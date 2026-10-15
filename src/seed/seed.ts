import fs from 'fs/promises'
import path from 'path'
import type { Payload } from 'payload'

import * as content from './content'

const IMAGES_DIR = process.env.SEED_IMAGES_DIR || path.join(process.cwd(), 'src', 'seed', 'images')

type SeedOptions = { onlyIfEmpty?: boolean }

async function ensureAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) return
  const { totalDocs } = await payload.count({ collection: 'users', where: { email: { equals: email } } })
  if (totalDocs > 0) return
  await payload.create({
    collection: 'users',
    data: { email, password, name: 'Administrator', roles: ['admin'] },
  })
  payload.logger.info(`Seed: Admin-Benutzer ${email} angelegt.`)
}

async function uploadImages(payload: Payload): Promise<Record<content.ImageKey, number>> {
  const ids = {} as Record<content.ImageKey, number>
  for (const [key, image] of Object.entries(content.IMAGES) as [content.ImageKey, (typeof content.IMAGES)[content.ImageKey]][]) {
    const existing = await payload.find({ collection: 'media', where: { filename: { equals: image.file } }, limit: 1 })
    if (existing.docs[0]) {
      ids[key] = existing.docs[0].id as number
      continue
    }
    const data = await fs.readFile(path.join(IMAGES_DIR, image.file))
    const doc = await payload.create({
      collection: 'media',
      data: { alt: image.alt, placeholder: true, caption: 'Platzhalter' },
      file: { data, mimetype: 'image/webp', name: image.file, size: data.byteLength },
    })
    ids[key] = doc.id as number
  }
  return ids
}

/**
 * Legt Startinhalte an (Produkte, Optionen, Texte, FAQ, Rechtstext-Vorlagen).
 * Idempotent: Mit `onlyIfEmpty` passiert nichts, sobald Produkte existieren.
 */
export async function seed(payload: Payload, { onlyIfEmpty = false }: SeedOptions = {}) {
  await ensureAdmin(payload)

  const { totalDocs: productCount } = await payload.count({ collection: 'products' })
  if (onlyIfEmpty && productCount > 0) {
    payload.logger.info('Seed: Inhalte vorhanden – übersprungen.')
    return
  }

  payload.logger.info('Seed: lege Startinhalte an …')
  const img = await uploadImages(payload)

  const accessoryIds: Record<string, number> = {}
  for (const [i, a] of content.accessories.entries()) {
    const doc = await payload.create({
      collection: 'products',
      data: {
        name: a.name,
        slug: a.key,
        type: 'zubehoer',
        tagline: a.tagline,
        price: a.price,
        priceNote: a.priceNote,
        available: true,
        illustration: a.illustration ?? 'none',
        images: a.image ? [img[a.image]] : [],
        sortOrder: 100 + i * 10,
      },
    })
    accessoryIds[a.key] = doc.id as number
  }

  for (const [i, p] of content.personalisations.entries()) {
    await payload.create({
      collection: 'products',
      data: {
        name: p.name,
        type: 'personalisierung',
        tagline: p.tagline,
        price: p.price,
        priceFrom: p.priceFrom ?? false,
        images: p.image ? [img[p.image]] : [],
        sortOrder: 50 + i * 10,
      },
    })
  }

  await payload.create({ collection: 'products', data: content.mainProduct(img, accessoryIds) as never })

  for (const [i, faq] of content.faqs.entries()) {
    await payload.create({ collection: 'faqs', data: { ...faq, sortOrder: (i + 1) * 10 } as never })
  }

  for (const page of content.legalPages) {
    const { totalDocs } = await payload.count({ collection: 'legal-pages', where: { slug: { equals: page.slug } } })
    if (!totalDocs) await payload.create({ collection: 'legal-pages', data: page })
  }

  await payload.updateGlobal({ slug: 'settings', data: content.settings })
  await payload.updateGlobal({ slug: 'homepage', data: content.homepage(img) as never })
  await payload.updateGlobal({ slug: 'craft', data: content.craft(img) as never })

  payload.logger.info('Seed: fertig.')
}
