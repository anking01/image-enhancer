import { useState, useCallback } from 'react'
import { PROVIDERS, getStoredProvider, saveProvider, getKey, saveKey } from '../services/aiService.js'

export function useAI() {
  const [providerId, setProviderId] = useState(getStoredProvider)
  const [loading, setLoading]       = useState(false)
  const [progress, setProgress]     = useState('')
  const [error, setError]           = useState(null)

  const provider = PROVIDERS[providerId] || PROVIDERS.gemini

  const switchProvider = useCallback((id) => {
    saveProvider(id)
    setProviderId(id)
  }, [])

  const storeKey = useCallback((key) => {
    saveKey(providerId, key)
  }, [providerId])

  const hasKey = Boolean(getKey(providerId))

  const run = useCallback(async (fn) => {
    setLoading(true)
    setProgress('')
    setError(null)
    try {
      const key = getKey(providerId)
      if (!key) throw new Error('NO_KEY')
      return await fn(key)
    } catch (err) {
      const msg = friendlyError(err)
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
      setProgress('')
    }
  }, [providerId])

  const generate = useCallback((prompt, options) =>
    run(key => provider.generate(prompt, options, key)), [run, provider])

  const edit = useCallback((dataURL, prompt, options) =>
    run(key => provider.edit(dataURL, prompt, options, key)), [run, provider])

  const enhance = useCallback((dataURL) =>
    run(key => provider.enhance ? provider.enhance(dataURL, key) : Promise.reject(new Error('Provider does not support enhance'))), [run, provider])

  const upscale = useCallback((dataURL, options) =>
    run(key => provider.upscale ? provider.upscale(dataURL, options, key) : Promise.reject(new Error('Provider does not support upscale'))), [run, provider])

  return {
    provider, providerId, hasKey,
    loading, progress, error,
    switchProvider, storeKey,
    generate, edit, enhance, upscale,
  }
}

function friendlyError(err) {
  const msg = err?.message || ''
  if (msg === 'NO_KEY')         return 'Please add your API key in Settings.'
  if (msg === 'INVALID_KEY')    return 'Invalid API key. Please check and update it in Settings.'
  if (msg === 'QUOTA_EXCEEDED') return 'API quota exceeded. Check your usage or upgrade your plan.'
  if (msg.includes('403'))      return 'Access denied (403). Check your API key and account credits.'
  if (msg.includes('fetch'))    return 'Network error. Check your internet connection.'
  return msg || 'Something went wrong. Please try again.'
}
