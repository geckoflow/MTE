import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn, nobody } from '@/access'

export const INQUIRY_TOPICS = [
  { label: 'Konfiguration', value: 'konfiguration' },
  { label: 'Allgemeine Frage', value: 'allgemein' },
  { label: 'Sonderwunsch', value: 'sonderwunsch' },
  { label: 'Anfrage für einen Verein', value: 'verein' },
  { label: 'Termin in der Werkstatt', value: 'termin' },
] as const

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Anfrage', plural: 'Anfragen' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['createdAt', 'name', 'topic', 'status', 'configuration'],
    group: 'Anfragen',
    listSearchableFields: ['name', 'email', 'organisation'],
  },
  defaultSort: '-createdAt',
  access: {
    read: isLoggedIn,
    create: nobody,
    update: isLoggedIn,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'neu',
          required: true,
          index: true,
          options: [
            { label: 'Neu', value: 'neu' },
            { label: 'In Bearbeitung', value: 'in_bearbeitung' },
            { label: 'Angebot gesendet', value: 'angebot' },
            { label: 'Auftrag erhalten', value: 'gewonnen' },
            { label: 'Abgeschlossen', value: 'abgeschlossen' },
            { label: 'Kein Auftrag', value: 'verloren' },
          ],
        },
        {
          name: 'topic',
          label: 'Anliegen',
          type: 'select',
          required: true,
          defaultValue: 'allgemein',
          options: INQUIRY_TOPICS.map((t) => ({ ...t })),
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true, admin: { readOnly: true } },
        { name: 'email', label: 'E-Mail', type: 'email', required: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', label: 'Telefon', type: 'text', admin: { readOnly: true } },
        { name: 'organisation', label: 'Verein / Organisation', type: 'text', admin: { readOnly: true } },
      ],
    },
    { name: 'message', label: 'Nachricht', type: 'textarea', admin: { readOnly: true } },
    { name: 'configuration', label: 'Konfiguration', type: 'relationship', relationTo: 'configurations', admin: { readOnly: true } },
    { name: 'internalNotes', label: 'Interne Notizen', type: 'textarea' },
    {
      name: 'consentAt',
      label: 'Datenschutz-Hinweis bestätigt am',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'sourcePath', label: 'Gesendet von Seite', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
