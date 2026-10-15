import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Configurator } from '@/components/configurator/Configurator'
import { buildCatalog, withoutPrices } from '@/lib/configurator/catalog'
import { normalizeCode } from '@/lib/configurator/code'
import { formatEuro, quote, validateSelection } from '@/lib/configurator/engine'
import { getConfigurableProducts, getConfigurationByCode, getSettings, priceSettings, vatNote } from '@/lib/data'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code: raw } = await params
  const code = normalizeCode(raw)
  const config = code ? await getConfigurationByCode(code) : null
  if (!config) return { title: 'Konfiguration nicht gefunden' }
  return {
    title: `Konfiguration ${config.code}`,
    description: `${config.productName} – individuell konfiguriert bei Schaftböller Ebner.`,
    robots: { index: false, follow: true },
    openGraph: { title: `Mein Schaftböller · ${config.code}`, description: `${config.productName} – individuell konfiguriert.` },
  }
}

export default async function SavedConfigurationPage({ params }: Props) {
  const { code: raw } = await params
  const code = normalizeCode(raw)
  if (!code) notFound()
  const [config, settings, products] = await Promise.all([getConfigurationByCode(code), getSettings(), getConfigurableProducts()])
  if (!config) notFound()
  const productId = typeof config.product === 'object' ? config.product?.id : config.product
  const product = products.find((p) => p.id === productId)
  const { showPrices: show } = priceSettings(settings)
  if (!product) {
    // Modell wird nicht mehr angeboten: gespeicherte Momentaufnahme zeigen statt 404 (Link aus der Bestätigungsmail)
    return (
      <section className="section">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Konfiguration {config.code}</p>
          <h1 className="h-l" style={{ margin: '22px 0 24px' }}>
            {config.productName}
          </h1>
          <p className="konfig-notice">Dieses Modell wird derzeit nicht im Konfigurator angeboten. Hier siehst du deine gespeicherte Auswahl.</p>
          <ul className="spec-list" style={{ marginTop: 24 }}>
            {(config.lines ?? []).map((l, i) => (
              <li key={l.id ?? i}>
                <span>
                  {l.label}
                  {l.detail ? ` – ${l.detail}` : ''}
                </span>
                <span>{show ? (l.amount ? formatEuro(Math.round(l.amount * 100)) : 'inklusive') : ''}</span>
              </li>
            ))}
          </ul>
          <div className="cta-row" style={{ marginTop: 32 }}>
            <Link className="btn btn-light" href={`/kontakt?thema=sonderwunsch&produkt=${encodeURIComponent(`Konfiguration ${config.code}`)}`}>
              Dazu anfragen
            </Link>
            <Link className="btn btn-ghost" href="/konfigurator">
              Neu konfigurieren
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const catalog = buildCatalog(product)
  const { selection, ok } = validateSelection(catalog, config.selection)
  const { showPrices, vat } = priceSettings(settings)
  const currentTotal = quote(catalog, selection, vat).totalCents
  const priceChanged = ok && showPrices && typeof config.total === 'number' && Math.round(config.total * 100) !== currentTotal
  const notices: string[] = []
  if (!ok) notices.push('Einige Optionen dieser Konfiguration sind nicht mehr verfügbar und wurden angepasst.')
  if (priceChanged) notices.push('Die Preise haben sich seit dem Speichern geändert – angezeigt werden die aktuellen Preise.')

  return (
    <Configurator
      catalog={showPrices ? catalog : withoutPrices(catalog)}
      products={products.map((p) => ({ slug: p.slug ?? String(p.id), name: p.name }))}
      showPrices={showPrices}
      vat={vat}
      vatNote={vatNote(settings)}
      leadTimeNote={settings.leadTimeNote || 'Fertigung auf Bestellung, Lieferzeit nach Vereinbarung.'}
      inquiryNote={settings.inquiryNote || 'Die Anfrage ist unverbindlich.'}
      initialSelection={selection}
      initialStep="uebersicht"
      savedCode={ok && !priceChanged ? config.code : undefined}
      notice={
        notices.length
          ? notices.join(' ')
          : `Gespeicherte Konfiguration ${config.code} – du kannst sie anpassen, teilen oder direkt anfragen.`
      }
    />
  )
}
