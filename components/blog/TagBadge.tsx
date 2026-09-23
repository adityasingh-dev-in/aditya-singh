import Link from 'next/link'
import { clsx } from 'clsx'

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  nextjs: { bg: 'rgba(255,255,255,0.04)', text: '#e4e4e7', border: 'rgba(255,255,255,0.1)' },
  typescript: { bg: 'rgba(56,189,248,0.06)', text: '#38bdf8', border: 'rgba(56,189,248,0.2)' },
  react: { bg: 'rgba(6,182,212,0.06)', text: '#22d3ee', border: 'rgba(6,182,212,0.2)' },
  rust: { bg: 'rgba(251,146,60,0.06)', text: '#fb923c', border: 'rgba(251,146,60,0.2)' },
  go: { bg: 'rgba(74,222,128,0.06)', text: '#4ade80', border: 'rgba(74,222,128,0.2)' },
  architecture: { bg: 'rgba(192,132,252,0.06)', text: '#c084fc', border: 'rgba(192,132,252,0.2)' },
  devops: { bg: 'rgba(168,85,247,0.06)', text: '#a855f7', border: 'rgba(168,85,247,0.2)' },
  default: { bg: 'rgba(255,255,255,0.03)', text: '#a1a1aa', border: 'rgba(255,255,255,0.08)' },
}

interface TagBadgeProps {
  tag: string
  interactive?: boolean
  className?: string
}

export default function TagBadge({ tag, interactive = false, className }: TagBadgeProps) {
  const style = TAG_STYLES[tag.toLowerCase()] ?? TAG_STYLES.default

  const badge = (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-medium border transition-colors',
        interactive && 'cursor-pointer hover:border-white/30',
        className,
      )}
      style={{
        background: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      #{tag}
    </span>
  )

  if (interactive) {
    return <Link href={`/blog?tag=${tag}`}>{badge}</Link>
  }

  return badge
}
