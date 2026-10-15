import 'server-only'

/* eslint-disable jsx-a11y/alt-text -- react-pdf <Image> kennt kein alt-Attribut */

import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import path from 'path'

import { formatEuro } from '@/lib/configurator/engine'
import type { Quote } from '@/lib/configurator/types'
import type { Setting } from '@/payload-types'

import { publicFile } from './assets'

const FONT_DIR = path.join(process.cwd(), 'public', 'fonts')
let registered = false
function registerFonts() {
  if (registered) return
  Font.register({
    family: 'Montserrat',
    fonts: [
      { src: path.join(FONT_DIR, 'montserrat-latin-800-normal.woff'), fontWeight: 800 },
      { src: path.join(FONT_DIR, 'montserrat-latin-800-italic.woff'), fontWeight: 800, fontStyle: 'italic' },
      { src: path.join(FONT_DIR, 'montserrat-latin-600-normal.woff'), fontWeight: 600 },
    ],
  })
  Font.register({
    family: 'Inter',
    fonts: [
      { src: path.join(FONT_DIR, 'inter-latin-400-normal.woff'), fontWeight: 400 },
      { src: path.join(FONT_DIR, 'inter-latin-600-normal.woff'), fontWeight: 600 },
    ],
  })
  Font.registerHyphenationCallback((word) => [word])
  registered = true
}

const s = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 10, color: '#111113', padding: 44, paddingBottom: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  logo: { width: 96 },
  meta: { textAlign: 'right', fontSize: 9, color: '#5d5d63', lineHeight: 1.5 },
  eyebrow: { fontFamily: 'Montserrat', fontWeight: 600, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#5d5d63' },
  title: { fontFamily: 'Montserrat', fontWeight: 800, fontSize: 24, textTransform: 'uppercase', marginTop: 6 },
  accent: { fontFamily: 'Montserrat', fontWeight: 800, fontStyle: 'italic', fontSize: 24, textTransform: 'uppercase', color: '#9a6a40' },
  code: { marginTop: 10, fontSize: 11, fontFamily: 'Montserrat', fontWeight: 600, letterSpacing: 1 },
  stage: { backgroundColor: '#141416', borderRadius: 4, marginTop: 14, marginBottom: 16, paddingVertical: 8, alignItems: 'center' },
  image: { width: '68%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5.5, borderBottomWidth: 0.5, borderBottomColor: '#d4d1cb' },
  label: { flex: 1, paddingRight: 12 },
  detail: { fontSize: 8.5, color: '#5d5d63', marginTop: 2 },
  amount: { width: 90, textAlign: 'right' },
  total: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  totalText: { fontFamily: 'Montserrat', fontWeight: 800, fontSize: 14, textTransform: 'uppercase' },
  note: { marginTop: 18, fontSize: 9, color: '#3a3a3f', lineHeight: 1.5 },
  footer: { position: 'absolute', left: 44, right: 44, bottom: 28, fontSize: 8, color: '#8d8d93', flexDirection: 'row', justifyContent: 'space-between' },
})

export async function renderConfigurationPdf(opts: {
  code: string
  productName: string
  createdAt: string
  quote: Quote
  showPrices: boolean
  settings: Setting
  url: string
  illustration: Buffer
}): Promise<Buffer> {
  registerFonts()
  const logo = await publicFile('brand/logo-schriftzug-schwarz.png')
  const { quote, settings, showPrices } = opts
  const date = new Date(opts.createdAt).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const contact = [settings.contactPerson, settings.phone, settings.email].filter(Boolean).join(' · ')
  const vatText =
    quote.vat.mode === 'kleinunternehmer'
      ? 'Umsatzsteuerbefreit (Kleinunternehmerregelung).'
      : `Alle Preise inkl. ${quote.vat.rate} % USt. (enthalten: ${formatEuro(quote.vat.includedCents)}).`

  const doc = (
    <Document title={`Konfiguration ${opts.code}`} author={settings.brandName || 'Schaftböller Ebner'} language="de-AT">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Image src={logo} style={s.logo} />
          <View style={s.meta}>
            <Text>{settings.brandName || 'Schaftböller Ebner'}</Text>
            <Text>{[settings.city || 'Oberalm', settings.region || 'Salzburg'].join(', ')}</Text>
            {contact ? <Text>{contact}</Text> : null}
          </View>
        </View>
        <Text style={s.eyebrow}>Deine Konfiguration · {date}</Text>
        <Text style={s.title}>
          {opts.productName} <Text style={s.accent}>Unikat.</Text>
        </Text>
        <Text style={s.code}>Code {opts.code}</Text>
        <View style={s.stage}>
          <Image src={opts.illustration} style={s.image} />
        </View>
        {quote.lines.map((line, i) => (
          <View style={s.row} key={i} wrap={false}>
            <View style={s.label}>
              <Text>{line.label}</Text>
              {line.detail ? <Text style={s.detail}>{line.detail}</Text> : null}
            </View>
            <Text style={s.amount}>{showPrices ? (line.amountCents ? formatEuro(line.amountCents) : 'inklusive') : ''}</Text>
          </View>
        ))}
        <View style={s.total}>
          <Text style={s.totalText}>Gesamt</Text>
          <Text style={s.totalText}>{showPrices ? formatEuro(quote.totalCents) : 'Preis auf Anfrage'}</Text>
        </View>
        <Text style={s.note}>
          {showPrices ? `${vatText} ` : ''}
          {settings.leadTimeNote || 'Fertigung auf Bestellung, Lieferzeit nach Vereinbarung.'} Diese Zusammenstellung ist unverbindlich und
          kein Angebot. Die Illustration ist schematisch, jedes Stück ist ein handgefertigtes Unikat. Online öffnen: {opts.url}
        </Text>
        <View style={s.footer} fixed>
          <Text>{settings.legalName || settings.brandName || 'Schaftböller Ebner'}</Text>
          <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
  return renderToBuffer(doc)
}
