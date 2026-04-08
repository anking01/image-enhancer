// ─── fal.ai Service ────────────────────────────────────────────────────────────
// Plug-and-play: implements { generate, edit, upscale }

import { fal } from '@fal-ai/client'

function configFal(key) { fal.config({ credentials: key }) }

async function urlToDataURL(url) {
  const res  = await fetch(url)
  const blob = await res.blob()
  return new Promise(resolve => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.readAsDataURL(blob)
  })
}

// Text → Image (FLUX Schnell by default)
export async function falGenerate(prompt, options = {}, key) {
  configFal(key)
  const model     = options.model || 'fal-ai/flux/schnell'
  const isSchnell = model.includes('schnell')
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
  })
  return urlToDataURL(result.data.images[0].url)
}

// Image + prompt → edited Image (FLUX Dev img2img — passes dataURL directly, no upload)
export async function falEdit(dataURL, prompt, options = {}, key) {
  configFal(key)
  const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
    input: {
      prompt,
      image_url:           dataURL,
      strength:            options.strength || 0.85,
      num_inference_steps: 28,
      guidance_scale:      3.5,
      num_images:          1,
      enable_safety_checker: false,
    },
    logs: true,
  })
  return urlToDataURL(result.data.images[0].url)
}

// Upscale (Clarity Upscaler — passes dataURL directly)
export async function falUpscale(dataURL, options = {}, key) {
  configFal(key)
  const result = await fal.subscribe('fal-ai/clarity-upscaler', {
    input: {
      image_url:   dataURL,
      scale:       options.scale || 2,
      prompt:      options.prompt || 'sharp, high quality, detailed',
      creativity:  options.creativity ?? 0.35,
      resemblance: options.resemblance ?? 0.6,
    },
    logs: true,
  })
  return urlToDataURL(result.data.image.url)
}
