import { describe, expect, it } from 'vitest'

import { DEFAULT_PREVIEW_PASSWORD, hasPreviewAccess, previewPassword } from '@/lib/preview'

const basic = (user: string, password: string) => `Basic ${Buffer.from(`${user}:${password}`, 'utf8').toString('base64')}`

describe('Vorschau-Schutz', () => {
  it('ist in Produktion ohne Einstellung mit dem Standardpasswort aktiv', () => {
    expect(previewPassword({ NODE_ENV: 'production' })).toBe(DEFAULT_PREVIEW_PASSWORD)
  })

  it('nimmt SITE_PASSWORD und ist mit SITE_PUBLIC=true aus', () => {
    expect(previewPassword({ NODE_ENV: 'production', SITE_PASSWORD: 'geheim' })).toBe('geheim')
    expect(previewPassword({ NODE_ENV: 'production', SITE_PASSWORD: 'geheim', SITE_PUBLIC: 'true' })).toBeNull()
  })

  it('lässt die lokale Entwicklung offen, außer SITE_PASSWORD ist gesetzt', () => {
    expect(previewPassword({ NODE_ENV: 'development' })).toBeNull()
    expect(previewPassword({ NODE_ENV: 'development', SITE_PASSWORD: 'geheim' })).toBe('geheim')
  })

  it('prüft nur das Passwort, der Benutzername ist beliebig', () => {
    expect(hasPreviewAccess(basic('david', 'geheim'), 'geheim')).toBe(true)
    expect(hasPreviewAccess(basic('', 'geheim'), 'geheim')).toBe(true)
    expect(hasPreviewAccess(basic('x', 'mit:doppelpunkt'), 'mit:doppelpunkt')).toBe(true)
    expect(hasPreviewAccess(basic('vorschau', 'Schaftböller'), 'Schaftböller')).toBe(true)
  })

  it('lehnt falsche, fehlende und kaputte Angaben ab', () => {
    expect(hasPreviewAccess(basic('david', 'falsch'), 'geheim')).toBe(false)
    expect(hasPreviewAccess(basic('david', 'geheim2'), 'geheim')).toBe(false)
    expect(hasPreviewAccess(null, 'geheim')).toBe(false)
    expect(hasPreviewAccess('Bearer abc', 'geheim')).toBe(false)
    expect(hasPreviewAccess('Basic ###', 'geheim')).toBe(false)
    expect(hasPreviewAccess(`Basic ${Buffer.from('ohnedoppelpunkt').toString('base64')}`, 'geheim')).toBe(false)
  })
})
