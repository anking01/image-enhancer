/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Build a CSS filter string from filter values
 */
export function buildFilterString(filters) {
  const { brightness, contrast, saturate, hueRotate, sharpness, warmth } = filters
  // warmth is implemented as a combination of sepia + hue-rotate
  const warmthSepia = warmth > 0 ? clamp(warmth * 0.3, 0, 0.4) : 0
  const warmthHue = warmth * 5

  return [
    `brightness(${clamp(brightness, 0.1, 3).toFixed(2)})`,
    `contrast(${clamp(contrast, 0.1, 3).toFixed(2)})`,
    `saturate(${clamp(saturate, 0, 3).toFixed(2)})`,
    `hue-rotate(${clamp(hueRotate + warmthHue, -180, 180).toFixed(1)}deg)`,
    `sepia(${warmthSepia.toFixed(2)})`,
    sharpness > 0 ? `contrast(${clamp(1 + sharpness * 0.1, 1, 1.5).toFixed(2)})` : '',
  ].filter(Boolean).join(' ')
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  hueRotate: 0,
  sharpness: 0,
  warmth: 0,
}

/**
 * Preset filter configurations
 */
export const PRESETS = {
  portrait: {
    name: 'Portrait',
    icon: '👤',
    description: 'Soft skin tones, gentle contrast',
    filters: { brightness: 1.05, contrast: 1.1, saturate: 1.1, hueRotate: 2, sharpness: 0.5, warmth: 0.3 },
  },
  landscape: {
    name: 'Landscape',
    icon: '🏔️',
    description: 'Vivid greens, deep blues',
    filters: { brightness: 1.05, contrast: 1.2, saturate: 1.4, hueRotate: -5, sharpness: 1, warmth: 0 },
  },
  lowlight: {
    name: 'Low Light',
    icon: '🌙',
    description: 'Brighten dark scenes, reduce noise',
    filters: { brightness: 1.4, contrast: 1.15, saturate: 1.2, hueRotate: 0, sharpness: 0.5, warmth: 0.2 },
  },
  vivid: {
    name: 'Vivid',
    icon: '✨',
    description: 'Maximum punch and color pop',
    filters: { brightness: 1.1, contrast: 1.3, saturate: 1.8, hueRotate: 0, sharpness: 1.5, warmth: 0 },
  },
  bw: {
    name: 'B&W',
    icon: '⬛',
    description: 'Classic black and white',
    filters: { brightness: 1.05, contrast: 1.2, saturate: 0, hueRotate: 0, sharpness: 1, warmth: 0 },
  },
  cinematic: {
    name: 'Cinematic',
    icon: '🎬',
    description: 'Film-grade teal and orange',
    filters: { brightness: 0.95, contrast: 1.25, saturate: 1.1, hueRotate: 10, sharpness: 0.8, warmth: -0.2 },
  },
}
