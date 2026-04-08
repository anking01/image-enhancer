import { fileURLToPath } from 'url'
import path from 'path'
import { existsSync } from 'fs'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

import app from './app.js'

const PORT = process.env.PORT || 3001

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  const { default: serveStatic } = await import('serve-static')
  app.use(serveStatic(distPath))
  app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`\n✓ GlowJewels server → http://localhost:${PORT}`)
  console.log(`  PhotoRoom: ${process.env.PHOTOROOM_API_KEY ? '✓' : '✗ not set'}`)
  console.log(`  Gemini:    ${process.env.GEMINI_API_KEY    ? '✓' : '✗ not set'}`)
  console.log(`  Database:  ${process.env.DATABASE_URL      ? '✓' : '✗ not set'}\n`)
})
