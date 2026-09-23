import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Velite integration via custom webpack plugin
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://res.cloudinary.com",
      "font-src 'self' data:",
      "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ]

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
          },
        ],
      },
    ]
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },
}

class VeliteWebpackPlugin {
  static started = false

  apply(compiler: { options: { mode: string }; hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } } }) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const dev = compiler.options.mode === 'development'
      // In dev mode, velite is run via `velite --watch` concurrently; avoid duplicate file locks
      if (!dev) {
        const { build } = await import('velite')
        await build({ watch: false, clean: false })
      }
    })
  }
}

export default nextConfig
