import { describe, expect, it } from 'vitest'

import { CODE_PATTERN, configurationCode, normalizeCode } from '@/lib/configurator/code'
import {
  blockedOptions,
  decodeSelection,
  defaultSelection,
  encodeSelection,
  formatEuro,
  quote,
  sanitizeEngraving,
  validateSelection,
  vatIncluded,
} from '@/lib/configurator/engine'
import { renderIllustration, visualStateFrom } from '@/lib/configurator/illustration'

import { catalog } from './fixtures'

describe('defaultSelection', () => {
  it('wählt Standardoptionen bzw. die erste verfügbare Option', () => {
    expect(defaultSelection(catalog)).toEqual({
      beschuss: 'at',
      holz: 'natur',
      beschriftung: { enabled: false, text: '', font: 'antiqua' },
      motive: [],
      zubehoer: [],
    })
  })
})

describe('validateSelection', () => {
  it('akzeptiert eine gültige Auswahl und normalisiert die Reihenfolge', () => {
    const r = validateSelection(catalog, {
      beschuss: 'de',
      holz: 'natur',
      beschriftung: { enabled: true, text: '  Josef   Ebner 1926 ', font: 'fraktur' },
      motive: ['edelweiss', 'rosette', 'rosette'],
      zubehoer: ['11', '10'],
    })
    expect(r.ok).toBe(true)
    expect(r.selection).toEqual({
      beschuss: 'de',
      holz: 'natur',
      beschriftung: { enabled: true, text: 'Josef Ebner 1926', font: 'fraktur' },
      motive: ['rosette', 'edelweiss'],
      zubehoer: ['10', '11'],
    })
  })

  it('ergänzt fehlende Gruppen mit Standardwerten', () => {
    const r = validateSelection(catalog, { holz: 'maser' })
    expect(r.ok).toBe(true)
    expect(r.selection.beschuss).toBe('at')
  })

  it('lehnt unbekannte und nicht verfügbare Optionen ab', () => {
    expect(validateSelection(catalog, { holz: 'gibtsnicht' }).ok).toBe(false)
    expect(validateSelection(catalog, { holz: 'alt' }).ok).toBe(false)
    expect(validateSelection(catalog, { zubehoer: ['12'] }).ok).toBe(false)
    expect(validateSelection(catalog, { zubehoer: ['999'] }).ok).toBe(false)
    expect(validateSelection(catalog, { motive: 'rosette' }).ok).toBe(false)
  })

  it('prüft Unverträglichkeiten', () => {
    const r = validateSelection(catalog, { holz: 'maser', motive: ['rosette'] })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]).toContain('nicht mit')
  })

  it('lehnt zu lange Texte, Steuerzeichen und HTML ab', () => {
    expect(validateSelection(catalog, { beschriftung: { enabled: true, text: 'x'.repeat(30), font: 'antiqua' } }).ok).toBe(false)
    expect(validateSelection(catalog, { beschriftung: { enabled: true, text: '<script>', font: 'antiqua' } }).ok).toBe(false)
    expect(validateSelection(catalog, { beschriftung: { enabled: true, text: 'Test', font: 'comic' } }).ok).toBe(false)
  })

  it('verwirft den Text einer ausgeschalteten Beschriftung ohne Fehler', () => {
    const r = validateSelection(catalog, { beschriftung: { enabled: false, text: 'Anna@Verein', font: 'antiqua' } })
    expect(r.ok).toBe(true)
    expect(r.selection.beschriftung).toEqual({ enabled: false, text: '', font: 'antiqua' })
  })

  it('behandelt leeren Text als „keine Beschriftung“', () => {
    const r = validateSelection(catalog, { beschriftung: { enabled: true, text: '   ', font: 'antiqua' } })
    expect(r.ok).toBe(true)
    expect(r.selection.beschriftung).toEqual({ enabled: false, text: '', font: 'antiqua' })
  })

  it('lehnt Nicht-Objekte ab', () => {
    expect(validateSelection(catalog, 'abc').ok).toBe(false)
    expect(validateSelection(catalog, [1, 2]).ok).toBe(false)
  })
})

