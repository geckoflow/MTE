import type { MetadataRoute } from 'next'

import { getLegalPages, getProducts } from '@/lib/data'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, legal] = await Promise.all([getProducts(), getLegalPages()])
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/schaftboeller`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/konfigurator`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/zubehoer`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/handwerk`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/galerie`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/kontakt`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ]
  const productRoutes = products
    .filter((p) => p.type !== 'personalisierung' && p.slug)
    .map((p) => ({
      url: `${SITE_URL}/${p.type === 'schaftboeller' ? 'schaftboeller' : 'zubehoer'}/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: p.type === 'schaftboeller' ? 0.8 : 0.5,
    }))
  const legalRoutes = legal.map((p) => ({ url: `${SITE_URL}/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: 'yearly' as const, priority: 0.2 }))
  return [...staticRoutes, ...productRoutes, ...legalRoutes]
}
