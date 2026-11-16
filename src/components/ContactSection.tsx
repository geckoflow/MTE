import type { Setting } from '@/payload-types'

import { ContactForm } from './ContactForm'

export function ContactSection({
  settings,
  heading = 'Lass uns',
  accent = 'reden.',
  lead,
  defaultTopic,
  defaultMessage,
  as = 'h2',
}: {
  settings: Setting
  heading?: string | null
  accent?: string | null
  lead?: string | null
  defaultTopic?: string
  defaultMessage?: string
  as?: 'h1' | 'h2'
}) {
  const Tag = as
  const address = [settings.street, [settings.zip, settings.city].filter(Boolean).join(' ')].filter(Boolean)
  return (
    <section className="section contact" id="kontakt" aria-labelledby="kontakt-h">
      <div className="wrap">
        <Tag className="h-xl" id="kontakt-h">
          {heading}
          <br />
          {accent}
        </Tag>
        <div className="contact-grid">
          <div className="contact-info reveal">
            <div>
              <h3>Werkstatt</h3>
              <p>
                {settings.brandName || 'Schaftböller Ebner'}
                <br />
                {address.length ? address.map((l) => (
                  <span key={l}>
                    {l}
                    <br />
                  </span>
                )) : <>{settings.city || 'Oberalm'}, {settings.region || 'Salzburg'}<br /></>}
                {settings.openingNote}
              </p>
            </div>
            <div>
              <h3>Persönlich</h3>
              <p>
                {settings.contactPerson}
                {settings.phone && (
                  <>
                    <br />
                    <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a>
                  </>
                )}
                {settings.email && (
                  <>
                    <br />
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </>
                )}
              </p>
            </div>
            <div>
              <h3>Beratung</h3>
              <p>{lead || 'Fragen zu Ausführung, Personalisierung oder Sonderwünschen? Wir nehmen uns Zeit für dich.'}</p>
            </div>
            {(settings.social?.length ?? 0) > 0 && (
              <div>
                <h3>Social Media</h3>
                <p>
                  {settings.social!.map((s) => (
                    <a key={s.id ?? s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      {s.network.charAt(0).toUpperCase() + s.network.slice(1)}
                    </a>
                  ))}
                </p>
              </div>
            )}
          </div>
          <div className="reveal">
            <ContactForm defaultTopic={defaultTopic} defaultMessage={defaultMessage} note={settings.inquiryNote} />
          </div>
        </div>
      </div>
    </section>
  )
}
