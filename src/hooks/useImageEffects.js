import { useState, useCallback } from 'react'
import {
  pencilSketch,
  addVignette,
  vintageFilm,
  duotone,
  hdrEffect,
  sharpenImage,
  warmTone,
  coolTone,
  pixelate,
  softGlow,
  cartoonEffect,
  denoiseImage,
  upscale2x,
} from '../utils/canvasEffects.js'

export const CANVAS_EFFECTS = [
  { id: 'pencilSketch', label: 'Pencil Sketch', icon: '✏️', desc: 'Artistic pencil drawing look' },
  { id: 'cartoon',      label: 'Cartoon',       icon: '🎨', desc: 'Flat colours with bold outlines' },
  { id: 'vintage',      label: 'Vintage Film',  icon: '📽️', desc: 'Sepia, grain and vignette' },
  { id: 'vignette',     label: 'Vignette',      icon: '⬛', desc: 'Dark soft edges' },
  { id: 'hdr',          label: 'HDR',           icon: '🌟', desc: 'S-curve + saturation boost' },
  { id: 'softGlow',     label: 'Soft Glow',     icon: '✨', desc: 'Screen-blend dreamy glow' },
  { id: 'duotone',      label: 'Duotone',       icon: '🎭', desc: 'Navy / amber two-tone palette' },
  { id: 'warm',         label: 'Warm Tone',     icon: '🌅', desc: 'Golden warm temperature' },
  { id: 'cool',         label: 'Cool Tone',     icon: '❄️', desc: 'Icy cool temperature' },
  { id: 'sharpen',      label: 'Sharpen',       icon: '🔍', desc: 'Unsharp mask for crisp details' },
  { id: 'pixelate',     label: 'Pixelate',      icon: '🟦', desc: 'Mosaic / 8-bit pixel art' },
  { id: 'denoise',      label: 'Denoise',       icon: '🧹', desc: 'Smooth out noise & grain' },
  { id: 'upscale2x',    label: 'Upscale 2×',    icon: '🔭', desc: 'Double resolution (smooth)' },
]

/** Canvas-based image effects — no external APIs needed */
export function useImageEffects() {
  const [loading, setLoading] = useState(false)
  const [activeEffect, setActiveEffect] = useState(null)

  const applyEffect = useCallback(async (effectId, dataURL) => {
    setLoading(true)
    setActiveEffect(effectId)
    try {
      let result
      switch (effectId) {
        case 'pencilSketch': result = await pencilSketch(dataURL);    break
        case 'cartoon':      result = await cartoonEffect(dataURL);   break
        case 'vintage':      result = await vintageFilm(dataURL);     break
        case 'vignette':     result = await addVignette(dataURL);     break
        case 'hdr':          result = await hdrEffect(dataURL);       break
        case 'softGlow':     result = await softGlow(dataURL);        break
        case 'duotone':      result = await duotone(dataURL);         break
        case 'warm':         result = await warmTone(dataURL);        break
        case 'cool':         result = await coolTone(dataURL);        break
        case 'sharpen':      result = await sharpenImage(dataURL);    break
        case 'pixelate':     result = await pixelate(dataURL);        break
        case 'denoise':      result = await denoiseImage(dataURL);    break
        case 'upscale2x':    result = await upscale2x(dataURL);       break
        default: throw new Error(`Unknown effect: ${effectId}`)
      }
      return result
    } finally {
      setLoading(false)
      setActiveEffect(null)
    }
  }, [])

  return { applyEffect, loading, activeEffect }
}
