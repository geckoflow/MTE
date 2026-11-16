import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { formatEuro } from '@/lib/configurator/engine'
import { DEFAULT_VISUAL, renderIllustration, type VisualState } from '@/lib/configurator/illustration'
import { isMedia, isVideo, mediaUrl, type ImageSize, type MaybeMedia } from '@/lib/media'

/** Überschrift mit optionalem Kontur-Akzent */
export function Heading({
  as: Tag = 'h2',
  text,
  accent,
  className = 'h-l',
  id,
  breakBeforeAccent = true,
}: {
  as?: 'h1' | 'h2' | 'h3'
  text?: string | null
  accent?: string | null
  className?: string
  id?: string
  breakBeforeAccent?: boolean
}) {
  if (!text && !accent) return null
  return (
    <Tag className={className} id={id}>
      {text}
      {text && accent && (breakBeforeAccent ? <br /> : ' ')}
      {accent && <span className="outline">{accent}</span>}
    </Tag>
  )
}

/** Bild aus der Mediathek (optimiert über next/image) */
export function MediaImage({
  media,
  size = 'large',
  sizes = '100vw',
  className = 'cover',
  priority = false,
  alt,
}: {
  media: MaybeMedia
  size?: ImageSize
  sizes?: string
  className?: string
  priority?: boolean
  alt?: string
}) {
  if (!isMedia(media)) return null
  const src = mediaUrl(media, size) ?? ''
  const sized = media.sizes?.[size]
  const width = sized?.width || media.width || 1600
  const height = sized?.height || media.height || 1000
  if (isVideo(media)) return null
  return (
    <Image
      src={src}
      alt={alt ?? media.alt ?? ''}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  )
}

/** Abbildung mit Schwarz-Weiß→Farbe-Effekt und Platzhalter-Kennzeichnung */
export function ToneFigure({
  media,
  size = 'large',
  sizes,
  className = '',
  style,
  priority,
  caption,
}: {
  media: MaybeMedia
  size?: ImageSize
  sizes?: string
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  caption?: string
}) {
  if (!isMedia(media)) return null
  return (
    <figure className={`tone reveal ${className}`} style={style}>
      <MediaImage media={media} size={size} sizes={sizes} priority={priority} />
      {(media.placeholder || caption) && <figcaption className="ph-badge">{caption ?? 'Platzhalter'}</figcaption>}
    </figure>
  )
}

export function RichText({ data, className = 'prose' }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return <LexicalRichText data={data as never} className={className} />
}

/** Stilisierte Schaftböller-Illustration (SVG) */
export function BoellerIllustration({
  state = DEFAULT_VISUAL,
  uid = 'b',
  title = 'Illustration eines Schaftböllers',
  className,
}: {
  state?: VisualState
  uid?: string
  title?: string
  className?: string
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderIllustration(state, { uid, title }) }} />
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON in <script> sicher einbetten
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export function priceLabel(
  price: number | null | undefined,
  opts: { from?: boolean | null; showPrices: boolean; note?: string | null },
): string {
  if (!opts.showPrices) return 'Preis auf Anfrage'
  if (!price) return opts.note || 'auf Anfrage'
  return `${opts.from ? 'ab ' : ''}${formatEuro(Math.round(price * 100))}`
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Brotkrumen">
      <ol className="breadcrumbs">
        {items.map((item, i) => (
          <li key={i}>
            {item.href && i < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
