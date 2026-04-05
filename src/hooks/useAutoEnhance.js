import { useState, useCallback } from 'react'
import { analyzeAndEnhance } from '../utils/autoEnhance.js'

/** Replaces useGemini — fully local, no API key needed */
export function useAutoEnhance() {
  const [loading, setLoading] = useState(false)

  const analyzeImage = useCallback(async (base64Image, mimeType = 'image/jpeg') => {
    setLoading(true)
    try {
      const dataURL = `data:${mimeType};base64,${base64Image}`
      const result = await analyzeAndEnhance(dataURL)
      setLoading(false)
      return result
    } catch (err) {
      setLoading(false)
      throw err
    }
  }, [])

  return { analyzeImage, loading }
}
