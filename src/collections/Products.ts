import type { CollectionConfig, Field } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { publishedField, slugField, sortOrderField } from '@/fields/slug'
import { ACCESSORY_VISUALS, ENGRAVING_FONTS, STEP_KEYS, STEP_LABELS, VISUAL_PRESETS } from '@/lib/configurator/types'

const KEY_PATTERN = /^[a-z0-9-]+$/

const keyField = (label: string): Field => ({
  name: 'key',
  label,
  type: 'text',
  required: true,
  admin: {
    description: 'Technischer Schlüssel (Kleinbuchstaben, Ziffern, Bindestriche). Nach dem Go-live nicht mehr ändern – gespeicherte Konfigurationen verweisen darauf.',
  },
  validate: (value: unknown) =>
    typeof value === 'string' && KEY_PATTERN.test(value) ? true : 'Nur Kleinbuchstaben, Ziffern und Bindestriche.',
})

const priceField = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'number',
  min: 0,
  defaultValue: 0,
  required: true,
  admin: { step: 1, description: description ?? 'Bruttopreis in Euro (inkl. USt.).' },
})

const layersField = (description: string): Field => ({
  name: 'layers',
  label: 'Foto-Ebenen',
  type: 'array',
  admin: { description, initCollapsed: true },
  labels: { singular: 'Ebene', plural: 'Ebenen' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'view',
          label: 'Ansicht',
          type: 'select',
          defaultValue: 'seite',
          required: true,
          options: [
            { label: 'Seitenansicht', value: 'seite' },
            { label: 'Detail', value: 'detail' },
          ],
        },
        { name: 'z', label: 'Ebene (z)', type: 'number', defaultValue: 10, admin: { description: 'Höhere Zahl liegt weiter oben.' } },
      ],
    },
    {
      name: 'image',
      label: 'Bild (freigestellt, transparenter Hintergrund)',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
})

