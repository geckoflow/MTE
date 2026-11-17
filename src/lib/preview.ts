/**
 * Vorschau-Schutz bis zum Go-live: Die ganze Website verlangt ein Passwort (HTTP Basic Auth) und ist für
 * Suchmaschinen gesperrt. In Produktion ist er ohne weitere Einstellung aktiv; SITE_PUBLIC=true schaltet ihn ab.
 * Ohne Node-Abhängigkeiten, weil src/proxy.ts und die Seiten-Metadaten ihn gemeinsam nutzen.
 */
export const DEFAULT_PREVIEW_PASSWORD = 'Schaftboeller-Vorschau'

type Env = Partial<Record<'NODE_ENV' | 'SITE_PUBLIC' | 'SITE_PASSWORD', string>>

/** Passwort für den Vorschau-Schutz oder null, wenn die Website öffentlich ist (lokale Entwicklung immer offen) */
export function previewPassword(env: Env = process.env): string | null {
  if (env.SITE_PUBLIC === 'true') return null
  if (env.SITE_PASSWORD) return env.SITE_PASSWORD
  return env.NODE_ENV === 'production' ? DEFAULT_PREVIEW_PASSWORD : null
}

/** Prüft den Authorization-Header; der Benutzername ist beliebig, nur das Passwort zählt */
export function hasPreviewAccess(authorization: string | null | undefined, password: string): boolean {
  const match = authorization?.match(/^Basic\s+([A-Za-z0-9+/=]+)\s*$/i)
  if (!match) return false
  let decoded: string
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0)))
  } catch {
    return false
  }
  const separator = decoded.indexOf(':')
  return separator >= 0 && constantTimeEqual(decoded.slice(separator + 1), password)
}

function constantTimeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a)
  const y = new TextEncoder().encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}
