import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROVIDER_LIST, getKey, saveKey, saveProvider } from '../services/aiService.js'

export default function ProviderModal({ isOpen, onClose, currentProvider, onProviderChange }) {
  const [selected, setSelected] = useState(currentProvider)
  const [keys, setKeys]         = useState({})
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelected(currentProvider)
      const initial = {}
      PROVIDER_LIST.forEach(p => { initial[p.id] = getKey(p.id) })
      setKeys(initial)
      setSaved(false)
    }
  }, [isOpen, currentProvider])

  const handleSave = () => {
    PROVIDER_LIST.forEach(p => {
      if (keys[p.id]) saveKey(p.id, keys[p.id])
    })
    saveProvider(selected)
    onProviderChange(selected)
    setSaved(true)
    setTimeout(onClose, 700)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl border-std surface p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">AI Provider Settings</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Choose your AI provider and enter your API key</p>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Provider selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PROVIDER_LIST.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selected === p.id
                      ? 'border-primary bg-primary-dim'
                      : 'border-white/8 hover:border-white/16 card'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-1 ${selected === p.id ? 'text-violet-300' : 'text-white'}`}>
                    {p.name}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.supportsGenerate && <Chip>Generate</Chip>}
                    {p.supportsEdit     && <Chip>Edit</Chip>}
                    {p.supportsEnhance  && <Chip>Enhance</Chip>}
                    {p.supportsUpscale  && <Chip>Upscale</Chip>}
                  </div>
                </button>
              ))}
            </div>

            {/* Key inputs */}
            <div className="space-y-4 mb-6">
              {PROVIDER_LIST.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-400">{p.keyLabel}</label>
                    <a
                      href={p.keyDocs}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Get key →
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={keys[p.id] || ''}
                      onChange={e => setKeys(k => ({ ...k, [p.id]: e.target.value }))}
                      placeholder={keys[p.id] ? '••••••••••••••••' : p.keyPlaceholder}
                      className="input-base pr-10"
                    />
                    {getKey(p.id) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1">Stored locally in your browser only.</p>
                </div>
              ))}
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'btn-primary'
              }`}
            >
              {saved ? '✓ Saved!' : 'Save Settings'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Chip({ children }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-zinc-400 font-medium">
      {children}
    </span>
  )
}
