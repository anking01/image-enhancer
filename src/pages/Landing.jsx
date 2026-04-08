import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI Image Generation',
    desc:  'Generate stunning images from text prompts using Google Gemini or FLUX models.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    title: 'Smart Image Editing',
    desc:  'Describe changes in plain language — AI understands and transforms your image.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'AI Enhancement',
    desc:  'Let AI analyse your photo and apply optimal brightness, contrast and colour settings.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Your Key, Your Privacy',
    desc:  'Use your own API key. Nothing is stored on any server — 100% private.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col overflow-y-auto scrollbar-thin">

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by Google Gemini &amp; fal.ai FLUX
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-syne font-bold text-white mb-6 leading-tight tracking-tight">
            Create &amp; edit images<br />
            <span className="gradient-text">with AI</span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            A professional AI image studio — generate, edit, and enhance photos
            using the latest AI models. Bring your own API key.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/studio" className="btn-primary px-7 py-3 text-base rounded-xl shadow-lg shadow-violet-900/30">
              Open Studio — it's free
            </Link>
            <a href="#features" className="btn-ghost px-7 py-3 text-base rounded-xl">
              See features
            </a>
          </div>
        </motion.div>

        {/* App preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 w-full max-w-3xl rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/60"
          style={{ background: '#111113' }}
        >
          <div className="h-10 border-b border-white/6 flex items-center px-4 gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[11px] text-zinc-600 font-medium mx-auto">LensAI Studio</span>
          </div>
          <div className="aspect-video bg-gradient-to-br from-violet-900/15 via-zinc-950 to-blue-900/15 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/25 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-zinc-500 text-sm">Your AI-generated image appears here</p>
            </div>
          </div>
          <div className="h-14 border-t border-white/6 flex items-center px-4 gap-3">
            <div className="flex-1 h-8 rounded-lg bg-white/4 border border-white/8 flex items-center px-3">
              <span className="text-xs text-zinc-600">A serene mountain lake at golden hour, cinematic...</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-5xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-syne font-bold text-white text-center mb-3">Everything you need</h2>
          <p className="text-zinc-500 text-center mb-14 max-w-md mx-auto text-sm">One studio for all your AI image needs — from generation to enhancement.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="p-5 rounded-2xl border border-white/7 card"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/12 text-violet-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-syne font-bold text-white mb-4">Ready to create?</h2>
          <p className="text-zinc-500 mb-8 text-sm">Open the studio and start generating with your own API key.</p>
          <Link to="/studio" className="btn-primary px-8 py-3 text-base rounded-xl shadow-lg shadow-violet-900/30">
            Open Studio
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/6 px-6 py-5 text-center">
        <p className="text-zinc-600 text-xs">LensAI — AI Image Studio</p>
      </footer>
    </div>
  )
}
