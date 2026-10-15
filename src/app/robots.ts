import type { MetadataRoute } from 'next'

import { SITE_URL, noIndex } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  if (noIndex) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/konfigurator/*/pdf'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
