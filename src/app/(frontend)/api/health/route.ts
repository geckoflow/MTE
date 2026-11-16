import { getPayloadClient } from '@/lib/data'

/** Health-Check für Docker/Monitoring: prüft, ob CMS und Datenbank antworten */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'products' })
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    // Ohne diese Zeile zeigt ein fehlgeschlagener Deploy nur „unhealthy“, aber nicht den Grund
    console.error('Health-Check fehlgeschlagen:', err instanceof Error ? err.message : err)
    return Response.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