const optionFields: Field[] = [
  {
    type: 'row',
    fields: [keyField('Schlüssel'), { name: 'label', label: 'Bezeichnung', type: 'text', required: true }],
  },
  { name: 'description', label: 'Kurzbeschreibung', type: 'text' },
  {
    type: 'row',
    fields: [
      priceField('price', 'Aufpreis (€)', 'Bruttoaufpreis in Euro. 0 = inklusive.'),
      { name: 'available', label: 'Verfügbar', type: 'checkbox', defaultValue: true },
      { name: 'isDefault', label: 'Standardauswahl', type: 'checkbox', defaultValue: false },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'visual',
        label: 'Darstellung in der Illustration',
        type: 'select',
        defaultValue: 'none',
        options: VISUAL_PRESETS.map((v) => ({ label: v, value: v })),
        admin: { description: 'Wirkt nur, solange keine Foto-Ebenen hinterlegt sind.' },
      },
      {
        name: 'color',
        label: 'Farbe (Hex)',
        type: 'text',
        admin: { description: 'z. B. #8c1d22 – für Riemen-Farben.', condition: (_, sibling) => sibling?.visual === 'riemen' },
        validate: (value: unknown) =>
          !value || (typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value)) ? true : 'Bitte Hex-Farbe angeben, z. B. #8c1d22',
      },
    ],
  },
  { name: 'image', label: 'Vorschaubild für die Auswahl-Kachel', type: 'upload', relationTo: 'media' },
  layersField('Freigestellte Fotos, die bei dieser Option über das Grundbild gelegt werden.'),
  {
    name: 'excludes',
    label: 'Nicht kombinierbar mit',
    type: 'text',
    hasMany: true,
    admin: { description: 'Format „gruppe.option“, z. B. „schnitzerei.rosette“.' },
  },
]

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produkte' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'price', 'available', 'published'],
    group: 'Produkte',
    listSearchableFields: ['name', 'slug'],
  },
  defaultSort: 'sortOrder',
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Allgemein',
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            {
              name: 'type',
              label: 'Art',
              type: 'select',
              required: true,
              defaultValue: 'zubehoer',
              index: true,
              options: [
                { label: 'Schaftböller', value: 'schaftboeller' },
                { label: 'Zubehör', value: 'zubehoer' },
                { label: 'Personalisierung', value: 'personalisierung' },
              ],
            },
            { name: 'tagline', label: 'Kurzbeschreibung', type: 'textarea', admin: { description: 'Ein bis zwei Sätze für Karten und Vorschauen.' } },
            { name: 'description', label: 'Beschreibung', type: 'richText' },
            {
              type: 'row',
              fields: [
                priceField('price', 'Preis (€)'),
                { name: 'priceFrom', label: '„ab“-Preis', type: 'checkbox', defaultValue: false },
                { name: 'priceNote', label: 'Preiszusatz', type: 'text', admin: { description: 'z. B. „pro Fläche“, „inklusive beim Schaftböller“' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'available', label: 'Lieferbar', type: 'checkbox', defaultValue: true },
                { name: 'featured', label: 'Auf Startseite hervorheben', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
        {
          label: 'Bilder & Details',
          fields: [
            { name: 'images', label: 'Bilder', type: 'upload', relationTo: 'media', hasMany: true },
            {
              name: 'specs',
              label: 'Technische Daten',
              type: 'array',
              labels: { singular: 'Eigenschaft', plural: 'Eigenschaften' },
              admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Bezeichnung', type: 'text', required: true },
                    { name: 'value', label: 'Wert', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'included',
              label: 'Im Preis enthalten',
              type: 'array',
              labels: { singular: 'Position', plural: 'Positionen' },
              admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
              fields: [{ name: 'item', label: 'Position', type: 'text', required: true }],
            },
            { name: 'leadTime', label: 'Lieferzeit', type: 'text', admin: { description: 'z. B. „ca. 8 Wochen“ oder „nach Vereinbarung“' } },
            {
              name: 'illustration',
              label: 'Darstellung im Konfigurator',
              type: 'select',
              defaultValue: 'none',
              options: ACCESSORY_VISUALS.map((v) => ({ label: v, value: v })),
              admin: {
                condition: (data) => data?.type === 'zubehoer',
                description: 'Zeigt das Zubehör in der Konfigurator-Illustration (z. B. Ständer).',
              },
            },
            layersField('Foto-Ebene(n) dieses Zubehörs für die Konfigurator-Vorschau.'),
          ],
        },
        {
          label: 'Konfigurator',
          description: 'Nur für Schaftböller: Optionen, Preise und Vorschau des Konfigurators.',
          fields: [
            {
              name: 'configurable',
              label: 'Im Konfigurator anbieten',
              type: 'checkbox',
              defaultValue: false,
              admin: { condition: (data) => data?.type === 'schaftboeller' },
            },
            {
              name: 'baseLabel',
              label: 'Bezeichnung des Grundpreises',
              type: 'text',
              defaultValue: 'Grundpreis',
              admin: { condition: (data) => Boolean(data?.configurable) },
            },
            {
              name: 'baseLayers',
              label: 'Grundbild(er) für die Foto-Vorschau',
              type: 'array',
              labels: { singular: 'Grundbild', plural: 'Grundbilder' },
              admin: {
                condition: (data) => Boolean(data?.configurable),
                description: 'Ohne Grundbild zeigt der Konfigurator die stilisierte Illustration.',
              },
              fields: [
                {
                  name: 'view',
                  label: 'Ansicht',
                  type: 'select',
                  defaultValue: 'seite',
                  required: true,
                  options: [
                    { label: 'Seitenansicht', value: 'seite' },
                    { label: 'Detail', value: 'detail' },
                  ],
                },
                { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media', required: true },
              ],
            },
            {
              name: 'textArea',
              label: 'Position der Beschriftung auf dem Foto',
              type: 'group',
              admin: {
                condition: (data) => Boolean(data?.configurable) && (data?.baseLayers?.length ?? 0) > 0,
                description: 'Angaben in Prozent der Bildbreite/-höhe (Mittelpunkt des Textes).',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'x', label: 'X (%)', type: 'number', defaultValue: 40 },
                    { name: 'y', label: 'Y (%)', type: 'number', defaultValue: 42 },
                    { name: 'width', label: 'Breite (%)', type: 'number', defaultValue: 30 },
                    { name: 'rotate', label: 'Drehung (°)', type: 'number', defaultValue: 0 },
                  ],
                },
              ],
            },
            {
              name: 'optionGroups',
              label: 'Optionsgruppen',
              type: 'array',
              labels: { singular: 'Optionsgruppe', plural: 'Optionsgruppen' },
              admin: { condition: (data) => Boolean(data?.configurable), initCollapsed: true, components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    keyField('Schlüssel'),
                    { name: 'label', label: 'Bezeichnung', type: 'text', required: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'step',
                      label: 'Schritt',
                      type: 'select',
                      required: true,
                      defaultValue: 'schaft',
                      options: STEP_KEYS.map((s) => ({ label: STEP_LABELS[s], value: s })),
                    },
                    {
                      name: 'kind',
                      label: 'Art',
                      type: 'select',
                      required: true,
                      defaultValue: 'single',
                      options: [
                        { label: 'Einfachauswahl', value: 'single' },
                        { label: 'Mehrfachauswahl', value: 'multi' },
                        { label: 'Texteingabe (Beschriftung)', value: 'text' },
                        { label: 'Zubehör-Produkte', value: 'accessories' },
                      ],
                    },
                    { name: 'required', label: 'Pflicht', type: 'checkbox', defaultValue: false },
                  ],
                },
                { name: 'help', label: 'Hinweistext', type: 'textarea' },
                {
                  name: 'options',
                  label: 'Optionen',
                  type: 'array',
                  labels: { singular: 'Option', plural: 'Optionen' },
                  admin: {
                    initCollapsed: true,
                    condition: (_, sibling) => sibling?.kind === 'single' || sibling?.kind === 'multi',
                    components: { RowLabel: '/components/admin/RowLabel#RowLabel' },
                  },
                  fields: optionFields,
                },
                {
                  name: 'text',
                  label: 'Einstellungen Beschriftung',
                  type: 'group',
                  admin: { condition: (_, sibling) => sibling?.kind === 'text' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        priceField('price', 'Preis (€)'),
                        { name: 'maxLength', label: 'Max. Zeichen', type: 'number', defaultValue: 24, min: 1, max: 60 },
                        { name: 'placeholder', label: 'Beispieltext', type: 'text' },
                      ],
                    },
                    {
                      name: 'fonts',
                      label: 'Schriftarten',
                      type: 'array',
                      labels: { singular: 'Schriftart', plural: 'Schriftarten' },
                      admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
                      fields: [
                        {
                          type: 'row',
                          fields: [
                            keyField('Schlüssel'),
                            { name: 'label', label: 'Bezeichnung', type: 'text', required: true },
                            {
                              name: 'font',
                              label: 'Schrift',
                              type: 'select',
                              required: true,
                              defaultValue: 'antiqua',
                              options: ENGRAVING_FONTS.map((f) => ({ label: f, value: f })),
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'accessories',
                  label: 'Wählbares Zubehör',
                  type: 'relationship',
                  relationTo: 'products',
                  hasMany: true,
                  filterOptions: { type: { equals: 'zubehoer' } },
                  admin: { condition: (_, sibling) => sibling?.kind === 'accessories' },
                },
              ],
            },
          ],
        },
      ],
    },
    slugField('name'),
    publishedField,
    sortOrderField,
  ],
}
