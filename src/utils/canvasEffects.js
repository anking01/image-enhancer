/**
 * Canvas-based image effects — no external APIs required.
 * All processing runs locally in the browser using Canvas 2D API.
 */

function clamp(v, min = 0, max = 255) {
  return Math.min(max, Math.max(min, v))
}

async function loadToCanvas(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      resolve({ canvas, ctx, w: img.naturalWidth, h: img.naturalHeight })
    }
    img.onerror = reject
    img.src = dataURL
  })
}

function toDataURL(canvas) {
  return canvas.toDataURL('image/jpeg', 0.93)
}

// ── Pencil Sketch ────────────────────────────────────────────────────────────
export async function pencilSketch(dataURL) {
  const { canvas: c1, ctx: ctx1, w, h } = await loadToCanvas(dataURL)

  // Step 1: greyscale
  const id1 = ctx1.getImageData(0, 0, w, h)
  const d = id1.data
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    d[i] = d[i + 1] = d[i + 2] = g
  }
  ctx1.putImageData(id1, 0, 0)

  // Step 2: inverted greyscale on a second canvas, then blur
  const c2 = document.createElement('canvas')
  c2.width = w; c2.height = h
  const ctx2 = c2.getContext('2d', { willReadFrequently: true })
  const id2 = ctx1.getImageData(0, 0, w, h)
  const d2 = id2.data
  for (let i = 0; i < d2.length; i += 4) {
    d2[i] = d2[i + 1] = d2[i + 2] = 255 - d2[i]
  }
  ctx2.putImageData(id2, 0, 0)

  // Blur the inverted layer
  const c3 = document.createElement('canvas')
  c3.width = w; c3.height = h
  const ctx3 = c3.getContext('2d', { willReadFrequently: true })
  ctx3.filter = 'blur(4px)'
  ctx3.drawImage(c2, 0, 0)
  ctx3.filter = 'none'

  // Step 3: color dodge blend
  const grayData = ctx1.getImageData(0, 0, w, h).data
  const blurData = ctx3.getImageData(0, 0, w, h).data
  const result = ctx1.createImageData(w, h)
  const rd = result.data
  for (let i = 0; i < grayData.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const base = grayData[i + c]
      const blend = blurData[i + c]
      const denom = 255 - blend
      rd[i + c] = denom === 0 ? 255 : clamp(Math.round(base * 255 / denom))
    }
    rd[i + 3] = 255
  }
  ctx1.putImageData(result, 0, 0)
  return toDataURL(c1)
}

// ── Vignette ─────────────────────────────────────────────────────────────────
export async function addVignette(dataURL, intensity = 0.75) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const cx = w / 2, cy = h / 2
  const r1 = Math.min(w, h) * 0.28
  const r2 = Math.max(w, h) * 0.78
  const grad = ctx.createRadialGradient(cx, cy, r1, cx, cy, r2)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(0,0,0,${intensity})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  return toDataURL(canvas)
}

// ── Vintage Film ─────────────────────────────────────────────────────────────
export async function vintageFilm(dataURL) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const id = ctx.getImageData(0, 0, w, h)
  const d = id.data

  // Sepia
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    d[i]     = clamp(r * 0.393 + g * 0.769 + b * 0.189)
    d[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168)
    d[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131)
  }

  // Film grain
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28
    d[i]     = clamp(d[i]     + noise)
    d[i + 1] = clamp(d[i + 1] + noise)
    d[i + 2] = clamp(d[i + 2] + noise)
  }
  ctx.putImageData(id, 0, 0)

  // Vignette
  const cx = w / 2, cy = h / 2
  const grad = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.22, cx, cy, Math.max(w, h) * 0.78)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.65)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  return toDataURL(canvas)
}

// ── Duotone ───────────────────────────────────────────────────────────────────
export async function duotone(dataURL, shadow = [15, 10, 80], highlight = [255, 190, 60]) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const id = ctx.getImageData(0, 0, w, h)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    const t = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255
    d[i]     = clamp(shadow[0] * (1 - t) + highlight[0] * t)
    d[i + 1] = clamp(shadow[1] * (1 - t) + highlight[1] * t)
    d[i + 2] = clamp(shadow[2] * (1 - t) + highlight[2] * t)
  }
  ctx.putImageData(id, 0, 0)
  return toDataURL(canvas)
}

