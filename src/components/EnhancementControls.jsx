import React, { useState } from 'react'
import { motion } from 'framer-motion'
import PresetCard from './PresetCard.jsx'
import { PRESETS, DEFAULT_FILTERS } from '../utils/filterUtils.js'

const SLIDERS = [
  { key: 'brightness', label: 'Brightness', min: 0.3, max: 2, step: 0.01, icon: '☀️' },
  { key: 'contrast', label: 'Contrast', min: 0.3, max: 2.5, step: 0.01, icon: '◑' },
  { key: 'saturate', label: 'Saturation', min: 0, max: 3, step: 0.01, icon: '🎨' },
  { key: 'hueRotate', label: 'Hue Shift', min: -180, max: 180, step: 1, icon: '🌈' },
  { key: 'sharpness', label: 'Sharpness', min: 0, max: 3, step: 0.05, icon: '🔍' },
  { key: 'warmth', label: 'Warmth', min: -1, max: 1, step: 0.01, icon: '🌡️' },
]

export default function EnhancementControls({
  filters,
  onFilterChange,
  onApplyPreset,
  onReset,
  onEnhance,
  onDownload,
  enhancing,
  hasImage,
  activePreset,
}) {
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(90)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-thin pr-0.5"
    >
      {/* AI Enhance Button */}
      <div className="glass rounded-xl p-4 border border-white/8">
        <button
          onClick={onEnhance}
          disabled={!hasImage || enhancing}
          className={`w-full py-3 px-4 rounded-xl font-syne font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 ${
            !hasImage || enhancing
              ? 'opacity-50 cursor-not-allowed bg-white/5 text-slate-500 border border-white/10'
              : 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:opacity-90 shadow-lg shadow-accent-cyan/20 hover:shadow-accent-cyan/30 active:scale-98'
          }`}
        >
          {enhancing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Smart Auto-Enhance
            </>
          )}
        </button>
      </div>

      {/* Manual Sliders */}
      <div className="glass rounded-xl p-4 border border-white/8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-syne font-semibold text-sm text-white">Manual Adjustments</h3>
          <button
            onClick={onReset}
            disabled={!hasImage}
            className="text-xs text-slate-500 hover:text-accent-cyan transition-colors disabled:opacity-40"
          >
            Reset
          </button>
        </div>
        <div className="space-y-4">
          {SLIDERS.map(slider => (
            <div key={slider.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-sm">{slider.icon}</span>
                  {slider.label}
                </span>
                <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded">
                  {Number(filters[slider.key] ?? 0).toFixed(slider.step < 0.1 ? 2 : 0)}
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={filters[slider.key] ?? 0}
                onChange={e => onFilterChange(slider.key, parseFloat(e.target.value))}
                disabled={!hasImage}
                className="w-full disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div className="glass rounded-xl p-4 border border-white/8">
        <h3 className="font-syne font-semibold text-sm text-white mb-3">Presets</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <PresetCard
              key={key}
              preset={preset}
              onApply={(f) => onApplyPreset(f, preset.name)}
              active={activePreset === preset.name}
            />
          ))}
        </div>
      </div>

      {/* Download */}
      <div className="glass rounded-xl p-4 border border-white/8">
        <h3 className="font-syne font-semibold text-sm text-white mb-3">Export</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {['png', 'jpeg', 'webp'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                    format === f
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
                      : 'bg-white/5 text-slate-500 border border-white/8 hover:border-white/15 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {format !== 'png' && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Quality</span>
                <span className="font-mono text-accent-cyan">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <button
            onClick={() => onDownload(format, quality)}
            disabled={!hasImage}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-accent-purple/40 text-accent-purple hover:bg-accent-purple/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
