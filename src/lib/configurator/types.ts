/**
 * Datentypen des Konfigurators – unabhängig von Payload, damit dieselbe Logik
 * im Browser (Live-Preis) und am Server (verbindlicher Preis) läuft.
 */

export const STEP_KEYS = ['modell', 'schaft', 'gestaltung', 'zubehoer'] as const
export type StepKey = (typeof STEP_KEYS)[number]

export const STEP_LABELS: Record<StepKey | 'uebersicht', string> = {
  modell: 'Modell',
  schaft: 'Schaft',
  gestaltung: 'Gestaltung',
  zubehoer: 'Zubehör',
  uebersicht: 'Übersicht',
}

/** Visuelle Voreinstellungen für die SVG-Illustration */
export const VISUAL_PRESETS = [
  'none',
  'holz-natur',
  'holz-dunkel',
  'holz-maser',
  'riemen',
  'motiv-rosette',
  'motiv-edelweiss',
  'motiv-eichenlaub',
  'beschuss',
] as const
export type VisualPreset = (typeof VISUAL_PRESETS)[number]

export const ACCESSORY_VISUALS = ['none', 'staender', 'hammer', 'ladestock'] as const
export type AccessoryVisual = (typeof ACCESSORY_VISUALS)[number]

export const ENGRAVING_FONTS = ['antiqua', 'fraktur', 'schreibschrift', 'modern'] as const
export type EngravingFont = (typeof ENGRAVING_FONTS)[number]

export type PreviewLayer = {
  view: string
  url: string
  z: number
}

export type CatalogOption = {
  key: string
  label: string
  description?: string
  /** Aufpreis in Cent (brutto) */
  priceCents: number
  available: boolean
  isDefault: boolean
  visual: VisualPreset
  color?: string
  imageUrl?: string
  layers: PreviewLayer[]
  /** Unverträgliche Optionen im Format "gruppe.option" */
  excludes: string[]
}

export type CatalogFont = { key: string; label: string; font: EngravingFont }

export type CatalogGroup = {
  key: string
  label: string
  step: StepKey
  kind: 'single' | 'multi' | 'text' | 'accessories'
  required: boolean
  help?: string
  options: CatalogOption[]
  text?: {
    priceCents: number
    maxLength: number
    placeholder?: string
    fonts: CatalogFont[]
  }
  /** IDs der wählbaren Zubehör-Produkte (kind = accessories) */
  accessoryIds: string[]
}

export type CatalogAccessory = {
  id: string
  slug: string
  name: string
  description?: string
  priceCents: number
  available: boolean
  visual: AccessoryVisual
  imageUrl?: string
  layers: PreviewLayer[]
}

export type TextArea = { x: number; y: number; width: number; rotate: number }

export type Catalog = {
  product: {
    id: string
    slug: string
    name: string
    basePriceCents: number
    baseLabel: string
    layers: PreviewLayer[]
    textArea?: TextArea
  }
  groups: CatalogGroup[]
  accessories: Record<string, CatalogAccessory>
}

export type TextSelection = { enabled: boolean; text: string; font: string }
export type SelectionValue = string | string[] | TextSelection
export type Selection = Record<string, SelectionValue>

export type QuoteLine = {
  group?: string
  label: string
  detail?: string
  amountCents: number
}

export type VatMode = 'regel' | 'kleinunternehmer'

export type Quote = {
  lines: QuoteLine[]
  totalCents: number
  vat: { mode: VatMode; rate: number; includedCents: number }
}

export type ValidationResult =
  | { ok: true; selection: Selection }
  | { ok: false; errors: string[]; selection: Selection }
