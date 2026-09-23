'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Terminal, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  // Don't display admin toolbar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/auth', { method: 'DELETE' })
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Admin top bar */}
      <header
        className="border-b px-6 h-14 flex items-center justify-between"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Terminal size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="font-bold text-sm" style={{ color: 'var(--color-foreground)' }}>
            Admin CMS
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(139,92,246,0.15)',
              color: 'var(--color-primary)',
            }}
          >
            aditya.dev
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/new"
            className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
            id="admin-new-post"
          >
            New Post
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1.5 rounded-lg border transition-all hover:opacity-70 disabled:opacity-50 cursor-pointer"
            style={{
              color: 'var(--color-muted-foreground)',
              borderColor: 'var(--color-border)',
            }}
            aria-label="Log out"
            id="admin-logout-btn"
          >
            <LogOut size={14} />
          </button>
        </nav>
      </header>

      <main className="p-6">{children}</main>
    </div>
  )
}

