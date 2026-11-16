import Link from 'next/link'

export default function NotFound() {
  return (
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
  )
}
