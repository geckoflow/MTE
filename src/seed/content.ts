import { richText } from './richtext'

/**
 * Startinhalte der Website (aus dem Konzept, Texte von David Ebner lektoriert).
 * Preise sind Beispielwerte am Marktniveau und müssen vor dem Go-live ersetzt werden.
 */

export const IMAGES = {
  nussholz: { file: 'nussholz.webp', alt: 'Makroaufnahme von geöltem Nussholz' },
  detail: { file: 'detail-edelstahl.webp', alt: 'Detail: Übergang von Nussholz zu poliertem Edelstahl' },
  werkstatt: { file: 'werkstatt.webp', alt: 'Handwerker hobelt ein Holzbrett in der Werkstatt' },
  schnitzerei: { file: 'schnitzerei.webp', alt: 'Ornamentale Schnitzerei in Holz' },
  schnitzen: { file: 'schnitzen.webp', alt: 'Hände beim Schnitzen mit dem Hohleisen' },
  lederriemen: { file: 'lederriemen.webp', alt: 'Handgenähter Lederriemen' },
  lederhandwerk: { file: 'lederhandwerk.webp', alt: 'Handwerker arbeitet an einem Lederriemen' },
} as const
export type ImageKey = keyof typeof IMAGES

export const settings = {
  brandName: 'Schaftböller Ebner',
  contactPerson: 'David Ebner',
  city: 'Oberalm',
  region: 'Salzburg',
  openingNote: 'Besuche in der Werkstatt nach Terminvereinbarung.',
  showPrices: true,
  vatMode: 'regel' as const,
  vatRate: 20,
  leadTimeNote: 'Fertigung auf Bestellung, Lieferzeit nach Vereinbarung.',
  inquiryNote: 'Die Anfrage ist unverbindlich. Wir melden uns mit einem Angebot und einem Liefertermin.',
  introEnabled: true,
  introTagline: 'Handwerk mit Tradition',
  previewBanner: true,
  footerNote: 'Handgefertigte Schaftböller aus Oberalm, Salzburg.',
}

