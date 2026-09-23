import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@site/content'
import type { Post } from '@site/content'
import { BentoGrid } from '@/components/ui/BentoGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { RaftSimulator } from '@/components/proof/RaftSimulator'
import { TelemetryWidget } from '@/components/proof/TelemetryWidget'
import TagBadge from '@/components/blog/TagBadge'
import {
  ArrowRight,
  BookOpen,
  ArrowUpRight,
  Database,
  Cloud,
  Cpu,
  Layers,
  Sparkles,
  GitBranch,
} from 'lucide-react'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Aditya Singh — Systems Architecture & Engineering Proof',
  description:
    'Senior engineering portfolio and technical writing by Aditya Singh. Focus on distributed consensus, zero-cost architectures, and high-performance web systems.',
}

export default function HomePage() {
  const publishedPosts = posts
    .filter((p: Post) => p.published)
    .sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const latestPost = publishedPosts[0]
  const secondPost = publishedPosts[1]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16 pb-24 space-y-20 sm:space-y-28">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-3xl space-y-6">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Systems Architecture · Distributed Consensus · Modern Web</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-100">
            Crafting systems that scale and{' '}
            <span className="text-gradient-purple">proving it with code.</span>
          </h1>

          {/* Narrative */}
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl font-sans">
            Hey, I&apos;m <span className="text-zinc-100 font-semibold">Aditya Singh</span>. I design
            fault-tolerant distributed systems and zero-overhead web engines. This portfolio serves as
            an executable proof object—demonstrating real-time consensus, Git-backed content pipelines,
            and sub-30ms interaction performance.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="#proof-grid"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-semibold bg-white text-black hover:bg-zinc-200 transition-all shadow-lg hover:scale-[1.02]"
              id="hero-explore-proof"
            >
              <Cpu size={14} /> Explore Proof Objects
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-medium border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-white/20 transition-all"
              id="hero-read-essays"
            >
              <BookOpen size={14} /> Engineering Essays ({publishedPosts.length})
            </Link>
            <a
              href="https://github.com/adityasingh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              GitHub <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* Flagship Mathematical Bento Grid (Proof Objects) */}
      <section id="proof-grid" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <h2 className="text-lg font-bold font-mono tracking-tight text-zinc-100">
              Executable Proof Matrix
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
            12-col bento · R/2 ≤ G ≤ R · Hardware spotlight
          </span>
        </div>

        <BentoGrid>
          {/* Tile 1: Flagship Proof Object - Raft Consensus Simulator (8 cols x 4 rows) */}
          <SpotlightCard className="md:col-span-8 md:row-span-4 p-5 sm:p-6 flex flex-col justify-between">
            <RaftSimulator />
          </SpotlightCard>

          {/* Tile 2: Zero-Cost Production Blog Architecture (4 cols x 4 rows) */}
          <SpotlightCard className="md:col-span-4 md:row-span-4 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-purple-400" />
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
                    Zero-Cost Pipeline
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  ₹0/MONTH
                </span>
              </div>

              <h3 className="text-base font-bold text-zinc-100 mb-2 font-mono">
                Git as the Database
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                No headless CMS subscription. Content is written in MDX, validated via Zod, and
                committed atomically to GitHub via the Git Data API.
              </p>

              {/* Architecture Steps */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/10">
                  <GitBranch size={13} className="text-emerald-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-zinc-200 font-semibold">GitHub Git Data API:</span>
                    <span className="text-zinc-400 ml-1">createTree → createCommit</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/10">
                  <Cloud size={13} className="text-cyan-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-zinc-200 font-semibold">Cloudinary:</span>
                    <span className="text-zinc-400 ml-1">Direct signed upload (CDN optimized)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/10">
                  <Cpu size={13} className="text-purple-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-zinc-200 font-semibold">Velite + Next 15:</span>
                    <span className="text-zinc-400 ml-1">Compile-time AST + Pagefind</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">Read architecture case study</span>
              <Link
                href="/blog/nextjs-velite-blog-architecture"
                className="text-xs font-mono font-medium text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
              >
                Inspect <ArrowRight size={12} />
              </Link>
            </div>
          </SpotlightCard>

          {/* Tile 3: Live System Telemetry (4 cols x 2 rows) */}
          <SpotlightCard className="md:col-span-4 md:row-span-2 p-5 sm:p-6">
            <TelemetryWidget />
          </SpotlightCard>

          {/* Tile 4: Featured Writing & Research (8 cols x 2 rows) */}
          {latestPost && (
            <SpotlightCard className="md:col-span-8 md:row-span-2 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                    Featured Deep Dive
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                    <span>{format(new Date(latestPost.date), 'MMMM yyyy')}</span>
                    <span>·</span>
                    <span>{latestPost.readingTime}</span>
                  </div>
                </div>

                <Link href={`/blog/${latestPost.slug}`} className="group/title block">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover/title:text-purple-300 transition-colors tracking-tight">
                    {latestPost.title}
                  </h3>
                </Link>

                <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-sans">
                  {latestPost.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex gap-1.5">
                  {latestPost.tags.slice(0, 2).map((t) => (
                    <TagBadge key={t} tag={t} />
                  ))}
                </div>
                <Link
                  href={`/blog/${latestPost.slug}`}
                  className="text-xs font-mono font-medium text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                >
                  Read essay <ArrowRight size={12} />
                </Link>
              </div>
            </SpotlightCard>
          )}
        </BentoGrid>
      </section>

      {/* Engineering Case Studies Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
              Senior Architectural Case Studies
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Detailed problem constraints, trade-off analyses, and verifiable outcomes.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-mono font-medium text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            All Case Studies <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Case Study 1 */}
          <SpotlightCard className="p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  DISTRIBUTED SYSTEMS
                </span>
                <span className="font-mono text-xs text-zinc-400">Go · RPC · Raft</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">
                Raft-KV: Linearizable Distributed Key-Value Engine
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300 font-medium">Problem:</strong> Ensuring linearizable
                state consistency across 5 nodes during network partitions.
                <br />
                <strong className="text-zinc-300 font-medium">Trade-off:</strong> CP over AP via
                randomized election timeouts (150-300ms) and majority quorum commit verification.
              </p>
              <div className="font-mono text-[11px] text-zinc-400 pt-1">
                Outcome: Zero split-brain occurrences across 10,000 simulated partition tests.
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <a
                href="https://github.com/adityasingh/raft-kv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-zinc-400 hover:text-white inline-flex items-center gap-1"
              >
                Inspect Source <ArrowUpRight size={12} />
              </a>
              <Link
                href="/blog/raft-consensus-go"
                className="text-xs font-mono text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
              >
                Read Deep Dive <ArrowRight size={12} />
              </Link>
            </div>
          </SpotlightCard>

          {/* Case Study 2 */}
          <SpotlightCard className="p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  SYSTEMS PROGRAMMING
                </span>
                <span className="font-mono text-xs text-zinc-400">Rust · Zero-Allocation</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">
                Zero-Allocation JSON Parser in Rust
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300 font-medium">Problem:</strong> Standard parsers
                allocate heavily on heap for micro-payloads (&lt;4KB), causing memory fragmentation.
                <br />
                <strong className="text-zinc-300 font-medium">Trade-off:</strong> Custom arena
                allocator with stack-allocated string slices versus dynamic memory structures.
              </p>
              <div className="font-mono text-[11px] text-zinc-400 pt-1">
                Outcome: 3.2× throughput improvement over serde_json on microbenchmarks.
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <a
                href="https://github.com/adityasingh/rust-json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-zinc-400 hover:text-white inline-flex items-center gap-1"
              >
                Inspect Source <ArrowUpRight size={12} />
              </a>
              <Link
                href="/projects"
                className="text-xs font-mono text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
              >
                View Benchmark <ArrowRight size={12} />
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Core Competencies Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-mono tracking-tight text-zinc-100">
          Technical Depth Matrix
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SpotlightCard className="p-5">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-zinc-200">
              <Layers size={14} className="text-purple-400" /> Distributed Systems
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Consensus protocols (Raft), log replication, split-brain mitigation, RPC state machines,
              and fault-injection partition tests.
            </p>
            <div className="font-mono text-[11px] text-zinc-400">Go · Rust · Linux · Docker</div>
          </SpotlightCard>

          <SpotlightCard className="p-5">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-zinc-200">
              <Cpu size={14} className="text-cyan-400" /> Full-Stack Architecture
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Next.js 15 App Router, React 19 RSC, Edge Middleware, strict TypeScript type systems,
              and compositor-only animations.
            </p>
            <div className="font-mono text-[11px] text-zinc-400">Next.js · TypeScript · Tailwind · Node</div>
          </SpotlightCard>

          <SpotlightCard className="p-5">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-zinc-200">
              <Database size={14} className="text-emerald-400" /> Performance & Cloud
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Global CDN media delivery (Cloudinary), atomic Git commit flows, Pagefind static
              indices, and sub-30ms INP optimization.
            </p>
            <div className="font-mono text-[11px] text-zinc-400">Cloudinary · Git Data API · Edge Workers</div>
          </SpotlightCard>
        </div>
      </section>
    </div>
  )
}
