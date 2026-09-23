import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@site/content'
import { format } from 'date-fns'
import { PenLine, Eye, Calendar, Clock, PlusCircle } from 'lucide-react'
import TagBadge from '@/components/blog/TagBadge'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

export default function AdminDashboardPage() {
  const allPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const publishedCount = allPosts.filter((p) => p.published).length
  const draftCount = allPosts.filter((p) => !p.published).length

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {publishedCount} published · {draftCount} draft
          </p>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
          id="dashboard-new-post"
        >
          <PlusCircle size={16} /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Posts', value: allPosts.length },
          { label: 'Published', value: publishedCount },
          { label: 'Drafts', value: draftCount },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border p-5"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Post list */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
          All Posts
        </h2>
        {allPosts.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              No posts yet.{' '}
              <Link href="/admin/new" style={{ color: 'var(--color-primary)' }}>
                Create your first post.
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allPosts.map((post) => (
              <div
                key={post.slug}
                className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-opacity-80"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-foreground)' }}>
                      {post.title}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: post.published
                          ? 'rgba(34,197,94,0.1)'
                          : 'rgba(234,179,8,0.1)',
                        color: post.published ? '#86efac' : '#fde047',
                      }}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      <Calendar size={11} />
                      {format(new Date(post.date), 'MMM d, yyyy')}
                    </span>
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      <Clock size={11} />
                      {post.readingTime}
                    </span>
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg border transition-all hover:opacity-70"
                    style={{
                      color: 'var(--color-muted-foreground)',
                      borderColor: 'var(--color-border)',
                    }}
                    aria-label={`View ${post.title}`}
                  >
                    <Eye size={14} />
                  </Link>
                  <Link
                    href={`/admin/edit/${post.slug}`}
                    className="p-1.5 rounded-lg border transition-all hover:opacity-70"
                    style={{
                      color: 'var(--color-primary)',
                      borderColor: 'var(--color-border)',
                    }}
                    aria-label={`Edit ${post.title}`}
                    id={`edit-${post.slug}`}
                  >
                    <PenLine size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
