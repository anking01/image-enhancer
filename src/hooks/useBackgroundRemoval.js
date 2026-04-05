import { useState, useCallback, useRef } from 'react'
import { fillBackground } from '../utils/canvasEffects.js'

/**
 * Background removal using @imgly/background-removal.
 * Runs entirely in the browser via WebAssembly — no API key, no server.
 * First run downloads the ONNX model (~10 MB) and caches it locally.
 */
export function useBackgroundRemoval() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)
  const removeRef = useRef(null)

  /**
   * bgColor: 'transparent' | '#000000' | '#ffffff' | any CSS color
   */
  const removeBackground = useCallback(async (dataURL, bgColor = 'transparent') => {
    setLoading(true)
    setProgress('Loading model…')

    try {
      if (!removeRef.current) {
        const mod = await import('@imgly/background-removal')
        removeRef.current = mod.removeBackground
      }
      const removeFn = removeRef.current

      const res  = await fetch(dataURL)
      const blob = await res.blob()

      setProgress('Removing background…')

      const resultBlob = await removeFn(blob, {
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100)
            setProgress(`${key === 'fetch:download' ? 'Downloading model' : 'Processing'}… ${pct}%`)
          }
        },
        output: { format: 'image/png', quality: 0.95 },
      })

      // Convert Blob → transparent dataURL
      const transparentDataURL = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(resultBlob)
      })

      // Fill background if a color was requested
      if (bgColor === 'transparent') return transparentDataURL
      return await fillBackground(transparentDataURL, bgColor)
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }, [])

  return { removeBackground, loading, progress }
}
