import { ContactSection } from '@/components/ContactSection'
import { Breadcrumbs, JsonLd } from '@/components/ui'
import { getHomepage, getSettings } from '@/lib/data'
import { organizationJsonLd, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Kontakt',
  description: 'Fragen, Sonderwünsche oder Vereinsanfragen: Kontakt zu Schaftböller Ebner in Oberalm, Salzburg.',
  path: '/kontakt',
})

const TOPICS = ['allgemein', 'sonderwunsch', 'verein', 'termin']

export default async function KontaktPage({ searchParams }: { searchParams: Promise<{ thema?: string; produkt?: string }> }) {
  const [{ thema, produkt }, settings, home] = await Promise.all([searchParams, getSettings(), getHomepage()])
  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <div className="wrap" style={{ paddingTop: 32 }}>
        <Breadcrumbs items={[{ href: '/', label: 'Startseite' }, { label: 'Kontakt' }]} />
      </div>
      <ContactSection
        as="h1"
        settings={settings}
        heading={home.contact?.heading}
        accent={home.contact?.headingAccent}
        lead={home.contact?.lead}
        defaultTopic={thema && TOPICS.includes(thema) ? thema : 'allgemein'}
        defaultMessage={produkt ? `Anfrage zu: ${produkt.slice(0, 120)}\n\n` : undefined}
      />
    </>
  )
}
