import type { AccessoryVisual, Catalog, EngravingFont, Selection, TextSelection, VisualPreset } from './types'

/**
 * Stilisierte Schaftböller-Illustration als SVG-String.
 * Wird verwendet, solange keine Foto-Ebenen im CMS hinterlegt sind.
 */

export type WoodPreset = 'holz-natur' | 'holz-dunkel' | 'holz-maser'
export type Motif = 'rosette' | 'edelweiss' | 'eichenlaub'

export type VisualState = {
  wood: WoodPreset
  strapColor: string
  text: string
  font: EngravingFont
  motif: Motif | null
  accessories: AccessoryVisual[]
}

export const WOODS: Record<WoodPreset, { c: [string, string, string]; grain: string; g: number }> = {
  'holz-natur': { c: ['#8f5d35', '#5a361c', '#b8824f'], grain: '0.0035 0.12', g: 0.55 },
  'holz-dunkel': { c: ['#4d2e19', '#2a170a', '#6e4528'], grain: '0.0035 0.12', g: 0.5 },
  'holz-maser': { c: ['#835030', '#472812', '#b27742'], grain: '0.011 0.05', g: 0.8 },
}

export const FONT_FAMILIES: Record<EngravingFont, { css: string; width: number; weight: number }> = {
  antiqua: { css: "'Cormorant Garamond', Georgia, serif", width: 0.5, weight: 600 },
  fraktur: { css: "'UnifrakturMaguntia', serif", width: 0.55, weight: 400 },
  schreibschrift: { css: "'Pinyon Script', cursive", width: 0.5, weight: 400 },
  modern: { css: "'Montserrat', sans-serif", width: 0.62, weight: 600 },
}

export const DEFAULT_STRAP = '#6e4024'

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const isColor = (c: string | undefined): c is string => !!c && /^#[0-9a-fA-F]{3,8}$/.test(c)

/** Leitet den Darstellungszustand aus Katalog + Auswahl ab */
export function visualStateFrom(catalog: Catalog, selection: Selection): VisualState {
  const state: VisualState = {
    wood: 'holz-natur',
    strapColor: DEFAULT_STRAP,
    text: '',
    font: 'antiqua',
    motif: null,
    accessories: [],
  }
  const apply = (visual: VisualPreset, color?: string) => {
    if (visual === 'holz-natur' || visual === 'holz-dunkel' || visual === 'holz-maser') state.wood = visual
    else if (visual === 'riemen' && isColor(color)) state.strapColor = color
    else if (visual.startsWith('motiv-')) state.motif = visual.slice(6) as Motif
  }
  for (const group of catalog.groups) {
    const value = selection[group.key]
    if (group.kind === 'single' && typeof value === 'string') {
      const o = group.options.find((x) => x.key === value)
      if (o) apply(o.visual, o.color)
    } else if (group.kind === 'multi' && Array.isArray(value)) {
      value.forEach((k) => {
        const o = group.options.find((x) => x.key === k)
        if (o) apply(o.visual, o.color)
      })
    } else if (group.kind === 'accessories' && Array.isArray(value)) {
      value.forEach((id) => {
        const visual = catalog.accessories[id]?.visual
        if (visual && visual !== 'none') state.accessories.push(visual)
      })
    } else if (group.kind === 'text') {
      const v = value as TextSelection | undefined
      if (v?.enabled && v.text) {
        state.text = v.text
        state.font = group.text?.fonts.find((f) => f.key === v.font)?.font ?? 'antiqua'
      }
    }
  }
  return state
}

const STOCK =
  'M190 160 L525 160 L525 116 C600 110 668 118 712 150 C760 186 778 262 752 318 C736 352 694 362 676 338 C662 318 676 296 698 302 C712 306 716 290 708 272 C690 236 650 216 600 214 L205 214 C186 214 176 200 176 187 C176 172 182 160 190 160 Z'

