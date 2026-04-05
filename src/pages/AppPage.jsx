import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompareSlider from '../components/CompareSlider.jsx'
import EnhancementControls from '../components/EnhancementControls.jsx'
import HistorySidebar from '../components/HistorySidebar.jsx'
import AnalysisPanel from '../components/AnalysisPanel.jsx'
import AIEditPanel from '../components/AIEditPanel.jsx'
import { useAutoEnhance } from '../hooks/useAutoEnhance.js'
import { useImageEffects } from '../hooks/useImageEffects.js'
import { useBackgroundRemoval } from '../hooks/useBackgroundRemoval.js'
import { useCloudGenerate } from '../hooks/useCloudGenerate.js'
import { useImageFilters } from '../hooks/useImageFilters.js'
import { useHistory } from '../hooks/useHistory.js'
import { useToast } from '../hooks/useToast.js'
import {
  fileToDataURL,
  resizeImage,
  getImageDimensions,
  formatBytes,
  downloadImageWithFilters,
} from '../utils/imageUtils.js'
import { DEFAULT_FILTERS } from '../utils/filterUtils.js'

function dataURLtoBase64(dataURL) { return dataURL.split(',')[1] }
function dataURLtoMime(dataURL)   { return dataURL.split(';')[0].split(':')[1] }

