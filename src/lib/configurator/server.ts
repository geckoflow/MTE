import 'server-only'

import type { Payload, Where } from 'payload'

import type { Product, Setting } from '@/payload-types'

import { buildCatalog } from './catalog'
import { configurationCode } from './code'
import { quote, validateSelection } from './engine'
import type { Catalog, Quote, Selection } from './types'

export async function loadConfigurable(payload: Payload, slugOrId?: string | null): Promise<{ product: Product; catalog: Catalog } | null> {
  const where: Where = slugOrId
    ? { or: [{ slug: { equals: slugOrId } }, ...(/^\d+$/.test(slugOrId) ? [{ id: { equals: Number(slugOrId) } }] : [])] }
    : {}
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [where, { type: { equals: 'schaftboeller' } }, { configurable: { equals: true } }, { published: { equals: true } }],
    },
    sort: 'sortOrder',
    depth: 2,
    limit: 1,
  })
  const product = docs[0]
  return product ? { product, catalog: buildCatalog(product) } : null
}

export const vatOf = (settings: Setting) => ({
  mode: (settings.vatMode ?? 'regel') as 'regel' | 'kleinunternehmer',
  rate: settings.vatRate ?? 20,
})

export type SavedConfiguration = { code: string; id: number; quote: Quote; selection: Selection; productName: string }

/**
 * Prüft die Auswahl, berechnet den verbindlichen Preis und speichert die Konfiguration
 * (gleiche Auswahl + gleicher Preis ⇒ gleicher Code, kein Duplikat).
 */
export async function saveConfiguration(
  payload: Payload,
  productSlug: string | undefined,
  rawSelection: unknown,
): Promise<{ ok: true; saved: SavedConfiguration } | { ok: false; status: number; errors: string[] }> {
  const loaded = await loadConfigurable(payload, productSlug)
  if (!loaded) return { ok: false, status: 404, errors: ['Produkt nicht gefunden.'] }
  const { product, catalog } = loaded
  const result = validateSelection(catalog, rawSelection)
  if (!result.ok) return { ok: false, status: 422, errors: result.errors }
  const settings = await payload.findGlobal({ slug: 'settings' })
  const q = quote(catalog, result.selection, vatOf(settings))
  const code = configurationCode(catalog.product.id, result.selection, q.totalCents)

  const existing = await payload.find({ collection: 'configurations', where: { code: { equals: code } }, limit: 1, depth: 0 })
  let id = existing.docs[0]?.id as number | undefined
  if (!id) {
    try {
      const doc = await payload.create({
        collection: 'configurations',
        data: {
          code,
          product: product.id,
          productName: product.name,
          total: q.totalCents / 100,
          lines: q.lines.map((l) => ({ label: l.label, detail: l.detail, amount: l.amountCents / 100 })),
          selection: result.selection,
          vatMode: q.vat.mode,
          vatRate: q.vat.rate,
        },
      })
      id = doc.id as number
    } catch (err) {
      // Gleichzeitiges Speichern derselben Konfiguration: vorhandenen Datensatz verwenden
      const again = await payload.find({ collection: 'configurations', where: { code: { equals: code } }, limit: 1, depth: 0 })
      if (!again.docs[0]) throw err
      id = again.docs[0].id as number
    }
  }
  return { ok: true, saved: { code, id, quote: q, selection: result.selection, productName: product.name } }
}
