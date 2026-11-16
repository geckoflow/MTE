import { ImageResponse } from 'next/og'

import { DEFAULT_VISUAL } from '@/lib/configurator/illustration'
import { satoriFonts } from '@/lib/render/assets'
import { IllustrationWithText, logoWhiteDataUri } from '@/lib/render/boeller-image'

export const alt = 'Schaftböller Ebner – Handgefertigte Schaftböller aus Oberalm, Salzburg'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Standard-Vorschaubild der Website */
export default async function Image() {
  const logo = await logoWhiteDataUri()
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0a0a', color: '#fff', fontFamily: 'Montserrat' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 64px', width: 520, gap: 26 }}>
          <img src={logo} width={200} height={125} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', fontWeight: 800, fontSize: 58, lineHeight: 0.95, textTransform: 'uppercase' }}>
            <span>Tradition.</span>
            <span>Handwerk.</span>
            <span style={{ fontStyle: 'italic', color: '#c99a6a' }}>Charakter.</span>
          </div>
          <div style={{ display: 'flex', fontFamily: 'Inter', fontSize: 22, color: '#a9a9ae' }}>Handgefertigte Schaftböller aus Oberalm</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 680 }}>
          <IllustrationWithText state={DEFAULT_VISUAL} width={660} />
        </div>
      </div>
    ),
    { ...size, fonts: await satoriFonts() },
  )
}
