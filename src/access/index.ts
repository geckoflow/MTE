import type { Access, FieldAccess, Where } from 'payload'

type Role = 'admin' | 'redaktion'

const hasRole = (user: unknown, role: Role): boolean =>
  Boolean(user && typeof user === 'object' && (user as { roles?: Role[] }).roles?.includes(role))

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

/** Zugang zur Admin-Oberfläche */
export const canAccessAdmin = ({ req }: { req: { user?: unknown } }): boolean => Boolean(req.user)

export const isAdmin: Access = ({ req }) => hasRole(req.user, 'admin')

export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, 'admin')

export const nobody: Access = () => false

export const anyone: Access = () => true

/** Öffentlich nur Einträge mit „Auf Website anzeigen“, angemeldete Nutzer sehen alles */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  const where: Where = { published: { equals: true } }
  return where
}

/** Admins oder der eigene Benutzer */
export const adminOrSelf: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}
