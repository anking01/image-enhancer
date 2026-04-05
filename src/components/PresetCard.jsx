import React from 'react'
import { motion } from 'framer-motion'

export default function PresetCard({ preset, onApply, active }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onApply(preset.filters)}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${
        active
          ? 'border-accent-cyan/50 bg-accent-cyan/10 shadow-lg shadow-accent-cyan/10'
          : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/6'
      }`}
    >
      <span className="text-2xl">{preset.icon}</span>
      <span className={`text-xs font-semibold ${active ? 'text-accent-cyan' : 'text-slate-300'}`}>
        {preset.name}
      </span>
      <span className="text-[10px] text-slate-500 leading-tight hidden sm:block">
        {preset.description}
      </span>
      {active && (
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-cyan" />
      )}
    </motion.button>
  )
}
