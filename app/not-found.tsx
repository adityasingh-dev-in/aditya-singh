import type { Metadata } from 'next'
import Link from 'next/link'
import { Terminal, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: '404 — Page Not Found' }

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center font-mono">
      <div className="p-8 rounded-2xl border border-white/10 bg-[#121215] max-w-md w-full space-y-5 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 mx-auto flex items-center justify-center text-purple-400">
          <Terminal size={18} />
        </div>

        <div>
          <span className="text-4xl font-extrabold text-zinc-100 tracking-tight">404</span>
          <h1 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mt-1">
            Route Not Resolved
          </h1>
        </div>

        <p className="text-xs text-zinc-500 font-sans leading-relaxed">
          The requested path does not exist in the static tree or has been relocated to another slug.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-all"
          >
            <ArrowLeft size={13} /> Return to Overview
          </Link>
        </div>
      </div>
    </div>
  )
}
