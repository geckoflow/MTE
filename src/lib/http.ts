import 'server-only'

/** Einfaches In-Memory-Rate-Limit (ausreichend für eine Instanz) */
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k)
  }
  return true
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return (forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unbekannt').trim()
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

/** Liest einen JSON-Body mit Größenlimit */
export async function readJson(req: Request, maxBytes = 20_000): Promise<unknown> {
  const text = await req.text()
  if (text.length > maxBytes) throw new Error('too_large')
  return JSON.parse(text)
}

/** Nur Anfragen von der eigenen Website annehmen (Schutz vor Cross-Site-Formularen) */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
