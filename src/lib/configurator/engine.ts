import type {
  Catalog,
  CatalogGroup,
  CatalogOption,
  Quote,
  QuoteLine,
  Selection,
  TextSelection,
  ValidationResult,
  VatMode,
} from './types'

/** Erlaubte Zeichen für Beschriftungen: Buchstaben (inkl. Umlaute), Ziffern, gängige Satzzeichen */
const TEXT_ALLOWED = /^[\p{L}\p{N} .,'’&\-/()!?:+#]*$/u

export function sanitizeEngraving(raw: unknown, maxLength: number): string {
  if (typeof raw !== 'string') return ''
  return raw
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export const ENGRAVING_HINT = 'Erlaubt sind Buchstaben, Ziffern, Leerzeichen und . , \' & - / ( ) ! ? : + #'

export function isEngravingAllowed(text: string): boolean {
  return TEXT_ALLOWED.test(text)
}

const isAvailable = (o: CatalogOption) => o.available

export function defaultOption(group: CatalogGroup): CatalogOption | undefined {
  const available = group.options.filter(isAvailable)
  return available.find((o) => o.isDefault) ?? available[0]
}

/** Startauswahl: Standardoptionen, nichts Zusätzliches gewählt */
export function defaultSelection(catalog: Catalog): Selection {
  const selection: Selection = {}
  for (const group of catalog.groups) {
    switch (group.kind) {
      case 'single': {
        const option = defaultOption(group)
        if (option) selection[group.key] = option.key
        break
      }
      case 'multi':
      case 'accessories':
        selection[group.key] = []
        break
      case 'text':
        selection[group.key] = {
          enabled: false,
          text: '',
          font: group.text?.fonts[0]?.key ?? '',
        }
        break
    }
  }
  return selection
}

const asStringArray = (value: unknown): string[] | null =>
  Array.isArray(value) && value.every((v) => typeof v === 'string') ? [...new Set(value)] : null

/**
 * Prüft eine (nicht vertrauenswürdige) Auswahl gegen den Katalog.
 * Fehlende Werte werden mit Standardwerten ergänzt, ungültige Werte führen zu Fehlern.
 * `selection` enthält immer eine bereinigte, verwendbare Auswahl.
 */
export function validateSelection(catalog: Catalog, raw: unknown): ValidationResult {
  const errors: string[] = []
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  if (raw !== undefined && raw !== null && input !== raw) errors.push('Ungültiges Format der Auswahl.')

  const selection = defaultSelection(catalog)

  for (const group of catalog.groups) {
    const value = input[group.key]
    if (value === undefined || value === null) {
      if (group.kind === 'single' && group.required && !selection[group.key]) {
        errors.push(`„${group.label}“: keine Option verfügbar.`)
      }
      continue
    }

    switch (group.kind) {
      case 'single': {
        const option = typeof value === 'string' ? group.options.find((o) => o.key === value) : undefined
        if (!option) errors.push(`„${group.label}“: unbekannte Option.`)
        else if (!option.available) errors.push(`„${group.label}: ${option.label}“ ist derzeit nicht verfügbar.`)
        else selection[group.key] = option.key
        break
      }
      case 'multi': {
        const keys = asStringArray(value)
        if (!keys) {
          errors.push(`„${group.label}“: ungültige Auswahl.`)
          break
        }
        const valid: string[] = []
        for (const key of keys) {
          const option = group.options.find((o) => o.key === key)
          if (!option) errors.push(`„${group.label}“: unbekannte Option.`)
          else if (!option.available) errors.push(`„${group.label}: ${option.label}“ ist derzeit nicht verfügbar.`)
          else valid.push(key)
        }
        // Reihenfolge wie im Katalog, damit gleiche Auswahl gleiche Codes ergibt
        selection[group.key] = group.options.map((o) => o.key).filter((k) => valid.includes(k))
        break
      }
      case 'accessories': {
        const ids = asStringArray(value)
        if (!ids) {
          errors.push(`„${group.label}“: ungültige Auswahl.`)
          break
        }
        const valid: string[] = []
        for (const id of ids) {
          const accessory = catalog.accessories[id]
          if (!accessory || !group.accessoryIds.includes(id)) errors.push(`„${group.label}“: unbekanntes Zubehör.`)
          else if (!accessory.available) errors.push(`„${accessory.name}“ ist derzeit nicht verfügbar.`)
          else valid.push(id)
        }
        selection[group.key] = group.accessoryIds.filter((id) => valid.includes(id))
        break
      }
      case 'text': {
        const settings = group.text
        const v = value as Partial<TextSelection>
        if (!settings || typeof v !== 'object' || Array.isArray(v)) {
          errors.push(`„${group.label}“: ungültige Eingabe.`)
          break
        }
        const font = settings.fonts.find((f) => f.key === v.font) ?? settings.fonts[0]
        // Ausgeschaltete Beschriftung: Text verwerfen, nichts prüfen
        if (!v.enabled) {
          selection[group.key] = { enabled: false, text: '', font: font?.key ?? '' }
          break
        }
        const text = sanitizeEngraving(v.text, settings.maxLength)
        if (typeof v.text === 'string' && v.text.trim().length > settings.maxLength) {
          errors.push(`„${group.label}“: höchstens ${settings.maxLength} Zeichen.`)
        }
        if (!isEngravingAllowed(text)) {
          errors.push(`„${group.label}“: ${ENGRAVING_HINT}`)
          break
        }
        if (v.font !== undefined && font?.key !== v.font) errors.push(`„${group.label}“: unbekannte Schriftart.`)
        selection[group.key] = { enabled: text.length > 0, text, font: font?.key ?? '' }
        break
      }
    }
  }

  // Unverträglichkeiten prüfen ("gruppe.option")
  const chosen = new Set<string>()
  for (const group of catalog.groups) {
    const value = selection[group.key]
    if (group.kind === 'single' && typeof value === 'string') chosen.add(`${group.key}.${value}`)
    if (group.kind === 'multi' && Array.isArray(value)) value.forEach((k) => chosen.add(`${group.key}.${k}`))
  }
  for (const group of catalog.groups) {
    for (const option of group.options) {
      const id = `${group.key}.${option.key}`
      if (!chosen.has(id)) continue
      for (const excluded of option.excludes) {
        if (chosen.has(excluded)) {
          const [gKey, oKey] = excluded.split('.')
          const other = catalog.groups.find((g) => g.key === gKey)?.options.find((o) => o.key === oKey)
          errors.push(`„${option.label}“ lässt sich nicht mit „${other?.label ?? excluded}“ kombinieren.`)
        }
      }
    }
  }

  return errors.length ? { ok: false, errors: [...new Set(errors)], selection } : { ok: true, selection }
}

/** Optionen, die durch die aktuelle Auswahl ausgeschlossen sind ("gruppe.option") */
export function blockedOptions(catalog: Catalog, selection: Selection): Set<string> {
  const blocked = new Set<string>()
  const chosen: string[] = []
  for (const group of catalog.groups) {
    const value = selection[group.key]
    if (group.kind === 'single' && typeof value === 'string') chosen.push(`${group.key}.${value}`)
    if (group.kind === 'multi' && Array.isArray(value)) value.forEach((k) => chosen.push(`${group.key}.${k}`))
  }
  for (const group of catalog.groups) {
    for (const option of group.options) {
      const id = `${group.key}.${option.key}`
      for (const excluded of option.excludes) {
        if (chosen.includes(id)) blocked.add(excluded)
        if (chosen.includes(excluded)) blocked.add(id)
      }
    }
  }
  for (const id of chosen) blocked.delete(id)
  return blocked
}

export function vatIncluded(totalCents: number, mode: VatMode, rate: number): number {
  if (mode !== 'regel' || rate <= 0) return 0
  return Math.round(totalCents - totalCents / (1 + rate / 100))
}

/** Preisberechnung – Bruttopreise in Cent. Erwartet eine validierte Auswahl. */
export function quote(
  catalog: Catalog,
  selection: Selection,
  vat: { mode: VatMode; rate: number } = { mode: 'regel', rate: 20 },
): Quote {
  const lines: QuoteLine[] = [
    { label: catalog.product.name, detail: catalog.product.baseLabel, amountCents: catalog.product.basePriceCents },
  ]

  for (const group of catalog.groups) {
    const value = selection[group.key]
    switch (group.kind) {
      case 'single': {
        const option = group.options.find((o) => o.key === value)
        if (option) lines.push({ group: group.key, label: `${group.label}: ${option.label}`, amountCents: option.priceCents })
        break
      }
      case 'multi': {
        if (!Array.isArray(value)) break
        for (const key of value) {
          const option = group.options.find((o) => o.key === key)
          if (option) lines.push({ group: group.key, label: `${group.label}: ${option.label}`, amountCents: option.priceCents })
        }
        break
      }
      case 'accessories': {
        if (!Array.isArray(value)) break
        for (const id of value) {
          const accessory = catalog.accessories[id]
          if (accessory) lines.push({ group: group.key, label: accessory.name, amountCents: accessory.priceCents })
        }
        break
      }
      case 'text': {
        const v = value as TextSelection | undefined
        if (v?.enabled && v.text && group.text) {
          const font = group.text.fonts.find((f) => f.key === v.font)
          lines.push({
            group: group.key,
            label: group.label,
            detail: `„${v.text}“${font ? ` · ${font.label}` : ''}`,
            amountCents: group.text.priceCents,
          })
        }
        break
      }
    }
  }

  const totalCents = lines.reduce((sum, line) => sum + line.amountCents, 0)
  return { lines, totalCents, vat: { mode: vat.mode, rate: vat.rate, includedCents: vatIncluded(totalCents, vat.mode, vat.rate) } }
}

/* ---------- Auswahl ⇄ URL (base64url-JSON, isomorph) ---------- */

export function encodeSelection(selection: Selection): string {
  const bytes = new TextEncoder().encode(JSON.stringify(selection))
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeSelection(encoded: string | null | undefined): unknown {
  if (!encoded || encoded.length > 4000) return undefined
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return undefined
  }
}

/** Kanonische Form für Hash/Vergleich: Schlüssel sortiert */
export function canonicalSelection(selection: Selection): string {
  const sorted: Selection = {}
  for (const key of Object.keys(selection).sort()) sorted[key] = selection[key]
  return JSON.stringify(sorted)
}

export const formatEuro = (cents: number) =>
  new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
