import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const TECH_STACK = [
  { name: 'React 18', icon: '⚛️', desc: 'UI library', color: 'text-sky-400' },
  { name: 'Vite 5', icon: '⚡', desc: 'Build tool', color: 'text-yellow-400' },
  { name: 'TailwindCSS', icon: '🎨', desc: 'Styling', color: 'text-teal-400' },
  { name: 'Framer Motion', icon: '🎬', desc: 'Animations', color: 'text-pink-400' },
  { name: 'React Router', icon: '🧭', desc: 'Routing', color: 'text-red-400' },
  { name: 'Gemini 2.0', icon: '🤖', desc: 'AI Vision', color: 'text-accent-cyan' },
  { name: 'Canvas API', icon: '🖼️', desc: 'Image export', color: 'text-orange-400' },
  { name: 'localStorage', icon: '💾', desc: 'History store', color: 'text-purple-400' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Image Encoding',
    desc: 'When you upload a photo, the browser\'s FileReader API converts it to a base64-encoded string. This encoding allows binary image data to be transmitted as plain text in a JSON request.',
  },
  {
    step: '02',
    title: 'Gemini Vision API',
    desc: 'The base64 image is sent to the Gemini 2.0 Flash endpoint as inline_data. The model receives both the image pixels and a structured prompt asking for a JSON analysis with specific enhancement parameters.',
  },
  {
    step: '03',
    title: 'JSON Parsing',
    desc: 'Gemini returns values for brightness, contrast, saturation, hue-rotate, and sharpness — plus a scene type and written analysis. We strip any markdown fencing and parse the JSON, with fallback values if parsing fails.',
  },
  {
    step: '04',
    title: 'CSS Filter Application',
    desc: 'The parsed values are assembled into a CSS filter string (e.g., brightness(1.2) contrast(1.15)...) and applied directly to the <img> element. This is GPU-accelerated and updates in real time.',
  },
  {
    step: '05',
    title: 'Canvas Export',
    desc: 'For download, the image is drawn onto an HTML Canvas element with ctx.filter set to the same filter string. The Canvas then exports to a Blob in the chosen format (PNG/JPEG/WEBP) at the specified quality level.',
  },
]

export default function About() {
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple/6 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-purple/25 bg-accent-purple/8 text-xs font-medium text-accent-purple mb-6"
          >
            About LensAI
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-syne font-extrabold text-4xl sm:text-5xl text-white mb-5"
          >
            AI meets{' '}
            <span className="gradient-text">photo editing</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg leading-relaxed"
          >
            LensAI is a fully client-side image enhancement tool that leverages Google Gemini's vision capabilities
            to intelligently analyze and enhance photos — without ever uploading your images to a server.
          </motion.p>
        </div>
      </section>

      {/* Project description */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: '100% Client-Side',
              icon: '🔒',
              desc: 'Your photos never leave your device. All image processing happens in the browser using the Canvas API and CSS filters. Only a base64 representation is sent to the Gemini API — and only when you click "Enhance with AI".',
            },
            {
              title: 'No Account Required',
              icon: '✅',
              desc: 'Just add your own Gemini API key (free from Google AI Studio) and start enhancing. Your key is stored in localStorage and never leaves your browser.',
            },
            {
              title: 'Non-Destructive Editing',
              icon: '↩️',
              desc: 'All enhancements are applied as CSS filter transforms. The original image data is never modified — reset to original with a single click at any time.',
            },
            {
              title: 'Open Architecture',
              icon: '🏗️',
              desc: 'Built on open web standards: React, Vite, TailwindCSS, Canvas API. No proprietary SDKs or cloud backends. Fork it, extend it, build on top of it.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl border border-white/8 p-6"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-syne font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-syne font-bold text-2xl sm:text-3xl text-white text-center mb-10"
        >
          Technology Stack
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TECH_STACK.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl border border-white/8 p-4 text-center hover:border-white/15 transition-colors"
            >
              <div className="text-3xl mb-2">{tech.icon}</div>
              <div className={`font-syne font-semibold text-sm ${tech.color} mb-0.5`}>{tech.name}</div>
              <div className="text-xs text-slate-600">{tech.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How the AI works */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-white mb-3">How the AI works</h2>
          <p className="text-slate-500">A plain-English explanation of the pipeline.</p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-accent-cyan/40 via-accent-purple/40 to-transparent hidden sm:block" />

          <div className="space-y-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 border border-accent-cyan/20 flex items-center justify-center">
                  <span className="font-syne font-bold text-sm gradient-text">{item.step}</span>
                </div>
                <div className="flex-1 glass rounded-xl border border-white/8 p-4">
                  <h3 className="font-syne font-semibold text-white mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-white mb-4">
            Ready to see it in action?
          </h2>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-syne font-bold text-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:opacity-90 transition-all shadow-2xl hover:-translate-y-0.5"
          >
            Open the App
          </Link>
        </motion.div>
      </section>
    </motion.div>
  )
}
