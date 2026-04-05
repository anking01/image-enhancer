import React, { useState, useRef, useCallback, useEffect } from 'react'

export default function CompareSlider({ originalSrc, enhancedSrc, filterString }) {
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.min(Math.max((x / rect.width) * 100, 0), 100)
    setPosition(pct)
  }, [])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    updatePosition(e.clientX)
  }

  const handleTouchStart = (e) => {
    setDragging(true)
    updatePosition(e.touches[0].clientX)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => updatePosition(e.clientX ?? e.touches?.[0]?.clientX)
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging, updatePosition])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-xl cursor-col-resize"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Checkerboard background — visible through transparent areas */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(45deg,#444 25%,transparent 25%),' +
            'linear-gradient(-45deg,#444 25%,transparent 25%),' +
            'linear-gradient(45deg,transparent 75%,#444 75%),' +
            'linear-gradient(-45deg,transparent 75%,#444 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
          backgroundColor: '#2a2a2a',
        }}
      />

      {/* Original image — full width */}
      <img
        src={originalSrc}
        alt="Original"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* Enhanced image — clipped to right side, checkerboard visible behind transparency */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        {/* Checkerboard for the enhanced side too */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg,#444 25%,transparent 25%),' +
              'linear-gradient(-45deg,#444 25%,transparent 25%),' +
              'linear-gradient(45deg,transparent 75%,#444 75%),' +
              'linear-gradient(-45deg,transparent 75%,#444 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
            backgroundColor: '#2a2a2a',
          }}
        />
        <img
          src={enhancedSrc}
          alt="Enhanced"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ filter: filterString }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/60 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
        style={{ left: `${position}%` }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center border border-white/20 z-10"
        style={{ left: `${position}%` }}
      >
        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
        </svg>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-white/70 font-medium pointer-events-none">
        Original
      </div>
      <div className="absolute top-3 right-3 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 backdrop-blur-sm border border-accent-cyan/20 rounded-md px-2 py-1 text-xs text-accent-cyan font-medium pointer-events-none">
        Enhanced
      </div>
    </div>
  )
}
