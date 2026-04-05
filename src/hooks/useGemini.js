import { useState, useCallback } from 'react'

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const ANALYSIS_PROMPT = `Analyze this image in detail. Return ONLY a raw valid JSON object (no markdown, no explanation) with:
{
  "brightness": <number 0.7 to 1.5>,
  "contrast": <number 0.8 to 1.8>,
  "saturate": <number 0.6 to 2.0>,
  "hueRotate": <number -15 to 15>,
  "sharpness": <number 0 to 2>,
  "sceneType": <one of: "portrait", "landscape", "product", "architecture", "food", "lowlight", "nighttime", "indoor", "other">,
  "analysis": <string: 2-3 sentence professional photo analysis and what enhancements are being applied and why>
}`

export function useGemini() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeImage = useCallback(async (base64Image, mimeType = 'image/jpeg') => {
    setLoading(true)
    setError(null)

    const apiKey = localStorage.getItem('lensai_api_key')
    if (!apiKey) {
      setLoading(false)
      throw new Error('NO_API_KEY')
    }

    try {
      const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
                { text: ANALYSIS_PROMPT },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
        }),
      })

      if (response.status === 400) {
        const data = await response.json()
        const message = data?.error?.message || 'Invalid request'
        if (message.toLowerCase().includes('api key')) {
          throw new Error('INVALID_API_KEY')
        }
        throw new Error(message)
      }

      if (response.status === 429) {
        throw new Error('QUOTA_EXCEEDED')
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Strip markdown fences if present
      const cleaned = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim()

      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        // Fallback: extract JSON object from text
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (match) {
          parsed = JSON.parse(match[0])
        } else {
          // Return fallback filters silently
          parsed = {
            brightness: 1.1,
            contrast: 1.15,
            saturate: 1.2,
            hueRotate: 0,
            sharpness: 0.5,
            sceneType: 'other',
            analysis: 'Enhancement applied with balanced settings for optimal quality.',
          }
        }
      }

      // Clamp and validate values
      const result = {
        brightness: clamp(Number(parsed.brightness) || 1.1, 0.5, 2.0),
        contrast: clamp(Number(parsed.contrast) || 1.15, 0.5, 2.5),
        saturate: clamp(Number(parsed.saturate) || 1.2, 0, 3),
        hueRotate: clamp(Number(parsed.hueRotate) || 0, -30, 30),
        sharpness: clamp(Number(parsed.sharpness) || 0.5, 0, 3),
        warmth: 0,
        sceneType: parsed.sceneType || 'other',
        analysis: parsed.analysis || 'Image enhanced with AI-optimized settings.',
      }

      setLoading(false)
      return result
    } catch (err) {
      setLoading(false)
      setError(err.message)
      throw err
    }
  }, [])

  return { analyzeImage, loading, error }
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}
