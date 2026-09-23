import type { Metadata } from 'next'
import { PostEditor } from '@/components/admin/PostEditor'

export const metadata: Metadata = {
  title: 'New Post — Admin',
}

export default function AdminNewPostPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          New Post
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
          Write in Markdown. Autosaved to your browser. Publish commits to GitHub.
        </p>
      </div>

      <PostEditor mode="new" />
    </div>
  )
}
