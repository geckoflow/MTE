import { buildCatalog } from '@/lib/configurator/catalog'
import { normalizeCode } from '@/lib/configurator/code'
import { quote, validateSelection } from '@/lib/configurator/engine'
import { visualStateFrom } from '@/lib/configurator/illustration'
import type { Quote } from '@/lib/configurator/types'
import { getPayloadClient } from '@/lib/data'
import { clientIp, rateLimit } from '@/lib/http'
import { renderBoellerPng } from '@/lib/render/boeller-image'
import { renderConfigurationPdf } from '@/lib/render/pdf'
import { SITE_URL } from '@/lib/seo'
import type { Product } from '@/payload-types'

/** PDF einer gespeicherten Konfiguration – Preise aus der gespeicherten Momentaufnahme */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!rateLimit(`pdf:${clientIp(req)}`, 20, 10 * 60_000)) return new Response('Zu viele Anfragen.', { status: 429 })
  const { code: raw } = await params
  const code = normalizeCode(raw)
  if (!code) return new Response('Nicht gefunden', { status: 404 })

  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'configurations', where: { code: { equals: code } }, depth: 2, limit: 1 })
  const config = docs[0]
  if (!config || typeof config.product !== 'object' || !config.product) return new Response('Nicht gefunden', { status: 404 })

  const settings = await payload.findGlobal({ slug: 'settings' })
  const catalog = buildCatalog(config.product as Product)
  const { selection } = validateSelection(catalog, config.selection)

  // Gespeicherte Positionen verwenden (Preis-Momentaufnahme), sonst neu berechnen
  const stored: Quote | null = config.lines?.length
    ? {
        lines: config.lines.map((l) => ({ label: l.label ?? '', detail: l.detail ?? undefined, amountCents: Math.round((l.amount ?? 0) * 100) })),
        totalCents: Math.round((config.total ?? 0) * 100),
        vat: {
          mode: (config.vatMode as 'regel' | 'kleinunternehmer') ?? 'regel',
          rate: settings.vatRate ?? 20,
          includedCents: 0,
        },
      }
    : null
  const q = stored ?? quote(catalog, selection, { mode: settings.vatMode ?? 'regel', rate: settings.vatRate ?? 20 })
  if (stored && q.vat.mode === 'regel') q.vat.includedCents = Math.round(q.totalCents - q.totalCents / (1 + q.vat.rate / 100))

  const png = await renderBoellerPng(visualStateFrom(catalog, selection), 1400)
  const pdf = await renderConfigurationPdf({
    code,
    productName: config.productName || catalog.product.name,
    createdAt: config.createdAt,
    quote: q,
    showPrices: settings.showPrices !== false,
    settings,
    url: `${SITE_URL}/konfigurator/${code}`,
    illustration: png,
  })
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Schaftboeller-Ebner-${code}.pdf"`,
      'Cache-Control': 'private, max-age=300',
      'X-Robots-Tag': 'noindex',
    },
  })
}
