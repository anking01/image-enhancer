import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🤖',
    title: 'Gemini AI Analysis',
    short: 'Scene-aware AI enhancement powered by Google Gemini 2.0 Flash vision model.',
    long: 'Upload any photo and our integration with the Gemini 2.0 Flash vision API automatically detects the scene type — portrait, landscape, food, architecture, low-light, and more. It then computes precise brightness, contrast, saturation, sharpness, and hue values tailored specifically to that scene.',
    color: 'from-accent-cyan/15 to-transparent',
    border: 'border-accent-cyan/20',
    tag: 'Core',
  },
  {
    icon: '↔️',
    title: 'Before/After Slider',
    short: 'Drag a comparison divider to see the exact difference AI enhancement makes.',
    long: 'The interactive comparison slider lets you drag a vertical divider across your image to compare the original and enhanced versions side by side. Works with touch on mobile devices too. See exactly what changed at the pixel level before you commit to downloading.',
    color: 'from-accent-purple/15 to-transparent',
    border: 'border-accent-purple/20',
    tag: 'UI',
  },
  {
    icon: '🎨',
    title: 'Manual Adjustment Sliders',
    short: '6 real-time sliders: Brightness, Contrast, Saturation, Hue, Sharpness, Warmth.',
    long: 'Take full creative control with six precision sliders that update your image in real time using CSS filters. Each slider shows its live numeric value. Combine AI enhancement with manual tweaks for perfect results. All changes are non-destructive — reset to original with one click.',
    color: 'from-orange-500/15 to-transparent',
    border: 'border-orange-500/20',
    tag: 'Editing',
  },
  {
    icon: '✨',
    title: '6 Smart Presets',
    short: 'Portrait, Landscape, Low Light, Vivid, B&W, Cinematic — one click away.',
    long: 'Six carefully tuned presets designed by photo editing principles. Portrait softens skin tones, Landscape boosts natural colors, Low Light rescues dark images, Vivid maximizes punch, B&W creates timeless monochrome, and Cinematic adds a film-grade teal-orange look. Apply any preset with a single click.',
    color: 'from-emerald-500/15 to-transparent',
    border: 'border-emerald-500/20',
    tag: 'Presets',
  },
  {
    icon: '📂',
    title: 'Local History',
    short: 'Last 5 enhanced images saved in your browser — no server, completely private.',
    long: 'Every time you enhance an image, a thumbnail and its filter settings are saved to your browser\'s localStorage. The next time you visit, your recent work is right there in the sidebar. Click any thumbnail to instantly restore that image and its enhancement settings. Maximum 5 items to keep storage light.',
    color: 'from-blue-500/15 to-transparent',
    border: 'border-blue-500/20',
    tag: 'Privacy',
  },
  {
    icon: '⬇️',
    title: 'Multi-format Export',
    short: 'Download as PNG, JPEG, or WEBP with quality control. Canvas API rendering.',
    long: 'Export your enhanced image in three formats: PNG for lossless quality, JPEG for smaller file sizes, or WebP for the best compression-to-quality ratio. JPEG and WebP exports include a quality slider from 10% to 100%. The Canvas API redraws the image with all filters baked in — what you see is what you get.',
    color: 'from-pink-500/15 to-transparent',
    border: 'border-pink-500/20',
    tag: 'Export',
  },
]

export default function Features() {
  const [expanded, setExpanded] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Header */}
      <section className="relative py-24 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-accent-cyan/6 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-accent-purple/6 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-purple/25 bg-accent-purple/8 text-xs font-medium text-accent-purple mb-6"
          >
            Feature Overview
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-syne font-extrabold text-4xl sm:text-5xl text-white mb-5"
          >
            Everything in one place
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Hover over a card to see the full details. Click to expand.
          </motion.p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className={`glass rounded-2xl border ${f.border} p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                expanded === i ? 'ring-1 ring-accent-cyan/30' : ''
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} border ${f.border} flex items-center justify-center text-2xl mb-4`}>
                {f.icon}
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-syne font-bold text-white text-lg leading-tight">{f.title}</h3>
                <span className="text-[10px] font-semibold text-slate-500 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  {f.tag}
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">{f.short}</p>

              <motion.div
                initial={false}
                animate={{ height: expanded === i ? 'auto' : 0, opacity: expanded === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-slate-300 leading-relaxed mt-4 pt-4 border-t border-white/8">
                  {f.long}
                </p>
              </motion.div>

              <div className="flex items-center gap-1 mt-4 text-xs text-slate-600">
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded === i ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {expanded === i ? 'Show less' : 'Read more'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-syne font-bold text-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:opacity-90 transition-all shadow-2xl hover:-translate-y-0.5"
          >
            Try All Features Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </section>
    </motion.div>
  )
}
