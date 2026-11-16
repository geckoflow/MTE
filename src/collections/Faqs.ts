import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '@/access'
import { publishedField, sortOrderField } from '@/fields/slug'

export const FAQ_CATEGORIES = [
  { label: 'Allgemein', value: 'allgemein' },
  { label: 'Kauf & Lieferung', value: 'kauf' },
  { label: 'Personalisierung', value: 'personalisierung' },
  { label: 'Pflege', value: 'pflege' },
  { label: 'Recht & Sicherheit', value: 'recht' },
] as const

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'Frage', plural: 'Häufige Fragen' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'showOnHome', 'published'],
    group: 'Inhalte',
  },
  defaultSort: 'sortOrder',
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'question', label: 'Frage', type: 'text', required: true },
    { name: 'answer', label: 'Antwort', type: 'textarea', required: true },
    {
      name: 'category',
      label: 'Kategorie',
      type: 'select',
      defaultValue: 'allgemein',
      options: FAQ_CATEGORIES.map((c) => ({ ...c })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'showOnHome',
      label: 'Auf der Startseite zeigen',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    publishedField,
    sortOrderField,
  ],
}
