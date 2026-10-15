import Link from 'next/link'

import { Configurator } from '@/components/configurator/Configurator'
import { buildCatalog } from '@/lib/configurator/catalog'
import { decodeSelection, validateSelection } from '@/lib/configurator/engine'
import { getConfigurableProducts, getSettings, priceSettings, vatNote } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Konfigurator',
  description:
    'Stell dir deinen Schaftböller zusammen: Nussholz, Lederriemen, Namensbeschriftung, Kerbschnitzerei und Zubehör – mit Live-Vorschau und Preis.',
  path: '/konfigurator',
})

type Props = { searchParams: Promise<{ modell?: string; k?: string }> }

export default async function KonfiguratorPage({ searchParams }: Props) {
  const [{ modell, k }, settings, products] = await Promise.all([searchParams, getSettings(), getConfigurableProducts()])
  const product = products.find((p) => p.slug === modell) ?? products[0]
  if (!product) {
    return (
      <section className="section">
        <div className="wrap empty-state">
          <h1 className="h-m">Der Konfigurator wird gerade vorbereitet.</h1>
          <p>Schreib uns gerne, wie dein Schaftböller aussehen soll.</p>
          <Link className="btn btn-light" href="/kontakt">
            Kontakt
          </Link>
        </div>
      </section>
    )
  }
  const catalog = buildCatalog(product)
  const decoded = decodeSelection(k)
  const { selection, ok } = validateSelection(catalog, decoded)
  const { showPrices, vat } = priceSettings(settings)

  return (
    <Configurator
      catalog={catalog}
      products={products.map((p) => ({ slug: p.slug ?? String(p.id), name: p.name }))}
      showPrices={showPrices}
      vat={vat}
      vatNote={vatNote(settings)}
      leadTimeNote={settings.leadTimeNote || 'Fertigung auf Bestellung, Lieferzeit nach Vereinbarung.'}
      inquiryNote={settings.inquiryNote || 'Die Anfrage ist unverbindlich.'}
      initialSelection={selection}
      notice={decoded !== undefined && !ok ? 'Einige Optionen deiner Auswahl sind nicht mehr verfügbar und wurden angepasst.' : undefined}
    />
  )
}
