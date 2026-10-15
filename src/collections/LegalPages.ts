import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '@/access'
import { publishedField, slugField } from '@/fields/slug'

/** Rechtstexte: Impressum, Datenschutz, später AGB/Widerruf (Phase 2) */
export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  labels: { singular: 'Rechtstext', plural: 'Rechtstexte' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt', 'published'],
    group: 'Inhalte',
    description: 'Erreichbar unter /<URL-Kürzel>, z. B. /impressum. Inhalte vor dem Go-live rechtlich prüfen lassen.',
  },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    { name: 'content', label: 'Inhalt', type: 'richText', required: true },
    {
      name: 'showInFooter',
      label: 'Im Footer verlinken',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    slugField('title'),
    publishedField,
  ],
}