export const MOTIF_PATHS: Record<Motif, string> = {
  rosette:
    Array.from({ length: 6 }, (_, i) => `<path transform="rotate(${i * 60})" d="M0 0 Q11 -17 0 -34 Q-11 -17 0 0Z"/>`).join('') +
    '<circle r="34" fill="none"/><circle r="4"/>',
  edelweiss:
    Array.from({ length: 9 }, (_, i) => `<path transform="rotate(${i * 40})" d="M0 -7 C7 -14 6 -27 0 -33 C-6 -27 -7 -14 0 -7Z"/>`).join('') +
    '<circle r="3.5" cx="-3" cy="-1"/><circle r="3.5" cx="3.5" cy="-1.5"/><circle r="3.5" cx="0" cy="4"/>',
  eichenlaub:
    '<path d="M-30 20 C-22 12 -20 0 -10 -8 C-15 -17 -5 -24 1 -17 C3 -28 16 -31 16 -21 C24 -26 33 -18 25 -9 C34 -3 28 8 18 4 C18 14 6 16 2 8 C-6 18 -18 23 -30 20Z"/><path fill="none" d="M-30 20 C-10 7 6 -5 22 -14"/><ellipse cx="17" cy="23" rx="6.5" ry="8.5"/><path d="M9 17 Q17 9 25 17 Z"/>',
}

/** Geometrie der Beschriftung im viewBox (für Overlays in Rasterbildern) */
export const TEXT_ANCHOR = { x: 352, y: 198, maxWidth: 290, viewWidth: 900, viewHeight: 470 }

export function engravingFontSize(text: string, font: EngravingFont): number {
  return Math.min(24, TEXT_ANCHOR.maxWidth / (Math.max(text.length, 4) * FONT_FAMILIES[font].width))
}

