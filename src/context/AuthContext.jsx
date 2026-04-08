import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const TOKEN_KEY   = 'gj_token'
const USER_KEY    = 'gj_user'

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(getStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed.')
    saveSession(data.token, data.user)
  }

  const signup = async (name, email, password) => {
    const res = await fetch('/api/auth/signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Signup failed.')
    saveSession(data.token, data.user)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
