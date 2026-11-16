import type { Media } from '@/payload-types'

import { SERVER_URL } from './env'

export type MaybeMedia = number | Media | null | undefined

export const isMedia = (m: MaybeMedia): m is Media => !!m && typeof m === 'object' && 'url' in m

export type ImageSize = 'thumb' | 'card' | 'large' | 'og'

/** Payload liefert absolute URLs (serverURL) – für next/image und Portabilität relativ machen */
const toRelative = (url: string): string => {
  try {
    const u = new URL(url, 'http://relative.invalid')
    return u.pathname.startsWith('/api/media/') ? `${u.pathname}${u.search}` : url
  } catch {
    return url
  }
}

/** URL eines Bildes (optional einer bestimmten Größe), relativ zur Website */
export function mediaUrl(m: MaybeMedia, size?: ImageSize): string | undefined {
  if (!isMedia(m)) return undefined
  const url = (size ? m.sizes?.[size]?.url : undefined) || m.url
  return url ? toRelative(url) : undefined
}

export function mediaDims(m: MaybeMedia): { width: number; height: number } {
  if (!isMedia(m)) return { width: 1600, height: 1000 }
  return { width: m.width || 1600, height: m.height || 1000 }
}

export const isVideo = (m: MaybeMedia) => isMedia(m) && !!m.mimeType?.startsWith('video/')

export const absoluteUrl = (pathOrUrl: string) => {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SERVER_URL}${pathOrUrl}`
}
