'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { usePostDraft } from '@/lib/hooks/usePostDraft'
import { Save, Send, Upload, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react'

// SSR disabled — @uiw/react-md-editor uses DOM APIs
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface PostEditorProps {
  initialSlug?: string
  initialContent?: string
  mode: 'new' | 'edit'
}

const DEFAULT_FRONTMATTER = (slug: string) => `---
title: "Untitled Post"
slug: "${slug}"
date: "${format(new Date(), 'yyyy-MM-dd')}"
description: "A brief description of this post."
tags: []
published: false
---

Start writing your post here...
`

export function PostEditor({ initialSlug, initialContent, mode }: PostEditorProps) {
  const router = useRouter()
  const defaultSlug = initialSlug ?? (mode === 'new' ? 'my-new-post' : `post-${Date.now()}`)
  const [slug, setSlug] = useState(defaultSlug)
  const { draft, lastSaved, saveDraft, clearDraft } = usePostDraft(slug)

  const [content, setContent] = useState(
    draft ?? initialContent ?? DEFAULT_FRONTMATTER(defaultSlug),
  )
  const [status, setStatus] = useState<'idle' | 'saving' | 'publishing' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  // Load draft from IndexedDB on mount
  useEffect(() => {
    if (draft && !initialContent) setContent(draft)
  }, [draft, initialContent])

  // Autosave to IndexedDB every 3 seconds on content change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(content)
    }, 3000)
    return () => clearTimeout(timer)
  }, [content, saveDraft])

  const handleSaveDraft = async () => {
    setStatus('saving')
    await saveDraft(content)
    setStatus('idle')
  }

  const handlePublish = useCallback(async () => {
    setStatus('publishing')
    setStatusMsg('')
    try {
      // Extract custom slug from frontmatter if user modified it
      const slugMatch = content.match(/^slug:\s*["']?([a-z0-9_-]+)["']?/m)
      const effectiveSlug = slugMatch ? slugMatch[1].trim().toLowerCase() : slug

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: effectiveSlug,
          fileContent: content,
          message: mode === 'new'
            ? `chore(content): publish ${effectiveSlug}`
            : `chore(content): update ${effectiveSlug}`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setStatusMsg(data.error ?? 'Publish failed')
        return
      }

      await clearDraft()
      setStatus('success')
      if (data.warning) {
        setStatusMsg(data.warning)
      } else if (data.commitSha) {
        setStatusMsg(`Published & synced to GitHub (${data.commitSha.slice(0, 7)})!`)
      } else {
        setStatusMsg(`Published to content/posts/${data.slug}.mdx!`)
      }
      setTimeout(() => router.push('/admin'), 2000)
    } catch (err: unknown) {
      setStatus('error')
      setStatusMsg(err instanceof Error ? err.message : 'Network error')
    }
  }, [content, slug, mode, clearDraft, router])

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })

      if (!urlRes.ok) {
        const errorData = await urlRes.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Failed to get upload credentials')
      }

      const uploadParams = await urlRes.json()
      const formData = new FormData()
      formData.append('file', file)

      if (uploadParams.method === 'signed') {
        formData.append('api_key', uploadParams.apiKey)
        formData.append('timestamp', String(uploadParams.timestamp))
        formData.append('signature', uploadParams.signature)
        formData.append('folder', uploadParams.folder)
      } else if (uploadParams.uploadPreset) {
        formData.append('upload_preset', uploadParams.uploadPreset)
        if (uploadParams.folder) formData.append('folder', uploadParams.folder)
      }

      const uploadRes = await fetch(uploadParams.uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}))
        throw new Error(errData?.error?.message ?? 'Cloudinary upload failed')
      }

      const uploadData = await uploadRes.json()
      const publicUrl = uploadData.secure_url ?? uploadData.url

      // Insert image markdown at cursor
      const imageMarkdown = `\n![${file.name}](${publicUrl})\n`
      setContent((prev) => prev + imageMarkdown)
      setStatusMsg('Image uploaded successfully')
      setStatus('idle')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed'
      setStatusMsg(msg)
      setStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const statusIcon = {
    idle: null,
    saving: <Loader2 size={14} className="animate-spin" />,
    publishing: <Loader2 size={14} className="animate-spin" />,
    success: <CheckCircle size={14} style={{ color: '#86efac' }} />,
    error: <AlertCircle size={14} style={{ color: '#fca5a5' }} />,
  }[status]

  return (
    <div className="space-y-4" data-color-mode="dark">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl border"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          {statusIcon}
          {status === 'saving' && 'Saving draft...'}
          {status === 'publishing' && 'Validating & publishing...'}
          {status === 'success' && <span style={{ color: '#86efac' }}>{statusMsg}</span>}
          {status === 'error' && <span style={{ color: '#fca5a5' }}>{statusMsg}</span>}
          {status === 'idle' && lastSaved && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> Saved {format(lastSaved, 'HH:mm:ss')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Image upload */}
          <label
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all hover:opacity-80"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted-foreground)',
              background: 'var(--color-muted)',
            }}
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
              id="image-upload"
            />
          </label>

          {/* Save Draft — IndexedDB only, no Git */}
          <button
            onClick={handleSaveDraft}
            disabled={status !== 'idle'}
            id="save-draft-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted-foreground)',
              background: 'var(--color-muted)',
            }}
          >
            <Save size={12} /> Save Draft
          </button>

          {/* Publish — calls /api/posts → validates MDX → commits to GitHub */}
          <button
            onClick={handlePublish}
            disabled={status === 'publishing' || status === 'saving'}
            id="publish-btn"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            {status === 'publishing' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            {status === 'publishing' ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* MDX Editor */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height={600}
          preview="live"
          hideToolbar={false}
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>
    </div>
  )
}
