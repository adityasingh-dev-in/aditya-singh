import { NextRequest, NextResponse } from 'next/server'
import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import matter from 'gray-matter'
import fs from 'node:fs'
import path from 'node:path'
import { commitPostToGitHub } from '@/lib/github'
import { verifyAuthSession } from '@/lib/auth'

export const runtime = 'nodejs' // needs Buffer + Node fs APIs

const MAX_FILE_SIZE = 500 * 1024 // 500 KB
const SLUG_REGEX = /^[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9]+)?$/i

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const session = await verifyAuthSession(req)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse request JSON safely
  let bodyJson: unknown
  try {
    bodyJson = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Malformed JSON payload' },
      { status: 400 },
    )
  }

  const { slug: rawSlug, fileContent: rawFileContent, message } = (bodyJson as {
    slug?: unknown
    fileContent?: unknown
    message?: unknown
  }) ?? {}

  // 3. Validate file content and size limits
  if (typeof rawFileContent !== 'string' || rawFileContent.trim().length === 0) {
    return NextResponse.json(
      { error: 'fileContent must be a non-empty string' },
      { status: 400 },
    )
  }

  if (Buffer.byteLength(rawFileContent, 'utf8') > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File content exceeds maximum allowed size (500 KB)' },
      { status: 413 },
    )
  }

  // 4. Parse frontmatter
  let frontmatter: Record<string, unknown>
  let body: string
  try {
    const parsed = matter(rawFileContent)
    frontmatter = parsed.data
    body = parsed.content
  } catch {
    return NextResponse.json(
      { error: 'Invalid frontmatter syntax. Must be valid YAML block.' },
      { status: 400 },
    )
  }

  // 5. Determine target slug (prefer frontmatter.slug if defined and non-empty, otherwise payload slug)
  const candidateSlug =
    typeof frontmatter.slug === 'string' && frontmatter.slug.trim().length > 0
      ? frontmatter.slug.trim()
      : typeof rawSlug === 'string' && rawSlug.trim().length > 0
        ? rawSlug.trim()
        : ''

  if (!candidateSlug) {
    return NextResponse.json(
      { error: 'Valid post slug is required either in frontmatter or request payload' },
      { status: 400 },
    )
  }

  const cleanSlug = candidateSlug.toLowerCase()
  if (cleanSlug.length < 2 || cleanSlug.length > 100 || !SLUG_REGEX.test(cleanSlug)) {
    return NextResponse.json(
      {
        error:
          'Invalid slug format. Must be between 2 and 100 characters and contain only lowercase letters, numbers, hyphens, and underscores.',
      },
      { status: 400 },
    )
  }

  // Synchronize frontmatter.slug with cleanSlug
  frontmatter.slug = cleanSlug

  // 6. Validate mandatory frontmatter fields
  if (!frontmatter.title || typeof frontmatter.title !== 'string') {
    return NextResponse.json(
      { error: 'Frontmatter must contain a string `title`' },
      { status: 400 },
    )
  }

  if (frontmatter.title.length > 200) {
    return NextResponse.json(
      { error: 'Title must not exceed 200 characters' },
      { status: 400 },
    )
  }

  if (!frontmatter.date) {
    return NextResponse.json(
      { error: 'Frontmatter must contain a valid `date` (YYYY-MM-DD)' },
      { status: 400 },
    )
  }

  // 7. Pre-flight MDX compile check — catches syntax errors BEFORE committing
  try {
    await compile(body, {
      remarkPlugins: [remarkGfm],
    })
  } catch (err: unknown) {
    const compileMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `MDX compilation failed: ${compileMsg}` },
      { status: 422 },
    )
  }

  // Re-serialize final file content with normalized frontmatter
  const finalFileContent = matter.stringify(body, frontmatter)

  // 8. Always write to local filesystem
  // This guarantees Velite (--watch) detects the new/updated file immediately in dev mode!
  let savedLocally = false
  try {
    const postsDir = path.join(process.cwd(), 'content', 'posts')
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true })
    }
    const localFilePath = path.join(postsDir, `${cleanSlug}.mdx`)
    fs.writeFileSync(localFilePath, finalFileContent, 'utf-8')
    savedLocally = true
  } catch (err) {
    console.error('Failed to write post to local filesystem:', err)
  }

  // 9. Sanitize commit message to prevent control-character injection
  const safeMessage =
    typeof message === 'string' && message.trim().length > 0
      ? message.replace(/[\r\n\x00-\x1F]/g, ' ').slice(0, 150).trim()
      : `chore(content): publish ${cleanSlug}`

  // 10. Atomic commit to GitHub (if GitHub PAT is configured)
  const isGitHubConfigured =
    Boolean(process.env.GITHUB_PAT) &&
    Boolean(process.env.GITHUB_OWNER) &&
    Boolean(process.env.GITHUB_REPO)

  if (isGitHubConfigured) {
    try {
      const result = await commitPostToGitHub({
        slug: cleanSlug,
        content: finalFileContent,
        message: safeMessage,
      })

      return NextResponse.json({
        success: true,
        slug: cleanSlug,
        commitSha: result.commitSha,
        savedLocally,
      })
    } catch (err: unknown) {
      console.error('GitHub commit error:', err)
      if (process.env.NODE_ENV !== 'production' || savedLocally) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        return NextResponse.json({
          success: true,
          slug: cleanSlug,
          savedLocally,
          warning: `Saved locally to content/posts/${cleanSlug}.mdx. GitHub sync failed: ${errorMsg}`,
        })
      }

      return NextResponse.json(
        {
          error:
            'Failed to commit post to repository. Please verify GitHub credentials and permissions.',
        },
        { status: 502 },
      )
    }
  }

  return NextResponse.json({
    success: true,
    slug: cleanSlug,
    savedLocally,
    message: `Post saved locally to content/posts/${cleanSlug}.mdx (GitHub integration not configured)`,
  })
}


