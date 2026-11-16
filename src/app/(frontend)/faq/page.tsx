import Link from 'next/link'

import { FAQ_CATEGORIES } from '@/collections/Faqs'
import { PageHead } from '@/components/ProductList'
import { JsonLd } from '@/components/ui'
import { getFaqs } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Häufige Fragen',
  description: 'Antworten zu Kauf, Fertigung, Personalisierung und Pflege von Schaftböllern von Schaftböller Ebner.',
  path: '/faq',
})

export default async function FaqPage() {
  const faqs = await getFaqs()
  const groups = FAQ_CATEGORIES.map((c) => ({ ...c, items: faqs.filter((f) => (f.category ?? 'allgemein') === c.value) })).filter(
    (g) => g.items.length,
  )
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }}
      />
      <PageHead
        eyebrow="Service"
        heading="Häufige"
        accent="Fragen."
        lead="Deine Frage ist nicht dabei? Schreib uns – wir antworten persönlich."
        crumbs={[{ href: '/', label: 'Startseite' }, { label: 'FAQ' }]}
      >
        <p style={{ marginTop: 24 }}>
          <Link className="btn btn-ghost" href="/kontakt">
            Frage stellen
          </Link>
        </p>
      </PageHead>
      <section className="section-sm">
        <div className="wrap" style={{ maxWidth: 980 }}>
          {groups.map((g) => (
            <div className="faq-cat faq-list" key={g.value}>
              <h2 className="eyebrow">{g.label}</h2>
              {g.items.map((f) => (
                <details key={f.id}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
