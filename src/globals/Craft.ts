import type { GlobalConfig } from 'payload'

import { isLoggedIn } from '@/access'
import { headingFields } from './Homepage'

export const Craft: GlobalConfig = {
  slug: 'craft',
  label: 'Handwerk & Tradition',
  admin: { group: 'Inhalte' },
  access: { read: isLoggedIn, update: isLoggedIn },
  fields: [
    { name: 'eyebrow', label: 'Überzeile', type: 'text' },
    ...headingFields(),
    { name: 'lead', label: 'Einleitung', type: 'textarea' },
    {
      name: 'steps',
      label: 'Schritte „Vom Baum zum Böller“',
      type: 'array',
      labels: { singular: 'Schritt', plural: 'Schritte' },
      admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
      fields: [
        { name: 'title', label: 'Titel', type: 'text', required: true },
        { name: 'text', label: 'Text', type: 'textarea', required: true },
        { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'story',
      label: 'Geschichte & Tradition',
      type: 'group',
      fields: [
        ...headingFields(),
        { name: 'body', label: 'Text', type: 'richText' },
        { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'materials',
      label: 'Materialien',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Material', plural: 'Materialien' },
      admin: { components: { RowLabel: '/components/admin/RowLabel#RowLabel' } },
      fields: [
        { name: 'title', label: 'Titel', type: 'text', required: true },
        { name: 'text', label: 'Text', type: 'textarea', required: true },
        { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
