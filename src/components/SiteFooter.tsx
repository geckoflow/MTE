import Link from 'next/link'

import type { LegalPage, Setting } from '@/payload-types'

type Props = {
  settings: Setting
  legalPages: Pick<LegalPage, 'id' | 'slug' | 'title' | 'showInFooter'>[]
  nav: { href: string; label: string }[]
}

export function SiteFooter({ settings, legalPages, nav }: Props) {
  const year = new Date().getFullYear()
  const brand = settings.brandName || 'Schaftböller Ebner'
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="f-grid">
          <div>
            <img className="f-logo" src="/brand/logo-schriftzug-weiss.png" alt={brand} width={483} height={302} loading="lazy" />
            {settings.footerNote && <p style={{ marginTop: 18, color: '#8d8d93', fontSize: '.85rem', maxWidth: '22em' }}>{settings.footerNote}</p>}
          </div>
          <div>
            <h2>Entdecken</h2>
            <Link href="/konfigurator">Konfigurator</Link>
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/faq">FAQ</Link>
          </div>
          <div>
            <h2>Kontakt</h2>
            <address>
              {brand}
              <br />
              {settings.street && (
                <>
                  {settings.street}
                  <br />
                </>
              )}
              {[settings.zip, settings.city].filter(Boolean).join(' ')}
              {settings.region ? `, ${settings.region}` : ''}
            </address>
            {settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a>}
            {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
            {(settings.social ?? []).map((s) => (
              <a key={s.id ?? s.url} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.network.charAt(0).toUpperCase() + s.network.slice(1)}
              </a>
            ))}
          </div>
          <div>
            <h2>Rechtliches</h2>
            {legalPages
              .filter((p) => p.showInFooter !== false && p.slug)
              .map((p) => (
                <Link key={p.id} href={`/${p.slug}`}>
                  {p.title}
                </Link>
              ))}
          </div>
        </div>
        <div className="f-bottom">
          <span>
            © {year} {brand}
          </span>
          <span>Handgefertigt in Oberalm, Salzburg</span>
        </div>
      </div>
    </footer>
  )
}