export default function AppPage() {
  // ── Image state ──────────────────────────────────────────────
  const [originalDataURL, setOriginalDataURL] = useState(null)
  const [activeDataURL, setActiveDataURL]     = useState(null)
  const [imageMeta, setImageMeta]             = useState(null)

  // ── Version history ───────────────────────────────────────────
  const [editHistory, setEditHistory]             = useState([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0)

  // ── UI state ─────────────────────────────────────────────────
  const [isDragging, setIsDragging]       = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [activePreset, setActivePreset]   = useState(null)
  const [rightTab, setRightTab]           = useState('ai') // 'ai' | 'adjust'

  // ── Hooks ─────────────────────────────────────────────────────
  const { analyzeImage, loading: enhancing }                       = useAutoEnhance()
  const { applyEffect, loading: effectsLoading, activeEffect }     = useImageEffects()
  const { removeBackground, loading: bgLoading, progress: bgProgress } = useBackgroundRemoval()
  const {
    generateImage, editWithSD, checkStatus, loading: sdLoading,
    sdStatus, checkingSD,
  } = useCloudGenerate()
  const { filters, filterString, updateFilter, applyFilters, resetFilters, filterHistory } = useImageFilters()
  const { history, addToHistory, clearHistory }                    = useHistory()
  const toast = useToast()

  const isAnyLoading = enhancing || effectsLoading || bgLoading || sdLoading

  // ── Load image ────────────────────────────────────────────────
  const loadImage = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WEBP)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Please upload an image under 20 MB.')
      return
    }
    try {
      const dataURL = await fileToDataURL(file)
      const dims    = await getImageDimensions(dataURL)
      setOriginalDataURL(dataURL)
      setActiveDataURL(dataURL)
      setImageMeta({ filename: file.name, size: file.size, width: dims.width, height: dims.height })
      resetFilters()
      setAnalysisResult(null)
      setActivePreset(null)
      setEditHistory([{ id: 'original', label: 'Original', dataURL, thumbnail: null, timestamp: Date.now() }])
      setCurrentVersionIndex(0)
      toast.info(`${file.name} loaded`)
    } catch {
      toast.error('Failed to load image.')
    }
  }, [resetFilters, toast])

  const handleFileInput = useCallback((e) => { loadImage(e.target.files[0]); e.target.value = '' }, [loadImage])
  const handleDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback(() => setIsDragging(false), [])
  const handleDrop      = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadImage(e.dataTransfer.files[0]) }, [loadImage])

  // ── Push new version ──────────────────────────────────────────
  const pushVersion = useCallback(async (dataURL, label) => {
    const thumbnail = await resizeImage(dataURL, 80).catch(() => null)
    const entry = { id: Date.now().toString(), label, dataURL, thumbnail, timestamp: Date.now() }
    setEditHistory(prev => {
      const trimmed = prev.slice(0, currentVersionIndex + 1)
      setCurrentVersionIndex(0)
      return [entry, ...trimmed]
    })
    setActiveDataURL(dataURL)
  }, [currentVersionIndex])

  // ── Canvas Effects ────────────────────────────────────────────
  const handleApplyEffect = useCallback(async (effectId) => {
    if (!activeDataURL) return
    try {
      const result = await applyEffect(effectId, activeDataURL)
      await pushVersion(result, `Effect: ${effectId}`)
      const thumbnail = await resizeImage(result, 200).catch(() => result)
      addToHistory({ id: Date.now().toString(), filename: `Effect — ${effectId}`, thumbnail, filtersApplied: filters, timestamp: Date.now() })
      toast.success(`${effectId} applied`)
    } catch (err) {
      toast.error(err.message || 'Effect failed')
    }
  }, [activeDataURL, applyEffect, pushVersion, addToHistory, filters, toast])

  // ── Background Removal ────────────────────────────────────────
  const handleRemoveBackground = useCallback(async (bgColor = 'transparent') => {
    if (!activeDataURL) return
    try {
      toast.info('Starting background removal…')
      const result = await removeBackground(activeDataURL, bgColor)
      const label = bgColor === 'transparent' ? 'BG removed (transparent)'
                  : bgColor === '#000000'      ? 'BG removed → Black'
                  : bgColor === '#ffffff'      ? 'BG removed → White'
                  : `BG removed → ${bgColor}`
      await pushVersion(result, label)
      const thumbnail = await resizeImage(result, 200).catch(() => result)
      addToHistory({ id: Date.now().toString(), filename: label, thumbnail, filtersApplied: filters, timestamp: Date.now() })
      toast.success('Background removed!')
    } catch (err) {
      toast.error(err.message || 'Background removal failed')
    }
  }, [activeDataURL, removeBackground, pushVersion, addToHistory, filters, toast])

  // ── Local Stable Diffusion: Generate ─────────────────────────
  const handleGenerate = useCallback(async (prompt, options) => {
    try {
      const result = await generateImage(prompt, options)
      if (!originalDataURL) {
        setOriginalDataURL(result)
        setImageMeta({ filename: 'AI Generated', size: 0, width: options.width || 512, height: options.height || 512 })
        resetFilters()
        setEditHistory([{ id: 'original', label: 'Generated', dataURL: result, thumbnail: null, timestamp: Date.now() }])
        setCurrentVersionIndex(0)
      }
      await pushVersion(result, `Generate: ${prompt.slice(0, 40)}`)
      const thumbnail = await resizeImage(result, 200).catch(() => result)
      addToHistory({ id: Date.now().toString(), filename: `Generated — ${prompt.slice(0, 30)}`, thumbnail, filtersApplied: DEFAULT_FILTERS, timestamp: Date.now() })
      toast.success('Image generated!')
    } catch (err) {
      if (err.message === 'HF_NO_TOKEN') {
        toast.error('Add your free HuggingFace token in the Generate tab to enable AI generation.')
      } else if (err.message === 'HF_INVALID_TOKEN') {
        toast.error('Invalid HuggingFace token. Check and re-enter it in the Generate tab.')
      } else {
        toast.error(err.message || 'Generation failed')
      }
    }
  }, [originalDataURL, generateImage, pushVersion, addToHistory, resetFilters, toast])

  // ── Local Stable Diffusion: Edit image ────────────────────────
  const handleEditWithSD = useCallback(async (prompt, strength, options) => {
    if (!activeDataURL) return
    try {
      const result = await editWithSD(activeDataURL, prompt, strength, options)
      await pushVersion(result, `SD Edit: ${prompt.slice(0, 40)}`)
      const thumbnail = await resizeImage(result, 200).catch(() => result)
      addToHistory({ id: Date.now().toString(), filename: `SD Edit — ${prompt.slice(0, 30)}`, thumbnail, filtersApplied: filters, timestamp: Date.now() })
      toast.success('SD edit applied!')
    } catch (err) {
      if (err.message === 'HF_NO_TOKEN') {
        toast.error('Add your free HuggingFace token in the Generate tab to enable AI generation.')
      } else if (err.message === 'HF_INVALID_TOKEN') {
        toast.error('Invalid HuggingFace token. Check and re-enter it in the Generate tab.')
      } else {
        toast.error(err.message || 'AI edit failed')
      }
    }
  }, [activeDataURL, editWithSD, pushVersion, addToHistory, filters, toast])

  // ── Auto AI Enhance ───────────────────────────────────────────
  const handleEnhance = useCallback(async () => {
    if (!activeDataURL) return
    try {
      const base64 = dataURLtoBase64(activeDataURL)
      const mime   = dataURLtoMime(activeDataURL)
      const result = await analyzeImage(base64, mime)
      const newFilters = {
        brightness: result.brightness,
        contrast:   result.contrast,
        saturate:   result.saturate,
        hueRotate:  result.hueRotate,
        sharpness:  result.sharpness,
        warmth:     result.warmth,
      }
      applyFilters(newFilters, `Auto — ${result.sceneType}`)
      setAnalysisResult(result)
      setActivePreset(null)
      const thumbnail = await resizeImage(activeDataURL, 200).catch(() => activeDataURL)
      addToHistory({ id: Date.now().toString(), filename: imageMeta?.filename || 'Enhanced', thumbnail, filtersApplied: newFilters, timestamp: Date.now() })
      toast.success(`Smart enhance complete — ${result.sceneType} detected`)
    } catch (err) {
      toast.error(err.message || 'Enhancement failed')
    }
  }, [activeDataURL, analyzeImage, applyFilters, addToHistory, imageMeta, toast])

  // ── Version restore ───────────────────────────────────────────
  const handleRestoreVersion = useCallback((idx) => {
    const version = editHistory[idx]
    if (!version) return
    setActiveDataURL(version.dataURL)
    setCurrentVersionIndex(idx)
    toast.info(`Restored: ${version.label}`)
  }, [editHistory, toast])

  // ── Manual filters ────────────────────────────────────────────
  const handleFilterChange = useCallback((key, value) => { updateFilter(key, value); setActivePreset(null) }, [updateFilter])
  const handleApplyPreset  = useCallback((presetFilters, presetName) => {
    applyFilters({ ...DEFAULT_FILTERS, ...presetFilters }, `Preset — ${presetName}`)
    setActivePreset(presetName)
    toast.info(`${presetName} preset applied`)
  }, [applyFilters, toast])
  const handleReset = useCallback(() => { resetFilters(); setActivePreset(null); toast.info('Filters reset') }, [resetFilters, toast])

  // ── Download ──────────────────────────────────────────────────
  const handleDownload = useCallback(async (format, quality) => {
    if (!activeDataURL || !imageMeta) return
    try {
      await downloadImageWithFilters(activeDataURL, filterString, imageMeta.filename || 'image', format, quality)
      toast.success(`Downloaded as ${format.toUpperCase()}`)
    } catch {
      toast.error('Download failed.')
    }
  }, [activeDataURL, imageMeta, filterString, toast])

  // ── History sidebar select ────────────────────────────────────
  const handleHistorySelect = useCallback((item) => {
    setActiveDataURL(item.thumbnail)
    setOriginalDataURL(item.thumbnail)
    setImageMeta({ filename: item.filename, size: 0, width: '—', height: '—' })
    applyFilters(item.filtersApplied, 'Restored from history')
    setAnalysisResult(null)
    setEditHistory([{ id: 'restored', label: item.filename, dataURL: item.thumbnail, thumbnail: null, timestamp: Date.now() }])
    setCurrentVersionIndex(0)
    toast.info(`Restored: ${item.filename}`)
  }, [applyFilters, toast])

  const hasImage  = Boolean(activeDataURL)
  const beforeSrc = originalDataURL || activeDataURL
  const afterSrc  = activeDataURL

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-64px)] flex flex-col overflow-hidden"
    >
      {/* Top bar */}
      <div className="border-b border-white/5 bg-bg-secondary/50 backdrop-blur-sm px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="font-syne font-semibold text-sm text-white">Workspace</span>
          </div>
          {imageMeta && (
            <>
              <span className="text-white/15">|</span>
              <span className="text-xs text-slate-500 truncate max-w-[200px]">{imageMeta.filename}</span>
            </>
          )}
          {editHistory.length > 1 && (
            <span className="text-[10px] bg-accent-purple/15 text-accent-purple border border-accent-purple/25 px-1.5 py-0.5 rounded-full">
              v{editHistory.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAnyLoading && (
            <div className="flex items-center gap-1.5 text-xs text-accent-cyan">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing…
            </div>
          )}
          {/* badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-accent-cyan/80 bg-accent-cyan/8 border border-accent-cyan/15 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            Free · No Server
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: History sidebar */}
        <div className="w-52 xl:w-60 flex-shrink-0 border-r border-white/5 bg-bg-secondary/30 overflow-y-auto scrollbar-thin p-3">
          <HistorySidebar
            history={history}
            onSelect={handleHistorySelect}
            onClear={clearHistory}
            onUpload={handleFileInput}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        </div>

        {/* CENTER: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary relative">
          <div className="flex-1 p-3 flex items-center justify-center overflow-hidden relative">
            {hasImage ? (
              <div className="w-full h-full max-w-4xl">
                <CompareSlider
                  originalSrc={beforeSrc}
                  enhancedSrc={afterSrc}
                  filterString={filterString}
                />
              </div>
            ) : (
              <EmptyState
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDragging={isDragging}
              />
            )}

            {/* Loading overlay */}
            <AnimatePresence>
              {isAnyLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-5 z-20"
                >
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/30 border-t-accent-cyan animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-accent-purple/30 border-b-accent-purple animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.4s' }} />
                    <div className="absolute inset-4 rounded-full border-2 border-white/10 border-l-white/40 animate-spin" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      {bgLoading ? '✂️' : effectsLoading ? '🎨' : sdLoading ? '🪄' : '✨'}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-syne font-bold text-white text-base mb-1">
                      {bgLoading ? 'Removing background…'
                       : effectsLoading ? 'Applying effect…'
                       : sdLoading ? 'AI generating via HuggingFace…'
                       : 'Smart enhancing…'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {bgLoading && bgProgress ? bgProgress : 'Running locally in your browser'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image info bar */}
          {imageMeta && (
            <div className="flex-shrink-0 border-t border-white/5 bg-bg-secondary/50 px-4 py-2 flex items-center gap-5 text-xs text-slate-500 overflow-x-auto">
              <span className="flex items-center gap-1.5 flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {imageMeta.filename}
              </span>
              {imageMeta.width !== '—' && <span className="flex-shrink-0">{imageMeta.width} × {imageMeta.height} px</span>}
              {imageMeta.size > 0 && <span className="flex-shrink-0">{formatBytes(imageMeta.size)}</span>}
              {editHistory.length > 1 && (
                <span className="flex-shrink-0 text-accent-cyan">{editHistory.length - 1} edit{editHistory.length > 2 ? 's' : ''}</span>
              )}
            </div>
          )}

          {/* Analysis panel */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-shrink-0 border-t border-white/5 overflow-y-auto max-h-56 scrollbar-thin p-3"
              >
                <AnalysisPanel analysis={analysisResult} filterHistory={filterHistory} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Controls */}
        <div className="w-64 xl:w-72 flex-shrink-0 border-l border-white/5 bg-bg-secondary/30 flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => setRightTab('ai')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                rightTab === 'ai'
                  ? 'text-white border-b-2 border-accent-cyan bg-accent-cyan/5'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/3'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Tools
            </button>
            <button
              onClick={() => setRightTab('adjust')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                rightTab === 'adjust'
                  ? 'text-white border-b-2 border-accent-cyan bg-accent-cyan/5'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/3'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Adjust
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
            {rightTab === 'ai' ? (
              <AIEditPanel
                hasImage={hasImage}
                onApplyEffect={handleApplyEffect}
                onRemoveBackground={handleRemoveBackground}
                onGenerate={handleGenerate}
                onEditWithSD={handleEditWithSD}
                effectsLoading={effectsLoading}
                activeEffect={activeEffect}
                bgLoading={bgLoading}
                bgProgress={bgProgress}
                sdLoading={sdLoading}
                sdStatus={sdStatus}
                onCheckSDStatus={checkStatus}
                checkingSD={checkingSD}
                editHistory={editHistory}
                onRestoreVersion={handleRestoreVersion}
                currentVersionIndex={currentVersionIndex}
              />
            ) : (
              <EnhancementControls
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyPreset={handleApplyPreset}
                onReset={handleReset}
                onEnhance={handleEnhance}
                onDownload={handleDownload}
                enhancing={enhancing}
                hasImage={hasImage}
                activePreset={activePreset}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ onDragOver, onDragLeave, onDrop, isDragging }) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => document.getElementById('file-input').click()}
      className={`w-full h-full max-w-2xl border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-5 cursor-pointer transition-all ${
        isDragging
          ? 'border-accent-cyan bg-accent-cyan/5'
          : 'border-white/10 hover:border-white/20 hover:bg-white/2'
      }`}
    >
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-white/10 flex items-center justify-center">
        <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="text-center px-8">
        <p className="font-syne font-semibold text-xl text-slate-400 mb-2">
          {isDragging ? 'Drop your image here' : 'Upload a photo to edit'}
        </p>
        <p className="text-sm text-slate-600 mb-4">
          Drag & drop or click — JPEG, PNG, WEBP · up to 20 MB
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {['Canvas Effects', 'BG Removal', 'Smart Enhance', 'SD Generate'].map(label => (
            <span key={label} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-slate-500">
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        100% local — no API key needed
      </div>
    </div>
  )
}
