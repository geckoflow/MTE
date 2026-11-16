import { PageHead, ProductGrid } from '@/components/ProductList'
import { getProducts, getSettings, priceSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Zubehör & Personalisierung',
  description: 'Hammer, Ladestock, Wand- und Standhalterung, Koffer und Lederriemen sowie Kerbschnitzerei und Namensbeschriftung für deinen Schaftböller.',
  path: '/zubehoer',
})

export default async function ZubehoerPage() {
  const [settings, accessories, personalisations] = await Promise.all([
    getSettings(),
    getProducts('zubehoer'),
    getProducts('personalisierung'),
  ])
  const { showPrices } = priceSettings(settings)
  return (
    <>
      <PageHead
        eyebrow="Zubehör"
        heading="Zubehör &"
        accent="Personalisierung."
        lead="Alles, was zu einem Schaftböller gehört – und Möglichkeiten, ihn zu deinem persönlichen Stück zu machen."
        crumbs={[{ href: '/', label: 'Startseite' }, { label: 'Zubehör' }]}
      />
      <section className="light section-sm" aria-labelledby="zub-h">
        <div className="wrap">
          <h2 className="h-m" id="zub-h" style={{ marginBottom: 32 }}>
            Zubehör
          </h2>
          <ProductGrid products={accessories} showPrices={showPrices} empty="Zubehör wird in Kürze ergänzt." />
        </div>
      </section>
      {personalisations.length > 0 && (
        <section className="light section-sm" aria-labelledby="pers-h" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 className="h-m" id="pers-h" style={{ marginBottom: 32 }}>
              Personalisierung
            </h2>
            <ProductGrid products={personalisations} showPrices={showPrices} empty="" />
            <p className="footnote">Personalisierungen wählst du direkt im Konfigurator.</p>
          </div>
        </section>
      )}
    </>
  )
}
