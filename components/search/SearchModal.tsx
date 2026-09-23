'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, FileText, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface SearchResult {
  url: string
  meta: { title?: string }
  excerpt: string
}

interface PagefindInstance {
  search: (query: string) => Promise<{
    results: Array<{
      data: () => Promise<SearchResult>
    }>
  }>
}

declare global {
  interface Window {
    pagefind: PagefindInstance | undefined
  }
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

function sanitizeExcerpt(rawExcerpt: string): string {
  if (!rawExcerpt) return ''
  // Protect search highlight mark tags while escaping all other HTML to prevent XSS
  const tokenized = rawExcerpt
    .replace(/<mark>/gi, '___MARK_START___')
    .replace(/<\/mark>/gi, '___MARK_END___')

  const escaped = tokenized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  return escaped
    .replace(
      /___MARK_START___/g,
      '<mark style="background:rgba(139,92,246,0.25);color:var(--color-primary);border-radius:2px;padding:0 2px;">',
    )
    .replace(/___MARK_END___/g, '</mark>')
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [pagefindReady, setPagefindReady] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load Pagefind on first open
  useEffect(() => {
    if (!open || pagefindReady) return
    const load = async () => {
      try {
        if (typeof window !== 'undefined') {
          const pf = await (new Function("return import('/pagefind/pagefind.js')")())
          window.pagefind = pf
          setPagefindReady(true)
        }
      } catch {
        console.warn('Pagefind not yet built — run `npm run build` first.')
      }
    }
    load()
  }, [open, pagefindReady])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Run search on query change
  useEffect(() => {
    if (!pagefindReady || !window.pagefind || !query.trim()) {
      setResults([])
      return
    }
    const run = async () => {
      setLoading(true)
      try {
        const res = await window.pagefind!.search(query)
        const data = await Promise.all(res.results.slice(0, 8).map((r) => r.data()))
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    const debounce = setTimeout(run, 200)
    return () => clearTimeout(debounce)
  }, [query, pagefindReady])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden animate-slideUp"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {loading ? (
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-muted-foreground)' }} />
          ) : (
            <Search size={18} style={{ color: 'var(--color-muted-foreground)' }} />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-sans)',
            }}
            id="search-input"
          />
          <button
            onClick={onClose}
            className="p-1 rounded transition-opacity hover:opacity-60"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {!pagefindReady && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--color-muted-foreground)' }}>
              Search requires a production build. Run{' '}
              <code style={{ color: 'var(--color-primary)' }}>npm run build</code> first.
            </p>
          )}

          {pagefindReady && query && results.length === 0 && !loading && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--color-muted-foreground)' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.map((result, i) => (
            <a
              key={i}
              href={result.url}
              onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 transition-all hover:opacity-80"
              style={{
                color: 'var(--color-foreground)',
                background: 'transparent',
              }}
            >
              <FileText size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
              <div>
                <p className="text-sm font-medium">{result.meta?.title ?? 'Untitled'}</p>
                <p
                  className="text-xs mt-0.5 line-clamp-2"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeExcerpt(result.excerpt) }}
                />
              </div>
            </a>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2 text-xs border-t flex items-center gap-4"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-muted-foreground)',
          }}
        >
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
