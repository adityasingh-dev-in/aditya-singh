# Setup Guide

A complete environment setup walkthrough for the Aditya Singh Engineering Blog.

---

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- A GitHub account and repository
- A Cloudinary account (free tier)
- A Vercel account (free tier)

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Environment Variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

### `NEXT_PUBLIC_SITE_URL`
Your production domain (e.g., `https://aditya.dev`). Used for OG image URLs and RSS feeds.

### `ADMIN_PASSWORD`
Any strong password. This is what you type at `/admin/login`.

### `ADMIN_JWT_SECRET`
A random 256-bit hex string used to sign JWT session tokens. Generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. GitHub Personal Access Token

1. Go to **GitHub → Settings → Developer settings → Fine-grained personal access tokens → Generate new token**
2. Set expiry to your preference
3. Under **Repository access**, select **Only select repositories** → choose your blog repo
4. Grant these permissions:
   - **Contents**: Read and Write
   - **Metadata**: Read (required)
5. Copy the token into `GITHUB_PAT`
6. Set `GITHUB_OWNER` to your GitHub username and `GITHUB_REPO` to the repository name

---

## 4. Cloudinary Setup

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com)
2. From your Cloudinary Dashboard, copy your **Product Environment Credentials**:
   - **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
3. Add these to your `.env.local` file.

> **How it works:** When uploading images in the CMS, the browser requests signed upload credentials from `/api/upload-url` and streams the image directly to Cloudinary. This bypasses serverless body limits and provides automatic image optimization.

---

## 5. Running Locally

```bash
npm run dev
```

This runs Velite in watch mode and Next.js with Turbopack simultaneously via `concurrently`.

> **Note:** The search modal will show "Search requires a production build" in dev mode — this is expected. Pagefind only runs during `npm run build`.

Visit:
- `http://localhost:3000` — public blog
- `http://localhost:3000/admin/login` — admin CMS
- `http://localhost:3000/blog` — post listing

---

## 6. Adding Your First Post

### Option A — Via the CMS

1. Open `http://localhost:3000/admin/login`
2. Enter your `ADMIN_PASSWORD`
3. Click **New Post**
4. Write your post in MDX with frontmatter at the top:

```mdx
---
title: "My First Post"
slug: "my-first-post"
date: "2026-09-22"
description: "A brief description."
tags: ["typescript"]
published: true
---

Post content here.
```

5. Click **Publish** — this validates the MDX and commits to GitHub

### Option B — Via the filesystem (during dev)

Create a file at `content/posts/my-first-post.mdx` with the frontmatter above. Velite will automatically compile it.

---

## 7. Deploying to Vercel

1. Push the repository to GitHub
2. Go to **Vercel → Add New Project → Import Git Repository**
3. Select your repository
4. In **Environment Variables**, add all variables from `.env.example`
5. Click **Deploy**

### Build Command Override

Vercel should auto-detect Next.js. If not, set:
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** `.next`

### Vercel Build Hook (for automatic redeploys on publish)

After deploying:
1. Go to **Vercel → Project Settings → Git → Deploy Hooks**
2. Create a hook named `GitHub CMS Publish`
3. Note the webhook URL
4. Add it to your GitHub repository under **Settings → Webhooks → Push events**

This way, every commit from the admin CMS automatically triggers a Vercel redeploy.

---

## 8. Writing MDX Posts

Posts support:
- Standard Markdown + GFM (GitHub Flavored Markdown) — tables, task lists, strikethrough
- Syntax highlighting (via `rehype-pretty-code` / Shiki with `github-dark-dimmed` theme)
- Custom `<Callout>` component:

```mdx
<Callout type="tip" title="Pro Tip">
  This is a highlighted callout block.
</Callout>
```

Available callout types: `note`, `tip`, `warning`, `danger`, `success`

---

## 9. Customising the Blog

| What to change | Where |
|---|---|
| Your name, bio, social links | `components/layout/Navbar.tsx`, `components/layout/Footer.tsx` |
| Projects list | `lib/projects.ts` |
| Site metadata (OG, Twitter) | `app/layout.tsx` |
| Syntax highlight theme | `velite.config.ts` → `rehypePrettyCode` options |
| Dark/light CSS theme vars | `app/globals.css` → `@theme` / `[data-theme="light"]` |
| Tag color mapping | `components/blog/TagBadge.tsx` |

---

## Architecture Reference

See [`tech-stack-architecture.md`](./tech-stack-architecture.md) for the full system design specification.
