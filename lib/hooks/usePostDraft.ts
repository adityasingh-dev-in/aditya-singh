'use client'

import { useEffect, useState } from 'react'
import { get, set, del } from 'idb-keyval'

interface UseDraftReturn {
  draft: string | null
  lastSaved: Date | null
  saveDraft: (content: string) => Promise<void>
  clearDraft: () => Promise<void>
}

/**
 * Persists editor content to IndexedDB under `draft:<slug>`.
 * No Git commits, no Vercel builds — purely client-side.
 * Cleared automatically after a successful publish.
 */
export function usePostDraft(slug: string): UseDraftReturn {
  const [draft, setDraft] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const key = `draft:${slug}`

  useEffect(() => {
    get(key).then((val) => {
      if (typeof val === 'string') setDraft(val)
    })
  }, [key])

  const saveDraft = async (content: string) => {
    await set(key, content)
    setDraft(content)
    setLastSaved(new Date())
  }

  const clearDraft = async () => {
    await del(key)
    setDraft(null)
    setLastSaved(null)
  }

  return { draft, lastSaved, saveDraft, clearDraft }
}
