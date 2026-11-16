#!/usr/bin/env sh
# Tägliche Sicherung von Datenbank und Medien (z. B. per Cron um 03:15):
#   15 3 * * * /usr/local/bin/mte-backup >> /var/log/mte-backup.log 2>&1
# (einmalig auf den Server kopieren: scp deploy/backup.sh <server>:/usr/local/bin/mte-backup)
#
# Behält die letzten 14 Sicherungen. Sicherungen zusätzlich extern ablegen (z. B. Storage-Box)!
set -eu

BACKUP_DIR="${BACKUP_DIR:-/var/backups/mte}"
KEEP="${KEEP:-14}"
STAMP="$(date +%Y-%m-%d_%H%M)"
# Gleicher Name bei Deploy über die Pipeline (deploy/deploy.sh) und bei Docker Compose
CONTAINER="${CONTAINER:-mte}"

mkdir -p "$BACKUP_DIR"

echo "[$STAMP] Datenbank sichern …"
# VACUUM INTO erzeugt im laufenden Betrieb eine konsistente Kopie der SQLite-Datei (inkl. WAL)
docker exec -i "$CONTAINER" sh -c 'rm -f /tmp/backup.db && node -e "
  const { createClient } = require(\"@libsql/client\");
  const db = createClient({ url: process.env.DATABASE_URL });
  db.execute(\"VACUUM INTO '\''/tmp/backup.db'\''\").then(() => db.close(), (err) => { console.error(err); process.exit(1) });
" && gzip -c /tmp/backup.db && rm -f /tmp/backup.db' > "$BACKUP_DIR/db_$STAMP.db.gz"

echo "[$STAMP] Medien sichern …"
docker exec -i "$CONTAINER" sh -c 'tar -C "$(dirname "$MEDIA_DIR")" -czf - "$(basename "$MEDIA_DIR")"' > "$BACKUP_DIR/media_$STAMP.tar.gz"

echo "[$STAMP] Alte Sicherungen aufräumen (behalte $KEEP) …"
ls -1t "$BACKUP_DIR"/db_*.db.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f
ls -1t "$BACKUP_DIR"/media_*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f

echo "[$STAMP] Fertig."

# Wiederherstellen (als root auf dem Server; App dafür kurz anhalten). Die alten -wal/-shm-Dateien
# müssen weg, sonst spielt SQLite veraltete Änderungen auf die zurückgeholte Datei:
#   docker stop mte
#   rm -f /htdocs/mte/data/schaftboeller.db-wal /htdocs/mte/data/schaftboeller.db-shm
#   gunzip -c /var/backups/mte/db_<STAMP>.db.gz > /htdocs/mte/data/schaftboeller.db
#   tar -C /htdocs/mte -xzf /var/backups/mte/media_<STAMP>.tar.gz
#   chown -R 1001:1001 /htdocs/mte/data /htdocs/mte/media
#   docker start mte
