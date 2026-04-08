// ─── Helpers ────────────────────────────────────────────────────────────────

export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getToken() {
  return localStorage.getItem('gj_token') || ''
}

// Compress image before sending — keeps quality high but reduces file size
// Vercel has a 4.5MB body limit so we need to stay under that
function compressForUpload(dataURL, maxPx = 1800, quality = 0.88) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > maxPx || h > maxPx) {
        if (w > h) { h = Math.round(h * maxPx / w); w = maxPx }
        else        { w = Math.round(w * maxPx / h); h = maxPx }
      }
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataURL
  })
}

async function callAPI(endpoint, imageDataURL) {
  const compressed = await compressForUpload(imageDataURL)
  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ image: compressed }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
  return data.result
}

// ─── Dark Background Detection ──────────────────────────────────────────────

export async function detectDarkBackground(dataURL) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const size   = 80
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const pixels = ctx.getImageData(0, 0, size, size).data

      let total = 0, count = 0
      for (let x = 0; x < size; x++) {
        let i = x * 4
        total += pixels[i] * 0.299 + pixels[i+1] * 0.587 + pixels[i+2] * 0.114
        i = ((size-1) * size + x) * 4
        total += pixels[i] * 0.299 + pixels[i+1] * 0.587 + pixels[i+2] * 0.114
        count += 2
      }
      for (let y = 1; y < size-1; y++) {
        let i = (y * size) * 4
        total += pixels[i] * 0.299 + pixels[i+1] * 0.587 + pixels[i+2] * 0.114
        i = (y * size + size-1) * 4
        total += pixels[i] * 0.299 + pixels[i+1] * 0.587 + pixels[i+2] * 0.114
        count += 2
      }
      resolve((total / count) < 60)
    }
    img.src = dataURL
  })
}

// ─── Canvas: Add White Background ───────────────────────────────────────────

export function addWhiteBackground(dataURL) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataURL
  })
}

// ─── Canvas: Local Enhancement ──────────────────────────────────────────────

export function localEnhance(dataURL) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.filter = 'brightness(1.05) contrast(1.12) saturate(1.18)'
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataURL
  })
}

// ─── Master Process Pipeline ─────────────────────────────────────────────────

export async function processImage(dataURL, mode, options = {}, onProgress) {
  const step = (msg, pct) => { if (onProgress) onProgress(msg, pct) }

  if (mode === 'remove_bg') {
    step('Removing background…', 15)
    let result = await callAPI('/api/remove-background', dataURL)
    step('Enhancing image…', 80)
    result = await localEnhance(result)
    if (options.whiteBg) {
      step('Adding white background…', 95)
      result = await addWhiteBackground(result)
    }
    step('Done!', 100)
    return result
  }

  if (mode === 'remove_mannequin') {
    step('Removing background…', 10)
    // Backend does: PhotoRoom BG removal → Gemini mannequin removal
    let result = await callAPI('/api/remove-mannequin', dataURL)
    step('Polishing output…', 88)
    result = await localEnhance(result)
    if (options.whiteBg) {
      step('Setting white background…', 96)
      result = await addWhiteBackground(result)
    }
    step('Done!', 100)
    return result
  }

  if (mode === 'enhance') {
    step('Enhancing with AI…', 15)
    let result = await callAPI('/api/enhance', dataURL)
    step('Finalising…', 90)
    result = await localEnhance(result)
    step('Done!', 100)
    return result
  }

  throw new Error('Unknown mode')
}
