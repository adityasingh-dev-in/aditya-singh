import Image from 'next/image'
import Link from 'next/link'
import { Callout } from './Callout'

export const MDXComponents = {
  // Override default HTML elements
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) return <span {...props}>{children}</span>

    const trimmedHref = href.trim()
    // Explicit whitelist of safe protocols: prevent javascript:, data:, vbscript: XSS
    const isAllowedScheme =
      trimmedHref.startsWith('https://') ||
      trimmedHref.startsWith('http://') ||
      trimmedHref.startsWith('mailto:') ||
      trimmedHref.startsWith('/') ||
      trimmedHref.startsWith('#')

    if (!isAllowedScheme) {
      return (
        <span className="text-red-400" title="Untrusted link protocol blocked">
          {children}
        </span>
      )
    }

    const isExternal =
      trimmedHref.startsWith('http://') || trimmedHref.startsWith('https://')

    if (isExternal) {
      return (
        <a
          href={trimmedHref}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <Link href={trimmedHref} {...props}>
        {children}
      </Link>
    )
  },

  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!src || typeof src !== 'string') return null
    const trimmedSrc = src.trim()
    // Disallow dangerous URI schemes in images
    if (
      !trimmedSrc.startsWith('https://') &&
      !trimmedSrc.startsWith('http://') &&
      !trimmedSrc.startsWith('/') &&
      !trimmedSrc.startsWith('data:image/')
    ) {
      return null
    }
    return (
      <span className="block my-6">
        <Image
          src={src}
          alt={alt ?? ''}
          width={800}
          height={500}
          className="rounded-xl border mx-auto"
          style={{ borderColor: 'var(--color-border)', objectFit: 'contain' }}
          unoptimized={src.startsWith('http')}
        />
        {alt && (
          <span
            className="block text-center text-sm mt-2"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {alt}
          </span>
        )}
      </span>
    )
  },

  // Custom components for use in MDX files
  Callout,

  // Styled blockquote
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote
      className="border-l-4 pl-5 py-1 my-6 italic"
      style={{
        borderColor: 'var(--color-primary)',
        color: 'var(--color-muted-foreground)',
        background: 'rgba(139,92,246,0.05)',
      }}
    >
      {children}
    </blockquote>
  ),

  // Table components
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th
      className="px-4 py-2 text-left font-semibold border"
      style={{
        background: 'var(--color-muted)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-foreground)',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td
      className="px-4 py-2 border"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-foreground)',
      }}
    >
      {children}
    </td>
  ),
}
