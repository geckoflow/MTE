import 'server-only'

import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Craft, Faq, Homepage, LegalPage, Product, Setting } from '@/payload-types'

export const getPayloadClient = cache(() => getPayload({ config }))

export const getSettings = cache(async (): Promise<Setting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'settings', depth: 1 })
})

export const getHomepage = cache(async (): Promise<Homepage> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'homepage', depth: 1 })
})

export const getCraft = cache(async (): Promise<Craft> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'craft', depth: 1 })
})

export const getProducts = cache(async (type?: Product['type']): Promise<Product[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [{ published: { equals: true } }, ...(type ? [{ type: { equals: type } }] : [])] },
    sort: 'sortOrder',
    depth: 1,
    limit: 100,
    overrideAccess: false,
  })
  return docs
})

export const getProductBySlug = cache(async (slug: string, type?: Product['type']): Promise<Product | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [{ slug: { equals: slug } }, { published: { equals: true } }, ...(type ? [{ type: { equals: type } }] : [])],
    },
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
})

export const getConfigurableProducts = cache(async (): Promise<Product[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [{ type: { equals: 'schaftboeller' } }, { configurable: { equals: true } }, { published: { equals: true } }],
    },
    sort: 'sortOrder',
    depth: 2,
    limit: 20,
    overrideAccess: false,
  })
  return docs
})

export const getFaqs = cache(async (onlyHome = false): Promise<Faq[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'faqs',
    where: { and: [{ published: { equals: true } }, ...(onlyHome ? [{ showOnHome: { equals: true } }] : [])] },
    sort: 'sortOrder',
    limit: 100,
    overrideAccess: false,
  })
  return docs
})

export const getGallery = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'gallery',
    where: { published: { equals: true } },
    sort: 'sortOrder',
    depth: 1,
    limit: 200,
    overrideAccess: false,
  })
  return docs
})

export const getLegalPage = cache(async (slug: string): Promise<LegalPage | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'legal-pages',
    where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
})

export const getLegalPages = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'legal-pages',
    where: { published: { equals: true } },
    sort: 'title',
    limit: 50,
    depth: 0,
    overrideAccess: false,
  })
  return docs
})

export const getConfigurationByCode = cache(async (code: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'configurations',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

export const priceSettings = (s: Pick<Setting, 'vatMode' | 'vatRate' | 'showPrices'>) => ({
  showPrices: s.showPrices !== false,
  vat: { mode: (s.vatMode ?? 'regel') as 'regel' | 'kleinunternehmer', rate: s.vatRate ?? 20 },
})

export const vatNote = (s: Pick<Setting, 'vatMode' | 'vatRate'>) =>
  s.vatMode === 'kleinunternehmer'
    ? 'Umsatzsteuerbefreit (Kleinunternehmerregelung)'
    : `inkl. ${s.vatRate ?? 20} % USt.`
