import type { Metadata } from 'next'
import { Github, ExternalLink, Cpu, CheckCircle2, ShieldAlert, GitFork } from 'lucide-react'
import { projects } from '@/lib/projects'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import TagBadge from '@/components/blog/TagBadge'

export const metadata: Metadata = {
  title: 'Architectural Proof & Engineering Systems',
  description:
    'Senior engineering case studies by Aditya Singh across distributed consensus, zero-cost architectures, and systems programming.',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string; bg: string }> = {
  active: {
    label: 'ACTIVE PRODUCTION',
    color: '#4ade80',
    border: 'rgba(74,222,128,0.25)',
    bg: 'rgba(74,222,128,0.08)',
  },
  maintained: {
    label: 'MAINTAINED',
    color: '#38bdf8',
    border: 'rgba(56,189,248,0.25)',
    bg: 'rgba(56,189,248,0.08)',
  },
  archived: {
    label: 'RESEARCH PROTOTYPE',
    color: '#a1a1aa',
    border: 'rgba(161,161,170,0.25)',
    bg: 'rgba(161,161,170,0.08)',
  },
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16 pb-24 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
          <Cpu size={14} />
          <span>EXECUTABLE PROOF & SYSTEMS ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 font-mono">
          Architectural Case Studies
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
          Senior-level engineering artifacts structured around problem constraints, deliberate
          trade-offs, and verifiable performance outcomes. No marketing demos.
        </p>
      </div>

      {/* Case Studies Grid */}
      <div className="space-y-6">
        {projects.map((project) => {
          const status = STATUS_CONFIG[project.status]
          return (
            <SpotlightCard key={project.id} className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold font-mono text-zinc-100 tracking-tight">
                      {project.title}
                    </h2>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider"
                      style={{
                        color: status.color,
                        background: status.bg,
                        border: `1px solid ${status.border}`,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">{project.tagline}</p>
                </div>

                <div className="flex items-center gap-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-all"
                      aria-label={`${project.title} GitHub repository`}
                    >
                      <Github size={13} /> Source
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-xs font-mono text-purple-300 hover:bg-purple-500/20 transition-all"
                      aria-label={`${project.title} Live URL`}
                    >
                      <ExternalLink size={13} /> Live System
                    </a>
                  )}
                </div>
              </div>

              {/* 3-Column Engineering Framework */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Problem Constraints */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-400 mb-2 font-semibold">
                      <ShieldAlert size={13} /> Problem Constraints
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {project.problemConstraints}
                    </p>
                  </div>
                </div>

                {/* 2. Architectural Trade-offs */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-purple-400 mb-2 font-semibold">
                      <GitFork size={13} /> Architectural Trade-offs
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {project.architecturalTradeoffs}
                    </p>
                  </div>
                </div>

                {/* 3. Verifiable Outcomes */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-emerald-400 mb-2 font-semibold">
                      <CheckCircle2 size={13} /> Verifiable Outcomes
                    </div>
                    <p className="text-xs text-emerald-200/90 leading-relaxed font-sans font-medium">
                      {project.outcomeMetrics}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Tech Stack Tags */}
              <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-zinc-400 mr-1">Stack:</span>
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-zinc-300 text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  {project.tags.map((t) => (
                    <TagBadge key={t} tag={t} />
                  ))}
                </div>
              </div>
            </SpotlightCard>
          )
        })}
      </div>
    </div>
  )
}
