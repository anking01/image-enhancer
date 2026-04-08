import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CANVAS_EFFECTS } from '../hooks/useImageEffects.js'
import { getFalKey, saveFalKey } from '../hooks/useFalGenerate.js'

// ── Sub-panel: Canvas Effects ─────────────────────────────────────────────────
function EffectsPanel({ hasImage, onApplyEffect, effectsLoading, activeEffect, editHistory, onRestoreVersion, currentVersionIndex }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-xl border border-white/8 p-4">
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          One-click effects — run <span className="text-accent-cyan">entirely in your browser</span>, no API or internet required.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CANVAS_EFFECTS.map(effect => (
            <motion.button
              key={effect.id}
              whileHover={{ scale: hasImage ? 1.02 : 1 }}
              whileTap={{ scale: hasImage ? 0.97 : 1 }}
              onClick={() => hasImage && onApplyEffect(effect.id)}
              disabled={!hasImage || effectsLoading}
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                activeEffect === effect.id
                  ? 'border-accent-cyan/50 bg-accent-cyan/12 text-white'
                  : !hasImage || effectsLoading
                  ? 'border-white/4 bg-white/2 opacity-40 cursor-not-allowed text-slate-600'
                  : 'border-white/8 bg-white/3 hover:border-white/18 hover:bg-white/6 text-slate-300 cursor-pointer'
              }`}
            >
              <span className="text-base mt-0.5 flex-shrink-0">
                {activeEffect === effect.id ? (
                  <svg className="w-4 h-4 animate-spin text-accent-cyan mt-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : effect.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">{effect.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight truncate">{effect.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Version history */}
      {editHistory && editHistory.length > 1 && (
        <VersionHistory
          editHistory={editHistory}
          onRestoreVersion={onRestoreVersion}
          currentVersionIndex={currentVersionIndex}
        />
      )}
    </div>
  )
}

// ── Sub-panel: Background Removal ─────────────────────────────────────────────
const BG_OPTIONS = [
  {
    color: 'transparent',
    label: 'Transparent',
    icon: '♟️',
    style: {
      backgroundImage:
        'linear-gradient(45deg,#555 25%,transparent 25%),' +
        'linear-gradient(-45deg,#555 25%,transparent 25%),' +
        'linear-gradient(45deg,transparent 75%,#555 75%),' +
        'linear-gradient(-45deg,transparent 75%,#555 75%)',
      backgroundSize: '10px 10px',
      backgroundPosition: '0 0,0 5px,5px -5px,-5px 0',
      backgroundColor: '#333',
    },
    textClass: 'text-slate-300',
  },
  {
    color: '#000000',
    label: 'Black BG',
    icon: '⬛',
    style: { backgroundColor: '#000' },
    textClass: 'text-slate-300',
  },
  {
    color: '#ffffff',
    label: 'White BG',
    icon: '⬜',
    style: { backgroundColor: '#fff' },
    textClass: 'text-slate-800',
  },
]

function BackgroundPanel({ hasImage, onRemoveBackground, bgLoading, bgProgress }) {
  const [selected, setSelected] = React.useState('transparent')

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-xl border border-white/8 p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-xl">
            ✂️
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-0.5">Remove Background</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              RMBG-1.4 — runs in browser via WASM. Model (~10 MB) downloads once and is cached.
            </p>
          </div>
        </div>

        {/* Background colour options */}
        <p className="text-xs text-slate-400 mb-2 font-semibold">Choose background after removal</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {BG_OPTIONS.map(opt => (
            <button
              key={opt.color}
              onClick={() => setSelected(opt.color)}
              disabled={bgLoading}
              className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all overflow-hidden ${
                selected === opt.color
                  ? 'border-accent-cyan shadow-[0_0_0_1px] shadow-accent-cyan/30'
                  : 'border-white/10 hover:border-white/25'
              } ${bgLoading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Colour preview swatch */}
              <div
                className="w-full h-8 rounded-lg"
                style={opt.style}
              />
              <span className="text-[11px] text-slate-300 font-medium">{opt.label}</span>
              {selected === opt.color && (
                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-accent-cyan flex items-center justify-center">
                  <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => onRemoveBackground(selected)}
          disabled={!hasImage || bgLoading}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all ${
            !hasImage || bgLoading
              ? 'bg-white/5 border border-white/10 text-slate-500 opacity-50 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500/80 to-orange-500/80 text-white hover:opacity-90 shadow-lg shadow-red-500/20'
          }`}
        >
          {bgLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {bgProgress || 'Processing…'}
            </>
          ) : (
            <>✂️ Remove Background</>
          )}
        </button>

        {bgLoading && bgProgress && (
          <p className="text-center text-[11px] text-slate-500 mt-2">{bgProgress}</p>
        )}
      </div>
    </div>
  )
}

