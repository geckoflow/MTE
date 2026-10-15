import { createHash } from 'node:crypto'

import { canonicalSelection } from './engine'
import type { Selection } from './types'

/** Crockford-Base32 ohne verwechselbare Zeichen (I, L, O, U) */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export const CODE_PATTERN = /^SE-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/

/**
 * Deterministischer Konfigurations-Code: gleiche Auswahl + gleicher Preis ⇒ gleicher Code.
 * Ändert sich der Preis, entsteht ein neuer Code (alte Angebote bleiben unverändert).
 */
export function configurationCode(productId: string, selection: Selection, totalCents: number): string {
  const digest = createHash('sha256')
    .update(`${productId}|${canonicalSelection(selection)}|${totalCents}`)
    .digest()
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of digest) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5 && out.length < 8) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
    if (out.length >= 8) break
  }
  return `SE-${out.slice(0, 4)}-${out.slice(4, 8)}`
}

export function normalizeCode(raw: string): string | null {
  const code = raw.trim().toUpperCase()
  return CODE_PATTERN.test(code) ? code : null
}
