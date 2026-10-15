import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Configurator } from '@/components/configurator/Configurator'
import { buildCatalog } from '@/lib/configurator/catalog'
import { normalizeCode } from '@/lib/configurator/code'
import { quote, validateSelection } from '@/lib/configurator/engine'
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
  if (!product) notFound()

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
      catalog={catalog}
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
