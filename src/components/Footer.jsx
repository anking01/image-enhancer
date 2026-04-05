import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg-secondary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3.5" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeWidth="2" d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
                </svg>
              </div>
              <span className="font-syne font-bold text-xl gradient-text">LensAI</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Powered by Google Gemini. Transform your photos with AI-driven enhancements in seconds.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-syne font-semibold text-sm text-white mb-3">Navigation</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/features', label: 'Features' },
                { to: '/about', label: 'About' },
                { to: '/app', label: 'Open App' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h4 className="font-syne font-semibold text-sm text-white mb-3">Built With</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>React + Vite</li>
              <li>TailwindCSS</li>
              <li>Framer Motion</li>
              <li>Google Gemini API</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} LensAI. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Your images are processed locally and never uploaded to our servers.
          </p>
        </div>
      </div>
    </footer>
  )
}
