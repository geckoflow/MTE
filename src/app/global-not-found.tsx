import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-800.css'
import '@fontsource/montserrat/latin-800-italic.css'
import '@fontsource/inter/latin-400.css'
import './(frontend)/globals.css'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden | Schaftböller Ebner',
  robots: { index: false },
}

/** 404 für URLs, die zu keiner Route passen (die Website hat mehrere Root-Layouts) */
export default function GlobalNotFound() {
  return (
    <html lang="de-AT">
      <body>
        <header className="site-header">
          <div className="wrap nav-row">
            <Link className="brand" href="/" aria-label="Schaftböller Ebner – Startseite">
              <img src="/brand/monogramm-se-weiss.png" alt="" width={219} height={119} />
              <span className="brand-text">
                Schaftböller<b>Ebner</b>
              </span>
            </Link>
          </div>
        </header>
        <main>
          <section className="section">
            <div className="wrap not-found">
              <p className="eyebrow">Fehler 404</p>
              <h1 className="h-xl">
                Hier ist
                <br />
                <span className="outline">nichts.</span>
              </h1>
              <p className="lead">Die Seite gibt es nicht (mehr). Vielleicht findest du über die Startseite oder den Konfigurator, was du suchst.</p>
              <div className="cta-row">
                <Link className="btn btn-light" href="/">
                  Zur Startseite
                </Link>
                <Link className="btn btn-ghost" href="/konfigurator">
                  Zum Konfigurator
                </Link>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
