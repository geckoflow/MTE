import Link from 'next/link'

import type { Product } from '@/payload-types'

import { MediaImage, priceLabel } from './ui'

const TYPE_LABEL: Record<Product['type'], string> = {
  schaftboeller: 'Schaftböller',
  zubehoer: 'Zubehör',
  personalisierung: 'Personalisierung',
}

export const productHref = (p: Pick<Product, 'type' | 'slug' | 'id'>) =>
  p.type === 'schaftboeller' ? `/schaftboeller/${p.slug ?? p.id}` : p.type === 'personalisierung' ? '/konfigurator' : `/zubehoer/${p.slug ?? p.id}`

export function ProductCard({ product, showPrices }: { product: Product; showPrices: boolean }) {
  const image = product.images?.[0]
  const initials = product.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (
    <Link className="p-card reveal" href={productHref(product)}>
      <figure className={image ? 'tone' : undefined}>
        {image ? (
          <>
            <MediaImage media={image} size="card" sizes="(max-width: 760px) 50vw, 25vw" />
            {typeof image === 'object' && image.placeholder && <figcaption className="ph-badge">Platzhalter</figcaption>}
          </>
        ) : (
          <div className="ico" aria-hidden="true">
            {initials}
          </div>
        )}
      </figure>
      <div className="body">
        <span className="tag">{TYPE_LABEL[product.type]}</span>
        <h3>{product.name}</h3>
        {product.tagline && <p>{product.tagline}</p>}
        <div className="row">
          <span>{priceLabel(product.price, { from: product.priceFrom, showPrices, note: product.priceNote })}</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  )
}
