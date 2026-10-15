import 'server-only'

import { ImageResponse } from 'next/og'

import {
  FONT_FAMILIES,
  TEXT_ANCHOR,
  engravingFontSize,
  renderIllustration,
  type VisualState,
} from '@/lib/configurator/illustration'

import { publicDataUri, satoriFonts } from './assets'

const FONT_NAME: Record<VisualState['font'], string> = {
  antiqua: 'Cormorant Garamond',
  fraktur: 'UnifrakturMaguntia',
  schreibschrift: 'Pinyon Script',
  modern: 'Montserrat',
}

/** Illustration als <img> plus Beschriftung als echtes Text-Overlay (Rasterbilder kennen keine Web-Fonts im SVG) */
export function IllustrationWithText({ state, width }: { state: VisualState; width: number }) {
  const scale = width / TEXT_ANCHOR.viewWidth
  const height = Math.round(TEXT_ANCHOR.viewHeight * scale)
  const svg = renderIllustration(state, { uid: 'r', includeText: false })
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  const fontSize = state.text ? engravingFontSize(state.text, state.font) * scale : 0
  const boxWidth = (TEXT_ANCHOR.maxWidth + 40) * scale
  return (
    <div style={{ display: 'flex', position: 'relative', width, height }}>
      <img src={src} width={width} height={height} alt="" />
      {state.text ? (
        <div
          style={{
            position: 'absolute',
            left: TEXT_ANCHOR.x * scale - boxWidth / 2,
            top: TEXT_ANCHOR.y * scale - fontSize * 0.62,
            width: boxWidth,
            display: 'flex',
            justifyContent: 'center',
            fontFamily: FONT_NAME[state.font],
            fontWeight: FONT_FAMILIES[state.font].weight,
            fontSize,
            lineHeight: 1.2,
            color: 'rgba(28,13,4,0.85)',
          }}
        >
          {state.text}
        </div>
      ) : null}
    </div>
  )
}

/** PNG der Illustration (für PDF) */
export async function renderBoellerPng(state: VisualState, width = 1200): Promise<Buffer> {
  const height = Math.round((TEXT_ANCHOR.viewHeight / TEXT_ANCHOR.viewWidth) * width)
  const res = new ImageResponse(<IllustrationWithText state={state} width={width} />, {
    width,
    height,
    fonts: await satoriFonts(),
  })
  return Buffer.from(await res.arrayBuffer())
}

export const logoWhiteDataUri = () => publicDataUri('brand/logo-schriftzug-weiss.png', 'image/png')
