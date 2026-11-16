import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { ImageResponse } from 'next/og'

import { buildCatalog } from '@/lib/configurator/catalog'
import { normalizeCode } from '@/lib/configurator/code'
import { formatEuro, validateSelection } from '@/lib/configurator/engine'
import { DEFAULT_VISUAL, visualStateFrom } from '@/lib/configurator/illustration'
import { getPayloadClient } from '@/lib/data'
import { clientIp, rateLimit } from '@/lib/http'
import { satoriFonts } from '@/lib/render/assets'
import { IllustrationWithText, logoWhiteDataUri } from '@/lib/render/boeller-image'
import type { Product } from '@/payload-types'

export const alt = 'Schaftböller-Konfiguration von Schaftböller Ebner'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Link-Vorschaubild (WhatsApp, E-Mail …) mit dem konfigurierten Böller */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params
  const code = normalizeCode(raw)
  if (!code) notFound()
  if (!rateLimit(`og:${clientIp(await headers())}`, 30, 10 * 60_000)) return new Response('Zu viele Anfragen.', { status: 429 })
  const payload = await getPayloadClient()
  const config = (await payload.find({ collection: 'configurations', where: { code: { equals: code } }, depth: 2, limit: 1 })).docs[0]
  if (!config) notFound()
  const settings = await payload.findGlobal({ slug: 'settings' })
  let state = DEFAULT_VISUAL
  if (typeof config.product === 'object' && config.product) {
    const catalog = buildCatalog(config.product as Product)
    state = visualStateFrom(catalog, validateSelection(catalog, config.selection).selection)
  }
  const logo = await logoWhiteDataUri()
  const showPrice = settings.showPrices !== false && config.total

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'radial-gradient(circle at 35% 45%, #34343a 0%, #0a0a0a 70%)',
          color: '#fff',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 760 }}>
          <IllustrationWithText state={state} width={720} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, paddingRight: 56, width: 440 }}>
          <img src={logo} width={170} height={106} alt="" />
          <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 600, fontSize: 18, letterSpacing: 6, color: '#a9a9ae' }}>
            MEIN UNIKAT
          </div>
          <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 40, lineHeight: 1.05, textTransform: 'uppercase' }}>
            {config?.productName ?? 'Schaftböller'}
          </div>
          {config && <div style={{ display: 'flex', fontSize: 24, color: '#c99a6a' }}>{config.code}</div>}
          {showPrice ? (
            <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 34 }}>{formatEuro(Math.round(config!.total! * 100))}</div>
          ) : null}
        </div>
      </div>
    ),
    { ...size, fonts: await satoriFonts() },
  )
}
