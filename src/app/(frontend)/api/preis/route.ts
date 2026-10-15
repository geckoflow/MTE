import { quote, validateSelection } from '@/lib/configurator/engine'
import { loadConfigurable, vatOf } from '@/lib/configurator/server'
import { getPayloadClient } from '@/lib/data'
import { clientIp, json, rateLimit, readJson } from '@/lib/http'

/** Verbindliche Preisberechnung: POST { product, selection } */
export async function POST(req: Request) {
  if (!rateLimit(`preis:${clientIp(req)}`, 120, 60_000)) return json({ error: 'Zu viele Anfragen.' }, 429)
  let body: { product?: string; selection?: unknown }
  try {
    body = (await readJson(req)) as typeof body
  } catch {
    return json({ error: 'Ungültige Anfrage.' }, 400)
  }
  const payload = await getPayloadClient()
  const loaded = await loadConfigurable(payload, typeof body.product === 'string' ? body.product : undefined)
  if (!loaded) return json({ error: 'Produkt nicht gefunden.' }, 404)
  const result = validateSelection(loaded.catalog, body.selection)
  const settings = await payload.findGlobal({ slug: 'settings' })
  const q = quote(loaded.catalog, result.selection, vatOf(settings))
  return json({
    ok: result.ok,
    errors: result.ok ? [] : result.errors,
    selection: result.selection,
    quote: settings.showPrices === false ? { ...q, lines: q.lines.map((l) => ({ ...l, amountCents: 0 })), totalCents: 0 } : q,
  })
}
