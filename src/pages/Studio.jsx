import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAI } from '../hooks/useAI.js'
import { useImageFilters } from '../hooks/useImageFilters.js'
import { useHistory } from '../hooks/useHistory.js'
import { useToast } from '../hooks/useToast.js'
import { useBackgroundRemoval } from '../hooks/useBackgroundRemoval.js'
import { fileToDataURL, getImageDimensions, resizeImage, downloadImageWithFilters } from '../utils/imageUtils.js'
import { DEFAULT_FILTERS, PRESETS } from '../utils/filterUtils.js'

// ─── Mode config ───────────────────────────────────────────────────────────────
const MODES = [
  { id: 'generate', label: 'Generate', icon: '✨', desc: 'Text → Image' },
  { id: 'edit',     label: 'Edit',     icon: '✏️', desc: 'Rewrite an image with AI' },
  { id: 'enhance',  label: 'Enhance',  icon: '🎨', desc: 'Smart photo enhancement' },
]

const ASPECT_RATIOS = [
  { id: 'square_hd',      label: '1:1',  w: 1024, h: 1024 },
  { id: 'portrait_4_3',   label: '3:4',  w: 768,  h: 1024 },
  { id: 'landscape_4_3',  label: '4:3',  w: 1024, h: 768  },
  { id: 'landscape_16_9', label: '16:9', w: 1024, h: 576  },
]

function dataURLtoBase64(d) { return d.split(',')[1] }
function dataURLtoMime(d)   { return d.split(';')[0].split(':')[1] }

