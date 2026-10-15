import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Optionale cookielose Statistik (Plausible) in der Content-Security-Policy erlauben
const analyticsOrigin = (() => {
  try {
    return process.env.PLAUSIBLE_DOMAIN ? new URL(process.env.PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js').origin : ''
  } catch {
    return ''
  }
})()

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${analyticsOrigin ? ` ${analyticsOrigin}` : ''}${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  `connect-src 'self'${analyticsOrigin ? ` ${analyticsOrigin}` : ''}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  // Eigene 404-Seite auch für URLs außerhalb aller Routen (zwei Root-Layouts: Website + Admin)
  experimental: { globalNotFound: true },
  // Nur Laufzeit-Dateien ins Standalone-Paket (Docker-Image) übernehmen
  outputFileTracingExcludes: {
    '*': ['docs/**', 'prototype/**', 'tests/**', 'media/**', 'deploy/**', '.github/**', 'playwright-report/**', 'test-results/**', '*.md'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Strenge CSP für die Website; der Admin-Bereich (Payload) bringt eigene Anforderungen mit
      { source: '/((?!admin|api).*)', headers: [{ key: 'Content-Security-Policy', value: csp }] },
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
