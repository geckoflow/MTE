import Link from 'next/link'

import { PageHead } from '@/components/ProductList'
import { Heading, RichText, ToneFigure } from '@/components/ui'
import { getCraft } from '@/lib/data'
import { isMedia } from '@/lib/media'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const craft = await getCraft()
  return pageMetadata({
    title: 'Handwerk & Tradition',
    description: craft.lead || 'Vom Nussbaum aus der Region bis zum fertigen Schaftböller – Herkunft, Material und Handarbeit aus Oberalm.',
    path: '/handwerk',
    meta: craft.meta,
  })
}

export default async function HandwerkPage() {
  const craft = await getCraft()
  return (
    <>
      <PageHead
        eyebrow={craft.eyebrow || 'Handwerk & Tradition'}
        heading={craft.heading || 'Vom Baum'}
        accent={craft.headingAccent || 'zum Böller.'}
        lead={craft.lead}
        crumbs={[{ href: '/', label: 'Startseite' }, { label: 'Handwerk & Tradition' }]}
      />

      {(craft.steps?.length ?? 0) > 0 && (
        <section className="light section-sm" aria-label="Vom Baum zum Böller">
          <div className="wrap">
            <div className="timeline" style={{ marginTop: 0 }}>
              {craft.steps!.map((step, i) => (
                <article className="t-step reveal" key={step.id ?? i}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: '.95rem', margin: '18px 0 8px' }}>
                    {step.title}
                  </h2>
                  <p>{step.text}</p>
                  {isMedia(step.image) && <ToneFigure media={step.image} size="card" sizes="(max-width: 760px) 50vw, 20vw" />}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {(craft.story?.heading || craft.story?.body) && (
        <section className="section" aria-labelledby="story-h">
          <div className="wrap split-2">
            <div className="reveal">
              <Heading id="story-h" text={craft.story.heading} accent={craft.story.headingAccent} />
              <div style={{ marginTop: 32 }}>
                <RichText data={craft.story.body} />
              </div>
            </div>
            <ToneFigure media={craft.story.image} size="large" sizes="(max-width: 760px) 100vw, 50vw" style={{ aspectRatio: '4/5' }} />
          </div>
        </section>
      )}

      {(craft.materials?.length ?? 0) > 0 && (
        <section className="section anthracite" aria-labelledby="mat-h">
          <div className="wrap">
            <Heading id="mat-h" text="Holz, Metall," accent="Leder." />
            <div className="materials">
              {craft.materials!.map((m, i) => (
                <article className="reveal" key={m.id ?? i}>
                  <ToneFigure media={m.image} size="card" sizes="(max-width: 760px) 100vw, 33vw" />
                  <h3 className="h-m">{m.title}</h3>
                  <p>{m.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="light section-sm">
        <div className="wrap split-2 end">
          <Heading text="Dein persönliches" accent="Unikat." />
          <div className="cta-row">
            <Link className="btn btn-dark" href="/konfigurator">
              Jetzt konfigurieren
            </Link>
            <Link className="btn btn-ghost" href="/kontakt?thema=termin">
              Werkstatt besuchen
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
