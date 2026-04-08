import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-white border-b border-stone-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gold-dim flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L29 10V22L16 29L3 22V10L16 3Z" stroke="#C9A84C" strokeWidth="2" fill="rgba(201,168,76,0.15)"/>
            <path d="M16 3L22 10H10L16 3Z" fill="#C9A84C" opacity="0.9"/>
            <path d="M10 10L16 29L3 22L10 10Z" fill="#C9A84C" opacity="0.5"/>
            <path d="M22 10L29 22L16 29L22 10Z" fill="#C9A84C" opacity="0.6"/>
          </svg>
        </div>
        <span className="font-display font-semibold text-stone-800 text-lg">GlowJewels</span>
        <span className="hidden sm:inline text-xs text-stone-400 font-medium bg-stone-100 px-2 py-0.5 rounded-full">Studio</span>
      </div>

      {/* Right: user + logout */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold-dim flex items-center justify-center">
              <span className="text-xs font-semibold text-gold">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-stone-600">{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
