import type { Field, FieldHook } from 'payload'

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const source = data?.[fallback] ?? originalDoc?.[fallback]
    return typeof source === 'string' ? slugify(source) : value
  }

export const slugField = (fallback = 'title'): Field => ({
  name: 'slug',
  label: 'URL-Kürzel',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Wird automatisch aus dem Namen erzeugt. Nur Kleinbuchstaben, Ziffern und Bindestriche.',
  },
  hooks: { beforeValidate: [formatSlug(fallback)] },
})

export const publishedField: Field = {
  name: 'published',
  label: 'Auf Website anzeigen',
  type: 'checkbox',
  defaultValue: true,
  index: true,
  admin: { position: 'sidebar' },
}

export const sortOrderField: Field = {
  name: 'sortOrder',
  label: 'Reihenfolge',
  type: 'number',
  defaultValue: 100,
  admin: { position: 'sidebar', description: 'Kleinere Zahlen werden zuerst angezeigt.' },
}
