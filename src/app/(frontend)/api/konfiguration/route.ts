import { saveConfiguration } from '@/lib/configurator/server'
import { getPayloadClient } from '@/lib/data'
import { clientIp, json, rateLimit, readJson, sameOrigin } from '@/lib/http'

/** Konfiguration speichern (teilen/PDF): POST { product, selection } → { code, url } */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Ungültige Herkunft.' }, 403)
  if (!rateLimit(`konfig:${clientIp(req)}`, 30, 10 * 60_000)) {
    return json({ error: 'Zu viele Anfragen – bitte später erneut versuchen.' }, 429)
  }
  let body: { product?: string; selection?: unknown }
  try {
    body = (await readJson(req)) as typeof body
  } catch {
    return json({ error: 'Ungültige Anfrage.' }, 400)
  }
  const payload = await getPayloadClient()
  const result = await saveConfiguration(payload, typeof body.product === 'string' ? body.product : undefined, body.selection)
  if (!result.ok) return json({ error: result.errors.join(' '), errors: result.errors }, result.status)
  const { code } = result.saved
  return json({ code, url: `/konfigurator/${code}`, pdfUrl: `/konfigurator/${code}/pdf` }, 201)
}
