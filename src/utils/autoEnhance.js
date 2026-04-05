/**
 * Smart auto-enhance using Canvas histogram analysis.
 * Detects scene type and computes optimal filter values — no external API needed.
 */

export async function analyzeAndEnhance(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        // Sample at 150×150 for speed
        const S = 150
        const canvas = document.createElement('canvas')
        canvas.width = S; canvas.height = S
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0, S, S)
        const { data } = ctx.getImageData(0, 0, S, S)
        const N = S * S

        let sumR = 0, sumG = 0, sumB = 0, sumLum = 0
        let darkPx = 0, brightPx = 0
        const lumHist = new Float32Array(256)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2]
          sumR += r; sumG += g; sumB += b
          const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
          sumLum += lum
          lumHist[lum]++
          if (lum < 50)  darkPx++
          if (lum > 210) brightPx++
        }

        const avgR   = sumR   / N
        const avgG   = sumG   / N
        const avgB   = sumB   / N
        const avgLum = sumLum / N

        // Variance (contrast proxy)
        let lumVar = 0, rVar = 0, gVar = 0, bVar = 0
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          lumVar += (lum - avgLum) ** 2
          rVar   += (data[i]     - avgR) ** 2
          gVar   += (data[i + 1] - avgG) ** 2
          bVar   += (data[i + 2] - avgB) ** 2
        }
        lumVar /= N; rVar /= N; gVar /= N; bVar /= N
        const rmsContrast = Math.sqrt(lumVar) / 255    // 0–1 scale

        // Saturation estimate
        const maxChan = Math.max(avgR, avgG, avgB)
        const minChan = Math.min(avgR, avgG, avgB)
        const satEst  = maxChan > 0 ? (maxChan - minChan) / maxChan : 0  // 0–1

        // Colour temperature: warm = R>B, cool = B>R
        const warmth = avgR - avgB  // positive = warm, negative = cool

        // Histogram percentiles (clipping check)
        let cumSum = 0
        let p2 = 0, p98 = 255
        for (let i = 0; i < 256; i++) {
          cumSum += lumHist[i]
          if (cumSum / N < 0.02) p2  = i
          if (cumSum / N < 0.98) p98 = i
        }
        const dynamicRange = p98 - p2

        // Scene detection
        const darkRatio   = darkPx   / N
        const brightRatio = brightPx / N
        let sceneType = 'other'
        if      (darkRatio   > 0.40)                        sceneType = 'lowlight'
        else if (brightRatio > 0.35 && warmth > 15)         sceneType = 'landscape'
        else if (warmth > 12 && satEst < 0.25)              sceneType = 'portrait'
        else if (avgLum > 185 && satEst < 0.20)             sceneType = 'product'
        else if (satEst > 0.30)                             sceneType = 'landscape'
        else if (avgLum < 90)                               sceneType = 'lowlight'
        else                                                sceneType = 'other'

        // Compute adjustments
        const targetLum = 128
        let brightness = clamp(targetLum / Math.max(avgLum, 1), 0.70, 1.70)

        let contrast = 1.0
        if (rmsContrast < 0.20)      contrast = 1.35   // low contrast → boost
        else if (rmsContrast < 0.30) contrast = 1.15
        else if (rmsContrast > 0.55) contrast = 0.90   // already contrasty
        else                         contrast = 1.0 + (0.35 - rmsContrast) * 0.8

        let saturate = 1.0
        if (satEst < 0.15) saturate = 1.55
        else if (satEst < 0.25) saturate = 1.30
        else if (satEst > 0.60) saturate = 0.90
        else saturate = 1.0 + (0.30 - satEst) * 1.2

        // Slight colour-cast correction
        const hueRotate = warmth > 30 ? -4 : warmth < -30 ? 4 : 0

        // Scene-specific tweaks
        if (sceneType === 'portrait') {
          brightness = Math.min(brightness * 1.05, 1.45)
          contrast   = Math.min(contrast   * 0.95, 1.30)
          saturate   = Math.min(saturate   * 0.90, 1.30)
        } else if (sceneType === 'landscape') {
          saturate = Math.min(saturate * 1.10, 1.80)
          contrast = Math.min(contrast * 1.05, 1.50)
        } else if (sceneType === 'lowlight') {
          brightness = Math.min(brightness * 1.15, 1.70)
          contrast   = Math.min(contrast   * 0.90, 1.40)
        } else if (sceneType === 'product') {
          brightness = Math.min(brightness * 0.98, 1.60)
          contrast   = Math.min(contrast   * 1.10, 1.60)
        }

        const result = {
          brightness: round2(brightness),
          contrast:   round2(clamp(contrast,  0.70, 2.00)),
          saturate:   round2(clamp(saturate,  0.50, 2.20)),
          hueRotate,
          sharpness:  sceneType === 'lowlight' ? 0.3 : 0.6,
          warmth:     warmth > 20 ? 0.15 : warmth < -20 ? -0.10 : 0,
          sceneType,
          analysis: buildAnalysisText(sceneType, avgLum, rmsContrast, satEst, dynamicRange),
        }
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image for analysis'))
    img.src = dataURL
  })
}

function clamp(v, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, v))
}

function round2(v) {
  return Math.round(v * 100) / 100
}

function buildAnalysisText(sceneType, avgLum, rmsContrast, satEst, dynamicRange) {
  const lumDesc  = avgLum  < 80  ? 'dark'   : avgLum  > 175 ? 'bright' : 'balanced'
  const contDesc = rmsContrast < 0.20 ? 'low contrast' : rmsContrast > 0.45 ? 'high contrast' : 'moderate contrast'
  const satDesc  = satEst  < 0.15 ? 'desaturated' : satEst  > 0.55 ? 'highly saturated' : 'moderate saturation'

  const sceneDescriptions = {
    portrait:  `Portrait detected — ${lumDesc} exposure, ${contDesc}. Applied gentle brightness lift with soft contrast and warm skin-tone preservation.`,
    landscape: `Landscape/outdoor scene detected — ${satDesc}, ${contDesc}. Boosted saturation and contrast to make colours and depth pop naturally.`,
    lowlight:  `Low-light scene detected (avg luminance: ${Math.round(avgLum)}). Lifted shadows, reduced noise potential, and restored detail in dark areas.`,
    product:   `Studio/product shot detected — ${lumDesc} exposure, ${contDesc}. Fine-tuned clarity and contrast to make product details crisp.`,
    other:     `Scene analysed — ${lumDesc} exposure, ${contDesc}, ${satDesc}. Auto-optimised brightness (${Math.round(avgLum)} → ~128), contrast, and colour balance for best visual impact.`,
  }
  return sceneDescriptions[sceneType] || sceneDescriptions.other
}
