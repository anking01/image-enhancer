// ─── Gemini Service ────────────────────────────────────────────────────────────
// Plug-and-play: implements { generate, edit, enhance }

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const IMG_MODEL  = 'gemini-2.0-flash-preview-image-generation'
const TEXT_MODEL = 'gemini-2.0-flash'

function dataURLtoBase64(dataURL) { return dataURL.split(',')[1] }
function dataURLtoMime(dataURL)   { return dataURL.split(';')[0].split(':')[1] }

async function post(model, key, body) {
  const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `Gemini error ${res.status}`
    if (res.status === 400 && msg.toLowerCase().includes('api key')) throw new Error('INVALID_KEY')
    if (res.status === 403) throw new Error('INVALID_KEY')
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED')
    throw new Error(msg)
  }
  return res.json()
}

function extractImageFromResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts || []
  const imgPart = parts.find(p => p.inlineData)
  if (!imgPart) throw new Error('Gemini returned no image. Try a different prompt.')
  return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`
}

// Text → Image
export async function geminiGenerate(prompt, _options, key) {
  const data = await post(IMG_MODEL, key, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  })
  return extractImageFromResponse(data)
}

// Image + prompt → edited Image
export async function geminiEdit(dataURL, prompt, _options, key) {
  const data = await post(IMG_MODEL, key, {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: dataURLtoMime(dataURL), data: dataURLtoBase64(dataURL) } },
      ],
    }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  })
  return extractImageFromResponse(data)
}

// Image → { brightness, contrast, saturate, hueRotate, sharpness, sceneType, analysis }
export async function geminiEnhance(dataURL, key) {
  const PROMPT = `Analyze this photo. Return ONLY raw JSON (no markdown):
{"brightness":<0.7-1.5>,"contrast":<0.8-1.8>,"saturate":<0.6-2.0>,"hueRotate":<-15 to 15>,"sharpness":<0-2>,"sceneType":"portrait|landscape|product|architecture|food|lowlight|other","analysis":"2-3 sentence description of what enhancements were applied and why"}`

  const data = await post(TEXT_MODEL, key, {
    contents: [{
      parts: [
        { inline_data: { mime_type: dataURLtoMime(dataURL), data: dataURLtoBase64(dataURL) } },
        { text: PROMPT },
      ],
    }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
  })

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  let parsed
  try { parsed = JSON.parse(cleaned) }
  catch { const m = cleaned.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : {} }

  const clamp = (v, lo, hi) => Math.min(Math.max(Number(v) || 0, lo), hi)
  return {
    brightness: clamp(parsed.brightness, 0.5, 2.0) || 1.1,
    contrast:   clamp(parsed.contrast,   0.5, 2.5) || 1.15,
    saturate:   clamp(parsed.saturate,   0.0, 3.0) || 1.2,
    hueRotate:  clamp(parsed.hueRotate, -30,  30)  || 0,
    sharpness:  clamp(parsed.sharpness,  0.0, 3.0) || 0.5,
    warmth: 0,
    sceneType:  parsed.sceneType || 'other',
    analysis:   parsed.analysis  || 'Image enhanced with AI-optimised settings.',
  }
}