// ── fal.ai Models ─────────────────────────────────────────────────────────────
const FAL_MODELS = [
  {
    id:    'fal-ai/flux/schnell',
    label: 'FLUX Schnell',
    desc:  'Ultra fast · 4 steps · great for iteration',
    badge: 'FAST',
    badgeColor: 'text-green-400 bg-green-400/10 border-green-400/20',
  },
  {
    id:    'fal-ai/flux/dev',
    label: 'FLUX Dev',
    desc:  'High quality · 28 steps · more credits',
    badge: 'HD',
    badgeColor: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
  },
]

const ASPECT_RATIOS = [
  { id: 'square_hd',      label: '1:1',   icon: '⬛', desc: 'Square HD' },
  { id: 'portrait_4_3',   label: '3:4',   icon: '📱', desc: 'Portrait' },
  { id: 'landscape_4_3',  label: '4:3',   icon: '🖼️', desc: 'Landscape' },
  { id: 'landscape_16_9', label: '16:9',  icon: '🎬', desc: 'Widescreen' },
]

// ── Sub-panel: fal.ai Generate ────────────────────────────────────────────────
function GeneratePanel({ hasImage, onGenerate, onEditImage, onUpscaleImage, falLoading, falProgress }) {
  const [mode, setMode]         = useState('generate') // 'generate' | 'edit' | 'upscale'
  const [prompt, setPrompt]     = useState('')
  const [model, setModel]       = useState('fal-ai/flux/schnell')
  const [imageSize, setImageSize] = useState('square_hd')
  const [upscaleScale, setUpscaleScale] = useState(2)
  const [upscalePrompt, setUpscalePrompt] = useState('')
  const [showKey, setShowKey]   = useState(false)
  const [keyInput, setKeyInput] = useState('')

  const hasKey = Boolean(getFalKey())

  const handleSaveKey = () => {
    if (!keyInput.trim()) return
    saveFalKey(keyInput.trim())
    setKeyInput('')
    setShowKey(false)
    window.location.reload()
  }

  const handleSubmit = () => {
    if (mode === 'generate') {
      if (!prompt.trim()) return
      onGenerate(prompt.trim(), { model, imageSize })
    } else if (mode === 'edit') {
      if (!prompt.trim() || !hasImage) return
      onEditImage(prompt.trim())
    } else if (mode === 'upscale') {
      if (!hasImage) return
      onUpscaleImage({ scale: upscaleScale, prompt: upscalePrompt || undefined })
    }
  }

  const canSubmit = hasKey && !falLoading && (
    mode === 'generate' ? prompt.trim().length > 0 :
    mode === 'edit'     ? prompt.trim().length > 0 && hasImage :
                          hasImage
  )

  return (
    <div className="flex flex-col gap-3">

      {/* fal.ai key banner */}
      <div className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
        hasKey ? 'border-green-500/20 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/8'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasKey ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
          <span className="text-xs text-slate-300 truncate">
            {hasKey ? 'fal.ai connected' : 'fal.ai API key required'}
          </span>
        </div>
        <button onClick={() => setShowKey(v => !v)} className="text-[11px] text-accent-cyan hover:underline flex-shrink-0">
          {hasKey ? 'Change' : 'Add Key'}
        </button>
      </div>

      {/* Key input */}
      <AnimatePresence>
        {(!hasKey || showKey) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl border border-orange-500/25 p-4">
              <h4 className="text-xs font-bold mb-1 text-orange-300">fal.ai API Key</h4>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Get your key at <span className="text-accent-cyan">fal.ai → Dashboard → Keys</span>.
                Stored only in your browser.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                  placeholder="fal-xxxxxxxxxxxx…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40"
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!keyInput.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode tabs */}
      <div className="flex rounded-xl overflow-hidden border border-white/8 bg-white/3">
        {[
          { id: 'generate', label: 'Generate', icon: '🪄' },
          { id: 'edit',     label: 'Edit',     icon: '✏️' },
          { id: 'upscale',  label: 'Upscale',  icon: '🔍' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-2.5 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
              mode === m.id
                ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-white border-b-2 border-accent-cyan'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* ── Generate mode ── */}
      <AnimatePresence mode="wait">
        {mode === 'generate' && (
          <motion.div key="gen" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="flex flex-col gap-3">
            {/* Model selector */}
            <div className="glass rounded-xl border border-white/8 p-3">
              <p className="text-[11px] text-slate-400 font-semibold mb-2">Model</p>
              <div className="flex flex-col gap-2">
                {FAL_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                      model === m.id
                        ? 'border-accent-cyan/40 bg-accent-cyan/8'
                        : 'border-white/5 hover:border-white/15 hover:bg-white/4'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${model === m.id ? 'border-accent-cyan bg-accent-cyan' : 'border-slate-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${model === m.id ? 'text-white' : 'text-slate-300'}`}>{m.label}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${m.badgeColor}`}>{m.badge}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="glass rounded-xl border border-white/8 p-3">
              <p className="text-[11px] text-slate-400 font-semibold mb-2">Aspect Ratio</p>
              <div className="grid grid-cols-4 gap-1.5">
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setImageSize(r.id)}
                    title={r.desc}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-center transition-all ${
                      imageSize === r.id
                        ? 'border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan'
                        : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/18 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-sm">{r.icon}</span>
                    <span className="text-[9px] font-bold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="glass rounded-xl border border-white/8 p-3">
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. a woman in a garden, golden hour, cinematic lighting, 4K"
                rows={3}
                className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40 resize-none transition-colors leading-relaxed"
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) canSubmit && handleSubmit() }}
              />
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[10px] text-slate-600">Ctrl+Enter to generate</span>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    !canSubmit
                      ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500 border border-white/8'
                      : 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:opacity-90 shadow-lg shadow-accent-cyan/15'
                  }`}
                >
                  {falLoading ? (
                    <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating…</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Generate</>
                  )}
                </button>
              </div>
              {falLoading && falProgress && (
                <p className="text-[10px] text-accent-cyan/70 mt-1 truncate">{falProgress}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Edit mode ── */}
        {mode === 'edit' && (
          <motion.div key="edit" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="flex flex-col gap-3">
            <div className="glass rounded-xl border border-white/8 p-3">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-lg">✏️</div>
                <div>
                  <h4 className="text-xs font-semibold text-white mb-0.5">Edit with AI</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Describe what to change. Powered by FLUX Kontext — understands your image context.</p>
                </div>
              </div>
              {!hasImage && (
                <div className="bg-orange-500/8 border border-orange-500/20 rounded-lg p-2.5 mb-3">
                  <p className="text-[11px] text-orange-300">Upload an image first to use AI edit.</p>
                </div>
              )}
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. make the sky dramatic with storm clouds, turn into oil painting, add snow"
                rows={3}
                disabled={!hasImage}
                className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40 resize-none transition-colors leading-relaxed disabled:opacity-40"
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) canSubmit && handleSubmit() }}
              />
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[10px] text-slate-600">Ctrl+Enter to apply</span>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    !canSubmit
                      ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500 border border-white/8'
                      : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                  }`}
                >
                  {falLoading ? (
                    <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Editing…</>
                  ) : (
                    <>✏️ Apply Edit</>
                  )}
                </button>
              </div>
              {falLoading && falProgress && (
                <p className="text-[10px] text-accent-cyan/70 mt-1 truncate">{falProgress}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Upscale mode ── */}
        {mode === 'upscale' && (
          <motion.div key="up" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="flex flex-col gap-3">
            <div className="glass rounded-xl border border-white/8 p-3">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-lg">🔍</div>
                <div>
                  <h4 className="text-xs font-semibold text-white mb-0.5">AI Upscale</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Clarity Upscaler — AI-powered, restores detail while enlarging.</p>
                </div>
              </div>
              {!hasImage && (
                <div className="bg-orange-500/8 border border-orange-500/20 rounded-lg p-2.5 mb-3">
                  <p className="text-[11px] text-orange-300">Upload an image first to upscale.</p>
                </div>
              )}
              {/* Scale selector */}
              <div className="mb-3">
                <p className="text-[11px] text-slate-400 font-semibold mb-2">Scale factor</p>
                <div className="flex gap-2">
                  {[2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setUpscaleScale(s)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        upscaleScale === s
                          ? 'border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan'
                          : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/18 hover:text-slate-200'
                      }`}
                    >{s}× Upscale</button>
                  ))}
                </div>
              </div>
              {/* Optional prompt */}
              <div className="mb-3">
                <label className="block text-[11px] text-slate-400 font-semibold mb-1.5">Enhancement prompt (optional)</label>
                <input
                  type="text"
                  value={upscalePrompt}
                  onChange={e => setUpscalePrompt(e.target.value)}
                  placeholder="e.g. sharp details, ultra HD"
                  className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40 transition-colors"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  !canSubmit
                    ? 'bg-white/5 border border-white/10 text-slate-500 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
                }`}
              >
                {falLoading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{falProgress || 'Upscaling…'}</>
                ) : (
                  <>🔍 Upscale {upscaleScale}×</>
                )}
              </button>
              {falLoading && falProgress && (
                <p className="text-center text-[10px] text-accent-cyan/70 mt-1">{falProgress}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Version history (shared) ──────────────────────────────────────────────────
function VersionHistory({ editHistory, onRestoreVersion, currentVersionIndex }) {
  return (
    <div className="glass rounded-xl border border-white/8 p-4">
      <h4 className="text-xs font-semibold text-slate-400 mb-3">Version History</h4>
      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {editHistory.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => onRestoreVersion(idx)}
              className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-all ${
                currentVersionIndex === idx
                  ? 'border-accent-cyan/30 bg-accent-cyan/8'
                  : 'border-white/5 hover:border-white/12 hover:bg-white/4'
              }`}
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt="version"
                  className="w-9 h-9 rounded-md object-cover flex-shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-md bg-white/5 flex-shrink-0 flex items-center justify-center text-lg">
                  {idx === editHistory.length - 1 ? '📷' : '✨'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${currentVersionIndex === idx ? 'text-accent-cyan' : 'text-slate-300'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              {currentVersionIndex === idx && (
                <span className="text-[10px] text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded flex-shrink-0">active</span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Main AIEditPanel ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'effects',    label: 'Effects',    icon: '🎨' },
  { id: 'background', label: 'BG Remove',  icon: '✂️' },
  { id: 'generate',   label: 'fal.ai',     icon: '🪄' },
]

export default function AIEditPanel({
  hasImage,
  onApplyEffect,
  onRemoveBackground,
  onGenerate,
  onEditImage,
  onUpscaleImage,
  effectsLoading,
  activeEffect,
  bgLoading,
  bgProgress,
  falLoading,
  falProgress,
  editHistory,
  onRestoreVersion,
  currentVersionIndex,
}) {
  const [tab, setTab] = useState('effects')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      {/* Tab bar */}
      <div className="flex rounded-xl overflow-hidden border border-white/8 bg-white/3">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
              tab === t.id
                ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-white border-b-2 border-accent-cyan'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'effects' && (
            <EffectsPanel
              hasImage={hasImage}
              onApplyEffect={onApplyEffect}
              effectsLoading={effectsLoading}
              activeEffect={activeEffect}
              editHistory={editHistory}
              onRestoreVersion={onRestoreVersion}
              currentVersionIndex={currentVersionIndex}
            />
          )}
          {tab === 'background' && (
            <BackgroundPanel
              hasImage={hasImage}
              onRemoveBackground={onRemoveBackground}
              bgLoading={bgLoading}
              bgProgress={bgProgress}
            />
          )}
          {tab === 'generate' && (
            <GeneratePanel
              hasImage={hasImage}
              onGenerate={onGenerate}
              onEditImage={onEditImage}
              onUpscaleImage={onUpscaleImage}
              falLoading={falLoading}
              falProgress={falProgress}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