export const homepage = (img: Record<ImageKey, number>) => ({
  hero: {
    eyebrow: 'Handwerk mit Tradition · Oberalm, Salzburg',
    lines: [
      { text: 'Tradition.', outline: false },
      { text: 'Handwerk.', outline: false },
      { text: 'Charakter.', outline: true },
    ],
    lead: 'Handgefertigte Schaftböller aus regionalem Nussholz und Edelstahl. Nach historischem Vorbild gebaut, jedes Stück ein Unikat.',
    primaryLabel: 'Schaftböller entdecken',
    primaryHref: '/schaftboeller',
    secondaryLabel: 'Jetzt konfigurieren',
    secondaryHref: '/konfigurator',
    image: img.nussholz,
    facts: [{ text: '20 mm Edelstahl' }, { text: 'Regionales Nussholz' }, { text: 'Handgefertigt in Oberalm' }],
  },
  marquee: ['Tradition', 'Handwerk', 'Charakter', 'Nussholz', 'Edelstahl', 'Oberalm'].map((word) => ({ word })),
  manufaktur: {
    eyebrow: '01 — Die Manufaktur',
    heading: 'Handgefertigt in Oberalm,',
    headingAccent: 'Salzburg.',
    intro: 'Traditionelles Handwerk, ausgewählte Materialien und Liebe zum Detail – dafür steht Schaftböller Ebner.',
    body: richText([
      'Unsere Schaftböller orientieren sich an den bekannten, früher in Berchtesgaden gefertigten Stangassinger-Schaftböllern. Wir bewahren die traditionelle Bauweise so originalgetreu wie möglich und setzen auf dieselben Bauteile und Zulieferer wie damals – um die überlieferte Tradition und den ursprünglichen Charakter dieser Schaftböller weiterzuführen.',
      'In unserer Werkstatt im Salzburger Land verbinden wir traditionelle Handwerkskunst mit präziser Verarbeitung. Jeder Schaft entsteht aus ausgewähltem Nussholz aus der Region, hochwertige Edelstahlkomponenten und sorgfältig gearbeitete Details ergänzen das natürliche Erscheinungsbild.',
    ]),
    quote: 'Jedes Stück ist ein Unikat – gefertigt mit Sorgfalt, Erfahrung und Leidenschaft für das Handwerk.',
    images: [img.werkstatt, img.detail],
  },
  quality: {
    eyebrow: 'Qualität',
    heading: 'Qualität, die man',
    headingAccent: 'sieht und spürt.',
    lead: 'Was einen Schaftböller von Schaftböller Ebner ausmacht – in vier Punkten.',
    items: [
      {
        title: 'Regionales Nussholz',
        text: 'Jeder Baum stammt von Bauern aus der Umgebung und lagert jahrelang zum Trocknen, bevor daraus ein Schaft wird – mit charaktervoller Maserung und sorgfältig geölter Oberfläche.',
      },
      { title: 'Rostfreier Edelstahl', text: 'Präzise verarbeitete Metallkomponenten aus rostfreiem Edelstahl, abgestimmt auf die jeweilige Ausführung.' },
      { title: 'Handwerkliche Details', text: 'Sorgfältige Verarbeitung bis ins Kleinste und ein stimmiges Gesamtbild aus Holz, Metall und Leder.' },
      {
        title: 'Individuelle Gestaltung',
        text: 'Auf Wunsch mit persönlicher Namensbeschriftung und ausgewählter Kerbschnitzerei. Dein Böller, dein Unikat.',
      },
    ],
  },
  contrast: {
    lineOne: 'Tradition bewahren.',
    lineTwo: 'Qualität weiterdenken.',
    leftLabel: 'Tradition',
    leftText:
      'Tradition ist für uns mehr als ein Versprechen. Sie ist die Grundlage unserer Arbeit. Wir orientieren uns an bewährten Formen und an der überlieferten Handwerkskunst des Schaftböllerbaus.',
    rightLabel: 'Qualität',
    rightText:
      'Zugleich legen wir Wert auf sorgfältige Fertigung, nachvollziehbare Herkunft der Materialien, saubere Verarbeitung und eine hochwertige Präsentation – bis zum letzten Detail.',
  },
  products: {
    eyebrow: '02 — Schaftböller',
    heading: 'Unsere',
    headingAccent: 'Schaftböller.',
    lead: 'Ein Grundmodell nach historischem Vorbild – mit Holzbild, Riemen, Beschriftung, Kerbschnitzerei und Zubehör machst du es zu deinem eigenen Stück.',
  },
  configurator: {
    eyebrow: '03 — Konfigurator',
    heading: 'Dein',
    headingAccent: 'Unikat.',
    lead: 'In fünf Schritten zu deinem persönlichen Schaftböller. Vorschau und Preis aktualisieren sich bei jeder Auswahl – am Ende fragst du unverbindlich an oder teilst deine Konfiguration per Link.',
  },
  unikat: {
    eyebrow: 'Dein persönliches Unikat',
    heading: 'Mehr als ein handgefertigtes Produkt.',
    text: 'Durch individuelle Gestaltung entsteht ein persönliches Stück mit eigenem Charakter. Ob Namensbeschriftung, Kerbschnitzerei oder besondere dekorative Details – wir beraten dich gerne zu den Gestaltungsmöglichkeiten.',
    image: img.lederhandwerk,
  },
  contact: {
    eyebrow: 'Persönlich. Regional. Mit Leidenschaft gefertigt.',
    heading: 'Lass uns',
    headingAccent: 'reden.',
    lead: 'Du hast Fragen zu unseren Schaftböllern oder möchtest dich zu individuellen Gestaltungsmöglichkeiten beraten lassen? Wir freuen uns darauf, von dir zu hören.',
  },
})

