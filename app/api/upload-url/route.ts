import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { verifyAuthSession } from '@/lib/auth'

export const runtime = 'nodejs'

// Strictly allowed image MIME types and their authorized extensions
// Note: SVG is intentionally excluded to prevent stored XSS via embedded script tags
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/avif': ['.avif'],
}

export async function POST(req: NextRequest) {
  // 1. Authenticate admin session
  const session = await verifyAuthSession(req)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate Cloudinary configuration
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured' },
      { status: 500 },
    )
  }

  // 3. Parse and validate JSON request
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 })
  }

  const { filename, contentType } = (body as { filename?: unknown; contentType?: unknown }) ?? {}

  if (!filename || typeof filename !== 'string') {
    return NextResponse.json({ error: 'A valid filename is required' }, { status: 400 })
  }

  if (!contentType || typeof contentType !== 'string') {
    return NextResponse.json({ error: 'A valid contentType is required' }, { status: 400 })
  }

  // 4. Strict MIME type and extension validation
  const normalizedMime = contentType.toLowerCase().trim()
  const allowedExtensions = ALLOWED_MIME_TYPES[normalizedMime]

  if (!allowedExtensions) {
    return NextResponse.json(
      {
        error: 'Unsupported media type. Only JPG, PNG, WebP, GIF, and AVIF images are permitted.',
      },
      { status: 415 },
    )
  }

  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) {
    return NextResponse.json(
      { error: 'Filename must include a valid image extension' },
      { status: 400 },
    )
  }

  const ext = filename.slice(lastDot).toLowerCase()
  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json(
      { error: `File extension "${ext}" does not match content type "${contentType}"` },
      { status: 400 },
    )
  }

  const timestamp = Math.round(new Date().getTime() / 1000)
  const folder = 'blog_media'
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  // 5. Generate signed upload credentials if API Secret is provided
  if (apiSecret && apiKey) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })

    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        timestamp,
      },
      apiSecret,
    )

    return NextResponse.json({
      uploadUrl,
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      method: 'signed',
    })
  }

  // 6. Fallback to unsigned upload preset if configured
  if (uploadPreset) {
    return NextResponse.json({
      uploadUrl,
      cloudName,
      uploadPreset,
      folder,
      method: 'unsigned',
    })
  }

  return NextResponse.json(
    {
      error:
        'Cloudinary credentials incomplete: set CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET, or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
    },
    { status: 500 },
  )
}
