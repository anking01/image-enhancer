import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import FormData from 'form-data'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'

const PHOTOROOM_KEY = process.env.PHOTOROOM_API_KEY || ''
const GEMINI_KEY    = process.env.GEMINI_API_KEY    || ''
const JWT_SECRET    = process.env.JWT_SECRET        || 'glowjewels_secret'
const DATABASE_URL  = process.env.DATABASE_URL      || ''

// ─── Database ─────────────────────────────────────────────────────────────────

let sql
let dbReady = false

async function getDB() {
  if (!DATABASE_URL) throw new Error('Database not configured.')
  if (!sql) sql = neon(DATABASE_URL)
  if (!dbReady) {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       TEXT        NOT NULL,
        email      TEXT        NOT NULL UNIQUE,
        password   TEXT        NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    dbReady = true
  }
  return sql
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function base64ToBuffer(dataURL) {
  const b64 = dataURL.includes(',') ? dataURL.split(',')[1] : dataURL
  return Buffer.from(b64, 'base64')
}

function bufferToBase64(buf, mime = 'image/png') {
  return `data:${mime};base64,${buf.toString('base64')}`
}

function getMime(dataURL) {
  return dataURL.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
}

// ─── Services ────────────────────────────────────────────────────────────────

async function photoroomRemoveBg(imageBuffer, mimeType) {
  if (!PHOTOROOM_KEY) throw new Error('Background removal service not configured.')
  const form = new FormData()
  form.append('image_file', imageBuffer, { filename: 'image.jpg', contentType: mimeType })
  const res = await fetch('https://sdk.photoroom.com/v1/segment', {
    method: 'POST',
    headers: { 'x-api-key': PHOTOROOM_KEY, ...form.getHeaders() },
    body: form,
  })
  if (!res.ok) throw new Error(`Background removal failed (${res.status})`)
  return bufferToBase64(await res.buffer(), 'image/png')
}

async function geminiEdit(prompt, imageDataURL) {
  if (!GEMINI_KEY) throw new Error('Enhancement service not configured.')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: getMime(imageDataURL), data: imageDataURL.split(',')[1] } }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    }
  )
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Enhancement failed (${res.status})`) }
  const data = await res.json()
  const img  = data?.candidates?.[0]?.content?.parts?.find(p => p.inline_data?.data)
  if (!img) throw new Error('No result from enhancement service.')
  return `data:${img.inline_data.mime_type};base64,${img.inline_data.data}`
}

// ─── App ─────────────────────────────────────────────────────────────────────

const app = express()
app.use(cors())
app.use(express.json({ limit: '30mb' }))

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Not authenticated.' })
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Session expired. Please login again.' }) }
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    const db = await getDB()
    const existing = await db`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    if (existing.length) return res.status(400).json({ error: 'An account with this email already exists.' })
    const hash = await bcrypt.hash(password, 10)
    const rows = await db`INSERT INTO users (name, email, password) VALUES (${name}, ${email.toLowerCase()}, ${hash}) RETURNING id`
    const token = jwt.sign({ id: rows[0].id, email: email.toLowerCase(), name }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { name, email: email.toLowerCase() } })
  } catch (err) {
    console.error('[signup]', err.message)
    res.status(500).json({ error: err.message || 'Something went wrong.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })
    const db   = await getDB()
    const rows = await db`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ error: 'Invalid email or password.' })
    const u = rows[0]
    const token = jwt.sign({ id: u.id, email: u.email, name: u.name }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { name: u.name, email: u.email } })
  } catch (err) {
    console.error('[login]', err.message)
    res.status(500).json({ error: err.message || 'Something went wrong.' })
  }
})

// ── Image processing routes ───────────────────────────────────────────────────

app.post('/api/remove-background', requireAuth, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'No image provided.' })
    const result = await photoroomRemoveBg(base64ToBuffer(image), getMime(image))
    res.json({ result })
  } catch (err) { console.error('[remove-background]', err.message); res.status(500).json({ error: err.message }) }
})

app.post('/api/remove-mannequin', requireAuth, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'No image provided.' })
    const result = await photoroomRemoveBg(base64ToBuffer(image), getMime(image))
    res.json({ result })
  } catch (err) { console.error('[remove-mannequin]', err.message); res.status(500).json({ error: err.message }) }
})

app.post('/api/enhance', requireAuth, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'No image provided.' })
    // Remove background with PhotoRoom → clean isolated jewelry on transparent bg
    // Frontend will then apply canvas enhancement + white background
    const result = await photoroomRemoveBg(base64ToBuffer(image), getMime(image))
    res.json({ result })
  } catch (err) { console.error('[enhance]', err.message); res.status(500).json({ error: err.message }) }
})

export default app
