import 'server-only'

import { SERVER_URL } from './env'

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

/**
 * Client-IP hinter Reverse-Proxys: der vom vertrauenswürdigen Proxy angehängte (rechte) Eintrag
 * von X-Forwarded-For. TRUSTED_PROXY_HOPS = Anzahl der Proxys vor der App (Standard 1, z. B. Caddy).
 */
export function clientIp(req: Request | Headers): string {
  const h = req instanceof Headers ? req : req.headers
  const parts = (h.get('x-forwarded-for') ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS || 1))
  return parts[Math.max(0, parts.length - hops)] || h.get('x-real-ip') || 'unbekannt'
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

/** Liest einen JSON-Body und bricht ab, sobald er größer als `maxBytes` wird */
export async function readJson(req: Request, maxBytes = 20_000): Promise<unknown> {
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared > maxBytes) throw new Error('too_large')
  if (!req.body) throw new Error('empty')
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      throw new Error('too_large')
    }
    chunks.push(value)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/**
 * Nur Anfragen von der eigenen Website annehmen (Schutz vor Cross-Site-Formularen).
 * Verglichen wird mit der öffentlichen Adresse (SERVER_URL) – unabhängig davon, welchen
 * Host-Header ein vorgeschalteter Proxy weiterreicht.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return false
  }
  const allowed = new Set<string>()
  try {
    const site = new URL(SERVER_URL)
    allowed.add(site.host)
    if (site.host.startsWith('www.')) allowed.add(site.host.slice(4))
    else allowed.add(`www.${site.host}`)
  } catch {}
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (host) allowed.add(host)
  return allowed.has(originHost)
}