// ── HDR Effect ────────────────────────────────────────────────────────────────
export async function hdrEffect(dataURL) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const id = ctx.getImageData(0, 0, w, h)
  const d = id.data

  // S-curve LUT
  const lut = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    const n = i / 255
    const s = n < 0.5 ? 2 * n * n : -1 + (4 - 2 * n) * n
    lut[i] = clamp(Math.round((n * 0.35 + s * 0.65) * 255))
  }

  for (let i = 0; i < d.length; i += 4) {
    d[i]     = lut[d[i]]
    d[i + 1] = lut[d[i + 1]]
    d[i + 2] = lut[d[i + 2]]
  }

  // Boost saturation 1.4x
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    d[i]     = clamp(gray + (r - gray) * 1.4)
    d[i + 1] = clamp(gray + (g - gray) * 1.4)
    d[i + 2] = clamp(gray + (b - gray) * 1.4)
  }
  ctx.putImageData(id, 0, 0)
  return toDataURL(canvas)
}

// ── Sharpen ───────────────────────────────────────────────────────────────────
export async function sharpenImage(dataURL, amount = 1.2) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const src = ctx.getImageData(0, 0, w, h)
  const original = new Uint8ClampedArray(src.data)
  const d = src.data

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        const center = original[idx + c]
        const top    = original[((y - 1) * w + x) * 4 + c]
        const bottom = original[((y + 1) * w + x) * 4 + c]
        const left   = original[(y * w + (x - 1)) * 4 + c]
        const right  = original[(y * w + (x + 1)) * 4 + c]
        d[idx + c] = clamp(center * (1 + amount) - (amount / 4) * (top + bottom + left + right))
      }
    }
  }
  ctx.putImageData(src, 0, 0)
  return toDataURL(canvas)
}

// ── Warm Tone ─────────────────────────────────────────────────────────────────
export async function warmTone(dataURL) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const id = ctx.getImageData(0, 0, w, h)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = clamp(d[i]     * 1.12)
    d[i + 1] = clamp(d[i + 1] * 1.04)
    d[i + 2] = clamp(d[i + 2] * 0.88)
  }
  ctx.putImageData(id, 0, 0)
  return toDataURL(canvas)
}

// ── Cool Tone ─────────────────────────────────────────────────────────────────
export async function coolTone(dataURL) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const id = ctx.getImageData(0, 0, w, h)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = clamp(d[i]     * 0.88)
    d[i + 1] = clamp(d[i + 1] * 1.00)
    d[i + 2] = clamp(d[i + 2] * 1.16)
  }
  ctx.putImageData(id, 0, 0)
  return toDataURL(canvas)
}

