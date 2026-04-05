import { useState, useCallback } from 'react'
import { DEFAULT_FILTERS, buildFilterString } from '../utils/filterUtils.js'

export function useImageFilters() {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [filterHistory, setFilterHistory] = useState([])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const applyFilters = useCallback((newFilters, label = 'Manual adjust') => {
    setFilters(newFilters)
    setFilterHistory(prev => [
      ...prev,
      { filters: newFilters, label, timestamp: Date.now() },
    ])
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
  }, [])

  const filterString = buildFilterString(filters)

  return {
    filters,
    filterString,
    updateFilter,
    applyFilters,
    resetFilters,
    filterHistory,
  }
}
