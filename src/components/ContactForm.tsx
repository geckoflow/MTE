'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const TOPICS = [
  { value: 'allgemein', label: 'Allgemeine Frage' },
  { value: 'sonderwunsch', label: 'Sonderwunsch' },
  { value: 'verein', label: 'Anfrage für einen Verein' },
  { value: 'termin', label: 'Termin in der Werkstatt' },
]

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'error'; message: string }

export function ContactForm({
  defaultTopic = 'allgemein',
  defaultMessage,
  note,
}: {
  defaultTopic?: string
  defaultMessage?: string
  note?: string | null
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const data = Object.fromEntries(new FormData(form).entries())
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          consent: data.consent === 'on',
          startedAt: startedAt.current,
          sourcePath: window.location.pathname,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Die Nachricht konnte nicht gesendet werden.')
      form.reset()
      setStatus({ kind: 'ok' })
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Unbekannter Fehler' })
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate={false} aria-describedby="contact-status">
      <div className="field-row">
        <div className="field">
          <label htmlFor="c-name">Name *</label>
          <input id="c-name" name="name" autoComplete="name" required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="c-mail">E-Mail *</label>
          <input id="c-mail" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="c-phone">Telefon (optional)</label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </div>
        <div className="field">
          <label htmlFor="c-topic">Anliegen</label>
          <select id="c-topic" name="topic" defaultValue={defaultTopic}>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-org">Verein / Organisation (optional)</label>
        <input id="c-org" name="organisation" maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="c-msg">Nachricht *</label>
        <textarea id="c-msg" name="message" rows={5} required maxLength={4000} defaultValue={defaultMessage} />
      </div>
      {/* Honigtopf gegen Spam-Bots – für Menschen unsichtbar */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="check">
        <input type="checkbox" name="consent" required /> Ich habe die{' '}
        <Link href="/datenschutz">Datenschutzerklärung</Link>&nbsp;gelesen und bin mit der Verarbeitung meiner Angaben zur
        Beantwortung einverstanden.
      </label>
      {note && <p className="muted" style={{ fontSize: '.8rem', marginBottom: 16 }}>{note}</p>}
      <button className="btn btn-light" type="submit" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'Wird gesendet …' : 'Nachricht senden'}
      </button>
      <div id="contact-status" aria-live="polite">
        {status.kind === 'ok' && (
          <p className="form-status ok">Danke für deine Nachricht! Wir melden uns so bald wie möglich.</p>
        )}
        {status.kind === 'error' && <p className="form-status error">{status.message}</p>}
      </div>
    </form>
  )
}
