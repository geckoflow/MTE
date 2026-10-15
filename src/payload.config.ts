import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { de } from '@payloadcms/translations/languages/de'
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
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
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
