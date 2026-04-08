import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function Signup() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signup } = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await signup(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-dim rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-dim rounded-full blur-3xl opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lift mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L29 10V22L16 29L3 22V10L16 3Z" stroke="#C9A84C" strokeWidth="2" fill="rgba(201,168,76,0.1)"/>
              <path d="M16 3L22 10H10L16 3Z" fill="#C9A84C" opacity="0.8"/>
              <path d="M10 10L16 29L3 22L10 10Z" fill="#C9A84C" opacity="0.5"/>
              <path d="M22 10L29 22L16 29L22 10Z" fill="#C9A84C" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-stone-900">GlowJewels Studio</h1>
          <p className="text-stone-500 text-sm mt-1">Professional jewelry image processing</p>
        </div>

        <div className="card-base p-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-6">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Your name"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full justify-center mt-2">
              {loading ? (
                <><svg className="animate-spin-slow w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-gold font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          &copy; {new Date().getFullYear()} GlowJewels Studio. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}
