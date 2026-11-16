import path from 'path'
import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '@/access'

export const MEDIA_DIR = path.resolve(process.env.MEDIA_DIR || path.join(process.cwd(), 'media'))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Bild', plural: 'Medien' },
  admin: {
    group: 'Inhalte',
    defaultColumns: ['filename', 'alt', 'placeholder', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'alt',
      label: 'Alternativtext',
      type: 'text',
      required: true,
      admin: { description: 'Kurze Bildbeschreibung für Screenreader und Suchmaschinen.' },
    },
    { name: 'caption', label: 'Bildunterschrift', type: 'text' },
    { name: 'credit', label: 'Fotograf:in / Quelle', type: 'text' },
    {
      name: 'placeholder',
      label: 'Platzhalterbild',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Markiert Bilder, die vor dem Go-live durch eigene Fotos ersetzt werden müssen.',
      },
    },
  ],
  upload: {
    staticDir: MEDIA_DIR,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'video/mp4', 'video/webm'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'large', width: 1920, formatOptions: { format: 'webp', options: { quality: 80 } } },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 82 } },
      },
    ],
    adminThumbnail: 'thumb',
  },
}
