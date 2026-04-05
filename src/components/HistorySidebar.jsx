import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HistorySidebar({ history, onSelect, onClear, onUpload, isDragging, onDragOver, onDragLeave, onDrop }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4 h-full"
    >
      {/* Upload area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative glass rounded-xl border-2 border-dashed transition-all duration-200 p-5 flex flex-col items-center justify-center gap-3 cursor-pointer group min-h-[140px] ${
          isDragging
            ? 'border-accent-cyan bg-accent-cyan/5 shadow-lg shadow-accent-cyan/10'
            : 'border-white/10 hover:border-white/20 hover:bg-white/3'
        }`}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-accent-cyan/20' : 'bg-white/5 group-hover:bg-white/8'}`}>
          <svg className={`w-5 h-5 transition-colors ${isDragging ? 'text-accent-cyan' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-accent-cyan' : 'text-slate-400 group-hover:text-slate-200'}`}>
            {isDragging ? 'Drop to upload' : 'Upload Image'}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">PNG, JPEG, WEBP up to 5MB</p>
        </div>
        <input
          id="file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onUpload}
        />
      </div>

      {/* History */}
      <div className="flex-1 glass rounded-xl border border-white/8 p-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-syne font-semibold text-sm text-white">Recent</h3>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-slate-600 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
            <svg className="w-8 h-8 text-slate-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-slate-600">No recent images</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin flex-1">
            <AnimatePresence>
              {history.map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => onSelect(item)}
                  className="flex items-center gap-3 p-2 rounded-lg border border-white/5 hover:border-white/12 hover:bg-white/4 transition-all group text-left"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.filename}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                      {item.filename}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
