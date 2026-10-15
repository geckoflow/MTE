import type { CollectionConfig } from 'payload'

import { adminOrSelf, canAccessAdmin, isAdmin, isAdminField, isLoggedIn } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Benutzer', plural: 'Benutzer' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles'],
    group: 'Verwaltung',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 8,
  },
  access: {
    read: isLoggedIn,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
    admin: canAccessAdmin,
  },
  hooks: {
    afterChange: [
      // Der erste Benutzer (Einrichtung über /admin) wird automatisch Administrator
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || doc.roles?.includes('admin')) return doc
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs !== 1) return doc
        return req.payload.update({
          collection: 'users',
          id: doc.id,
          data: { roles: ['admin'] },
          overrideAccess: true,
          req,
        })
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Name', type: 'text' },
    {
      name: 'roles',
      label: 'Rollen',
      type: 'select',
      hasMany: true,
      defaultValue: ['redaktion'],
      required: true,
      saveToJWT: true,
      access: { update: isAdminField, create: isAdminField },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Redaktion', value: 'redaktion' },
      ],
      admin: {
        description: 'Administratoren verwalten Benutzer und Einstellungen. Die Redaktion pflegt Inhalte, Produkte und Anfragen.',
      },
    },
  ],
}
