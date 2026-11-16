# Betriebshandbuch

## Architektur

```mermaid
flowchart LR
  B[Browser] -->|HTTPS| C[Caddy<br/>TLS, gzip/zstd]
  C --> A[App-Container<br/>Next.js + Payload]
  A --> P[(SQLite-Datei<br/>Volume data)]
  A --> M[(Medien-Volume<br/>oder S3)]
  A --> S[SMTP<br/>Anfrage-Mails]
```

- **App:** ein Container (`node server.js`) mit Website, Admin (`/admin`) und API. Er läuft als Benutzer `nextjs` (uid 1001).
- **Datenbank:** SQLite (libSQL) als Datei `/app/data/schaftboeller.db` im Volume `data`, im WAL-Modus (daneben liegen `-wal` und `-shm`). Die Datei entsteht beim ersten Start, Migrationen (`src/migrations`) laufen beim Start automatisch (`prodMigrations`). Kein eigener Datenbank-Container.
- **Nur eine Instanz:** SQLite erlaubt einen Schreiber zur selben Zeit und liegt lokal im Volume. Die App deshalb nicht mehrfach parallel starten (keine Replikas). Für das Aufkommen der Manufaktur reicht das deutlich.
- **Medien:** Volume `/app/media`. Alternativ S3-kompatibler Speicher in der EU (`S3_*`-Variablen).
- **Health-Check:** `GET /api/health` → `{"ok":true}` (prüft CMS und Datenbank). Wird vom Docker-HEALTHCHECK genutzt.
- **REST-API:** für Gäste geschlossen. Die Website liest Inhalte serverseitig. Öffentlich sind nur Medien (`/api/media/…`) und die Website-Endpunkte `/api/preis`, `/api/konfiguration`, `/api/anfrage`, `/api/health`.

## Erstinstallation (Docker Compose)

```bash
git clone <repo> /opt/schaftboeller && cd /opt/schaftboeller
cp .env.example .env.production
openssl rand -hex 32        # → PAYLOAD_SECRET
# .env.production ausfüllen: SERVER_URL, DOMAIN, SMTP_*, MAIL_FROM_*, beim ersten Start SEED_ON_INIT=true + SEED_ADMIN_*
docker compose --env-file .env.production --profile tls up -d --build
docker compose --env-file .env.production logs -f app
```

- Nach dem ersten erfolgreichen Start `SEED_ON_INIT=false` setzen und `SEED_ADMIN_PASSWORD` aus der Datei entfernen. Danach unter `/admin/account` ein eigenes Passwort setzen.
- DNS: A/AAAA-Einträge für `DOMAIN` und `www.DOMAIN` auf den Server. Caddy holt die Zertifikate automatisch.
- Ohne das Profil `tls` lauscht die App nur auf `127.0.0.1:3000`, dann übernimmt ein vorhandener Reverse-Proxy TLS.

## Umgebungsvariablen

Alle Variablen sind in [`.env.example`](../../.env.example) beschrieben. Zu beachten:

| Variable | Hinweis |
|---|---|
| `SERVER_URL` | Öffentliche Adresse. Wird zur Laufzeit gelesen, dasselbe Image funktioniert für Staging und Produktion |
| `DATABASE_URL` | Pfad der SQLite-Datei (`file:/pfad/datei.db`). In Docker fest auf `file:/app/data/schaftboeller.db` gesetzt |
| `PAYLOAD_SECRET` | Nie ändern, sonst werden alle Anmeldungen ungültig |
| `SMTP_*` | Ohne `SMTP_HOST` werden E-Mails nur ins Log geschrieben |
| `SITE_NOINDEX=true` | Für Staging: `robots.txt` sperrt alles, Seiten sind `noindex` |
| `PLAUSIBLE_DOMAIN`, `PLAUSIBLE_SCRIPT_URL` | Build-Argumente: fließen in die Content-Security-Policy ein, daher nach Änderung neu bauen |
| `RATE_LIMIT_INQUIRIES` | Anfragen pro IP in 10 Minuten (Standard 5) |
| `TRUSTED_PROXY_HOPS` | Anzahl der Reverse-Proxys vor der App (Standard 1). Bestimmt, welcher Eintrag aus `X-Forwarded-For` als Client-IP gilt. Bei eigenem Proxy statt Caddy: `X-Forwarded-For` anhängen (nginx: `$proxy_add_x_forwarded_for`) |