export const craft = (img: Record<ImageKey, number>) => ({
  eyebrow: '04 — Handwerk & Tradition',
  heading: 'Vom Baum',
  headingAccent: 'zum Böller.',
  lead: 'Herkunft, Material und Handarbeit – nachvollziehbar vom Nussbaum aus der Nachbarschaft bis zur Übergabe in der Werkstatt.',
  steps: [
    { title: 'Der Baum', text: 'Nussbäume von Bauern aus der Umgebung von Oberalm.' },
    { title: 'Die Zeit', text: 'Jahrelange Lagerung, damit das Holz ruhig und stabil wird.', image: img.nussholz },
    { title: 'Der Schaft', text: 'Von Hand gefertigt, geschliffen und geölt.', image: img.schnitzen },
    { title: 'Das Metall', text: 'Edelstahlkomponenten, präzise verarbeitet und eingepasst.', image: img.detail },
    { title: 'Die Übergabe', text: 'Endkontrolle und persönliche Übergabe in der Werkstatt.' },
  ],
  story: {
    heading: 'Tradition aus',
    headingAccent: 'Berchtesgaden.',
    body: richText([
      'Unsere Schaftböller orientieren sich an den bekannten Stangassinger-Schaftböllern, die früher in Berchtesgaden gefertigt wurden. Wir fertigen nach historischem Vorbild und setzen dabei auf dieselben Bauteile und Zulieferer wie damals.',
      'So bleibt der ursprüngliche Charakter erhalten: die markante Form des Schafts, das Zusammenspiel von Holz und Metall und die Verarbeitung, die ein Schaftböller-Leben lang hält.',
    ]),
    image: img.werkstatt,
  },
  materials: [
    { title: 'Nussholz', text: 'Aus der Region, jahrelang getrocknet, von Hand geölt. Jede Maserung ist einzigartig.', image: img.nussholz },
    { title: 'Edelstahl', text: 'Rostfreie Komponenten, präzise verarbeitet – entsprechend der jeweiligen Ausführung.', image: img.detail },
    { title: 'Leder', text: 'Robuster Riemen aus Leder, sorgfältig vernäht. Beim Schaftböller inklusive.', image: img.lederriemen },
  ],
})

type AccessorySeed = {
  key: string
  name: string
  tagline: string
  price: number
  illustration?: 'staender' | 'hammer' | 'ladestock'
  image?: ImageKey
  priceNote?: string
}

export const accessories: AccessorySeed[] = [
  { key: 'hammer', name: 'Hammer', tagline: 'Ladezubehör, passend zum Schaftböller.', price: 45, illustration: 'hammer' },
  { key: 'ladestock', name: 'Ladestock', tagline: 'Ladezubehör, passend zum Kaliber.', price: 35, illustration: 'ladestock' },
  { key: 'wandhalterung', name: 'Wandhalterung', tagline: 'Präsentiert deinen Schaftböller zu Hause an der Wand.', price: 140 },
  { key: 'standhalterung', name: 'Standhalterung', tagline: 'Stabiler Stand aus Holz, passend zum Schaft.', price: 150, illustration: 'staender' },
  { key: 'koffer', name: 'Schaftböller-Koffer', tagline: 'Für sicheren Transport und Aufbewahrung.', price: 490 },
  {
    key: 'lederriemen',
    name: 'Lederriemen',
    tagline: 'Handgenähter Riemen aus Leder – beim Schaftböller inklusive, auch einzeln erhältlich.',
    price: 85,
    image: 'lederriemen',
    priceNote: 'beim Schaftböller inklusive',
  },
]

export const personalisations = [
  {
    name: 'Kerbschnitzerei',
    tagline: 'Ausgewählte Motive, von Hand in den Schaft geschnitzt.',
    price: 120,
    priceFrom: true,
    image: 'schnitzerei' as ImageKey,
  },
  {
    name: 'Namensbeschriftung',
    tagline: 'Dein Name, dein Verein oder ein Datum – sauber in den Schaft eingearbeitet.',
    price: 60,
  },
]

