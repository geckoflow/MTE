import Link from 'next/link'

import { ProductCard } from '@/components/ProductCard'
import { PageHead } from '@/components/ProductList'
import { getProducts, getSettings, priceSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Schaftböller',
  description: 'Handgefertigte Schaftböller aus regionalem Nussholz und rostfreiem Edelstahl – nach historischem Vorbild gebaut in Oberalm, Salzburg.',
  path: '/schaftboeller',
})

export default async function SchaftboellerPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts('schaftboeller')])
  const { showPrices } = priceSettings(settings)
  return (
    <>
      <PageHead
        eyebrow="Schaftböller"
        heading="Unsere"
        accent="Schaftböller."
        lead="Nach historischem Vorbild gebaut, aus regionalem Nussholz und Edelstahl – und mit Holzbild, Riemen, Beschriftung und Kerbschnitzerei zu deinem Unikat gemacht."
        crumbs={[{ href: '/', label: 'Startseite' }, { label: 'Schaftböller' }]}
      >
        <p style={{ marginTop: 24 }}>
          <Link className="btn btn-light" href="/konfigurator">
            Zum Konfigurator
          </Link>
        </p>
      </PageHead>
      <section className="light section-sm">
        <div className="wrap">
          {products.length ? (
            <div className="p-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} showPrices={showPrices} />
              ))}
            </div>
          ) : (
            <p className="empty-state">Modelle werden in Kürze vorgestellt.</p>
          )}
          <p className="footnote">
            Jeder Schaftböller wird auf Bestellung gefertigt. {settings.leadTimeNote}
          </p>
        </div>
      </section>
    </>
  )
}
