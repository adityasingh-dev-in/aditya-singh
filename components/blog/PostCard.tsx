import Link from 'next/link'
import { format } from 'date-fns'
import { Clock, Calendar, ArrowRight } from 'lucide-react'
import TagBadge from './TagBadge'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

interface PostCardProps {
  title: string
  slug: string
  date: string
  description: string
  tags: string[]
  readingTime: string
  coverImage?: string
  featured?: boolean
}

export default function PostCard({
  title,
  slug,
  date,
  description,
  tags,
  readingTime,
  featured = false,
}: PostCardProps) {
  return (
    <SpotlightCard className={`p-6 md:p-7 flex flex-col justify-between h-full ${featured ? 'md:col-span-2' : ''}`}>
      <div>
        {/* Header row: Tags + Featured */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>

          {featured && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/blog/${slug}`} className="block group/link">
          <h2 className="font-bold text-lg md:text-xl text-zinc-100 group-hover/link:text-purple-300 transition-colors tracking-tight leading-snug mb-2.5">
            {title}
          </h2>
        </Link>

        {/* Description */}
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Meta Footer */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {readingTime}
          </span>
        </div>

        <Link
          href={`/blog/${slug}`}
          className="inline-flex items-center gap-1 text-xs font-mono font-medium text-purple-400 hover:text-purple-300 transition-colors group-hover:translate-x-0.5"
          aria-label={`Read ${title}`}
        >
          Read <ArrowRight size={12} />
        </Link>
      </div>
    </SpotlightCard>
  )
}
