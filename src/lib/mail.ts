import 'server-only'

import { formatEuro } from '@/lib/configurator/engine'
import type { Quote } from '@/lib/configurator/types'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export type InquiryMailData = {
  topicLabel: string
  name: string
  email: string
  phone?: string
  organisation?: string
  message?: string
  configuration?: { code: string; productName: string; quote: Quote; url: string; pdfUrl: string }
  adminUrl: string
  showPrices: boolean
}

const wrap = (title: string, body: string) => `<!doctype html><html lang="de"><body style="margin:0;background:#f4f2ee;font-family:Arial,Helvetica,sans-serif;color:#111113">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff">
<tr><td style="background:#0a0a0a;color:#ffffff;padding:22px 28px;font-weight:800;font-style:italic;letter-spacing:2px;text-transform:uppercase;font-size:14px">Schaftböller Ebner</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;text-transform:uppercase">${esc(title)}</h1>
${body}
</td></tr></table></td></tr></table></body></html>`

function configTable(c: NonNullable<InquiryMailData['configuration']>, showPrices: boolean) {
  const rows = c.quote.lines
    .map(
      (l) =>
        `<tr><td style="padding:7px 0;border-bottom:1px solid #e5e2dc">${esc(l.label)}${l.detail ? `<br><span style="color:#5d5d63;font-size:12px">${esc(l.detail)}</span>` : ''}</td><td align="right" style="padding:7px 0;border-bottom:1px solid #e5e2dc;white-space:nowrap">${showPrices ? (l.amountCents ? esc(formatEuro(l.amountCents)) : 'inklusive') : ''}</td></tr>`,
    )
    .join('')
  return `<p style="margin:20px 0 6px;font-weight:bold">Konfiguration ${esc(c.code)} – ${esc(c.productName)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
<tr><td style="padding:10px 0;font-weight:bold">Gesamt</td><td align="right" style="padding:10px 0;font-weight:bold">${showPrices ? esc(formatEuro(c.quote.totalCents)) : 'auf Anfrage'}</td></tr></table>
<p style="font-size:14px"><a href="${esc(c.url)}">Konfiguration öffnen</a> · <a href="${esc(c.pdfUrl)}">PDF</a></p>`
}

const textConfig = (c: NonNullable<InquiryMailData['configuration']>, showPrices: boolean) =>
  [
    `Konfiguration ${c.code} – ${c.productName}`,
    ...c.quote.lines.map((l) => `- ${l.label}${l.detail ? ` (${l.detail})` : ''}: ${showPrices ? (l.amountCents ? formatEuro(l.amountCents) : 'inklusive') : ''}`),
    `Gesamt: ${showPrices ? formatEuro(c.quote.totalCents) : 'auf Anfrage'}`,
    `Link: ${c.url}`,
  ].join('\n')

/** Benachrichtigung an Schaftböller Ebner */
export function ownerMail(d: InquiryMailData) {
  const rows: [string, string | undefined][] = [
    ['Anliegen', d.topicLabel],
    ['Name', d.name],
    ['E-Mail', d.email],
    ['Telefon', d.phone],
    ['Verein / Organisation', d.organisation],
  ]
  const html = wrap(
    `Neue Anfrage: ${d.topicLabel}`,
    `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px">${rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;color:#5d5d63">${esc(k)}</td><td style="padding:3px 0">${k === 'E-Mail' ? `<a href="mailto:${esc(v)}">${esc(v)}</a>` : esc(v)}</td></tr>`)
      .join('')}</table>
${d.message ? `<p style="margin:18px 0 0;white-space:pre-wrap;font-size:14px;line-height:1.5">${esc(d.message)}</p>` : ''}
${d.configuration ? configTable(d.configuration, true) : ''}
<p style="margin-top:24px;font-size:13px"><a href="${esc(d.adminUrl)}">Anfrage im Redaktionssystem öffnen</a></p>`,
  )
  const text = [
    `Neue Anfrage: ${d.topicLabel}`,
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    d.message ? `\n${d.message}` : '',
    d.configuration ? `\n${textConfig(d.configuration, true)}` : '',
    `\nIm Redaktionssystem: ${d.adminUrl}`,
  ].join('\n')
  return { subject: `Neue Anfrage (${d.topicLabel}) – ${d.name}`, html, text }
}

/** Eingangsbestätigung an die anfragende Person */
export function customerMail(d: InquiryMailData, brand: string) {
  const html = wrap(
    'Danke für deine Anfrage',
    `<p style="font-size:15px;line-height:1.55">Hallo ${esc(d.name)},</p>
<p style="font-size:15px;line-height:1.55">danke für deine Nachricht an ${esc(brand)}. Wir haben deine Anfrage erhalten und melden uns so bald wie möglich persönlich bei dir.</p>
${d.configuration ? configTable(d.configuration, d.showPrices) : ''}
${d.message ? `<p style="margin-top:18px;font-size:13px;color:#5d5d63">Deine Nachricht:</p><p style="white-space:pre-wrap;font-size:14px">${esc(d.message)}</p>` : ''}
<p style="margin-top:24px;font-size:15px">Herzliche Grüße<br>${esc(brand)}</p>
<p style="margin-top:24px;font-size:11px;color:#8d8d93">Diese E-Mail wurde automatisch versendet. Die Anfrage ist unverbindlich.</p>`,
  )
  const text = [
    `Hallo ${d.name},`,
    '',
    `danke für deine Nachricht an ${brand}. Wir haben deine Anfrage erhalten und melden uns so bald wie möglich persönlich bei dir.`,
    d.configuration ? `\n${textConfig(d.configuration, d.showPrices)}` : '',
    '',
    `Herzliche Grüße`,
    brand,
  ].join('\n')
  return { subject: `Deine Anfrage bei ${brand}`, html, text }
}
