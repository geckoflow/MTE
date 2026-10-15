import type { Catalog } from '@/lib/configurator/types'

/** Katalog wie im Seed (Beispielpreise) */
export const catalog: Catalog = {
  product: { id: '1', slug: 'klassik-20', name: 'Schaftböller Klassik', basePriceCents: 249000, baseLabel: 'Grundpreis', layers: [] },
  accessories: {
    '10': { id: '10', slug: 'hammer', name: 'Hammer', priceCents: 4500, available: true, visual: 'hammer', layers: [] },
    '11': { id: '11', slug: 'standhalterung', name: 'Standhalterung', priceCents: 15000, available: true, visual: 'staender', layers: [] },
    '12': { id: '12', slug: 'koffer', name: 'Koffer', priceCents: 49000, available: false, visual: 'none', layers: [] },
  },
  groups: [
    {
      key: 'beschuss',
      label: 'Beschuss',
      step: 'modell',
      kind: 'single',
      required: true,
      accessoryIds: [],
      options: [
        { key: 'at', label: 'Österreich', priceCents: 0, available: true, isDefault: true, visual: 'beschuss', layers: [], excludes: [] },
        { key: 'de', label: 'Deutschland', priceCents: 5000, available: true, isDefault: false, visual: 'beschuss', layers: [], excludes: [] },
      ],
    },
    {
      key: 'holz',
      label: 'Nussholz',
      step: 'schaft',
      kind: 'single',
      required: true,
      accessoryIds: [],
      options: [
        { key: 'natur', label: 'Nuss natur', priceCents: 0, available: true, isDefault: false, visual: 'holz-natur', layers: [], excludes: [] },
        { key: 'maser', label: 'Ausgesuchte Maserung', priceCents: 15000, available: true, isDefault: false, visual: 'holz-maser', layers: [], excludes: [] },
        { key: 'alt', label: 'Altholz', priceCents: 0, available: false, isDefault: false, visual: 'holz-dunkel', layers: [], excludes: [] },
      ],
    },
    {
      key: 'beschriftung',
      label: 'Namensbeschriftung',
      step: 'gestaltung',
      kind: 'text',
      required: false,
      accessoryIds: [],
      options: [],
      text: {
        priceCents: 6000,
        maxLength: 24,
        fonts: [
          { key: 'antiqua', label: 'Antiqua', font: 'antiqua' },
          { key: 'fraktur', label: 'Fraktur', font: 'fraktur' },
        ],
      },
    },
    {
      key: 'motive',
      label: 'Kerbschnitzerei',
      step: 'gestaltung',
      kind: 'multi',
      required: false,
      accessoryIds: [],
      options: [
        { key: 'rosette', label: 'Rosette', priceCents: 12000, available: true, isDefault: false, visual: 'motiv-rosette', layers: [], excludes: ['holz.maser'] },
        { key: 'edelweiss', label: 'Edelweiß', priceCents: 18000, available: true, isDefault: false, visual: 'motiv-edelweiss', layers: [], excludes: [] },
      ],
    },
    {
      key: 'zubehoer',
      label: 'Zubehör',
      step: 'zubehoer',
      kind: 'accessories',
      required: false,
      options: [],
      accessoryIds: ['10', '11', '12'],
    },
  ],
}
