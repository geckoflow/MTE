import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn, nobody } from '@/access'

/**
 * Gespeicherte Konfigurationen (teilbarer Link, PDF, Anfrage).
 * Werden ausschließlich serverseitig über /api/konfiguration und /api/anfrage angelegt.
 */
export const Configurations: CollectionConfig = {
  slug: 'configurations',
  labels: { singular: 'Konfiguration', plural: 'Konfigurationen' },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'productName', 'total', 'createdAt'],
    group: 'Anfragen',
    description: 'Von Besucher:innen gespeicherte oder angefragte Konfigurationen. Preise sind als Momentaufnahme gespeichert.',
  },
  defaultSort: '-createdAt',
  access: {
    read: isLoggedIn,
    create: nobody,
    update: nobody,
    delete: isAdmin,
  },
  fields: [
    { name: 'code', label: 'Code', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: 'product', label: 'Produkt', type: 'relationship', relationTo: 'products', admin: { readOnly: true } },
    { name: 'productName', label: 'Produktname', type: 'text', admin: { readOnly: true } },
    { name: 'total', label: 'Gesamtpreis (€)', type: 'number', admin: { readOnly: true } },
    {
      name: 'lines',
      label: 'Positionen',
      type: 'array',
      admin: { readOnly: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Position', type: 'text' },
            { name: 'detail', label: 'Detail', type: 'text' },
            { name: 'amount', label: 'Betrag (€)', type: 'number' },
          ],
        },
      ],
    },
    { name: 'selection', label: 'Auswahl (technisch)', type: 'json', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'vatMode', label: 'USt.-Modus', type: 'text', admin: { readOnly: true } },
        { name: 'vatRate', label: 'USt.-Satz (%)', type: 'number', admin: { readOnly: true } },
      ],
    },
  ],
}