// ── Pixelate ──────────────────────────────────────────────────────────────────
export async function pixelate(dataURL, blockSize = 12) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      const px = ctx.getImageData(x + Math.floor(blockSize / 2), y + Math.floor(blockSize / 2), 1, 1).data
      ctx.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`
      ctx.fillRect(x, y, Math.min(blockSize, w - x), Math.min(blockSize, h - y))
    }
  }
  return toDataURL(canvas)
}

// ── Soft Glow ─────────────────────────────────────────────────────────────────
export async function softGlow(dataURL) {
  const { canvas: c1, ctx: ctx1, w, h } = await loadToCanvas(dataURL)

  // Blurred version
  const c2 = document.createElement('canvas')
  c2.width = w; c2.height = h
  const ctx2 = c2.getContext('2d')
  ctx2.filter = 'blur(6px) brightness(1.3)'
  ctx2.drawImage(c1, 0, 0)
  ctx2.filter = 'none'

  // Screen blend: result = 1 - (1 - base)(1 - blend)
  const baseData  = ctx1.getImageData(0, 0, w, h)
  const glowData  = ctx2.getImageData(0, 0, w, h)
  const bd = baseData.data, gd = glowData.data

  for (let i = 0; i < bd.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const base  = bd[i + c] / 255
      const blend = gd[i + c] / 255
      const screened = 1 - (1 - base) * (1 - blend * 0.45)
      bd[i + c] = clamp(Math.round(screened * 255))
    }
  }
  ctx1.putImageData(baseData, 0, 0)
  return toDataURL(c1)
}

// ── Cartoon ───────────────────────────────────────────────────────────────────
// Simplified: posterize + edge overlay
export async function cartoonEffect(dataURL) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const id = ctx.getImageData(0, 0, w, h)
  const d = id.data

  // Posterize (reduce colour levels to 5)
  const levels = 5
  const step = 255 / (levels - 1)
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.round(Math.round(d[i]     / step) * step)
    d[i + 1] = Math.round(Math.round(d[i + 1] / step) * step)
    d[i + 2] = Math.round(Math.round(d[i + 2] / step) * step)
  }
  ctx.putImageData(id, 0, 0)

  // Edge detection (greyscale Sobel into separate canvas)
  const { canvas: c2, ctx: ctx2 } = await loadToCanvas(dataURL)
  const gray = ctx2.getImageData(0, 0, w, h)
  const gd = gray.data
  for (let i = 0; i < gd.length; i += 4) {
    const g = 0.299 * gd[i] + 0.587 * gd[i + 1] + 0.114 * gd[i + 2]
    gd[i] = gd[i + 1] = gd[i + 2] = g
  }
  ctx2.putImageData(gray, 0, 0)

  const edge = ctx2.getImageData(0, 0, w, h)
  const ed = edge.data
  const orig = new Uint8ClampedArray(ed)
  const Kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const Ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const ki = (ky + 1) * 3 + (kx + 1)
          const pi = ((y + ky) * w + (x + kx)) * 4
          gx += orig[pi] * Kx[ki]
          gy += orig[pi] * Ky[ki]
        }
      }
      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy))
      const i = (y * w + x) * 4
      ed[i] = ed[i + 1] = ed[i + 2] = mag
      ed[i + 3] = 255
    }
  }
  ctx2.putImageData(edge, 0, 0)

  // Overlay edges (black lines) onto posterized image
  const posterData = ctx.getImageData(0, 0, w, h)
  const pd = posterData.data
  const edgeVals = ctx2.getImageData(0, 0, w, h).data
  for (let i = 0; i < pd.length; i += 4) {
    const edgeMag = edgeVals[i] / 255
    const threshold = edgeMag > 0.25 ? edgeMag : 0
    pd[i]     = clamp(pd[i]     * (1 - threshold * 0.85))
    pd[i + 1] = clamp(pd[i + 1] * (1 - threshold * 0.85))
    pd[i + 2] = clamp(pd[i + 2] * (1 - threshold * 0.85))
  }
  ctx.putImageData(posterData, 0, 0)
  return toDataURL(canvas)
}

// ── Denoise (box blur) ────────────────────────────────────────────────────────
export async function denoiseImage(dataURL) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const c2 = document.createElement('canvas')
  c2.width = w; c2.height = h
  const ctx2 = c2.getContext('2d')
  ctx2.filter = 'blur(1.2px)'
  ctx2.drawImage(canvas, 0, 0)
  ctx2.filter = 'none'
  return toDataURL(c2)
}

// ── Fill background behind transparent PNG ────────────────────────────────────
export async function fillBackground(dataURL, color = '#000000') {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = dataURL
  })
}

// ── Upscale 2x (nearest-neighbour placeholder) ────────────────────────────────
export async function upscale2x(dataURL) {
  const { canvas, ctx, w, h } = await loadToCanvas(dataURL)
  const c2 = document.createElement('canvas')
  c2.width = w * 2; c2.height = h * 2
  const ctx2 = c2.getContext('2d')
  ctx2.imageSmoothingEnabled = true
  ctx2.imageSmoothingQuality = 'high'
  ctx2.drawImage(canvas, 0, 0, w * 2, h * 2)
  return toDataURL(c2)
}
