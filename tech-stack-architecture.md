# Personal Engineering Blog: Architecture & Tech Stack Specification

A production-grade, statically generated, self-hosted engineering blog and publishing platform. Combines a modern Next.js static site generator with an authenticated in-browser CMS and atomic Git-backed persistence.

---

## 1. System Architecture Overview

                                    +-----------------------------+
                                    |     Cloudflare R2 Bucket    |
                                    |   (Images / Static Assets)  |
                                    +-----------------------------+
                                                  ^
                                                  | Direct Presigned Upload
                                                  |
+-------------------+                 +-----------+----------+                 +---------------------+
|   Public Reader   |                 |    Admin Author      |                 |   GitHub Repository |
| (Static Fast-Path)|                 | (In-Browser CMS UI)  |                 | (Single Source Truth)|
+-------------------+                 +----------------------+                 +---------------------+
          |                                      |                                        ^
          | HTTP GET                             | Draft (IndexedDB)                      |
          v                                      | Publish (JSON Payload)                 | Atomic Commits
+-------------------+                            v                                        | (Git Data API)
| Vercel Edge / CDN |                 +----------------------+                            |
| (Pagefind Search  |                 | /api/posts Endpoint  |----------------------------+
|  + HTML / ISR)    |                 | - Auth Guard         |
+-------------------+                 | - Pre-flight MDX Val |
          ^                           +----------------------+
          | Build Hook Trigger                   |
          +--------------------------------------+ (Triggers rebuild on commit)

### Key Architectural Tenets
1. Decoupled Asset Pipeline: Static assets and media bypass both the Git repository and Vercel compute payloads via Cloudflare R2 presigned URLs.
2. Atomic Content Versioning: All post updates and publishing write directly to GitHub via the low-level Git Data API, bypassing file lock/SHA collision issues.
3. Build Shielding: Client-side draft autosaving (IndexedDB) prevents unnecessary CI/CD builds on intermediate saves, reserving deployment hooks solely for published content.
4. Pre-flight Compile Checking: MDX content is parsed and verified for AST/compilation health in serverless execution prior to committing to git, eliminating broken deployment builds.

---

## 2. Full Technology Stack

### Core Framework & Runtimes
* Framework: Next.js 15 (App Router)
* Language: TypeScript 5.x (Strict mode)
* Styling: Tailwind CSS 4.x
* UI Primitives: Radix UI / Shadcn UI
* Icons: Lucide React

### Content & Search
* Content Engine: Velite (Zod-powered content schema and build pipeline)
* Syntax Highlighting: rehype-pretty-code with shiki
* Markdown Parser & Extensions: @mdx-js/mdx, remark-gfm, gray-matter
* Static Search: Pagefind (Client-side decoupled indexer with zero bundle overhead)

### Media & Storage
* Media Storage: Cloudflare R2 (S3-compatible, $0 egress fees)
* Object Client: @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

### Administration & Security
* Admin CMS Editor: @uiw/react-mdx-editor
* Draft Persistence: idb-keyval (Browser IndexedDB)
* Authentication: Iron Session (iron-session) or JOSE session tokens
* Git Automation: @octokit/rest (GitHub Git Data API)

### Development & Build Tooling
* Process Management: concurrently (cross-platform watch script orchestration)
* Search Indexing CLI: pagefind

---

## 3. Core Implementation Specifications

### 3.1 Content Engine (velite.config.ts)

import { defineConfig, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: {
    posts: {
      name: 'Post',
      pattern: 'posts/**/*.mdx',
      schema: s
        .object({
          title: s.string().max(120),
          slug: s.slug('posts'),
          date: s.isodate().or(s.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
          description: s.string().max(250),
          tags: s.array(s.string()).default([]),
          published: s.boolean().default(true),
          coverImage: s.string().url().optional(),
          body: s.mdx(),
        })
        .transform((data) => ({
          ...data,
          permalink: `/blog/${data.slug}`,
        })),
    },
  },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: 'github-dark-dimmed',
          keepBackground: true,
        },
      ],
    ],
  },
})

---

