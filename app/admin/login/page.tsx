'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Invalid password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-background)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 shadow-2xl"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col items-center gap-4 mb-8">
          <div
            className="p-3 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.15)' }}
          >
            <Lock size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Admin Login
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
              Enter your admin password to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-foreground)' }}
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{
                background: 'var(--color-muted)',
                borderColor: error ? '#ef4444' : 'var(--color-border)',
                color: 'var(--color-foreground)',
              }}
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            id="admin-login-submit"
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
