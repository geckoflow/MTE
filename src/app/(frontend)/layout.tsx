import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-800.css'
import '@fontsource/montserrat/latin-800-italic.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/unifrakturmaguntia/latin-400.css'
import '@fontsource/pinyon-script/latin-400.css'
import './globals.css'

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import React from 'react'

import { RevealObserver } from '@/components/RevealObserver'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getLegalPages, getSettings } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { SITE_URL, noIndex } from '@/lib/seo'

// Inhalte kommen live aus dem CMS – Änderungen sind sofort sichtbar.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const brand = settings.brandName || 'Schaftböller Ebner'
  const og = mediaUrl(settings.defaultOgImage, 'og')
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${brand} – Handgefertigte Schaftböller aus Oberalm`, template: `%s | ${brand}` },
    description:
      'Handgefertigte Schaftböller aus regionalem Nussholz und Edelstahl – nach historischem Vorbild gebaut in Oberalm, Salzburg. Jetzt online konfigurieren.',
    applicationName: brand,
    openGraph: {
      type: 'website',
      locale: 'de_AT',
      siteName: brand,
      ...(og ? { images: [{ url: og, width: 1200, height: 630 }] } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
}

/** Läuft vor dem ersten Rendern: JS-Klasse, Einstiegsseite merken, Intro ggf. sofort ausblenden */
const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');var seen=location.pathname!=='/';try{seen=seen||sessionStorage.getItem('se-intro')==='1'}catch(e){}if(seen&&!/[?&]intro/.test(location.search))d.classList.add('intro-seen')})()`

const NAV = [
  { href: '/schaftboeller', label: 'Schaftböller' },
  { href: '/zubehoer', label: 'Zubehör' },
  { href: '/handwerk', label: 'Handwerk & Tradition' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/kontakt', label: 'Kontakt' },
]

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, legalPages] = await Promise.all([getSettings(), getLegalPages()])
  const plausibleDomain = process.env.PLAUSIBLE_DOMAIN
  const plausibleSrc = process.env.PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js'

  return (
    <html lang="de-AT" suppressHydrationWarning>
      <head>
        {/* Klasse „js“ vor dem ersten Rendern setzen, damit Einblend-Effekte nicht flackern */}
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#inhalt">
          Zum Inhalt springen
        </a>
        <SiteHeader nav={NAV} previewBanner={Boolean(settings.previewBanner)} />
        <main id="inhalt">{children}</main>
        <SiteFooter settings={settings} legalPages={legalPages} nav={NAV} />
        <RevealObserver />
        {plausibleDomain && <Script defer data-domain={plausibleDomain} src={plausibleSrc} strategy="afterInteractive" />}
      </body>
    </html>
  )
}