### 3.2 Cloudflare R2 Presigned Upload Route (app/api/upload-url/route.ts)

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { verifyAuthSession } from '@/lib/auth'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const session = await verifyAuthSession(req)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename, contentType } = await req.json()
  if (!filename || typeof filename !== 'string') {
    return NextResponse.json({ error: 'Valid filename is required' }, { status: 400 })
  }

  const sanitizedKey = `media/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: sanitizedKey,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${sanitizedKey}`

  return NextResponse.json({ uploadUrl, publicUrl })
}

---

### 3.3 Atomic Git Data Publishing Engine (lib/github.ts)

import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_PAT })
const OWNER = process.env.GITHUB_OWNER!
const REPO = process.env.GITHUB_REPO!
const BRANCH = process.env.GITHUB_BRANCH || 'main'

interface CommitPostInput {
  slug: string
  content: string
  message: string
}

export async function commitPostToGitHub({ slug, content, message }: CommitPostInput) {
  // 1. Get HEAD reference
  const refRes = await octokit.rest.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
  })
  const latestCommitSha = refRes.data.object.sha

  // 2. Fetch base tree from latest commit
  const commitRes = await octokit.rest.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: latestCommitSha,
  })
  const baseTreeSha = commitRes.data.tree.sha

  // 3. Create blob for new file
  const blobRes = await octokit.rest.git.createBlob({
    owner: OWNER,
    repo: REPO,
    content: Buffer.from(content).toString('base64'),
    encoding: 'base64',
  })

  // 4. Construct tree with single modified path
  const treeRes = await octokit.rest.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseTreeSha,
    tree: [
      {
        path: `content/posts/${slug}.mdx`,
        mode: '100644',
        type: 'blob',
        sha: blobRes.data.sha,
      },
    ],
  })

  // 5. Create new commit
  const newCommitRes = await octokit.rest.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message,
    tree: treeRes.data.sha,
    parents: [latestCommitSha],
  })

  // 6. Update reference atomically
  await octokit.rest.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommitRes.data.sha,
    force: false,
  })

  return { commitSha: newCommitRes.data.sha }
}

---

### 3.4 Pre-flight MDX Verification & Publishing Route (app/api/posts/route.ts)

import { NextRequest, NextResponse } from 'next/server'
import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import matter from 'gray-matter'
import { commitPostToGitHub } from '@/lib/github'
import { verifyAuthSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await verifyAuthSession(req)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug, fileContent, message } = await req.json()

    // 1. Sanitize slug to prevent path traversal
    const sanitizedSlug = slug?.replace(/[^a-zA-Z0-9_-]/g, '')
    if (!sanitizedSlug) {
      return NextResponse.json({ error: 'Valid post slug is required' }, { status: 400 })
    }

    // 2. Separate frontmatter from markdown body
    const { data: frontmatter, content: body } = matter(fileContent)

    if (!frontmatter.title || !frontmatter.date) {
      return NextResponse.json(
        { error: 'Frontmatter must contain at least title and date' },
        { status: 400 }
      )
    }

    // 3. Pre-flight compile check
    await compile(body, {
      remarkPlugins: [remarkGfm],
    })

    // 4. Atomic commit to repository
    const result = await commitPostToGitHub({
      slug: sanitizedSlug,
      content: fileContent,
      message: message || `chore(content): publish ${sanitizedSlug}`,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    return NextResponse.json(
      { error: `MDX Pre-flight validation failed: ${err.message}` },
      { status: 422 }
    )
  }
}

---

### 3.5 Client Draft Engine (app/admin/editor.tsx snippet)

import { useEffect, useState } from 'react'
import { get, set, del } from 'idb-keyval'

export function usePostDraft(slug: string) {
  const [draft, setDraft] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    get(`draft:${slug}`).then((val) => {
      if (val) setDraft(val)
    })
  }, [slug])

  const saveDraft = async (content: string) => {
    await set(`draft:${slug}`, content)
    setDraft(content)
    setLastSaved(new Date())
  }

  const clearDraft = async () => {
    await del(`draft:${slug}`)
    setDraft(null)
  }

  return { draft, saveDraft, clearDraft, lastSaved }
}

---

