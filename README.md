# Schaftböller Ebner – Website

Website der Manufaktur **Schaftböller Ebner** (Oberalm, Salzburg). Sie präsentiert die Manufaktur, bietet einen **Schaftböller-Konfigurator mit Anfrage** und lässt sich ohne Umbau um einen Shop erweitern (Phase 2).

Grundlage ist das [Website-Konzept](docs/konzept/website-konzept.md). Das ursprüngliche Briefing (Mail von David Ebner vom 14.10.2026) liegt unter [`docs/briefing/`](docs/briefing/2026-10-14_mail-david-ebner/README.md), der Design-Prototyp unter [`prototype/`](prototype/index.html).

## Umfang Phase 1

| Bereich | Umsetzung |
|---|---|
| **Seiten** | Startseite mit Logo-Intro, Schaftböller (Liste und Detail), Zubehör und Personalisierung (Liste und Detail), Konfigurator, Handwerk & Tradition, Galerie, FAQ, Kontakt, Rechtstexte (Impressum, Datenschutz), 404 |
| **Konfigurator** | 5 Schritte mit Live-Vorschau: stilisierte SVG-Illustration oder, sobald Fotos hinterlegt sind, Foto-Ebenen. Dazu Live-Preis, Unverträglichkeiten, Auswahl in der URL, gespeicherte Konfiguration mit Code (`/konfigurator/SE-XXXX-XXXX`), PDF, Link-Vorschaubild für WhatsApp und Co., unverbindliche Anfrage |
| **Preise** | Eine Preis-Engine für Browser und Server; der Server rechnet verbindlich nach. Preis-Momentaufnahme pro Konfiguration, umschaltbar zwischen Regelbesteuerung und Kleinunternehmer, Preise auch ganz ausblendbar („Preis auf Anfrage“) |
| **Anfragen** | Kontaktformular und Konfigurator-Anfrage: Speicherung im CMS mit Status, Mail an Schaftböller Ebner (mit PDF) und Bestätigung an die anfragende Person. Spam-Schutz durch Honigtopf, Mindest-Ausfüllzeit, Rate-Limit und Herkunftsprüfung |
| **CMS** | Payload CMS mit deutscher Oberfläche. Pflegbar sind Produkte inkl. Konfigurator-Optionen, Bildern, Preisen und Regeln, Startseite, Handwerk-Seite, FAQ, Galerie, Rechtstexte und Einstellungen. Rollen „Administrator“ und „Redaktion“ |
| **SEO** | Metadaten, Open-Graph-Bilder, `sitemap.xml`, `robots.txt`, strukturierte Daten (LocalBusiness, Product, FAQPage, BreadcrumbList), SEO-Felder im CMS |
| **Datenschutz und Sicherheit** | Selbst gehostete Schriften, keine Cookies, keine Google-Dienste, optional cookielose Statistik (Plausible). Content-Security-Policy, Sicherheits-Header, Login-Sperre nach Fehlversuchen |
| **Barrierefreiheit** | Semantisches HTML, Tastaturbedienung (auch Konfigurator-Tabs), Fokus-Rahmen, `aria-live` für Preise, „reduzierte Bewegung“ |
| **Betrieb** | Docker-Image (Next.js standalone, läuft ohne Root-Rechte), Docker Compose mit SQLite-Datenbank im Volume und optionalem Caddy (HTTPS), automatische Migrationen beim Start, Health-Check, Backup-Skript, CI mit GitHub Actions |

## Technik

Next.js 16 (App Router), Payload CMS 3, SQLite (libSQL), TypeScript, Vitest, Playwright.

```
src/
  app/(frontend)/       Website (Seiten, API-Routen /api/preis, /api/konfiguration, /api/anfrage, /api/health)
  app/(payload)/        Admin-Oberfläche und REST-API von Payload (/admin, /api/…)
  collections/, globals/  CMS-Datenmodell
  components/           UI-Komponenten, Konfigurator
  lib/configurator/     Preis-Engine, Validierung, Codes, Illustration (isomorph, getestet)
  lib/render/           PDF und Rasterbilder (Open Graph)
  migrations/           Datenbank-Migrationen (SQLite)
  seed/                 Startinhalte (Beispielprodukte, Texte, FAQ, Rechtstext-Vorlagen)
tests/unit, tests/e2e   Vitest bzw. Playwright
docs/betrieb/           Betriebshandbuch, Redaktionsanleitung, Go-live-Checkliste
```

## Lokal entwickeln

Voraussetzungen: Node.js ≥ 22.12. Ein Datenbank-Server ist nicht nötig: Die SQLite-Datei `data/schaftboeller.db` entsteht beim ersten Start.

```bash
cp .env.example .env          # PAYLOAD_SECRET und SERVER_URL=http://localhost:3000 setzen
npm ci
npm run dev                   # http://localhost:3000 – Schema wird lokal automatisch abgeglichen
npm run seed                  # Startinhalte + Admin (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD) anlegen
```

Admin-Oberfläche: <http://localhost:3000/admin>. Ohne Seed-Admin legt der erste Aufruf den ersten Benutzer an, er wird automatisch Administrator.

Von vorne beginnen: Server stoppen und die Ordner `data/` (Datenbank) und `media/` (Uploads) löschen.

| Befehl | Zweck |
|---|---|
| `npm run lint` / `npm run typecheck` | ESLint, TypeScript |
| `npm run test:unit` | Unit-Tests (Preis-Engine, Validierung, Codes, Illustration) |
| `npm run test:e2e` | End-to-End-Tests gegen einen laufenden Server mit Startinhalten |
| `npm run generate:types` | `src/payload-types.ts` nach Änderungen am Datenmodell neu erzeugen |
| `npm run generate:importmap` | Admin-Import-Map nach neuen Admin-Komponenten neu erzeugen |
| `npm run migrate:create -- <name>` | Neue Migration nach Änderungen am Datenmodell (CI prüft das) |

## Betrieb

Siehe [Betriebshandbuch](docs/betrieb/betriebshandbuch.md). Kurzfassung:

```bash
cp .env.example .env.production   # Werte ausfüllen (PAYLOAD_SECRET, SERVER_URL, SMTP …)
docker compose --env-file .env.production --profile tls up -d --build
```

Vor dem Go-live: [Go-live-Checkliste](docs/betrieb/go-live-checkliste.md). Für David: [Redaktionsanleitung](docs/betrieb/redaktion.md).