## Updates einspielen

```bash
cd /opt/schaftboeller
git pull
docker compose --env-file .env.production --profile tls up -d --build
```

Migrationen laufen beim Start. Vorher ein Backup ziehen (siehe unten). Abhängigkeiten werden über Pull-Requests aktualisiert; die CI muss grün sein.

## Backups

[`deploy/backup.sh`](../../deploy/backup.sh) sichert die Datenbank und die Medien und behält 14 Stände. Die Datenbank wird im laufenden Betrieb mit `VACUUM INTO` konsistent kopiert (`db_<Datum>.db.gz`). Die Datei im Volume **nicht** einfach mit `cp` kopieren, solange die App läuft: Ein Teil der Daten steht dann noch in der `-wal`-Datei.

```cron
15 3 * * * cd /opt/schaftboeller && ./deploy/backup.sh >> /var/log/schaftboeller-backup.log 2>&1
```

**Wichtig:** Das Backup-Verzeichnis zusätzlich extern sichern (z. B. Storage-Box, `restic`). Mindestens einmal pro Quartal testweise wiederherstellen.

Wiederherstellen (im Verzeichnis `/opt/schaftboeller`, steht auch am Ende des Skripts). Dabei die alten `-wal`/`-shm`-Dateien löschen, sonst spielt SQLite veraltete Änderungen auf die zurückgeholte Datei:

```bash
docker compose --env-file .env.production stop app
gunzip -c /var/backups/schaftboeller/db_<STAMP>.db.gz | docker compose --env-file .env.production run --rm -T --no-deps app \
  sh -c 'rm -f /app/data/schaftboeller.db-wal /app/data/schaftboeller.db-shm && cat > /app/data/schaftboeller.db'
docker compose --env-file .env.production run --rm -T --no-deps app tar -C /app -xzf - < /var/backups/schaftboeller/media_<STAMP>.tar.gz
docker compose --env-file .env.production start app
```

## Monitoring

- Uptime-Check auf `https://<domain>/api/health` (z. B. Uptime Kuma, Better Stack). Alarm per E-Mail.
- Logs: `docker compose logs app`. Fehler beim Mailversand oder bei der PDF-Erzeugung erscheinen dort; die Anfrage bleibt trotzdem im CMS gespeichert.

## Entwicklung → Produktion

1. Änderungen im Branch, Pull-Request. Die CI prüft Lint, Typen, Unit-Tests, Migrationen, Build, E2E und Docker-Build.
2. Bei Änderungen am Datenmodell: `npm run migrate:create -- <name>` und die Migration committen. Die CI schlägt fehl, wenn sie fehlt.
3. Nach dem Merge auf dem Server: `git pull && docker compose … up -d --build`.

## Phase 2 (Shop) – Anknüpfungspunkte

- `lib/configurator/engine.ts` (`quote`, `validateSelection`) und `lib/configurator/server.ts` (`saveConfiguration`) bilden die verbindliche Preisberechnung. Warenkorb und Kasse nutzen sie direkt.
- `configurations` enthält bereits eine Preis-Momentaufnahme. Bestellungen verweisen künftig darauf.
- Rechtstexte (AGB, Widerruf, Versand & Zahlung) sind als weitere Einträge in „Rechtstexte“ möglich und automatisch unter `/<slug>` erreichbar.
- Zahlungsarten je Warenkorb-Inhalt (Böller: Vorkasse/Anzahlung/Abholung) – siehe Konzept, Kapitel 11 und 12.
