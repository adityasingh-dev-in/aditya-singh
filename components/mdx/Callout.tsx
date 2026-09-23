import { clsx } from 'clsx'
import { AlertCircle, Info, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react'

type CalloutType = 'note' | 'tip' | 'warning' | 'danger' | 'success'

const CALLOUT_STYLES: Record<
  CalloutType,
  { bg: string; border: string; text: string; icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }> }
> = {
  note: {
    bg: 'rgba(56, 189, 248, 0.05)',
    border: 'rgba(56, 189, 248, 0.25)',
    text: '#38bdf8',
    icon: Info,
  },
  tip: {
    bg: 'rgba(74, 222, 128, 0.05)',
    border: 'rgba(74, 222, 128, 0.25)',
    text: '#4ade80',
    icon: Lightbulb,
  },
  warning: {
    bg: 'rgba(250, 204, 21, 0.05)',
    border: 'rgba(250, 204, 21, 0.25)',
    text: '#facc15',
    icon: AlertTriangle,
  },
  danger: {
    bg: 'rgba(248, 113, 113, 0.05)',
    border: 'rgba(248, 113, 113, 0.25)',
    text: '#f87171',
    icon: AlertCircle,
  },
  success: {
    bg: 'rgba(192, 132, 252, 0.05)',
    border: 'rgba(192, 132, 252, 0.25)',
    text: '#c084fc',
    icon: CheckCircle,
  },
}

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
  className?: string
}

export function Callout({ type = 'note', title, children, className }: CalloutProps) {
  const style = CALLOUT_STYLES[type]
  const Icon = style.icon

  return (
    <aside
      className={clsx('rounded-xl border p-4 sm:p-5 my-6 transition-all', className)}
      style={{
        background: style.bg,
        borderColor: style.border,
      }}
      role="note"
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="flex-shrink-0 mt-0.5" style={{ color: style.text } as React.CSSProperties} />
        <div className="flex-1 text-sm leading-relaxed">
          {title && (
            <p className="font-mono font-semibold text-xs uppercase tracking-wider mb-1.5" style={{ color: style.text }}>
              {title}
            </p>
          )}
          <div className="text-zinc-300 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </aside>
  )
}
