import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'lensai_history'
const MAX_ITEMS = 5

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch {
      // Storage quota exceeded — ignore
    }
  }, [history])

  const addToHistory = useCallback((item) => {
    // item: { id, filename, thumbnail, filtersApplied, timestamp }
    setHistory(prev => {
      const updated = [item, ...prev.filter(h => h.id !== item.id)]
      return updated.slice(0, MAX_ITEMS)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { history, addToHistory, clearHistory }
}
