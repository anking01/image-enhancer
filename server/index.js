import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env from server directory regardless of where node is run from
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '.env') })

import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import FormData from 'form-data'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app  = express()
const PORT = process.env.PORT || 3001

const PHOTOROOM_KEY = process.env.PHOTOROOM_API_KEY || ''
const GEMINI_KEY    = process.env.GEMINI_API_KEY    || ''
const JWT_SECRET    = process.env.JWT_SECRET        || 'glowjewels_secret'

// ─── Database Setup ──────────────────────────────────────────────────────────

const db = new Database(path.join(__dirname, 'users.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'] }))
app.use(express.json({ limit: '30mb' }))

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Not authenticated.' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Session expired. Please login again.' })
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function base64ToBuffer(base64DataURL) {
  const base64 = base64DataURL.includes(',') ? base64DataURL.split(',')[1] : base64DataURL
  return Buffer.from(base64, 'base64')
}

function bufferToBase64(buffer, mimeType = 'image/png') {
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

function getMimeFromDataURL(dataURL) {
  return dataURL.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
}

// ─── PhotoRoom ───────────────────────────────────────────────────────────────

async function photoroomRemoveBg(imageBuffer, mimeType) {
  if (!PHOTOROOM_KEY) throw new Error('Background removal service not configured.')

  const form = new FormData()
  form.append('image_file', imageBuffer, { filename: 'image.jpg', contentType: mimeType })

  const res = await fetch('https://sdk.photoroom.com/v1/segment', {
    method:  'POST',
    headers: { 'x-api-key': PHOTOROOM_KEY, ...form.getHeaders() },
    body:    form,
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Processing error ${res.status}: ${txt}`)
  }

  const buf = await res.buffer()
  return bufferToBase64(buf, 'image/png')
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

async function geminiEdit(prompt, imageBase64DataURL) {
  if (!GEMINI_KEY) throw new Error('Enhancement service not configured. Please contact support.')

  const base64   = imageBase64DataURL.split(',')[1]
  const mimeType = getMimeFromDataURL(imageBase64DataURL)

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_KEY}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Enhancement error ${res.status}`)
  }

  const data    = await res.json()
  const parts   = data?.candidates?.[0]?.content?.parts || []
  const imgPart = parts.find(p => p.inline_data?.data)
  if (!imgPart) throw new Error('No result returned from enhancement service.')

  return `data:${imgPart.inline_data.mime_type};base64,${imgPart.inline_data.data}`
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ ok: true }))

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required.' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (existing)
      return res.status(400).json({ error: 'An account with this email already exists.' })

    const hash = await bcrypt.hash(password, 10)
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email.toLowerCase(), hash)

    const token = jwt.sign({ id: result.lastInsertRowid, email: email.toLowerCase(), name }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { name, email: email.toLowerCase() } })
  } catch (err) {
    console.error('[signup]', err.message)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' })

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password.' })

    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password.' })

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { name: user.name, email: user.email } })
  } catch (err) {
    console.error('[login]', err.message)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ─── Image Processing Routes (protected) ─────────────────────────────────────

app.post('/api/remove-background', requireAuth, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'No image provided.' })
    const result = await photoroomRemoveBg(base64ToBuffer(image), getMimeFromDataURL(image))
    res.json({ result })
  } catch (err) {
    console.error('[remove-background]', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/remove-mannequin', requireAuth, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'No image provided.' })
    const result = await photoroomRemoveBg(base64ToBuffer(image), getMimeFromDataURL(image))
    res.json({ result })
  } catch (err) {
    console.error('[remove-mannequin]', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/enhance', requireAuth, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'No image provided.' })

    const prompt = `This is a jewelry product photo. Enhance it to look like a premium, high-end e-commerce product photograph:
1. Significantly improve lighting — make the jewelry look brilliantly lit
2. Boost sharpness and clarity — every detail should be crisp
3. Make metals (gold, silver, platinum, rose gold) look lustrous and polished
4. Make gemstones (diamonds, rubies, emeralds, sapphires) look vivid and sparkling
5. Improve white balance so the image looks clean and professional
6. Keep the background clean and neutral
7. Do not change the composition or add/remove any elements
Output: same jewelry photo but dramatically enhanced, ready for a luxury brand website.`

    const result = await geminiEdit(prompt, image)
    res.json({ result })
  } catch (err) {
    console.error('[enhance]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── Serve Frontend (production) ─────────────────────────────────────────────

import { existsSync } from 'fs'

const distPath = path.join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  const { default: serveStatic } = await import('serve-static')
  app.use(serveStatic(distPath))
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')))
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✓ GlowJewels server running on http://localhost:${PORT}`)
  console.log(`  PhotoRoom API: ${PHOTOROOM_KEY ? '✓ configured' : '✗ not set'}`)
  console.log(`  Gemini API:    ${GEMINI_KEY    ? '✓ configured' : '✗ not set'}`)
  console.log(`  Users DB:      ✓ ready\n`)
})
