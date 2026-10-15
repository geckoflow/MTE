import { after } from 'next/server'
import { z } from 'zod'

import { INQUIRY_TOPICS } from '@/collections/Inquiries'
import { visualStateFrom } from '@/lib/configurator/illustration'
import { loadConfigurable, saveConfiguration, type SavedConfiguration } from '@/lib/configurator/server'
import { getPayloadClient } from '@/lib/data'
import { clientIp, json, rateLimit, readJson, sameOrigin } from '@/lib/http'
import { customerMail, ownerMail } from '@/lib/mail'
import { renderBoellerPng } from '@/lib/render/boeller-image'
import { renderConfigurationPdf } from '@/lib/render/pdf'
import { SITE_URL } from '@/lib/seo'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined))

const schema = z.object({
  topic: z.enum(['konfiguration', 'allgemein', 'sonderwunsch', 'verein', 'termin']),
  name: z.string().trim().min(2, 'Bitte gib deinen Namen an.').max(120),
  email: z.string().trim().max(200).pipe(z.email('Bitte gib eine gültige E-Mail-Adresse an.')),
  phone: optionalText(40),
  organisation: optionalText(120),
  message: optionalText(4000),
  consent: z.literal(true, { error: 'Bitte bestätige den Datenschutz-Hinweis.' }),
  website: z.string().optional(),
  startedAt: z.number().optional(),
  product: z.string().max(100).optional(),
  selection: z.unknown().optional(),
  sourcePath: z.string().max(200).optional(),
})

const MIN_FILL_MS = 2500

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Ungültige Herkunft.' }, 403)
  const ip = clientIp(req)
  if (!rateLimit(`anfrage:${ip}`, Number(process.env.RATE_LIMIT_INQUIRIES || 5), 10 * 60_000)) {
    return json({ error: 'Zu viele Anfragen in kurzer Zeit. Bitte versuche es später erneut oder ruf uns an.' }, 429)
  }

  let raw: unknown
  try {
    raw = await readJson(req, 40_000)
  } catch {
    return json({ error: 'Ungültige Anfrage.' }, 400)
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return json({ error: first?.message || 'Bitte prüfe deine Eingaben.', field: first?.path.join('.') }, 422)
  }
  const data = parsed.data

  // Spam-Schutz: Honigtopf-Feld befüllt → still verwerfen
  if (data.website) return json({ ok: true })
  if (data.startedAt && Date.now() - data.startedAt < MIN_FILL_MS) {
    return json({ error: 'Das ging sehr schnell – bitte sende das Formular noch einmal.' }, 422)
  }
  if (data.topic !== 'konfiguration' && !data.message) {
    return json({ error: 'Bitte schreib uns eine Nachricht.', field: 'message' }, 422)
  }

  const payload = await getPayloadClient()
  let saved: SavedConfiguration | undefined
  if (data.topic === 'konfiguration') {
    const result = await saveConfiguration(payload, data.product, data.selection)
    if (!result.ok) return json({ error: result.errors.join(' '), errors: result.errors }, result.status)
    saved = result.saved
  }

  const inquiry = await payload.create({
    collection: 'inquiries',
    data: {
      topic: data.topic,
      status: 'neu',
      name: data.name,
      email: data.email,
      phone: data.phone,
      organisation: data.organisation,
      message: data.message,
      configuration: saved?.id,
      consentAt: new Date().toISOString(),
      sourcePath: data.sourcePath,
    },
  })

  // E-Mails nach dem Antworten versenden – die Anfrage ist bereits gespeichert
  after(async () => {
    try {
      const settings = await payload.findGlobal({ slug: 'settings' })
      const brand = settings.brandName || 'Schaftböller Ebner'
      const topicLabel = INQUIRY_TOPICS.find((t) => t.value === data.topic)?.label ?? data.topic
      const configuration = saved
        ? {
            code: saved.code,
            productName: saved.productName,
            quote: saved.quote,
            url: `${SITE_URL}/konfigurator/${saved.code}`,
            pdfUrl: `${SITE_URL}/konfigurator/${saved.code}/pdf`,
          }
        : undefined
      const mailData = {
        topicLabel,
        name: data.name,
        email: data.email,
        phone: data.phone,
        organisation: data.organisation,
        message: data.message,
        configuration,
        adminUrl: `${SITE_URL}/admin/collections/inquiries/${inquiry.id}`,
        showPrices: settings.showPrices !== false,
      }

      let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined
      if (saved) {
        try {
          const loaded = await loadConfigurable(payload, data.product)
          if (loaded) {
            const png = await renderBoellerPng(visualStateFrom(loaded.catalog, saved.selection), 1200)
            const pdf = await renderConfigurationPdf({
              code: saved.code,
              productName: saved.productName,
              createdAt: new Date().toISOString(),
              quote: saved.quote,
              showPrices: true,
              settings,
              url: configuration!.url,
              illustration: png,
            })
            attachments = [{ filename: `Konfiguration-${saved.code}.pdf`, content: pdf, contentType: 'application/pdf' }]
          }
        } catch (err) {
          payload.logger.error({ err }, 'PDF für Anfrage konnte nicht erzeugt werden')
        }
      }

      const recipient = settings.inquiryRecipient || settings.email || process.env.INQUIRY_FALLBACK_EMAIL
      if (recipient) {
        const owner = ownerMail(mailData)
        await payload.sendEmail({ to: recipient, replyTo: data.email, subject: owner.subject, html: owner.html, text: owner.text, attachments })
      } else {
        payload.logger.warn('Keine Empfängeradresse für Anfragen hinterlegt (Einstellungen → Anfragen & Preise).')
      }
      const customer = customerMail(mailData, brand)
      await payload.sendEmail({
        to: data.email,
        replyTo: recipient || undefined,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
      })
    } catch (err) {
      payload.logger.error({ err }, 'E-Mail-Versand für Anfrage fehlgeschlagen')
    }
  })

  return json({ ok: true, code: saved?.code }, 201)
}
