'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type NavItem = { href: string; label: string }

export function SiteHeader({ nav, previewBanner = false }: { nav: NavItem[]; previewBanner?: boolean }) {
  const pathname = usePathname()
  const overlay = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  // Menü gilt nur für die Seite, auf der es geöffnet wurde – Navigation schließt es automatisch
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const solid = !overlay || scrolled

  useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 40)
    const frame = window.requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [overlay])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <header className={`site-header${overlay ? ' overlay' : ''}${solid || open ? ' solid' : ''}`}>
        {previewBanner && (
          <div className="preview-banner" role="note">
            Vorschau – Inhalte, Bilder und Preise sind Beispielwerte.
          </div>
        )}
        <div className="wrap nav-row">
          <Link className="brand" href="/" aria-label="Schaftböller Ebner – Startseite">
            <img src="/brand/monogramm-se-weiss.png" alt="" width={219} height={119} />
            <span className="brand-text">
              Schaftböller<b>Ebner</b>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="btn btn-light btn-sm btn-pill" href="/konfigurator">
              Konfigurator
            </Link>
            <button
              className="icon-btn burger"
              type="button"
              aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpenOn(open ? null : pathname)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <nav className={`mobile-nav${open ? ' open' : ''}`} id="mobile-nav" aria-label="Mobile Navigation" aria-hidden={!open}>
        <Link href="/" tabIndex={open ? 0 : -1}>
          Startseite
        </Link>
        {nav.slice(0, 2).map((item) => (
          <Link key={item.href} href={item.href} tabIndex={open ? 0 : -1}>
            {item.label}
          </Link>
        ))}
        <Link href="/konfigurator" className="hl" tabIndex={open ? 0 : -1}>
          Konfigurator
        </Link>
        {nav.slice(2).map((item) => (
          <Link key={item.href} href={item.href} tabIndex={open ? 0 : -1}>
            {item.label}
          </Link>
        ))}
        <Link href="/faq" tabIndex={open ? 0 : -1}>
          FAQ
        </Link>
      </nav>
    </>
  )
}
