import type { Metadata } from 'next'
import { getPostFromGitHub } from '@/lib/github'
import { PostEditor } from '@/components/admin/PostEditor'
import { notFound } from 'next/navigation'
import fs from 'node:fs'
import path from 'node:path'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return { title: `Edit ${slug} — Admin` }
}

export default async function AdminEditPage({ params }: PageProps) {
  const { slug } = await params

  // 1. Check local filesystem first (handles local development, initial posts, offline)
  let existingContent: string | null = null
  const localFilePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`)
  if (fs.existsSync(localFilePath)) {
    try {
      existingContent = fs.readFileSync(localFilePath, 'utf-8')
    } catch {
      existingContent = null
    }
  }

  // 2. Fall back to GitHub repository if not present locally
  if (!existingContent) {
    existingContent = await getPostFromGitHub(slug)
  }

  if (!existingContent) notFound()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 font-mono">
          Edit Post
        </h1>
        <p className="text-sm mt-1 text-zinc-400 font-mono">
          <code className="px-2 py-0.5 rounded text-xs bg-white/10 text-purple-300">
            {slug}.mdx
          </code>{' '}
          — edits autosave in your browser. Publishing updates the file and commits to GitHub.
        </p>
      </div>

      <PostEditor mode="edit" initialSlug={slug} initialContent={existingContent} />
    </div>
  )
}

