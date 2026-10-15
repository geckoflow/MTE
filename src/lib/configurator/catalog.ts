import type { Media, Product } from '@/payload-types'
import { mediaUrl } from '@/lib/media'

import type {
  AccessoryVisual,
  Catalog,
  CatalogAccessory,
  CatalogGroup,
  CatalogOption,
  EngravingFont,
  PreviewLayer,
  VisualPreset,
} from './types'

export const toCents = (euro: number | null | undefined) => Math.round((Number(euro) || 0) * 100)

type LayerInput = { view: string; image: number | Media; z?: number | null }[]

function layers(input: LayerInput | null | undefined, defaultZ = 10): PreviewLayer[] {
  return (input ?? [])
    .map((l) => ({ view: l.view, url: mediaUrl(l.image, 'large') ?? '', z: l.z ?? defaultZ }))
    .filter((l) => l.url)
}

export function accessoryFromProduct(p: Product): CatalogAccessory {
  return {
    id: String(p.id),
    slug: p.slug ?? String(p.id),
    name: p.name,
    description: p.tagline ?? undefined,
    priceCents: toCents(p.price),
    available: p.available !== false && p.published !== false,
    visual: (p.illustration ?? 'none') as AccessoryVisual,
    imageUrl: mediaUrl(p.images?.[0], 'thumb'),
    layers: layers(p.layers, 20),
  }
}

/** Baut aus einem Payload-Produkt (depth ≥ 2) den Konfigurator-Katalog */
export function buildCatalog(product: Product): Catalog {
  const accessories: Record<string, CatalogAccessory> = {}

  const groups: CatalogGroup[] = (product.optionGroups ?? []).map((g) => {
    const accessoryIds: string[] = []
    if (g.kind === 'accessories') {
      for (const rel of g.accessories ?? []) {
        if (typeof rel !== 'object' || !rel) continue
        const acc = accessoryFromProduct(rel)
        accessories[acc.id] = acc
        accessoryIds.push(acc.id)
      }
    }
    const options: CatalogOption[] =
      g.kind === 'single' || g.kind === 'multi'
        ? (g.options ?? []).map((o) => ({
            key: o.key,
            label: o.label,
            description: o.description ?? undefined,
            priceCents: toCents(o.price),
            available: o.available !== false,
            isDefault: Boolean(o.isDefault),
            visual: (o.visual ?? 'none') as VisualPreset,
            color: o.color ?? undefined,
            imageUrl: mediaUrl(o.image, 'thumb'),
            layers: layers(o.layers),
            excludes: o.excludes ?? [],
          }))
        : []
    return {
      key: g.key,
      label: g.label,
      step: g.step,
      kind: g.kind,
      required: Boolean(g.required),
      help: g.help ?? undefined,
      options,
      text:
        g.kind === 'text'
          ? {
              priceCents: toCents(g.text?.price),
              maxLength: g.text?.maxLength ?? 24,
              placeholder: g.text?.placeholder ?? undefined,
              fonts: (g.text?.fonts ?? []).map((f) => ({ key: f.key, label: f.label, font: f.font as EngravingFont })),
            }
          : undefined,
      accessoryIds,
    }
  })

  return {
    product: {
      id: String(product.id),
      slug: product.slug ?? String(product.id),
      name: product.name,
      basePriceCents: toCents(product.price),
      baseLabel: product.baseLabel || 'Grundpreis',
      layers: layers(product.baseLayers, 0),
      textArea:
        product.baseLayers?.length && product.textArea
          ? {
              x: product.textArea.x ?? 40,
              y: product.textArea.y ?? 42,
              width: product.textArea.width ?? 30,
              rotate: product.textArea.rotate ?? 0,
            }
          : undefined,
    },
    groups,
    accessories,
  }
}
