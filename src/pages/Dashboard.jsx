import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  processImage,
  detectDarkBackground,
  addWhiteBackground,
  blobToDataURL,
} from '../services/processService'

const MODES = [
  {
    id: 'remove_bg',
    label: 'Remove Background',
    desc: 'Remove background & clean the image',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    id: 'remove_mannequin',
    label: 'Remove Mannequin',
    desc: 'Remove mannequin, keep only jewelry',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7v6M9 10h6M9 20h6M10 13l-1 7M14 13l1 7"/>
      </svg>
    ),
  },
  {
    id: 'enhance',
    label: 'Enhance & Polish',
    desc: 'AI-powered shine & detail enhancement',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
    ),
  },
]

export default function Dashboard() {
  const [original, setOriginal]     = useState(null)
  const [fileName, setFileName]     = useState('')
  const [result, setResult]         = useState(null)
  const [rawResult, setRawResult]   = useState(null) // result before white bg
  const [mode, setMode]             = useState('remove_bg')
  const [isDark, setIsDark]         = useState(false)
  const [whiteBg, setWhiteBg]       = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress]     = useState({ msg: '', pct: 0 })
  const [dragging, setDragging]     = useState(false)
  const [error, setError]           = useState('')
  const fileInputRef = useRef(null)

  const loadImage = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }
    setError('')
    setResult(null)
    setWhiteBg(false)
    setFileName(file.name)

    const dataURL = await blobToDataURL(file)
    setOriginal(dataURL)

    const dark = await detectDarkBackground(dataURL)
    setIsDark(dark)
  }, [])

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) loadImage(f)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) loadImage(f)
  }

  const handleProcess = async () => {
    if (!original || processing) return
    setProcessing(true)
    setResult(null)
    setError('')
    setProgress({ msg: 'Starting…', pct: 5 })

    try {
      const out = await processImage(
        original,
        mode,
        { whiteBg: false }, // we handle white bg separately via toggle
        (msg, pct) => setProgress({ msg, pct })
      )
      setRawResult(out)
      if (whiteBg) {
        const withWhite = await addWhiteBackground(out)
        setResult(withWhite)
      } else {
        setResult(out)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleWhiteBgToggle = async (checked) => {
    setWhiteBg(checked)
    if (rawResult) {
      if (checked) {
        const withWhite = await addWhiteBackground(rawResult)
        setResult(withWhite)
      } else {
        setResult(rawResult)
      }
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result
    const ext  = '.png'
    const base = fileName.replace(/\.[^.]+$/, '') || 'processed'
    a.download = `${base}_processed${ext}`
    a.click()
  }

  const handleReset = () => {
    setOriginal(null)
    setResult(null)
    setRawResult(null)
    setFileName('')
    setIsDark(false)
    setWhiteBg(false)
    setError('')
    setProgress({ msg: '', pct: 0 })
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* ── Upload Zone (no image) ── */}
      {!original && (
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-semibold text-stone-800 mb-2">
                Upload Jewelry Image
              </h2>
              <p className="text-stone-500">
                Upload a product photo to remove mannequin, background, or enhance it.
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`card-base border-2 border-dashed cursor-pointer transition-all duration-200 rounded-2xl p-16 flex flex-col items-center gap-4
                ${dragging ? 'border-gold bg-gold-dim' : 'border-stone-200 hover:border-gold hover:bg-gold-dim'}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-gold-light' : 'bg-stone-100'}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#C9A84C' : '#78716C'} strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-stone-700 font-medium">Drop image here or <span className="gradient-gold font-semibold">browse</span></p>
                <p className="text-stone-400 text-sm mt-1">JPG, PNG, WEBP supported</p>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </motion.div>
        </div>
      )}

      {/* ── Main Processing UI ── */}
      {original && (
        <div className="flex-1 flex flex-col lg:flex-row gap-0">

          {/* Left: Images */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-800">Image Studio</h2>
                <p className="text-stone-400 text-sm">{fileName}</p>
              </div>
              <button onClick={handleReset} className="btn-outline text-sm py-2 px-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                New Image
              </button>
            </div>

            <div className={`grid gap-4 flex-1 ${result ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Original */}
              <div className="card-base overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-stone-100">
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Original</span>
                </div>
                <div className="flex-1 checkerboard flex items-center justify-center p-4 min-h-48">
                  <img
                    src={original}
                    alt="Original"
                    className="max-h-72 max-w-full object-contain rounded-lg shadow-card"
                  />
                </div>
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card-base overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Result</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Ready
                      </span>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 text-xs font-medium text-gold bg-gold-dim hover:bg-gold-light border border-gold/30 rounded-lg px-2.5 py-1 transition-all"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Save Image
                      </button>
                    </div>
                  </div>
                  <div className={`flex-1 flex items-center justify-center p-4 min-h-48 relative group ${whiteBg ? 'bg-white' : 'checkerboard'}`}>
                    <img
                      src={result}
                      alt="Result"
                      className="max-h-72 max-w-full object-contain rounded-lg shadow-card"
                    />
                    {/* Hover overlay download */}
                    <button
                      onClick={handleDownload}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-b-2xl"
                    >
                      <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-sm font-medium px-4 py-2 rounded-xl shadow-lift flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Save Image
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Processing Progress */}
            <AnimatePresence>
              {processing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="card-base p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-700 flex items-center gap-2">
                      <svg className="animate-spin-slow w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#E7E5E4" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      {progress.msg}
                    </span>
                    <span className="text-sm text-stone-400">{progress.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #C9A84C, #B8960A)' }}
                      animate={{ width: `${progress.pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Right: Control Panel */}
          <div className="w-full lg:w-72 bg-white border-t lg:border-t-0 lg:border-l border-stone-200 p-6 flex flex-col gap-6">

            {/* Mode Selection */}
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">Processing Mode</h3>
              <div className="flex flex-col gap-2">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setResult(null); setError('') }}
                    className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                      mode === m.id
                        ? 'border-gold bg-gold-dim text-stone-800'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <div className={`flex items-center gap-2.5 ${mode === m.id ? 'text-gold' : 'text-stone-400'}`}>
                      {m.icon}
                      <span className={`text-sm font-medium ${mode === m.id ? 'text-stone-800' : 'text-stone-700'}`}>
                        {m.label}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1 ml-8">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">Options</h3>
              <div className="space-y-3">
                {/* White Background Toggle */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isDark ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-stone-50'
                }`}>
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={whiteBg}
                      onChange={e => handleWhiteBgToggle(e.target.checked)}
                    />
                    <div className={`w-9 h-5 rounded-full transition-colors ${whiteBg ? 'bg-gold' : 'bg-stone-300'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${whiteBg ? 'translate-x-4' : ''}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">
                      White Background
                      {isDark && <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Dark image detected</span>}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">Place result on white background</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleProcess}
                disabled={!original || processing}
                className="btn-gold w-full justify-center text-base py-3"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin-slow w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Process Image
                  </>
                )}
              </button>

              {result && (
                <motion.button
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleDownload}
                  className="btn-outline w-full justify-center"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Result
                </motion.button>
              )}
            </div>

            {/* Mode Info */}
            <div className="text-xs text-stone-400 text-center">
              {mode === 'remove_mannequin' && (
                <p>AI removes mannequin & keeps jewelry on clean background</p>
              )}
              {mode === 'remove_bg' && (
                <p>Removes background, keeps jewelry & mannequin isolated</p>
              )}
              {mode === 'enhance' && (
                <p>AI enhances lighting, sharpness & gem brilliance</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
