import React from 'react'
import { motion } from 'framer-motion'

const SCENE_ICONS = {
  portrait: '👤',
  landscape: '🏔️',
  product: '📦',
  architecture: '🏛️',
  food: '🍽️',
  lowlight: '🌙',
  nighttime: '🌃',
  indoor: '🏠',
  other: '📷',
}

export default function AnalysisPanel({ analysis, filterHistory }) {
  if (!analysis) return null

  const { analysis: text, sceneType, brightness, contrast, saturate, sharpness } = analysis

  const stats = [
    { label: 'Brightness', value: `${((brightness - 1) * 100).toFixed(0)}%`, positive: brightness >= 1 },
    { label: 'Contrast', value: `${((contrast - 1) * 100).toFixed(0)}%`, positive: contrast >= 1 },
    { label: 'Saturation', value: `${((saturate - 1) * 100).toFixed(0)}%`, positive: saturate >= 1 },
    { label: 'Sharpness', value: `+${sharpness.toFixed(1)}`, positive: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-xl border border-white/8 p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-syne font-semibold text-sm text-white">AI Analysis</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base">{SCENE_ICONS[sceneType] || '📷'}</span>
            <span className="text-xs text-slate-400 capitalize">{sceneType} detected</span>
          </div>
        </div>
      </div>

      {/* Analysis text */}
      <p className="text-sm text-slate-300 leading-relaxed mb-4 bg-white/3 rounded-lg p-3 border border-white/5">
        {text}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white/3 rounded-lg p-3 border border-white/5 text-center">
            <div className={`text-lg font-mono font-bold ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.positive && !stat.value.startsWith('+') ? '+' : ''}{stat.value}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Enhancement timeline */}
      {filterHistory && filterHistory.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-2">Enhancement Timeline</h4>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin">
            {filterHistory.slice().reverse().map((item, i) => (
              <div key={item.timestamp} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 flex items-center justify-center flex-shrink-0 text-[10px] text-accent-cyan font-bold">
                  {filterHistory.length - i}
                </span>
                <span>{item.label}</span>
                <span className="ml-auto text-slate-600 text-[10px]">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
