# Go-live-Checkliste Phase 1

## Inhalte (David)
- [ ] Echte **Preise und Lieferumfänge** eingetragen. Die Startinhalte enthalten Beispielpreise am Marktniveau.
- [ ] **Konfigurator-Optionen** geprüft: Holz, Riemen, Beschriftung (Schriften, Zeichenzahl), Schnitzmotive, Zubehör, Beschuss AT/DE
- [ ] **Eigene Fotos** hochgeladen, alle Platzhalter ersetzt (Medien → Filter „Platzhalterbild“)
- [ ] Texte freigegeben (Startseite, Handwerk, FAQ). Aussagen zu Stangassinger-Tradition und Zulieferern sind belegbar
- [ ] **Einstellungen:** Kontaktdaten, Adresse, Telefon, öffentliche E-Mail, **Empfänger für Anfragen**, Social-Media-Profile
- [ ] **Umsatzsteuer:** Regelbesteuerung oder Kleinunternehmer korrekt eingestellt
- [ ] **Vorschau-Hinweis ausschalten** (Einstellungen → Website)
- [ ] Logo als Vektor (SVG) erhalten, ggf. Header-Logo und Favicon ersetzen (`public/brand/`, `src/app/icon.png`)

## Recht
- [ ] **Impressum** vollständig: Firmenwortlaut, Rechtsform, Anschrift, UID, Gewerbe, Behörde, Kammer
- [ ] **Datenschutzerklärung** vervollständigt (Hoster, Speicherfristen, Statistik ja/nein) und geprüft
- [ ] Rechtliche Einordnung des Schaftböllers mit BH Hallein, WKO und Beschussamt besprochen. Erst danach Texte zu Kauf und Versand freigeben (FAQ „Wer darf einen Schaftböller kaufen?“)
- [ ] Lizenz der Widder-Grafik geklärt (Canva)

## Technik (gecko-flow)
- [ ] Domain registriert, DNS gesetzt, `SERVER_URL` korrekt, nginx mit Zertifikat leitet auf Port 84 weiter (inkl. `client_max_body_size 25m`)
- [ ] GitHub: Secrets `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER` im Environment `production`; erster Deploy grün
- [ ] Server: `/htdocs/mte/.env.production` angelegt (`chmod 600`), `/htdocs/mte` wird **nicht** vom Webserver ausgeliefert, Port 84 von außen nicht erreichbar (`APP_BIND=127.0.0.1`, wenn nginx lokal läuft)
- [ ] `PAYLOAD_SECRET` gesetzt (erzeugt der erste Deploy) und zusätzlich sicher abgelegt
- [ ] **SMTP** eingerichtet, SPF/DKIM/DMARC für die Absender-Domain gesetzt, Testanfrage kommt an (inkl. PDF) und die Bestätigung beim Kunden ebenso
- [ ] **Startpasswort des Administrators geändert**, `SEED_ON_INIT=false`, persönliche Benutzerkonten angelegt
- [ ] Backup-Cron aktiv (`/usr/local/bin/mte-backup`), externe Kopie eingerichtet, Wiederherstellung einmal getestet
- [ ] Uptime-Monitoring auf `/api/health`
- [ ] `SITE_NOINDEX` **nicht** gesetzt (nur auf Staging)
- [ ] Google Search Console: Domain bestätigen, Sitemap `https://<domain>/sitemap.xml` einreichen
- [ ] Google-Unternehmensprofil angelegt bzw. aktualisiert
- [ ] Lighthouse mobil: Performance, Barrierefreiheit, Best Practices und SEO ≥ 95 (mit echten Fotos erneut prüfen)
- [ ] Optional: Plausible eingerichtet (`PLAUSIBLE_DOMAIN` in `.env.production` und als Repository-Variable für den Image-Build, Datenschutzerklärung angepasst)
