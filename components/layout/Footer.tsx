import Link from 'next/link'
import { Github, Twitter, Rss, Mail, Terminal, GitCommit } from 'lucide-react'

const SOCIAL_LINKS = [
  { href: 'https://github.com/adityasingh', label: 'GitHub', icon: Github },
  { href: 'https://twitter.com/adityasingh', label: 'Twitter', icon: Twitter },
  { href: '/rss.xml', label: 'RSS Feed', icon: Rss },
  { href: 'mailto:hi@aditya.dev', label: 'Email', icon: Mail },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] mt-24 bg-[#09090b] text-zinc-400 font-mono text-xs">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Identity & Mission */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Terminal size={15} className="text-purple-400" />
              <span>aditya.dev — Engineering Proof</span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-md">
              A statically generated engineering portfolio and CMS built without databases or
              recurring hosting fees. Every post is a Git commit; every asset is edge-cached.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <GitCommit size={13} className="text-emerald-400" />
              <span>Engineered with Next.js 15, Velite, Cloudinary & Pagefind</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              Navigation
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Engineering Essays
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Architectural Proof
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  In-Browser CMS
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              Channels
            </div>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20 transition-all text-xs"
                  aria-label={label}
                >
                  <Icon size={13} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>
            © {new Date().getFullYear()} Aditya Singh. All systems nominal.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> INP &lt; 30ms
            </span>
            <span>·</span>
            <span>Zero-cost edge pipeline</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
