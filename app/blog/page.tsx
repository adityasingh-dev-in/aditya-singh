'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import type { Post } from '@site/content'
import { posts } from '@site/content'
import PostCard from '@/components/blog/PostCard'
import { Suspense, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react'

function BlogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTag = searchParams.get('tag') ?? ''
  const [search, setSearch] = useState('')

  const publishedPosts = useMemo(
    () =>
      posts
        .filter((p: Post) => p.published)
        .sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [],
  )

  const allTags = useMemo(
    () => Array.from(new Set(publishedPosts.flatMap((p: Post) => p.tags))).sort(),
    [publishedPosts],
  )

  const filteredPosts = useMemo(() => {
    let result: Post[] = publishedPosts
    if (activeTag) result = result.filter((p: Post) => p.tags.includes(activeTag))
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p: Post) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q)),
      )
    }
    return result
  }, [publishedPosts, activeTag, search])

  const setTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) params.set('tag', tag)
    else params.delete('tag')
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16 pb-24 space-y-10">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
          <BookOpen size={14} />
          <span>TECHNICAL WRITING & ESSAYS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 font-mono">
          Engineering Journal
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
          Deep dives into distributed consensus algorithms, zero-cost content pipelines, and
          type-level TypeScript machinery. {publishedPosts.length} published essays.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-6 border-b border-white/[0.08]">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.02] flex-1 max-w-md focus-within:border-white/20 transition-colors">
          <Search size={14} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, tag, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs font-mono outline-none text-zinc-200 placeholder:text-zinc-500"
            id="blog-filter-input"
          />
        </div>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal size={12} className="text-zinc-500 mr-1" />
            <button
              onClick={() => setTag('')}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                !activeTag
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-white/[0.02] text-zinc-400 border-white/10 hover:border-white/20'
              }`}
              id="tag-filter-all"
            >
              All ({publishedPosts.length})
            </button>
            {allTags.map((tag) => {
              const active = tag === activeTag
              return (
                <button
                  key={tag}
                  onClick={() => setTag(active ? '' : tag)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                    active
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                      : 'bg-white/[0.02] text-zinc-400 border-white/10 hover:border-white/20'
                  }`}
                  id={`tag-filter-${tag}`}
                >
                  #{tag}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Post Grid (Bento style) */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post: Post, idx: number) => (
            <PostCard
              key={post.slug}
              title={post.title}
              slug={post.slug}
              date={post.date}
              description={post.description}
              tags={post.tags}
              readingTime={(post as Post & { readingTime?: string }).readingTime ?? ''}
              coverImage={post.coverImage}
              featured={idx === 0 && !activeTag && !search}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-white/10 bg-white/[0.01]">
          <p className="font-mono text-sm text-zinc-300">
            No essays match the current query &ldquo;{search || activeTag}&rdquo;.
          </p>
          <button
            onClick={() => {
              setTag('')
              setSearch('')
            }}
            className="mt-3 text-xs font-mono text-purple-400 hover:text-purple-300 underline"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense>
      <BlogContent />
    </Suspense>
  )
}
