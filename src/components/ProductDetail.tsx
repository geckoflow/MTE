import Link from 'next/link'

import type { Product, Setting } from '@/payload-types'
import { buildCatalog } from '@/lib/configurator/catalog'
import { defaultSelection } from '@/lib/configurator/engine'
import { visualStateFrom } from '@/lib/configurator/illustration'
import { priceSettings, vatNote } from '@/lib/data'
import { isMedia } from '@/lib/media'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo'

import { ProductCard } from './ProductCard'
import { BoellerIllustration, Breadcrumbs, JsonLd, MediaImage, RichText, priceLabel } from './ui'

export function ProductDetail({
  product,
  settings,
  related,
  parent,
}: {
  product: Product
  settings: Setting
  related: Product[]
  parent: { href: string; label: string }
}) {
  const { showPrices } = priceSettings(settings)
  const path = `${parent.href}/${product.slug}`
  const images = (product.images ?? []).filter(isMedia)
  const catalog = product.configurable ? buildCatalog(product) : null
  const visual = catalog ? { ...visualStateFrom(catalog, defaultSelection(catalog)), accessories: ['staender' as const] } : null

  return (
    <>
      <JsonLd data={productJsonLd(product, path, showPrices)} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Startseite', path: '/' }, { name: parent.label, path: parent.href }, { name: product.name, path }])} />
      <section className="section-sm">
        <div className="wrap">
          <Breadcrumbs items={[{ href: '/', label: 'Startseite' }, parent, { label: product.name }]} />
          <div className="pd-grid">
            <div className="pd-gallery">
              <div className="main">
                {visual ? (
                  <BoellerIllustration state={visual} uid="pd" title={`Illustration: ${product.name}`} />
                ) : images[0] ? (
                  <figure className="tone in" style={{ width: '100%', height: '100%' }}>
                    <MediaImage media={images[0]} size="large" sizes="(max-width: 1100px) 100vw, 55vw" priority />
                    {images[0].placeholder && <figcaption className="ph-badge">Platzhalter</figcaption>}
                  </figure>
                ) : (
                  <span className="muted">Foto folgt</span>
                )}
              </div>
              {images.length > (visual ? 0 : 1) && (
                <div className="pd-thumbs">
                  {images.slice(visual ? 0 : 1, 5).map((m) => (
                    <figure className="tone" key={m.id}>
                      <MediaImage media={m} size="thumb" sizes="15vw" />
                    </figure>
                  ))}
                </div>
              )}
            </div>
            <div className="pd-info">
              <h1 className="h-l">{product.name}</h1>
              {product.tagline && <p className="lead">{product.tagline}</p>}
              <p className="price">
                {priceLabel(product.price, { from: product.priceFrom, showPrices, note: product.priceNote })}
                {showPrices && product.price ? <small>{vatNote(settings)}</small> : null}
              </p>
              {product.priceNote && showPrices && product.price ? <p className="muted">{product.priceNote}</p> : null}
              <div className="cta-row">
                {product.configurable ? (
                  <Link className="btn btn-light" href={`/konfigurator?modell=${product.slug}`}>
                    Jetzt konfigurieren
                  </Link>
                ) : null}
                <Link className={`btn ${product.configurable ? 'btn-ghost' : 'btn-light'}`} href={`/kontakt?thema=allgemein&produkt=${encodeURIComponent(product.name)}`}>
                  Anfragen
                </Link>
              </div>
              {(product.specs?.length ?? 0) > 0 && (
                <div>
                  <h2 className="eyebrow" style={{ marginBottom: 12 }}>
                    Technische Daten
                  </h2>
                  <ul className="spec-list">
                    {product.specs!.map((s) => (
                      <li key={s.id ?? s.label}>
                        <span>{s.label}</span>
                        <span>{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(product.included?.length ?? 0) > 0 && (
                <div>
                  <h2 className="eyebrow" style={{ marginBottom: 12 }}>
                    Im Preis enthalten
                  </h2>
                  <ul className="included">
                    {product.included!.map((i) => (
                      <li key={i.id ?? i.item}>{i.item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {product.leadTime && (
                <p className="muted">
                  Lieferzeit: {product.leadTime}. {settings.leadTimeNote}
                </p>
              )}
              <RichText data={product.description} />
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="light section-sm" aria-labelledby="rel-h">
          <div className="wrap">
            <h2 className="h-m" id="rel-h" style={{ marginBottom: 32 }}>
              Passend dazu
            </h2>
            <div className="p-grid">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} showPrices={showPrices} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
