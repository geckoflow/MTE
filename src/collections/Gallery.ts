import type { CollectionConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { publishedField, sortOrderField } from '@/fields/slug'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: { singular: 'Unikat', plural: 'Galerie' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'published'],
    group: 'Inhalte',
    description: 'Fertige Unikate für die Galerie-Seite.',
  },
  defaultSort: 'sortOrder',
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media', required: true },
    { name: 'description', label: 'Beschreibung', type: 'textarea' },
    { name: 'year', label: 'Jahr', type: 'number', admin: { position: 'sidebar' } },
    publishedField,
    sortOrderField,
  ],
}
