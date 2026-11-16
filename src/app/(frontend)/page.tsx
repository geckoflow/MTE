import Link from 'next/link'
import { Fragment } from 'react'

import { ContactSection } from '@/components/ContactSection'
import { Intro } from '@/components/Intro'
import { ProductCard, productHref } from '@/components/ProductCard'
import { BoellerIllustration, Heading, JsonLd, MediaImage, RichText, ToneFigure, priceLabel } from '@/components/ui'
import { buildCatalog } from '@/lib/configurator/catalog'
import { defaultSelection } from '@/lib/configurator/engine'
import { DEFAULT_VISUAL, visualStateFrom } from '@/lib/configurator/illustration'
import { getConfigurableProducts, getCraft, getFaqs, getHomepage, getProducts, getSettings, priceSettings } from '@/lib/data'
import { isMedia, isVideo, mediaUrl } from '@/lib/media'
import { organizationJsonLd, pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const home = await getHomepage()
  return {
    ...pageMetadata({ title: 'Schaftböller Ebner – Handgefertigte Schaftböller aus Oberalm', path: '/', meta: home.meta }),
    title: { absolute: home.meta?.title || 'Schaftböller Ebner – Handgefertigte Schaftböller aus Oberalm, Salzburg' },
  }
}

export default async function HomePage() {
  const [settings, home, craft, products, configurable, faqs] = await Promise.all([
    getSettings(),
    getHomepage(),
    getCraft(),
    getProducts(),
    getConfigurableProducts(),
    getFaqs(true),
  ])
  const { showPrices } = priceSettings(settings)
  const hero = home.hero ?? {}
  const lines = hero.lines?.length ? hero.lines : [{ text: 'Tradition.', outline: false }, { text: 'Handwerk.', outline: false }, { text: 'Charakter.', outline: true }]
  const featured = products.find((p) => p.type === 'schaftboeller' && p.featured) ?? products.find((p) => p.type === 'schaftboeller')
  const others = products.filter((p) => p.type !== 'schaftboeller')
  const mainConfigurable = configurable[0]
  const teaserVisual = mainConfigurable
    ? { ...visualStateFrom(buildCatalog(mainConfigurable), defaultSelection(buildCatalog(mainConfigurable))), strapColor: '#8c1d22', accessories: ['staender' as const] }
    : DEFAULT_VISUAL
  const marquee = home.marquee?.length ? home.marquee.map((m) => m.word) : ['Tradition', 'Handwerk', 'Charakter']
  const manufaktur = home.manufaktur ?? {}
  const quality = home.quality ?? {}
  const contrast = home.contrast ?? {}

  return (
    <>
      {settings.introEnabled !== false && <Intro tagline={settings.introTagline || 'Handwerk mit Tradition'} />}
      <JsonLd data={organizationJsonLd(settings)} />

      {/* Hero */}
      <section className="hero" aria-labelledby="hero-h">
        <img className="hero-ram" src="/brand/widder-weiss.webp" alt="" aria-hidden="true" width={470} height={535} />
        <div className="wrap hero-grid">
          <div>
            {hero.eyebrow && <p className="eyebrow">{hero.eyebrow}</p>}
            <h1 className="h-xl" id="hero-h">
              {lines.map((l, i) => (
                <span className="line" key={i}>
                  <span className={l.outline ? 'outline' : undefined}>{l.text}</span>
                </span>
              ))}
            </h1>
            {hero.lead && <p className="lead">{hero.lead}</p>}
            <div className="cta-row">
              <Link className="btn btn-light" href={hero.primaryHref || '/schaftboeller'}>
                {hero.primaryLabel || 'Schaftböller entdecken'}
              </Link>
              <Link className="btn btn-ghost" href={hero.secondaryHref || '/konfigurator'}>
                {hero.secondaryLabel || 'Jetzt konfigurieren'} →
              </Link>
            </div>
          </div>
          {isMedia(hero.image) && (
            <figure className="hero-media tone reveal">
              {isVideo(hero.video) && isMedia(hero.video) ? (
                <video className="cover" autoPlay muted loop playsInline poster={mediaUrl(hero.image, 'large')} aria-hidden="true">
                  <source src={mediaUrl(hero.video)} type={hero.video.mimeType ?? 'video/mp4'} />
                </video>
              ) : (
                <MediaImage media={hero.image} size="card" sizes="(max-width: 760px) 100vw, 35vw" priority />
              )}
              {hero.image.placeholder && <figcaption className="ph-badge">Platzhalter</figcaption>}
            </figure>
          )}
        </div>
        <div className="wrap hero-meta">
          {(hero.facts ?? []).map((f) => (
            <span key={f.id ?? f.text}>{f.text}</span>
          ))}
          <a className="scroll-cue" href="#manufaktur">
            Scroll
          </a>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((word, i) => (
            <Fragment key={i}>
              <span>{word}</span>
              <span className="dot">✦</span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Manufaktur */}
      <section className="light section" id="manufaktur" aria-labelledby="manu-h">
        <div className="wrap split-2">
          <div className="reveal">
            {manufaktur.eyebrow && <p className="eyebrow">{manufaktur.eyebrow}</p>}
            <Heading id="manu-h" text={manufaktur.heading} accent={manufaktur.headingAccent} breakBeforeAccent={false} />
          </div>
          <div className="prose reveal">
            {manufaktur.intro && <p className="first">{manufaktur.intro}</p>}
            <RichText data={manufaktur.body} className="prose" />
            {manufaktur.quote && <p className="quote">{manufaktur.quote}</p>}
          </div>
        </div>
        {(manufaktur.images?.length ?? 0) > 0 && (
          <div className="wrap media-row">
            {manufaktur.images!.map((m, i) => (
              <ToneFigure key={i} media={m} size={i === 0 ? 'large' : 'card'} sizes={i === 0 ? '(max-width: 760px) 100vw, 60vw' : '(max-width: 760px) 100vw, 40vw'} />
            ))}
          </div>
        )}
      </section>

      {/* Qualität */}
      <section className="section" aria-labelledby="q-h">
        <div className="wrap">
          <div className="q-head reveal">
            <Heading id="q-h" text={quality.heading} accent={quality.headingAccent} />
            {quality.lead && <p className="lead" style={{ maxWidth: '26em' }}>{quality.lead}</p>}
          </div>
          <div className="q-grid">
            {(quality.items ?? []).map((item, i) => (
              <article className="q-item reveal" key={item.id ?? i}>
                <span className="q-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h-m">{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Kontrast */}
      {(contrast.lineOne || contrast.lineTwo) && (
        <section className="contrast" aria-labelledby="c-h">
          <div className="wrap">
            <h2 className="h-xl" id="c-h">
              {contrast.lineOne}
              <br />
              {contrast.lineTwo}
            </h2>
            <div className="contrast-cols">
              <div className="reveal">
                <span className="eyebrow">{contrast.leftLabel}</span>
                <p>{contrast.leftText}</p>
              </div>
              <div className="reveal">
                <span className="eyebrow">{contrast.rightLabel}</span>
                <p>{contrast.rightText}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Produkte */}
      <section className="light section" aria-labelledby="p-h">
        <div className="wrap">
          <div className="split-2 end reveal">
            <div>
              {home.products?.eyebrow && <p className="eyebrow">{home.products.eyebrow}</p>}
              <Heading id="p-h" text={home.products?.heading} accent={home.products?.headingAccent} />
            </div>
            {home.products?.lead && <p className="lead">{home.products.lead}</p>}
          </div>
          {featured && (
            <article className="p-feature reveal" aria-labelledby="pf-h">
              <div className="stage-card">
                {featured.configurable ? (
                  <BoellerIllustration state={teaserVisual} uid="feat" title={`Illustration: ${featured.name}`} />
                ) : (
                  <MediaImage media={featured.images?.[0]} size="card" />
                )}
              </div>
              <div className="info">
                <span className="tag">Hauptprodukt</span>
                <h3 className="h-m" id="pf-h">
                  {featured.name}
                </h3>
                {featured.tagline && <p className="muted">{featured.tagline}</p>}
                {(featured.specs?.length ?? 0) > 0 && (
                  <ul className="spec-list">
                    {featured.specs!.map((s) => (
                      <li key={s.id ?? s.label}>
                        <span>{s.label}</span>
                        <span>{s.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="price">{priceLabel(featured.price, { from: featured.priceFrom, showPrices })}</p>
                <div className="cta-row">
                  {featured.configurable && (
                    <Link className="btn btn-light" href={`/konfigurator?modell=${featured.slug}`}>
                      Konfigurieren
                    </Link>
                  )}
                  <Link className="btn btn-ghost" href={productHref(featured)}>
                    Details
                  </Link>
                </div>
              </div>
            </article>
          )}
          {others.length > 0 && (
            <div className="p-grid" style={{ marginTop: 'clamp(40px, 6vw, 80px)' }}>
              {others.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} showPrices={showPrices} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Konfigurator-Teaser */}
      {mainConfigurable && (
        <section className="section anthracite" aria-labelledby="k-h">
          <div className="wrap split-2 end">
            <div className="reveal">
              {home.configurator?.eyebrow && <p className="eyebrow">{home.configurator.eyebrow}</p>}
              <Heading id="k-h" text={home.configurator?.heading} accent={home.configurator?.headingAccent} breakBeforeAccent={false} />
              {home.configurator?.lead && <p className="lead" style={{ margin: '28px 0 36px' }}>{home.configurator.lead}</p>}
              <Link className="btn btn-light" href="/konfigurator">
                Unikat gestalten →
              </Link>
            </div>
            <div className="stage-card reveal" style={{ border: '1px solid var(--line)' }}>
              <BoellerIllustration state={{ ...teaserVisual, text: 'Dein Name', font: 'fraktur', motif: 'edelweiss' }} uid="teaser" />
            </div>
          </div>
        </section>
      )}

      {/* Handwerk */}
      {(craft.steps?.length ?? 0) > 0 && (
        <section className="light section" aria-labelledby="h-h">
          <div className="wrap">
            <div className="split-2 end reveal">
              <div>
                {craft.eyebrow && <p className="eyebrow">{craft.eyebrow}</p>}
                <Heading id="h-h" text={craft.heading} accent={craft.headingAccent} />
              </div>
              <div>
                {craft.lead && <p className="lead">{craft.lead}</p>}
                <p style={{ marginTop: 24 }}>
                  <Link className="btn btn-dark" href="/handwerk">
                    Mehr über unser Handwerk
                  </Link>
                </p>
              </div>
            </div>
            <div className="timeline">
              {craft.steps!.map((step, i) => (
                <article className="t-step reveal" key={step.id ?? i}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  {isMedia(step.image) && <ToneFigure media={step.image} size="card" sizes="(max-width: 760px) 50vw, 20vw" />}
                </article>
              ))}
            </div>
            {home.unikat?.heading && (
              <div className="unikat">
                <ToneFigure media={home.unikat.image} size="card" sizes="(max-width: 760px) 100vw, 50vw" />
                <div className="prose reveal">
                  {home.unikat.eyebrow && <p className="eyebrow">{home.unikat.eyebrow}</p>}
                  <h3 className="h-m">{home.unikat.heading}</h3>
                  {home.unikat.text && <p>{home.unikat.text}</p>}
                  <div className="cta-row">
                    <Link className="btn btn-dark" href="/konfigurator">
                      Unikat gestalten
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="section" aria-labelledby="faq-h">
          <div className="wrap faq-grid">
            <div className="reveal">
              <p className="eyebrow">05 — Service</p>
              <Heading id="faq-h" text="Häufige" accent="Fragen." />
              <p style={{ marginTop: 28 }}>
                <Link className="btn btn-ghost" href="/faq">
                  Alle Fragen
                </Link>
              </p>
            </div>
            <div className="faq-list reveal">
              {faqs.map((f) => (
                <details key={f.id}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactSection settings={settings} heading={home.contact?.heading} accent={home.contact?.headingAccent} lead={home.contact?.lead} />
    </>
  )
}