export function renderIllustration(
  state: VisualState,
  opts: { uid?: string; includeText?: boolean; title?: string } = {},
): string {
  const uid = (opts.uid ?? 'b').replace(/[^a-z0-9]/gi, '')
  const w = WOODS[state.wood]
  const has = (v: AccessoryVisual) => state.accessories.includes(v)
  const font = FONT_FAMILIES[state.font]
  const text = opts.includeText === false ? '' : state.text
  const fs = text ? engravingFontSize(text, state.font) : 0
  const strap = isColor(state.strapColor) ? state.strapColor : DEFAULT_STRAP
  const motif = state.motif
    ? `<g transform="translate(630 170)" fill="rgba(25,12,4,.28)" stroke="rgba(25,12,4,.8)" stroke-width="1.6" stroke-linejoin="round">${MOTIF_PATHS[state.motif]}</g><g transform="translate(630.8 171)" fill="none" stroke="rgba(255,225,190,.16)" stroke-width="1">${MOTIF_PATHS[state.motif]}</g>`
    : ''
  const title = opts.title ? `<title>${esc(opts.title)}</title>` : ''
  const textMarkup = text
    ? `<text x="352" y="198" text-anchor="middle" dominant-baseline="middle" font-family="${esc(font.css)}" font-weight="${font.weight}" font-size="${fs.toFixed(1)}" fill="rgba(255,228,195,.18)" transform="translate(.8 .9)">${esc(text)}</text><text x="352" y="198" text-anchor="middle" dominant-baseline="middle" font-family="${esc(font.css)}" font-weight="${font.weight}" font-size="${fs.toFixed(1)}" fill="rgba(28,13,4,.85)">${esc(text)}</text>`
    : ''

  return `<svg viewBox="0 0 900 470" xmlns="http://www.w3.org/2000/svg" role="img">${title}
<defs>
<linearGradient id="${uid}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.c[2]}"/><stop offset=".45" stop-color="${w.c[0]}"/><stop offset="1" stop-color="${w.c[1]}"/></linearGradient>
<linearGradient id="${uid}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f8f9"/><stop offset=".28" stop-color="#b3bac1"/><stop offset=".5" stop-color="#eef1f3"/><stop offset=".78" stop-color="#7f878f"/><stop offset="1" stop-color="#c9cfd4"/></linearGradient>
<filter id="${uid}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${w.grain}" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  1.7 0 0 0 -.62"/></filter>
<filter id="${uid}b"><feGaussianBlur stdDeviation="9"/></filter>
<clipPath id="${uid}c"><path d="${STOCK}"/></clipPath>
</defs>
<ellipse cx="460" cy="${has('staender') ? 398 : 440}" rx="330" ry="13" fill="rgba(0,0,0,.55)" filter="url(#${uid}b)"/>
${has('ladestock') ? `<g><rect x="130" y="428" width="500" height="7" rx="3.5" fill="url(#${uid}s)"/><rect x="616" y="424" width="58" height="15" rx="7" fill="url(#${uid}w)"/></g>` : ''}
${has('hammer') ? `<g transform="translate(720 404) rotate(-8)"><rect x="0" y="22" width="120" height="9" rx="4.5" fill="url(#${uid}w)"/><rect x="-14" y="2" width="24" height="46" rx="5" fill="url(#${uid}s)"/></g>` : ''}
<path d="M232 214 C236 320 400 392 540 392 C640 392 700 362 712 322" fill="none" stroke="${strap}" stroke-width="15" stroke-linecap="round"/>
<path d="M232 214 C236 320 400 392 540 392 C640 392 700 362 712 322" fill="none" stroke="rgba(255,240,220,.5)" stroke-width="1.2" stroke-dasharray="5 6"/>
${has('staender') ? `<g><path d="M300 214 H530 V231 H300 Z" fill="url(#${uid}w)"/><path d="M318 231 H512 V372 H474 C474 314 356 314 356 372 H318 Z" fill="url(#${uid}w)"/><path d="M318 231 H512 V372 H474 C474 314 356 314 356 372 H318 Z" fill="rgba(0,0,0,.22)"/><rect x="288" y="372" width="254" height="18" rx="3" fill="url(#${uid}w)"/></g>` : ''}
<path d="${STOCK}" fill="url(#${uid}w)"/>
<rect x="170" y="100" width="620" height="270" filter="url(#${uid}g)" clip-path="url(#${uid}c)" opacity="${w.g}"/>
<path d="M525 116 C600 110 668 118 712 150 C760 186 778 262 752 318" fill="none" stroke="rgba(255,230,200,.22)" stroke-width="2"/>
${motif}
${textMarkup}
<rect x="150" y="128" width="195" height="44" rx="5" fill="url(#${uid}s)"/>
<rect x="335" y="120" width="190" height="58" fill="url(#${uid}s)"/>
<rect x="335" y="120" width="190" height="13" fill="rgba(255,255,255,.35)"/>
<rect x="335" y="164" width="190" height="14" fill="rgba(0,0,0,.22)"/>
<rect x="62" y="114" width="32" height="72" rx="15" fill="url(#${uid}s)"/>
<rect x="96" y="121" width="22" height="58" rx="10" fill="url(#${uid}s)"/>
<rect x="120" y="116" width="32" height="68" rx="13" fill="url(#${uid}s)"/>
<path d="M520 118 C518 100 528 92 540 90 C552 88 556 76 548 66 C562 68 570 84 562 98 C556 108 542 108 538 118 Z" fill="url(#${uid}s)"/>
<path d="M590 214 C596 232 600 244 614 254 C606 238 606 226 608 214 Z" fill="url(#${uid}s)"/>
<circle cx="230" cy="216" r="6" fill="none" stroke="#cfd4d8" stroke-width="2.5"/><circle cx="712" cy="322" r="6" fill="none" stroke="#cfd4d8" stroke-width="2.5"/>
<circle cx="215" cy="188" r="4" fill="url(#${uid}s)"/>
</svg>`
}

export const DEFAULT_VISUAL: VisualState = {
  wood: 'holz-natur',
  strapColor: '#8c1d22',
  text: '',
  font: 'antiqua',
  motif: null,
  accessories: ['staender'],
}
