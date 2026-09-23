'use client'

import React, { useRef } from 'react'

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

/**
 * Hardware-accelerated SpotlightCard adhering to Phase 4 in design guide.md.
 * Directly maps cursor coordinates to CSS custom properties (--mouse-x, --mouse-y)
 * on the GPU compositor thread, bypassing React lifecycle re-renders.
 */
export function SpotlightCard({
  children,
  className = '',
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const bounds = cardRef.current.getBoundingClientRect()
    const x = e.clientX - bounds.left
    const y = e.clientY - bounds.top

    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card group ${className}`}
      {...props}
    >
      {/* Micro-tonal surface illumination layer */}
      <div className="spotlight-glow" />

      {/* Main content layer */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}

export default SpotlightCard
