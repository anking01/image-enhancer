import { fal } from '@fal-ai/client'
import { useState, useCallback } from 'react'

const KEY_STORAGE = 'fal_api_key'

export function getFalKey() {
  return import.meta.env.VITE_FAL_KEY || localStorage.getItem(KEY_STORAGE) || ''
}

export function saveFalKey(key) {
  localStorage.setItem(KEY_STORAGE, key.trim())
}

// Configure once at module load
const _key = getFalKey()
if (_key) fal.config({ credentials: _key })

async function urlToDataURL(url) {
  const resp = await fetch(url)
  const blob = await resp.blob()
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export function useFalGenerate() {
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState('')

  const onQueueUpdate = useCallback((update) => {
    if (update.status === 'IN_QUEUE')     setProgress('Waiting in queue…')
    if (update.status === 'IN_PROGRESS') {
      const msg = update.logs?.slice(-1)[0]?.message
      setProgress(msg || 'Processing…')
    }
  }, [])

  // ── Text to Image ────────────────────────────────────────────
  const generateImage = useCallback(async (prompt, options = {}) => {
    const key = getFalKey()
    if (!key) throw new Error('FAL_NO_KEY')
    fal.config({ credentials: key })
    setLoading(true)
    setProgress('Queuing…')
    try {
      const model      = options.model || 'fal-ai/flux/schnell'
      const isSchnell  = model.includes('schnell')

      console.log('[fal] generate:', model, prompt)
      const result = await fal.subscribe(model, {
        input: {
          prompt,
          image_size:          options.imageSize || 'square_hd',
          num_inference_steps: isSchnell ? 4 : 28,
          num_images:          1,
          enable_safety_checker: false,
          ...(isSchnell ? {} : { guidance_scale: 3.5 }),
        },
        logs: true,
        onQueueUpdate,
      })

      console.log('[fal] generate result:', result)
      setProgress('Fetching image…')
      return await urlToDataURL(result.data.images[0].url)
    } catch (err) {
      console.error('[fal] generate error:', err)
      throw new Error(err?.message || err?.detail || 'Generation failed — check console')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }, [onQueueUpdate])

  // ── Image Editing — FLUX Dev img2img (no storage upload needed) ──
  const editImage = useCallback(async (dataURL, prompt, options = {}) => {
    const key = getFalKey()
    if (!key) throw new Error('FAL_NO_KEY')
    fal.config({ credentials: key })
    setLoading(true)
    setProgress('Starting edit…')
    try {
      console.log('[fal] edit img2img prompt:', prompt)
      const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
        input: {
          prompt,
          image_url:           dataURL,           // dataURL passed directly — no upload
          strength:            options.strength || 0.85,
          num_inference_steps: 28,
          guidance_scale:      3.5,
          num_images:          1,
          enable_safety_checker: false,
        },
        logs: true,
        onQueueUpdate,
      })

      console.log('[fal] edit result:', result)
      setProgress('Fetching image…')
      return await urlToDataURL(result.data.images[0].url)
    } catch (err) {
      console.error('[fal] edit error:', err)
      throw new Error(err?.message || err?.detail || 'Edit failed — check console')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }, [onQueueUpdate])

  // ── Upscale — Clarity Upscaler (dataURL direct) ───────────────
  const upscaleImage = useCallback(async (dataURL, options = {}) => {
    const key = getFalKey()
    if (!key) throw new Error('FAL_NO_KEY')
    fal.config({ credentials: key })
    setLoading(true)
    setProgress('Starting upscale…')
    try {
      console.log('[fal] upscale', options.scale + 'x')
      const result = await fal.subscribe('fal-ai/clarity-upscaler', {
        input: {
          image_url:   dataURL,                  // dataURL direct
          scale:       options.scale || 2,
          prompt:      options.prompt || 'sharp, high quality, detailed',
          creativity:  options.creativity ?? 0.35,
          resemblance: options.resemblance ?? 0.6,
        },
        logs: true,
        onQueueUpdate,
      })

      console.log('[fal] upscale result:', result)
      setProgress('Fetching image…')
      return await urlToDataURL(result.data.image.url)
    } catch (err) {
      console.error('[fal] upscale error:', err)
      throw new Error(err?.message || err?.detail || 'Upscale failed — check console')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }, [onQueueUpdate])

  return { generateImage, editImage, upscaleImage, loading, progress }
}
