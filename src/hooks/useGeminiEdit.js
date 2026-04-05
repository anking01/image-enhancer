import { useState, useCallback } from 'react'

// Gemini 2.5 Flash Image — supports image input + image output generation
const GEMINI_EDIT_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

export function useGeminiEdit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Edit an image using a natural language prompt.
   * Returns a base64 data URL of the generated image, or throws.
   */
  const editImage = useCallback(async (base64Image, mimeType = 'image/jpeg', prompt) => {
    setLoading(true)
    setError(null)

    const apiKey = localStorage.getItem('lensai_api_key')
    if (!apiKey) {
      setLoading(false)
      throw new Error('NO_API_KEY')
    }

    try {
      const response = await fetch(`${GEMINI_EDIT_ENDPOINT}?key=${apiKey}`, {
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
                {
                  text: `You are an expert photo editor. Edit the provided image according to this instruction: "${prompt}".
                  Make the edit look realistic and natural. Return ONLY the edited image with no text explanation.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            temperature: 1,
            topP: 0.95,
          },
        }),
      })

      if (response.status === 400) {
        const data = await response.json().catch(() => ({}))
        const msg = data?.error?.message || 'Bad request'
        if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('invalid')) {
          throw new Error('INVALID_API_KEY')
        }
        throw new Error(msg)
      }
      if (response.status === 429) throw new Error('QUOTA_EXCEEDED')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const parts = data?.candidates?.[0]?.content?.parts || []

      // Find the image part in the response
      const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))
      if (imagePart) {
        setLoading(false)
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
      }

      // If no image returned, check for text (Gemini sometimes refuses or explains)
      const textPart = parts.find(p => p.text)
      const reason = textPart?.text || 'The model did not return an image. Try a different prompt.'
      throw new Error(reason.length > 120 ? reason.slice(0, 120) + '…' : reason)
    } catch (err) {
      setLoading(false)
      setError(err.message)
      throw err
    }
  }, [])

  /**
   * Generate a completely new image from a text prompt (no input image required).
   */
  const generateImage = useCallback(async (prompt) => {
    setLoading(true)
    setError(null)

    const apiKey = localStorage.getItem('lensai_api_key')
    if (!apiKey) {
      setLoading(false)
      throw new Error('NO_API_KEY')
    }

    try {
      const response = await fetch(`${GEMINI_EDIT_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a high-quality, realistic image: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            temperature: 1,
            topP: 0.95,
          },
        }),
      })

      if (response.status === 400) {
        const data = await response.json().catch(() => ({}))
        const msg = data?.error?.message || 'Bad request'
        if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('invalid')) throw new Error('INVALID_API_KEY')
        throw new Error(msg)
      }
      if (response.status === 429) throw new Error('QUOTA_EXCEEDED')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const parts = data?.candidates?.[0]?.content?.parts || []
      const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))
      if (imagePart) {
        setLoading(false)
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
      }
      const textPart = parts.find(p => p.text)
      const reason = textPart?.text || 'No image returned. Try rephrasing your prompt.'
      throw new Error(reason.length > 120 ? reason.slice(0, 120) + '…' : reason)
    } catch (err) {
      setLoading(false)
      setError(err.message)
      throw err
    }
  }, [])

  return { editImage, generateImage, loading, error }
}
