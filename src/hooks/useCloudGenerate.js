import { useState, useCallback } from 'react'

const FLUX_API = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell'
const SD_API   = 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5'
const TOKEN_KEY = 'hf_token'

function getToken() {
  return import.meta.env.VITE_HF_TOKEN || localStorage.getItem(TOKEN_KEY) || ''
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token.trim())
}

async function callHF(apiUrl, body, token) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-wait-for-model': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const ct = res.headers.get('content-type') || ''
    const err = ct.includes('application/json') ? await res.json().catch(() => ({})) : {}
    if (res.status === 401 || res.status === 403) throw new Error('HF_INVALID_TOKEN')
    if (res.status === 503) throw new Error('Model is warming up — please try again in 30 seconds.')
    throw new Error(err.error || `HuggingFace error ${res.status}`)
  }

  const blob = await res.blob()
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export function useCloudGenerate() {
  const [loading, setLoading]       = useState(false)
  const [sdStatus, setSdStatus]     = useState(() => getToken() ? 'running' : 'offline')
  const [checkingSD, setCheckingSD] = useState(false)

  const checkStatus = useCallback(async () => {
    const token = getToken()
    if (!token) { setSdStatus('offline'); return false }
    setCheckingSD(true)
    setSdStatus('running')   // HF is always available if token exists
    setCheckingSD(false)
    return true
  }, [])

  const generateImage = useCallback(async (prompt, options = {}) => {
    const token = getToken()
    if (!token) throw new Error('HF_NO_TOKEN')
    setLoading(true)
    try {
      return await callHF(FLUX_API, {
        inputs: prompt,
        parameters: {
          width:  options.width  || 512,
          height: options.height || 512,
          num_inference_steps: 4,
          guidance_scale: 0,
        },
      }, token)
    } finally {
      setLoading(false)
    }
  }, [])

  const editWithSD = useCallback(async (dataURL, prompt, strength = 0.65, options = {}) => {
    // HF simple inference doesn't support img2img for FLUX
    // Use SD 1.5 image-to-image pipeline
    const token = getToken()
    if (!token) throw new Error('HF_NO_TOKEN')
    setLoading(true)
    try {
      const base64 = dataURL.split(',')[1]
      return await callHF(SD_API, {
        inputs: base64,
        parameters: {
          prompt,
          strength,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          negative_prompt: options.negative_prompt || 'blurry, ugly, low quality, watermark',
        },
      }, token)
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateImage, editWithSD, checkStatus, loading, sdStatus, checkingSD }
}
