import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { de } from '@payloadcms/translations/languages/de'
import fs from 'fs'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Configurations } from './collections/Configurations'
import { Faqs } from './collections/Faqs'
import { Gallery } from './collections/Gallery'
import { Inquiries } from './collections/Inquiries'
import { LegalPages } from './collections/LegalPages'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { Craft } from './globals/Craft'
import { Homepage } from './globals/Homepage'
import { Settings } from './globals/Settings'
import { SERVER_URL } from './lib/env'
import { migrations } from './migrations'
import { seed } from './seed/seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = SERVER_URL
const isProduction = process.env.NODE_ENV === 'production'

// Lokale SQLite-Datei, z. B. DATABASE_URL=file:/app/data/schaftboeller.db (Standard: ./data/schaftboeller.db)
const databaseUrl = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), 'data/schaftboeller.db')}`
if (databaseUrl.startsWith('file:')) {
  fs.mkdirSync(path.dirname(path.resolve(databaseUrl.slice('file:'.length))), { recursive: true })
}

const plugins: Plugin[] = [
  seoPlugin({
    collections: ['products', 'legal-pages'],
    globals: ['homepage', 'craft'],
    uploadsCollection: 'media',
    generateTitle: ({ doc }) => {
      const d = doc as { name?: string; title?: string }
      return d?.name || d?.title ? `${d.name ?? d.title} | Schaftböller Ebner` : 'Schaftböller Ebner'
    },
    generateDescription: ({ doc }) => (doc as { tagline?: string })?.tagline ?? '',
  }),
]

// Optional: Medien in S3-kompatiblem Speicher (EU) statt auf der lokalen Festplatte
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'eu-central-1',
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  )
}

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    dateFormat: 'dd.MM.yyyy, HH:mm',
    meta: {
      titleSuffix: ' – Schaftböller Ebner',
      icons: [{ rel: 'icon', type: 'image/png', url: '/icon.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Logo#Icon',
      },
    },
  },
  i18n: {
    supportedLanguages: { de },
    fallbackLanguage: 'de',
  },
  collections: [Products, Configurations, Inquiries, Faqs, Gallery, LegalPages, Media, Users],
  globals: [Homepage, Craft, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  graphQL: { disable: true },
  cors: [serverURL],
  csrf: [serverURL],
  upload: { limits: { fileSize: 25_000_000 } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: databaseUrl },
    // WAL: Lesen blockiert nicht während des Schreibens; bei Sperren bis zu 5 s warten statt Fehler
    wal: true,
    busyTimeout: 5000,
    // IDs gelöschter Datensätze (z. B. Anfragen) werden nie neu vergeben
    autoIncrement: true,
    // Lokal: Schema automatisch abgleichen. Produktion: versionierte Migrationen beim Start.
    push: !isProduction && process.env.PAYLOAD_DB_PUSH !== 'false',
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.MAIL_FROM_ADDRESS || 'website@schaftboeller-ebner.at',
        defaultFromName: process.env.MAIL_FROM_NAME || 'Schaftböller Ebner',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        },
      })
    : undefined,
  sharp,
  plugins,
  onInit: async (payload) => {
    if (process.env.SEED_ON_INIT === 'true') {
      await seed(payload, { onlyIfEmpty: true })
    }
  },
})