export const mainProduct = (img: Record<ImageKey, number>, accessoryIds: Record<string, number>) => ({
  name: 'Schaftböller Klassik',
  slug: 'klassik-20',
  type: 'schaftboeller' as const,
  tagline: 'Lauf 20 mm aus rostfreiem Edelstahl, Schaft aus regionalem Nussholz, Lederriemen inklusive.',
  description: richText([
    'Unser Grundmodell nach historischem Vorbild: ein Schaftböller in der Tradition der Berchtesgadener Stangassinger-Böller, gefertigt in unserer Werkstatt in Oberalm.',
    'Der Schaft entsteht aus regionalem Nussholz, das jahrelang getrocknet und anschließend von Hand bearbeitet und geölt wird. Lauf und Metallteile sind aus rostfreiem Edelstahl.',
    { p: [{ text: 'Mach ihn zu deinem Unikat: ', bold: true }, 'Holzbild, Riemen, Namensbeschriftung, Kerbschnitzerei und Zubehör wählst du im Konfigurator.'] },
  ]),
  price: 2490,
  priceFrom: true,
  available: true,
  featured: true,
  images: [img.nussholz, img.detail],
  specs: [
    { label: 'Lauf', value: '20 mm, rostfreier Edelstahl' },
    { label: 'Schaft', value: 'Regionales Nussholz, geölt' },
    { label: 'Bauweise', value: 'Nach historischem Vorbild' },
    { label: 'Lederriemen', value: 'inklusive' },
    { label: 'Beschuss', value: 'Österreich, Deutschland optional' },
  ],
  included: [{ item: 'Lederriemen' }, { item: 'Beschussbestätigung' }, { item: 'Pflegeanleitung' }],
  leadTime: 'nach Vereinbarung',
  configurable: true,
  baseLabel: 'Grundpreis',
  sortOrder: 10,
  optionGroups: [
    {
      key: 'beschuss',
      label: 'Beschuss',
      step: 'modell',
      kind: 'single',
      required: true,
      help: 'Welcher Beschuss für dich nötig ist, klären wir gerne persönlich.',
      options: [
        { key: 'at', label: 'Österreich', description: 'Standard', price: 0, isDefault: true, visual: 'beschuss' },
        { key: 'de', label: 'Deutschland', description: 'deutsches Beschusszeichen', price: 50, visual: 'beschuss' },
      ],
    },
    {
      key: 'holz',
      label: 'Nussholz',
      step: 'schaft',
      kind: 'single',
      required: true,
      help: 'Jeder Schaft ist ein Einzelstück – das gewählte Holzbild ist eine Richtung, die Maserung bleibt Natur.',
      options: [
        { key: 'natur', label: 'Nuss natur', description: 'geölt, warmer Ton', price: 0, isDefault: true, visual: 'holz-natur' },
        { key: 'dunkel', label: 'Nuss dunkel', description: 'geölt, tiefer Ton', price: 0, visual: 'holz-dunkel' },
        { key: 'maser', label: 'Ausgesuchte Maserung', description: 'besonders lebhaftes Holzbild', price: 150, visual: 'holz-maser' },
      ],
    },
    {
      key: 'riemen',
      label: 'Lederriemen',
      step: 'schaft',
      kind: 'single',
      required: true,
      options: [
        { key: 'braun', label: 'Braun', price: 0, isDefault: true, visual: 'riemen', color: '#6e4024' },
        { key: 'rot', label: 'Rot', description: 'traditionell', price: 0, visual: 'riemen', color: '#8c1d22' },
        { key: 'schwarz', label: 'Schwarz', price: 0, visual: 'riemen', color: '#1d1d1f' },
      ],
    },
    {
      key: 'beschriftung',
      label: 'Namensbeschriftung',
      step: 'gestaltung',
      kind: 'text',
      required: false,
      help: 'Name, Verein oder Datum – sauber in den Schaft eingearbeitet.',
      text: {
        price: 60,
        maxLength: 24,
        placeholder: 'z. B. Josef Ebner 1926',
        fonts: [
          { key: 'antiqua', label: 'Antiqua', font: 'antiqua' },
          { key: 'fraktur', label: 'Fraktur', font: 'fraktur' },
          { key: 'schreibschrift', label: 'Schreibschrift', font: 'schreibschrift' },
        ],
      },
    },
    {
      key: 'schnitzerei',
      label: 'Kerbschnitzerei',
      step: 'gestaltung',
      kind: 'single',
      required: true,
      options: [
        { key: 'keine', label: 'Keine', price: 0, isDefault: true, visual: 'none' },
        { key: 'rosette', label: 'Rosette', description: 'klassischer Kerbschnitt', price: 120, visual: 'motiv-rosette' },
        { key: 'edelweiss', label: 'Edelweiß', description: 'alpines Motiv', price: 180, visual: 'motiv-edelweiss' },
        { key: 'eichenlaub', label: 'Eichenlaub', description: 'mit Eichel', price: 240, visual: 'motiv-eichenlaub' },
      ],
    },
    {
      key: 'zubehoer',
      label: 'Zubehör',
      step: 'zubehoer',
      kind: 'accessories',
      required: false,
      help: 'Ergänze passendes Zubehör. Die Standhalterung siehst du direkt in der Vorschau.',
      accessories: ['hammer', 'ladestock', 'wandhalterung', 'standhalterung', 'koffer'].map((k) => accessoryIds[k]),
    },
  ],
})

