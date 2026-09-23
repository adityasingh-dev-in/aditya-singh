'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, Terminal, Menu, X, ArrowUpRight } from 'lucide-react'
import { clsx } from 'clsx'
import SearchModal from '@/components/search/SearchModal'

const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/blog', label: 'Writing' },
  { href: '/projects', label: 'Proof & Systems' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Keyboard shortcut: Cmd/Ctrl+K for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <header className="sticky top-4 z-40 w-full px-4 sm:px-6 pointer-events-none">
        <nav className="mx-auto max-w-4xl h-14 rounded-full border border-white/10 bg-[#09090b]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-4 sm:px-5 flex items-center justify-between pointer-events-auto transition-all">
          {/* Brand & Beacon */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono font-semibold text-sm text-zinc-100 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <Terminal size={14} className="text-purple-400" />
              </div>
              <span className="tracking-tight">aditya.dev</span>
            </Link>

            {/* Status Beacon - hidden on tiny screens */}
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-white/10 text-[11px] font-mono text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Available for Architecture</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all',
                    active
                      ? 'bg-white/[0.08] text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]',
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right Action: Search Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              aria-label="Search posts"
              id="search-trigger"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-zinc-300 border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white transition-all"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-2 mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#09090b]/95 backdrop-blur-2xl shadow-2xl p-3 flex flex-col gap-1 pointer-events-auto animate-fadeIn">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'px-4 py-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-between',
                    active
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]',
                  )}
                >
                  <span>{label}</span>
                  <ArrowUpRight size={14} className="opacity-50" />
                </Link>
              )
            })}
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
