import type { Metadata } from 'next'

import type { Media, Product, Setting } from '@/payload-types'

import { SERVER_URL } from './env'
import { absoluteUrl, mediaUrl } from './media'

export const SITE_URL = SERVER_URL

/** Staging/Vorschau-Umgebungen nicht indexieren */
export const noIndex = process.env.SITE_NOINDEX === 'true'

type Meta = { title?: string | null; description?: string | null; image?: number | Media | null }

export function pageMetadata(opts: {
  title: string
  description?: string | null
  path: string
  meta?: Meta | null
  image?: string
}): Metadata {
  const title = opts.meta?.title || opts.title
  const description = opts.meta?.description || opts.description || undefined
  const image = mediaUrl(opts.meta?.image ?? undefined, 'og') || opts.image
  return {
    title: { absolute: title.includes('|') ? title : `${title} | Schaftböller Ebner` },
    description,
    alternates: { canonical: opts.path },
    openGraph: {
      title,
      description,
      url: opts.path,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
  }
}

export function organizationJsonLd(settings: Setting) {
  const sameAs = (settings.social ?? []).map((s) => s.url).filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organisation`,
    name: settings.brandName || 'Schaftböller Ebner',
    legalName: settings.legalName || undefined,
    url: SITE_URL,
    logo: absoluteUrl('/brand/logo-schriftzug-schwarz.png'),
    image: absoluteUrl('/brand/logo-widder-schwarz-original.png'),
    description: 'Handgefertigte Schaftböller aus regionalem Nussholz und Edelstahl.',
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.street || undefined,
      postalCode: settings.zip || undefined,
      addressLocality: settings.city || 'Oberalm',
      addressRegion: settings.region || 'Salzburg',
      addressCountry: 'AT',
    },
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function productJsonLd(product: Product, path: string, showPrices: boolean) {
  const images = (product.images ?? []).map((m) => mediaUrl(m, 'large')).filter(Boolean) as string[]
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline || undefined,
    image: images.map(absoluteUrl),
    brand: { '@type': 'Brand', name: 'Schaftböller Ebner' },
    url: `${SITE_URL}${path}`,
    ...(showPrices && product.price
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: product.price.toFixed(2),
            availability: product.available !== false ? 'https://schema.org/MadeToOrder' : 'https://schema.org/OutOfStock',
            seller: { '@id': `${SITE_URL}/#organisation` },
          },
        }
      : {}),
  }
}