## 4. Middleware & Route Protection (middleware.ts)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const sessionToken = req.cookies.get('admin_session')?.value

  const isProtectedPath = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isProtectedApi = pathname.startsWith('/api/posts') || pathname.startsWith('/api/upload-url')

  if ((isProtectedPath || isProtectedApi) && !sessionToken) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/posts/:path*', '/api/upload-url/:path*'],
}

---

## 5. Build Order & Milestones

1. Step 1: Baseline Scaffold: Next.js 15 (App Router) + Tailwind CSS + Lucide React + Shadcn UI.
2. Step 2: Velite Content Engine: Configure velite.config.ts, adjust package.json scripts, and verify static compilation.
3. Step 3: MDX Pipeline & Search: Setup rehype-pretty-code, build public post pages (/blog and /blog/[slug]), and execute Pagefind generation (pagefind --site .next/server/app --output-path public/pagefind).
4. Step 4: Cloudflare R2 Uploads: Implement /api/upload-url and connect presigned URL generation with direct client uploads.
5. Step 5: Admin Auth & Security: Implement /admin/login, session cookies, and route guards across /admin/* and protected /api/* endpoints.
6. Step 6: Editor & IndexedDB Drafts: Implement /admin/new and /admin/edit/[slug] with @uiw/react-mdx-editor and local IndexedDB autosaving.
7. Step 7: Pre-flight Verification & Publishing: Implement /api/posts with @mdx-js/mdx verification and Octokit Git Data API commits.

---



Build a production-grade, statically generated engineering blog with an in-browser authenticated CMS using Next.js 15 (App Router), Tailwind CSS, Velite, Pagefind, Cloudflare R2, and GitHub Git Data API.

### Core Stack Requirements
- Next.js 15 (App Router) + TypeScript (strict).
- Styling: Tailwind CSS + Lucide Icons + Shadcn UI primitives.
- Content Management: Velite (velite.config.ts) compiling content from content/posts/**/*.mdx.
- Search: Pagefind static search indexing .next/server/app with output to public/pagefind.
- Asset Pipeline: Direct-to-Cloudflare-R2 uploads using presigned URLs via @aws-sdk/s3-request-presigner.
- Git Storage: Octokit via GitHub Git Data API (createTree, createCommit, updateRef).
- Local Storage: idb-keyval for client-side draft auto-persistence.

### Package Scripts Configuration (package.json)
{
  "scripts": {
    "dev": "concurrently \"velite --watch\" \"next dev --turbo\"",
    "build": "velite && next build && pagefind --site .next/server/app --output-path public/pagefind",
    "start": "next start"
  }
}

### Public View Specifications
1. /: Clean developer portfolio landing page with featured posts, latest projects, and clean typography.
2. /blog: Chronological list of all published posts with tags, search trigger, read times, and dates.
3. /blog/[slug]: Rendered MDX post with rich code blocks (rehype-pretty-code), table of contents, and tag links.
4. Search Modal: Client-side modal using Pagefind library.

### Admin CMS Specifications
1. /admin/login: Secure password gate verifying against ADMIN_PASSWORD env variable; sets HTTP-only session cookie.
2. middleware.ts: Guard both /admin/:path* (except /admin/login) and /api/posts, /api/upload-url.
3. /admin/new & /admin/edit/[slug]:
   - Split-pane markdown editor (@uiw/react-mdx-editor).
   - Image drag-and-drop: Requests presigned URL from /api/upload-url, uploads directly to R2 via PUT, and pastes the public URL into markdown.
   - Autosave: Automatically saves changes to browser IndexedDB under draft:<slug>.
   - "Save Draft": Saves exclusively to IndexedDB with UI timestamp. Does NOT trigger git commits or Vercel builds.
   - "Publish": Sends payload to /api/posts.
4. /api/posts:
   - Validates admin session.
   - Parses frontmatter with gray-matter.
   - Runs pre-flight check using @mdx-js/mdx compile(body, { remarkPlugins: [remarkGfm] }) in a try/catch block. Returns 422 with compilation error if invalid.
   - Executes atomic commit to GitHub using Octokit Git Data API (getRef -> getCommit -> createBlob -> createTree -> createCommit -> updateRef).