import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI-Powered Enhancement',
    desc: 'Gemini analyzes your photo scene and applies optimal adjustments automatically.',
    color: 'from-accent-cyan/20 to-accent-cyan/5',
    border: 'border-accent-cyan/20',
    textColor: 'text-accent-cyan',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: 'Before/After Slider',
    desc: 'Drag the comparison slider to see the exact difference your enhancements make.',
    color: 'from-accent-purple/20 to-accent-purple/5',
    border: 'border-accent-purple/20',
    textColor: 'text-accent-purple',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Enhancement History',
    desc: 'Your last 5 images are saved locally so you can pick up right where you left off.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: 'Manual Controls',
    desc: 'Fine-tune brightness, contrast, saturation, sharpness, and warmth with live sliders.',
    color: 'from-orange-500/20 to-orange-500/5',
    border: 'border-orange-500/20',
    textColor: 'text-orange-400',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Upload Your Photo',
    desc: 'Drag & drop or click to upload any image — JPEG, PNG or WebP up to 5MB.',
    icon: '📤',
  },
  {
    num: '02',
    title: 'AI Analyzes Scene',
    desc: 'Gemini vision identifies the scene type and calculates the optimal enhancement settings.',
    icon: '🧠',
  },
  {
    num: '03',
    title: 'Download Enhanced',
    desc: 'Compare before/after, tweak manually, then export in your preferred format and quality.',
    icon: '⬇️',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Travel Photographer',
    avatar: 'PS',
    text: 'LensAI transformed my golden hour shots into something I\'d actually print. The landscape preset is insanely good — it boosted the greens and blues without making them look fake.',
    stars: 5,
  },
  {
    name: 'Marcus Reid',
    role: 'Product Designer',
    avatar: 'MR',
    text: 'I use it daily for quick client mockup photos. The AI correctly identifies product shots and applies a clean, professional look automatically. Saves me 20 minutes per shoot.',
    stars: 5,
  },
  {
    name: 'Sofia Nakamura',
    role: 'Content Creator',
    avatar: 'SN',
    text: 'The before/after comparison slider sold me. I can see exactly what changed and fine-tune if needed. The cinematic preset is my go-to for Reels thumbnails.',
    stars: 5,
  },
]

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/8 text-xs font-medium text-accent-cyan mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              Powered by Google Gemini 2.0 Flash
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-syne font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6"
          >
            Your photos,{' '}
            <span className="gradient-text">reimagined</span>
            <br />
            by AI.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload any photo and watch Gemini AI analyze it, detect the scene, and apply precision enhancements — all in your browser, in seconds.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/app"
              className="px-8 py-4 rounded-2xl font-syne font-bold text-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:opacity-90 transition-all shadow-2xl shadow-accent-cyan/20 hover:shadow-accent-cyan/30 hover:-translate-y-0.5"
            >
              Start Enhancing — Free
            </Link>
            <Link
              to="/features"
              className="px-8 py-4 rounded-2xl font-syne font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              See Features →
            </Link>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-8 mt-16 text-center"
          >
            {[
              { value: '6', label: 'Smart Presets' },
              { value: '5', label: 'Format Exports' },
              { value: '100%', label: 'Private — No Upload' },
              { value: 'Free', label: 'Gemini API' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-syne font-bold text-2xl gradient-text">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-syne font-bold text-3xl sm:text-4xl text-white mb-4">
            Everything you need to perfect your photos
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Professional-grade tools wrapped in an intuitive interface, powered by state-of-the-art AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`glass rounded-2xl p-6 border ${f.border} hover:scale-[1.02] transition-transform`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} border ${f.border} flex items-center justify-center mb-4 ${f.textColor}`}>
                {f.icon}
              </div>
              <h3 className="font-syne font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 bg-bg-secondary/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-syne font-bold text-3xl sm:text-4xl text-white mb-4">How it works</h2>
            <p className="text-slate-500">Three simple steps to a stunning photo.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-accent-cyan/30 via-accent-purple/30 to-accent-cyan/30" />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-2xl glass border border-white/10 flex items-center justify-center text-4xl shadow-xl">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                    <span className="font-syne font-bold text-xs text-white">{i + 1}</span>
                  </div>
                </div>
                <h3 className="font-syne font-bold text-lg text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-syne font-bold text-3xl sm:text-4xl text-white mb-4">What creators are saying</h2>
          <p className="text-slate-500">Trusted by photographers and content creators worldwide.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.stars)].map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto glass rounded-3xl border border-white/10 p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent-cyan/8 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent-purple/8 rounded-full blur-[80px]" />
          </div>
          <div className="relative">
            <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-4">
              Ready to enhance?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              It's completely free. Just add your Gemini API key and start transforming photos instantly.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-syne font-bold text-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:opacity-90 transition-all shadow-2xl shadow-accent-cyan/20 hover:-translate-y-0.5"
            >
              Open LensAI
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.div>
  )
}