describe('blockedOptions', () => {
  it('sperrt ausgeschlossene Optionen in beide Richtungen', () => {
    const s = { ...defaultSelection(catalog), holz: 'maser' }
    expect(blockedOptions(catalog, s).has('motive.rosette')).toBe(true)
    const s2 = { ...defaultSelection(catalog), motive: ['rosette'] }
    expect(blockedOptions(catalog, s2).has('holz.maser')).toBe(true)
  })
})

describe('quote', () => {
  it('summiert Grundpreis, Aufpreise, Beschriftung und Zubehör', () => {
    const { selection } = validateSelection(catalog, {
      beschuss: 'de',
      holz: 'natur',
      beschriftung: { enabled: true, text: 'Ebner', font: 'antiqua' },
      motive: ['edelweiss'],
      zubehoer: ['10', '11'],
    })
    const q = quote(catalog, selection)
    expect(q.totalCents).toBe(249000 + 5000 + 0 + 6000 + 18000 + 4500 + 15000)
    expect(q.lines.map((l) => l.label)).toEqual([
      'Schaftböller Klassik',
      'Beschuss: Deutschland',
      'Nussholz: Nuss natur',
      'Namensbeschriftung',
      'Kerbschnitzerei: Edelweiß',
      'Hammer',
      'Standhalterung',
    ])
    expect(q.vat.includedCents).toBe(Math.round(q.totalCents - q.totalCents / 1.2))
  })

  it('weist bei Kleinunternehmern keine USt. aus', () => {
    const q = quote(catalog, defaultSelection(catalog), { mode: 'kleinunternehmer', rate: 20 })
    expect(q.vat.includedCents).toBe(0)
    expect(vatIncluded(12000, 'regel', 20)).toBe(2000)
  })
})

describe('Codes und URL-Kodierung', () => {
  it('erzeugt stabile, gültige Codes', () => {
    const s = defaultSelection(catalog)
    const a = configurationCode('1', s, 249000)
    expect(a).toMatch(CODE_PATTERN)
    expect(configurationCode('1', { ...s }, 249000)).toBe(a)
    expect(configurationCode('1', s, 250000)).not.toBe(a)
    expect(normalizeCode(a.toLowerCase())).toBe(a)
    expect(normalizeCode('SE-IIII-OOOO')).toBeNull()
  })

  it('kodiert Auswahl verlustfrei inkl. Umlauten', () => {
    const s = { ...defaultSelection(catalog), beschriftung: { enabled: true, text: 'Jörg Öller – 1926', font: 'antiqua' } }
    expect(decodeSelection(encodeSelection(s))).toEqual(s)
    expect(decodeSelection('%%%')).toBeUndefined()
  })

  it('formatiert Euro-Beträge österreichisch', () => {
    expect(formatEuro(249000)).toMatch(/2\.490/)
    expect(formatEuro(4550)).toMatch(/45,50/)
  })
})

describe('Illustration', () => {
  it('maskiert Beschriftungen und bildet die Auswahl ab', () => {
    const s = { ...defaultSelection(catalog), holz: 'maser', zubehoer: ['11'] }
    const state = visualStateFrom(catalog, s)
    expect(state.wood).toBe('holz-maser')
    expect(state.accessories).toEqual(['staender'])
    const svg = renderIllustration({ ...state, text: '<b>&"' }, { uid: 'x' })
    expect(svg).toContain('&lt;b&gt;&amp;&quot;')
    expect(svg).not.toContain('<b>')
  })

  it('bereinigt Beschriftungstexte', () => {
    expect(sanitizeEngraving('  a\u0007b  \n c ', 24)).toBe('ab c')
    expect(sanitizeEngraving(42, 24)).toBe('')
  })
})
