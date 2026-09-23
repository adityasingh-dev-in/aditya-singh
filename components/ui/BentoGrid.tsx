import React from 'react'

interface BentoGridProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}

/**
 * 12-column Mathematical Bento Grid adhering to the spatial mathematics
 * in design guide.md. Gutter gap is 16px (gap-bento) paired with 20px
 * corner radius (rounded-bento), strictly satisfying R/2 <= G <= R.
 */
export function BentoGrid({ children, className = '', ...props }: BentoGridProps) {
  return (
    <section
      className={`grid grid-cols-1 md:grid-cols-12 gap-bento md:auto-rows-[135px] max-w-6xl mx-auto w-full ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export default BentoGrid
