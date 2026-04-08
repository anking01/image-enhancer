// ─── Unified AI Service ────────────────────────────────────────────────────────
// To add a new AI provider:
//   1. Create src/services/myProvider.js  with  myGenerate / myEdit / myEnhance
//   2. Add it to PROVIDERS below
//   3. Done — the UI picks it up automatically

import { geminiGenerate, geminiEdit, geminiEnhance } from './geminiService.js'
import { falGenerate, falEdit, falUpscale } from './falService.js'

export const PROVIDERS = {
  gemini: {
    id:           'gemini',
    name:         'Google Gemini',
    description:  'Best for editing & understanding. Uses gemini-2.0-flash.',
    keyLabel:     'Gemini API Key',
    keyPlaceholder: 'AIzaSy…',
    keyStorage:   'ai_key_gemini',
    keyDocs:      'https://aistudio.google.com/app/apikey',
    supportsGenerate: true,
    supportsEdit:     true,
    supportsEnhance:  true,
    supportsUpscale:  false,
    generate: geminiGenerate,
    edit:     geminiEdit,
    enhance:  geminiEnhance,
  },
  fal: {
    id:           'fal',
    name:         'fal.ai (FLUX)',
    description:  'Best for generation quality. Uses FLUX models.',
    keyLabel:     'fal.ai API Key',
    keyPlaceholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:…',
    keyStorage:   'ai_key_fal',
    keyDocs:      'https://fal.ai/dashboard/keys',
    supportsGenerate: true,
    supportsEdit:     true,
    supportsEnhance:  false,
    supportsUpscale:  true,
    generate: falGenerate,
    edit:     falEdit,
    upscale:  falUpscale,
  },
}

export const PROVIDER_LIST = Object.values(PROVIDERS)

export function getStoredProvider() {
  return localStorage.getItem('ai_provider') || 'gemini'
}

export function saveProvider(id) {
  localStorage.setItem('ai_provider', id)
}

export function getKey(providerId) {
  const p = PROVIDERS[providerId]
  if (!p) return ''
  return localStorage.getItem(p.keyStorage) || ''
}

export function saveKey(providerId, key) {
  const p = PROVIDERS[providerId]
  if (p) localStorage.setItem(p.keyStorage, key.trim())
}