// ─── Studio ────────────────────────────────────────────────────────────────────
export default function Studio() {
  const [mode, setMode]               = useState('generate')
  const [prompt, setPrompt]           = useState('')
  const [aspectRatio, setAspectRatio] = useState('square_hd')
  const [imageDataURL, setImageDataURL] = useState(null)
  const [originalURL, setOriginalURL]   = useState(null)
  const [showCompare, setShowCompare]   = useState(false)
  const [analysisText, setAnalysisText] = useState('')
  const [rightTab, setRightTab]         = useState('settings') // 'settings' | 'adjust' | 'history'

  const fileRef = useRef(null)

  const ai = useAI()
  const { filters, filterString, updateFilter, applyFilters, resetFilters } = useImageFilters()
  const { history, addToHistory } = useHistory()
  const { removeBackground, loading: bgLoading, progress: bgProgress } = useBackgroundRemoval()
  const toast = useToast()

  const hasImage = Boolean(imageDataURL)
  const isLoading = ai.loading || bgLoading

  // ── Upload ──────────────────────────────────────────────────────────────────
  const loadFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Please upload a valid image.'); return }
    if (file.size > 20 * 1024 * 1024) { toast.error('File too large (max 20 MB).'); return }
    const url = await fileToDataURL(file)
    setImageDataURL(url)
    setOriginalURL(url)
    setAnalysisText('')
    setShowCompare(false)
    resetFilters()
    toast.info(`${file.name} loaded`)
  }, [resetFilters, toast])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [loadFile])

  // ── Run AI ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() && mode !== 'enhance') return
    if (!ai.hasKey) { toast.error('Add your API key in Settings (top right).'); return }

    try {
      let result

      if (mode === 'generate') {
        toast.info('Generating…')
        result = await ai.generate(prompt.trim(), { imageSize: aspectRatio })
        setOriginalURL(result)
        setAnalysisText('')
        resetFilters()
      } else if (mode === 'edit') {
        if (!hasImage) { toast.error('Upload an image first.'); return }
        toast.info('Editing image…')
        result = await ai.edit(imageDataURL, prompt.trim())
        setOriginalURL(imageDataURL)
      } else if (mode === 'enhance') {
        if (!hasImage) { toast.error('Upload an image first.'); return }
        if (!ai.provider.supportsEnhance) { toast.error(`${ai.provider.name} does not support Enhance. Switch to Gemini.`); return }
        toast.info('Analysing image…')
        const analysis = await ai.enhance(imageDataURL)
        applyFilters({
          brightness: analysis.brightness,
          contrast:   analysis.contrast,
          saturate:   analysis.saturate,
          hueRotate:  analysis.hueRotate,
          sharpness:  analysis.sharpness,
          warmth: 0,
        }, 'AI Enhanced')
        setAnalysisText(analysis.analysis)
        setShowCompare(true)
        toast.success(`Enhanced — ${analysis.sceneType} detected`)
        const thumb = await resizeImage(imageDataURL, 200).catch(() => imageDataURL)
        addToHistory({ id: Date.now().toString(), filename: 'Enhanced', thumbnail: thumb, filtersApplied: filters, timestamp: Date.now() })
        return
      }

      setImageDataURL(result)
      setShowCompare(false)
      toast.success('Done!')
      setPrompt('')

      const thumb = await resizeImage(result, 200).catch(() => result)
      addToHistory({ id: Date.now().toString(), filename: prompt.slice(0, 40) || 'Generated', thumbnail: thumb, filtersApplied: DEFAULT_FILTERS, timestamp: Date.now() })
    } catch (err) {
      toast.error(err.message || 'Something went wrong.')
    }
  }, [mode, prompt, aspectRatio, imageDataURL, hasImage, ai, filters, applyFilters, resetFilters, addToHistory, toast])

  // ── Background removal ──────────────────────────────────────────────────────
  const handleBgRemove = useCallback(async () => {
    if (!hasImage) { toast.error('Upload an image first.'); return }
    toast.info('Removing background…')
    try {
      const result = await removeBackground(imageDataURL, 'transparent')
      setOriginalURL(imageDataURL)
      setImageDataURL(result)
      toast.success('Background removed!')
      const thumb = await resizeImage(result, 200).catch(() => result)
      addToHistory({ id: Date.now().toString(), filename: 'BG Removed', thumbnail: thumb, filtersApplied: filters, timestamp: Date.now() })
    } catch (err) { toast.error(err.message || 'Background removal failed.') }
  }, [hasImage, imageDataURL, removeBackground, filters, addToHistory, toast])

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (format = 'png') => {
    if (!hasImage) return
    try {
      await downloadImageWithFilters(imageDataURL, filterString, 'lensai-image', format, 0.95)
      toast.success(`Downloaded as ${format.toUpperCase()}`)
    } catch { toast.error('Download failed.') }
  }, [hasImage, imageDataURL, filterString, toast])

  // ── Restore from history ────────────────────────────────────────────────────
  const handleHistoryRestore = useCallback((item) => {
    setImageDataURL(item.thumbnail)
    setOriginalURL(item.thumbnail)
    applyFilters(item.filtersApplied, 'Restored')
    setAnalysisText('')
    setShowCompare(false)
    toast.info(`Restored: ${item.filename}`)
  }, [applyFilters, toast])

  const canSubmit = !isLoading && ai.hasKey && (
    mode === 'generate' ? prompt.trim().length > 0 :
    mode === 'edit'     ? prompt.trim().length > 0 && hasImage :
    hasImage
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Mode bar */}
      <div className="flex-shrink-0 h-11 border-b border-white/6 flex items-center px-4 gap-1 bg-canvas/60 backdrop-blur-sm">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === m.id
                ? 'bg-primary text-white shadow-sm shadow-violet-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}

        {/* Right: info */}
        <div className="ml-auto flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-violet-400">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {bgLoading ? bgProgress || 'Processing…' : 'Running AI…'}
            </div>
          )}
          {hasImage && (
            <button
              onClick={() => setShowCompare(v => !v)}
              className={`btn-ghost text-xs py-1 px-2.5 ${showCompare ? 'border-violet-500/40 text-violet-300' : ''}`}
            >
              {showCompare ? 'Show Result' : 'Compare'}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Canvas area */}
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              {hasImage ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="relative max-w-full max-h-full"
                  style={{ maxHeight: 'calc(100vh - 280px)' }}
                >
                  <img
                    src={showCompare && originalURL ? originalURL : imageDataURL}
                    alt="Studio canvas"
                    style={{ filter: showCompare ? 'none' : filterString }}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-black/50 border border-white/6"
                    draggable={false}
                  />
                  {showCompare && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full border border-white/10 font-medium">
                      Before
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center max-w-sm"
                >
                  {mode === 'generate' ? (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                        <svg className="w-10 h-10 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-zinc-400 font-medium mb-2">Ready to generate</p>
                      <p className="text-zinc-600 text-sm">Type a prompt below and press Generate</p>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-40 h-40 rounded-2xl border-2 border-dashed border-white/12 hover:border-primary/40 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group mb-4"
                      >
                        <svg className="w-10 h-10 text-zinc-600 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">Upload Image</span>
                      </button>
                      <p className="text-zinc-600 text-xs">or drag &amp; drop · JPEG, PNG, WEBP · up to 20 MB</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analysis text */}
          <AnimatePresence>
            {analysisText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-shrink-0 border-t border-white/6 px-6 py-3"
              >
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span className="text-violet-400 font-medium">AI Analysis: </span>
                  {analysisText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt bar */}
          <div className="flex-shrink-0 border-t border-white/6 p-4">
            <div className="flex gap-3 items-end max-w-3xl mx-auto">
              {/* Upload button */}
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 transition-all self-end"
                title="Upload image"
              >
                <svg className="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Prompt input */}
              {mode !== 'enhance' ? (
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); canSubmit && handleSubmit() } }}
                  placeholder={
                    mode === 'generate'
                      ? 'Describe the image you want to create… (Enter to generate)'
                      : 'Describe what to change in the image… (Enter to apply)'
                  }
                  rows={1}
                  className="flex-1 input-base min-h-[40px] max-h-32 overflow-y-auto resize-none py-2.5 leading-relaxed"
                  style={{ height: 'auto' }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px' }}
                />
              ) : (
                <div className="flex-1 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center px-4">
                  <span className="text-sm text-zinc-500">
                    {hasImage ? 'Click Generate to smart-enhance this image' : 'Upload an image to enhance'}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-shrink-0 w-10 h-10 rounded-xl btn-primary self-end p-0 flex items-center justify-center"
                title={mode === 'generate' ? 'Generate' : mode === 'edit' ? 'Apply Edit' : 'Enhance'}
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error */}
            {ai.error && (
              <p className="text-center text-xs text-red-400 mt-2 max-w-3xl mx-auto">{ai.error}</p>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-64 xl:w-72 flex-shrink-0 border-l border-white/6 flex flex-col overflow-hidden" style={{ background: '#111113' }}>
          {/* Panel tabs */}
          <div className="flex border-b border-white/6 flex-shrink-0">
            {[
              { id: 'settings', label: 'Settings' },
              { id: 'adjust',   label: 'Adjust' },
              { id: 'history',  label: 'History' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setRightTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                  rightTab === t.id
                    ? 'text-white border-b-2 border-primary'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">

            {/* ── Settings tab ── */}
            {rightTab === 'settings' && (
              <>
                {/* No key warning */}
                {!ai.hasKey && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/6 p-4">
                    <p className="text-xs font-semibold text-orange-300 mb-1">API Key Required</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">Open Settings in the top bar to add your API key.</p>
                  </div>
                )}

                {/* Aspect ratio (generate mode only) */}
                {mode === 'generate' && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 mb-2">Aspect Ratio</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ASPECT_RATIOS.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setAspectRatio(r.id)}
                          className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                            aspectRatio === r.id
                              ? 'border-primary/50 bg-primary/12 text-violet-300'
                              : 'border-white/8 text-zinc-400 hover:border-white/16 hover:text-zinc-200'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Quick Tools</p>
                  <div className="space-y-2">
                    <button
                      onClick={handleBgRemove}
                      disabled={!hasImage || isLoading}
                      className="btn-ghost w-full justify-center text-xs py-2"
                    >
                      ✂️ Remove Background
                    </button>
                    <button
                      onClick={() => { resetFilters(); setShowCompare(false); setAnalysisText('') }}
                      disabled={!hasImage}
                      className="btn-ghost w-full justify-center text-xs py-2"
                    >
                      ↺ Reset Edits
                    </button>
                  </div>
                </div>

                {/* Download */}
                {hasImage && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 mb-2">Export</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['png', 'jpeg', 'webp'].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => handleDownload(fmt)}
                          className="btn-ghost text-[11px] py-1.5 justify-center uppercase tracking-wide"
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Adjust tab ── */}
            {rightTab === 'adjust' && (
              <>
                {!hasImage && (
                  <p className="text-xs text-zinc-600 text-center py-4">Upload an image to adjust filters</p>
                )}

                {/* Presets */}
                {hasImage && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 mb-2">Presets</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(PRESETS).slice(0, 6).map(([name, vals]) => (
                        <button
                          key={name}
                          onClick={() => applyFilters({ ...DEFAULT_FILTERS, ...vals }, name)}
                          className="btn-ghost text-[11px] py-1.5 justify-center capitalize"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sliders */}
                {hasImage && (
                  <div className="space-y-4">
                    {[
                      { key: 'brightness', label: 'Brightness', min: 0.5, max: 2,   step: 0.01 },
                      { key: 'contrast',   label: 'Contrast',   min: 0.5, max: 2.5, step: 0.01 },
                      { key: 'saturate',   label: 'Saturation', min: 0,   max: 3,   step: 0.01 },
                      { key: 'sharpness',  label: 'Sharpness',  min: 0,   max: 3,   step: 0.01 },
                      { key: 'hueRotate',  label: 'Hue',        min: -90, max: 90,  step: 1    },
                    ].map(({ key, label, min, max, step }) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-zinc-400">{label}</span>
                          <span className="text-xs font-mono text-zinc-500">{Number(filters[key]).toFixed(key === 'hueRotate' ? 0 : 2)}</span>
                        </div>
                        <input
                          type="range" min={min} max={max} step={step}
                          value={filters[key] ?? DEFAULT_FILTERS[key]}
                          onChange={e => updateFilter(key, parseFloat(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {hasImage && (
                  <button onClick={() => handleDownload('png')} className="btn-primary w-full justify-center text-xs py-2.5">
                    ↓ Download
                  </button>
                )}
              </>
            )}

            {/* ── History tab ── */}
            {rightTab === 'history' && (
              <>
                {history.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-4">No history yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {history.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleHistoryRestore(item)}
                        className="group relative rounded-xl overflow-hidden border border-white/6 hover:border-primary/40 transition-all aspect-square"
                      >
                        <img src={item.thumbnail} alt={item.filename} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Restore</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5"
            style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(6px)' }}
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute inset-3 rounded-full border-2 border-blue-500/20 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.4s' }} />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm mb-1">
                {bgLoading ? 'Removing background…' : `Running ${ai.provider?.name || 'AI'}…`}
              </p>
              <p className="text-zinc-500 text-xs">
                {bgLoading ? bgProgress : 'This may take a few seconds'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = '' }}
      />
    </div>
  )
}