export const faqs = [
  {
    question: 'Wer darf einen Schaftböller kaufen?',
    answer:
      'Schaftböller geben wir ausschließlich an volljährige Personen ab. Welche Voraussetzungen im Einzelfall gelten – etwa zum Beschuss oder zum Einsatz in Deutschland – besprechen wir vor der Bestellung persönlich mit dir.',
    category: 'recht',
    showOnHome: true,
  },
  {
    question: 'Wie lange dauert die Fertigung?',
    answer:
      'Jeder Schaftböller wird auf Bestellung gefertigt. Die Lieferzeit hängt von Ausführung und Personalisierung ab – mit dem Angebot nennen wir dir einen verbindlichen Termin.',
    category: 'kauf',
    showOnHome: true,
  },
  {
    question: 'Welche Personalisierungen sind möglich?',
    answer:
      'Namensbeschriftung und ausgewählte Kerbschnitzereien wählst du direkt im Konfigurator. Andere Wünsche besprechen wir gerne persönlich – schreib uns einfach über das Kontaktformular.',
    category: 'personalisierung',
    showOnHome: true,
  },
  {
    question: 'Wie pflege ich Nussholz und Edelstahl?',
    answer:
      'Geöltes Nussholz von Zeit zu Zeit mit Holzöl nachbehandeln. Edelstahlteile nach dem Schießen gründlich reinigen und trocknen. Eine ausführliche Pflegeanleitung liegt jedem Schaftböller bei.',
    category: 'pflege',
    showOnHome: false,
  },
  {
    question: 'Kann ich meinen Schaftböller abholen?',
    answer: 'Ja – die persönliche Übergabe in unserer Werkstatt in Oberalm ist nach Terminvereinbarung möglich.',
    category: 'kauf',
    showOnHome: true,
  },
  {
    question: 'Gibt es Angebote für Schützenvereine?',
    answer:
      'Für Vereine und Sammelbestellungen machen wir gerne ein individuelles Angebot – auch mit einheitlicher Beschriftung. Wähle im Kontaktformular „Anfrage für einen Verein“.',
    category: 'allgemein',
    showOnHome: false,
  },
  {
    question: 'Ist die Anfrage über den Konfigurator verbindlich?',
    answer:
      'Nein. Deine Anfrage ist unverbindlich. Wir melden uns mit einem Angebot und einem Liefertermin – erst mit deiner Zusage wird daraus eine Bestellung.',
    category: 'kauf',
    showOnHome: false,
  },
]

