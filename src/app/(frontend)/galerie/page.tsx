import Link from 'next/link'

import { PageHead } from '@/components/ProductList'
import { MediaImage } from '@/components/ui'
import { getGallery } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Galerie',
  description: 'Fertige Unikate von Schaftböller Ebner – handgefertigte Schaftböller aus Oberalm.',
  path: '/galerie',
})

export default async function GaleriePage() {
  const items = await getGallery()
  return (
    <>
      <PageHead
        eyebrow="Galerie"
        heading="Fertige"
        accent="Unikate."
        lead="Jeder Schaftböller ist ein Einzelstück. Hier zeigen wir eine Auswahl fertiger Arbeiten."
        crumbs={[{ href: '/', label: 'Startseite' }, { label: 'Galerie' }]}
      />
      <section className="section-sm">
        <div className="wrap">
          {items.length ? (
            <div className="gallery-grid">
              {items.map((item) => (
                <figure className="tone reveal" key={item.id}>
                  <MediaImage media={item.image} size="card" sizes="(max-width: 760px) 50vw, 33vw" alt={item.title} />
                  <figcaption>
                    <strong>{item.title}</strong>
                    {[item.year, item.description].filter(Boolean).join(' · ')}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Bald zeigen wir hier die ersten fertigen Unikate.</p>
              <Link className="btn btn-light" href="/konfigurator">
                Dein Unikat gestalten
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
