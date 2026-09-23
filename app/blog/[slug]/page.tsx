import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { posts } from '@site/content'
import type { Post } from '@site/content'
import { MDXContent } from '@/components/mdx/MDXContent'
import TagBadge from '@/components/blog/TagBadge'
import { Calendar, Clock, ArrowLeft, GitCommit, PenSquare } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return posts
    .filter((p: Post) => p.published)
    .map((p: Post) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p: Post) => p.slug === slug && p.published)
  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    title: `${post.title} — Aditya Singh`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      url: `${siteUrl}/blog/${post.slug}`,
      images: post.coverImage
        ? [{ url: post.coverImage }]
        : [{ url: `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = posts.find((p: Post) => p.slug === slug && p.published)

  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 sm:pt-14 pb-24" data-pagefind-body>
      {/* Navigation & Telemetry Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-8 text-xs font-mono text-zinc-500">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>All Essays</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400/90">
            <GitCommit size={12} />
            <span>git-backed</span>
          </span>
          <Link
            href={`/admin/edit/${post.slug}`}
            className="hidden sm:inline-flex items-center gap-1 hover:text-purple-400 transition-colors"
            title="Edit in CMS"
          >
            <PenSquare size={12} />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="mb-12 space-y-6 pb-8 border-b border-white/[0.08]">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} interactive />
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-zinc-100 font-sans">
          {post.title}
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-sans">
          {post.description}
        </p>

        {/* Meta Bar */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-2">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {format(new Date(post.date), 'MMMM d, yyyy')}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {post.readingTime}
          </span>
        </div>

        {/* Cover image if available */}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={`Cover image for ${post.title}`}
            className="w-full rounded-2xl border border-white/10 mt-6 object-cover max-h-[420px]"
          />
        )}
      </header>

      {/* MDX Content */}
      <div className="prose">
        <MDXContent code={post.body} />
      </div>

      {/* Post Footer */}
      <div className="mt-16 pt-8 border-t border-white/[0.08] flex items-center justify-between font-mono text-xs text-zinc-400">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft size={13} /> Back to all essays
        </Link>
        <span>Published on GitHub · Zero-cost stack</span>
      </div>
    </article>
  )
}