export const legalPages = [
  {
    title: 'Impressum',
    slug: 'impressum',
    content: richText([
      { p: [{ text: 'Hinweis: Vorlage – vor der Veröffentlichung vervollständigen und rechtlich prüfen lassen.', bold: true }] },
      { h2: 'Angaben gemäß § 5 ECG, § 14 UGB und § 25 MedienG' },
      '[Firmenwortlaut / Name des Unternehmens]',
      'Schaftböller Ebner – [Rechtsform]',
      '[Straße Hausnummer], [PLZ] Oberalm, Österreich',
      { h3: 'Kontakt' },
      'Telefon: [Telefonnummer]',
      'E-Mail: [E-Mail-Adresse]',
      { h3: 'Unternehmensdaten' },
      { ul: ['Unternehmensgegenstand: [z. B. Herstellung von Schaftböllern]', 'UID-Nummer: [ATU…]', 'Firmenbuchnummer / Firmenbuchgericht: [falls eingetragen]', 'Gewerbebehörde: Bezirkshauptmannschaft Hallein', 'Kammerzugehörigkeit: Wirtschaftskammer Salzburg', 'Gewerbeordnung: www.ris.bka.gv.at'] },
      { h3: 'Offenlegung gemäß § 25 MedienG' },
      'Medieninhaber: [Name]. Grundlegende Richtung: Information über die Produkte und Leistungen von Schaftböller Ebner.',
      { h3: 'Haftung für Inhalte und Links' },
      'Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine Gewähr. Für Inhalte verlinkter externer Seiten sind ausschließlich deren Betreiber verantwortlich.',
      { h3: 'Bildnachweise' },
      '[Fotograf:innen / Quellen]',
    ]),
  },
  {
    title: 'Datenschutzerklärung',
    slug: 'datenschutz',
    content: richText([
      { p: [{ text: 'Hinweis: Vorlage – vor der Veröffentlichung vervollständigen und rechtlich prüfen lassen.', bold: true }] },
      { h2: '1. Verantwortlicher' },
      '[Firmenwortlaut], [Adresse], [E-Mail-Adresse]. Wir verarbeiten personenbezogene Daten ausschließlich auf Grundlage der Datenschutz-Grundverordnung (DSGVO) und des österreichischen Datenschutzgesetzes (DSG).',
      { h2: '2. Hosting und Server-Logfiles' },
      'Die Website wird bei [Hosting-Anbieter, Standort EU] betrieben. Beim Aufruf werden technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser) kurzzeitig in Server-Logfiles gespeichert, um den sicheren Betrieb zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Die Logfiles werden nach [14] Tagen gelöscht.',
      { h2: '3. Keine Cookies, keine Tracker' },
      'Diese Website setzt keine Cookies zu Werbe- oder Analysezwecken. Für das einmalige Logo-Intro wird im Speicher deines Browsers (sessionStorage) vermerkt, dass das Intro bereits gezeigt wurde; dieser Eintrag wird beim Schließen des Browsers gelöscht. Schriften werden von unserem eigenen Server geladen, es werden keine Daten an Google übertragen.',
      { h2: '4. Konfigurator' },
      'Konfigurationen werden ohne personenbezogene Daten gespeichert und erhalten einen Code (z. B. SE-7F3K-92QA), über den du sie wieder aufrufen und teilen kannst.',
      { h2: '5. Anfragen und Kontaktformular' },
      'Wenn du uns über das Kontaktformular oder den Konfigurator eine Anfrage sendest, verarbeiten wir deine Angaben (Name, E-Mail-Adresse, optional Telefonnummer, Verein und Nachricht sowie die gewählte Konfiguration), um deine Anfrage zu beantworten und ein Angebot zu erstellen (Art. 6 Abs. 1 lit. b DSGVO). Die Daten werden per E-Mail an uns übermittelt und in unserem Redaktionssystem gespeichert. Wir löschen sie, sobald sie für die Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen, spätestens jedoch nach [3] Jahren.',
      { h2: '6. Statistik' },
      '[Nur falls aktiviert:] Wir nutzen Plausible Analytics zur cookielosen, anonymisierten Reichweitenmessung. Es werden keine Cookies gesetzt und keine personenbezogenen Profile erstellt (Art. 6 Abs. 1 lit. f DSGVO).',
      { h2: '7. Deine Rechte' },
      'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wende dich dazu an [E-Mail-Adresse]. Wenn du der Ansicht bist, dass die Verarbeitung deiner Daten gegen das Datenschutzrecht verstößt, kannst du dich bei der Österreichischen Datenschutzbehörde (www.dsb.gv.at) beschweren.',
    ]),
  },
]
