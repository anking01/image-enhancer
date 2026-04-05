import { useState, useCallback } from 'react'

/**
 * Connects to a locally-running ComfyUI instance at localhost:8188.
 * ComfyUI uses a prompt/workflow queue API.
 */

const COMFY_BASE = 'http://127.0.0.1:8188'

// Returns: 'running' | 'offline'
async function pingComfy() {
  try {
    const res = await fetch(`${COMFY_BASE}/system_stats`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return 'offline'
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? 'running' : 'offline'
  } catch {
    return 'offline'
  }
}

/** Enhance prompt for Realistic Vision model */
function enhancePrompt(prompt, isRealistic) {
  if (!isRealistic) return prompt
  const prefix = 'RAW photo, (photorealistic:1.4), masterpiece, best quality, ultra detailed, sharp focus, 8k uhd, dslr, high resolution,'
  return `${prefix} ${prompt}`
}

function realisticNegPrompt() {
  return '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, watermark, signature'
}

/** Build a minimal txt2img workflow for ComfyUI */
function buildTxt2ImgWorkflow(prompt, negPrompt, steps, cfg, width, height, useRealistic = true) {
  return {
    "3": { class_type: "KSampler", inputs: { seed: Math.floor(Math.random() * 1e10), steps, cfg, sampler_name: "dpmpp_2m_sde", scheduler: "karras", denoise: 1, model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0] } },
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "model.safetensors" } },
    "5": { class_type: "EmptyLatentImage", inputs: { width, height, batch_size: 1 } },
    "6": { class_type: "CLIPTextEncode", inputs: { text: enhancePrompt(prompt, useRealistic), clip: ["4", 1] } },
    "7": { class_type: "CLIPTextEncode", inputs: { text: useRealistic ? realisticNegPrompt() : negPrompt, clip: ["4", 1] } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: "lensai", images: ["8", 0] } },
  }
}

/** Build img2img workflow */
function buildImg2ImgWorkflow(base64Image, prompt, negPrompt, steps, cfg, denoise, width, height, useRealistic = true) {
  return {
    "1": { class_type: "LoadImage", inputs: { image: `data:image/png;base64,${base64Image}`, upload: "image" } },
    "3": { class_type: "KSampler", inputs: { seed: Math.floor(Math.random() * 1e10), steps, cfg, sampler_name: "dpmpp_2m_sde", scheduler: "karras", denoise, model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["10", 0] } },
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "model.safetensors" } },
    "6": { class_type: "CLIPTextEncode", inputs: { text: enhancePrompt(prompt, useRealistic), clip: ["4", 1] } },
    "7": { class_type: "CLIPTextEncode", inputs: { text: useRealistic ? realisticNegPrompt() : negPrompt, clip: ["4", 1] } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: "lensai", images: ["8", 0] } },
    "10": { class_type: "VAEEncode", inputs: { pixels: ["1", 0], vae: ["4", 2] } },
  }
}

/** Poll ComfyUI until the prompt finishes, return image blob */
async function runPromptAndGetImage(workflow) {
  // Get available model first
  let useRealistic = false
  const modelsRes = await fetch(`${COMFY_BASE}/object_info/CheckpointLoaderSimple`)
  if (modelsRes.ok) {
    const info = await modelsRes.json()
    const models = info?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || []
    if (models.length > 0) {
      // Prefer Realistic Vision, else first available
      const preferred = models.find(m => m.toLowerCase().includes('realistic')) || models[0]
      useRealistic = preferred.toLowerCase().includes('realistic')
      if (workflow['4']) workflow['4'].inputs.ckpt_name = preferred
      console.log('Using model:', preferred, '| Realistic mode:', useRealistic)
      // Apply prompt enhancements now that we know the model
      if (useRealistic) {
        // Re-enhance prompts in workflow nodes 6 and 7
        if (workflow['6']?.inputs?.text && !workflow['6'].inputs.text.startsWith('RAW photo')) {
          workflow['6'].inputs.text = enhancePrompt(workflow['6'].inputs.text, true)
          workflow['7'].inputs.text = realisticNegPrompt()
        }
      }
    }
  }

  // Queue the prompt
  const queueRes = await fetch(`${COMFY_BASE}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  })
  if (!queueRes.ok) {
    const err = await queueRes.json().catch(() => ({}))
    throw new Error(err?.error?.message || `ComfyUI error ${queueRes.status}`)
  }
  const { prompt_id } = await queueRes.json()

  // Poll history until done
  for (let attempt = 0; attempt < 120; attempt++) {
    await new Promise(r => setTimeout(r, 1000))
    const histRes = await fetch(`${COMFY_BASE}/history/${prompt_id}`)
    if (!histRes.ok) continue
    const hist = await histRes.json()
    const entry = hist[prompt_id]
    if (!entry) continue

    // Check for errors
    if (entry.status?.status_str === 'error') {
      throw new Error('ComfyUI generation failed. Check terminal for details.')
    }

    if (entry.status?.completed) {
      // Find the output image
      const outputs = entry.outputs || {}
      for (const nodeOut of Object.values(outputs)) {
        const images = nodeOut.images || []
        for (const img of images) {
          const imgRes = await fetch(`${COMFY_BASE}/view?filename=${img.filename}&subfolder=${img.subfolder || ''}&type=${img.type || 'output'}`)
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result)
              reader.readAsDataURL(blob)
            })
          }
        }
      }
    }
  }
  throw new Error('Generation timed out after 2 minutes.')
}

export function useLocalGenerate() {
  const [loading, setLoading]       = useState(false)
  const [sdStatus, setSdStatus]     = useState('unknown')
  const [checkingSD, setCheckingSD] = useState(false)

  const checkStatus = useCallback(async () => {
    setCheckingSD(true)
    const status = await pingComfy()
    setSdStatus(status)
    setCheckingSD(false)
    return status === 'running'
  }, [])

  const generateImage = useCallback(async (prompt, options = {}) => {
    setLoading(true)
    try {
      const status = await pingComfy()
      setSdStatus(status)
      if (status !== 'running') throw new Error('SD_OFFLINE')

      const workflow = buildTxt2ImgWorkflow(
        prompt,
        options.negative_prompt || realisticNegPrompt(),
        options.steps  || 30,
        options.cfg_scale || 7,
        options.width  || 512,
        options.height || 512,
      )
      return await runPromptAndGetImage(workflow)
    } finally {
      setLoading(false)
    }
  }, [])

  const editWithSD = useCallback(async (dataURL, prompt, strength = 0.65, options = {}) => {
    setLoading(true)
    try {
      const status = await pingComfy()
      setSdStatus(status)
      if (status !== 'running') throw new Error('SD_OFFLINE')

      const base64 = dataURL.split(',')[1]
      const workflow = buildImg2ImgWorkflow(
        base64,
        prompt,
        options.negative_prompt || realisticNegPrompt(),
        options.steps  || 30,
        options.cfg_scale || 7,
        strength,
        options.width  || 512,
        options.height || 512,
      )
      return await runPromptAndGetImage(workflow)
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateImage, editWithSD, checkStatus, loading, sdStatus, checkingSD }
}
