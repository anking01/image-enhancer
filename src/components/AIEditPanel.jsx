import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CANVAS_EFFECTS } from '../hooks/useImageEffects.js'
import { saveToken } from '../hooks/useCloudGenerate.js'

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

// ── Sub-panel: Cloud AI Generate (HuggingFace) ────────────────────────────────
function GeneratePanel({ hasImage, onGenerate, onEditWithSD, sdLoading, sdStatus }) {
  const [prompt, setPrompt]     = useState('')
  const [mode, setMode]         = useState('generate')
  const [strength, setStrength] = useState(0.65)
  const [size, setSize]         = useState(512)
  const [showToken, setShowToken] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const hasToken = sdStatus === 'running'

  const handleSaveToken = () => {
    if (!tokenInput.trim()) return
    saveToken(tokenInput.trim())
    setTokenInput('')
    setShowToken(false)
    window.location.reload() // reload so hook picks up new token
  }

  const handleSubmit = () => {
    if (!prompt.trim()) return
    const opts = { width: size, height: size }
    if (mode === 'generate') onGenerate(prompt.trim(), opts)
    else onEditWithSD(prompt.trim(), strength, opts)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* HF Status banner */}
      <div className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
        hasToken ? 'border-green-500/30 bg-green-500/8' : 'border-orange-500/30 bg-orange-500/8'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasToken ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
          <span className="text-xs text-slate-300 truncate">
            {hasToken ? 'FLUX.1 ready via HuggingFace' : 'HF token required'}
          </span>
        </div>
        <button
          onClick={() => setShowToken(v => !v)}
          className="text-[11px] text-accent-cyan hover:underline flex-shrink-0"
        >
          {hasToken ? 'Change' : 'Add Token'}
        </button>
      </div>

      {/* Token setup */}
      <AnimatePresence>
        {(!hasToken || showToken) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl border border-orange-500/25 p-4">
              <h4 className="text-xs font-bold mb-1 text-orange-300">Free HuggingFace Token</h4>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Get a free token at{' '}
                <span className="text-accent-cyan">huggingface.co → Settings → Access Tokens</span>
                {' '}(Read permission is enough). Stored only in your browser.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveToken()}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40"
                />
                <button
                  onClick={handleSaveToken}
                  disabled={!tokenInput.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-white/8 bg-white/3">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            mode === 'generate'
              ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-white border-b-2 border-accent-cyan'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🪄 Text to Image
        </button>
        <button
          onClick={() => setMode('img2img')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            mode === 'img2img'
              ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-white border-b-2 border-accent-cyan'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          ✏️ Edit Image
        </button>
      </div>

      {/* Prompt */}
      <div className="glass rounded-xl border border-white/8 p-4">
        <label className="block text-xs font-semibold text-slate-400 mb-2">
          {mode === 'generate' ? 'Describe what to create' : 'Describe how to edit'}
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={
            mode === 'generate'
              ? 'e.g. a woman in a garden, golden hour, cinematic'
              : 'e.g. turn into oil painting style'
          }
          rows={3}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40 resize-none transition-colors leading-relaxed"
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit() }}
        />

        {mode === 'img2img' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Strength</span>
              <span className="font-mono text-accent-cyan">{strength.toFixed(2)}</span>
            </div>
            <input
              type="range" min={0.1} max={0.95} step={0.05}
              value={strength} onChange={e => setStrength(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Size */}
        <div className="mt-3">
          <label className="text-[11px] text-slate-400 block mb-1.5">Output size</label>
          <div className="flex gap-2">
            {[512, 768, 1024].map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                  size === s
                    ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40'
                    : 'bg-white/4 text-slate-500 border-white/8 hover:text-slate-300'
                }`}
              >{s}px</button>
            ))}
          </div>
        </div>

        {mode === 'generate' && (
          <p className="text-[10px] text-slate-600 mt-2">Powered by FLUX.1-schnell · ~10–30s</p>
        )}
        {mode === 'img2img' && (
          <p className="text-[10px] text-slate-600 mt-2">Powered by Stable Diffusion 1.5 · ~20–40s</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-slate-600">Ctrl+Enter to run</span>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || sdLoading || !hasToken || (mode === 'img2img' && !hasImage)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              !prompt.trim() || sdLoading || !hasToken || (mode === 'img2img' && !hasImage)
                ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500 border border-white/8'
                : 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:opacity-90 shadow-lg shadow-accent-cyan/15'
            }`}
          >
            {sdLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {mode === 'generate' ? 'Generate' : 'Apply Edit'}
              </>
            )}
          </button>
        </div>
      </div>
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
  { id: 'generate',   label: 'Generate',   icon: '🪄' },
]

export default function AIEditPanel({
  hasImage,
  onApplyEffect,
  onRemoveBackground,
  onGenerate,
  onEditWithSD,
  effectsLoading,
  activeEffect,
  bgLoading,
  bgProgress,
  sdLoading,
  sdStatus,
  onCheckSDStatus,
  checkingSD,
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
              onEditWithSD={onEditWithSD}
              sdLoading={sdLoading}
              sdStatus={sdStatus}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
