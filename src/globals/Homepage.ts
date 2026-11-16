import type { Field, GlobalConfig } from 'payload'

import { isLoggedIn } from '@/access'

/** Überschrift mit hervorgehobenem (Kontur-)Teil, z. B. „Unsere“ + „Schaftböller.“ */
export const headingFields = (prefix = ''): Field[] => [
  {
    type: 'row',
    fields: [
      { name: `${prefix}heading`, label: 'Überschrift', type: 'text' },
      { name: `${prefix}headingAccent`, label: 'Überschrift – Akzent (Kontur)', type: 'text' },
    ],
  },
]

const sectionGroup = (name: string, label: string, fields: Field[]): Field => ({
  name,
  label,
  type: 'group',
  fields: [{ name: 'eyebrow', label: 'Kleine Überzeile', type: 'text' }, ...headingFields(), ...fields],
})

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Startseite',
  admin: { group: 'Inhalte' },
  access: { read: isLoggedIn, update: isLoggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            { name: 'eyebrow', label: 'Überzeile', type: 'text' },
            {
              name: 'lines',
              label: 'Headline-Zeilen',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Zeile', plural: 'Zeilen' },
              admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'text', label: 'Text', type: 'text', required: true },
                    { name: 'outline', label: 'Als Kontur-Schrift', type: 'checkbox', defaultValue: false },
                  ],
                },
              ],
            },
            { name: 'lead', label: 'Einleitung', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'primaryLabel', label: 'Button 1 – Text', type: 'text' },
                { name: 'primaryHref', label: 'Button 1 – Link', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'secondaryLabel', label: 'Button 2 – Text', type: 'text' },
                { name: 'secondaryHref', label: 'Button 2 – Link', type: 'text' },
              ],
            },
            { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media' },
            {
              name: 'video',
              label: 'Video (optional, MP4/WebM, stumm, < 3 MB)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Läuft auf größeren Bildschirmen anstelle des Bildes, wenn keine reduzierte Bewegung gewünscht ist.' },
            },
            {
              name: 'facts',
              label: 'Kurzfakten (Leiste unten)',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Fakt', plural: 'Fakten' },
              admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
              fields: [{ name: 'text', label: 'Text', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Laufband',
          fields: [
            {
              name: 'marquee',
              label: 'Wörter im Laufband',
              type: 'array',
              labels: { singular: 'Wort', plural: 'Wörter' },
              admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
              fields: [{ name: 'word', label: 'Wort', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Manufaktur',
          fields: [
            sectionGroup('manufaktur', 'Die Manufaktur', [
              { name: 'intro', label: 'Einleitungssatz', type: 'textarea' },
              { name: 'body', label: 'Text', type: 'richText' },
              { name: 'quote', label: 'Zitat', type: 'textarea' },
              { name: 'images', label: 'Bilder (2)', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 2 },
            ]),
          ],
        },
        {
          label: 'Qualität',
          fields: [
            sectionGroup('quality', 'Qualität', [
              { name: 'lead', label: 'Einleitung', type: 'textarea' },
              {
                name: 'items',
                label: 'Punkte',
                type: 'array',
                maxRows: 4,
                labels: { singular: 'Punkt', plural: 'Punkte' },
                admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
                fields: [
                  { name: 'title', label: 'Titel', type: 'text', required: true },
                  { name: 'text', label: 'Text', type: 'textarea', required: true },
                ],
              },
            ]),
          ],
        },
        {
          label: 'Kontrast',
          fields: [
            {
              name: 'contrast',
              label: 'Kontrast-Statement (Schwarz/Weiß)',
              type: 'group',
              fields: [
                { name: 'lineOne', label: 'Zeile 1', type: 'text' },
                { name: 'lineTwo', label: 'Zeile 2', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'leftLabel', label: 'Links – Überzeile', type: 'text' },
                    { name: 'rightLabel', label: 'Rechts – Überzeile', type: 'text' },
                  ],
                },
                { name: 'leftText', label: 'Links – Text', type: 'textarea' },
                { name: 'rightText', label: 'Rechts – Text', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Produkte & Konfigurator',
          fields: [
            sectionGroup('products', 'Produkte', [{ name: 'lead', label: 'Einleitung', type: 'textarea' }]),
            sectionGroup('configurator', 'Konfigurator-Teaser', [{ name: 'lead', label: 'Einleitung', type: 'textarea' }]),
          ],
        },
        {
          label: 'Unikat & Kontakt',
          fields: [
            sectionGroup('unikat', 'Dein persönliches Unikat', [
              { name: 'text', label: 'Text', type: 'textarea' },
              { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media' },
            ]),
            sectionGroup('contact', 'Kontakt', [{ name: 'lead', label: 'Einleitung', type: 'textarea' }]),
          ],
        },
      ],
    },
  ],
}
