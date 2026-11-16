#!/usr/bin/env sh
# Tägliche Sicherung von Datenbank und Medien (z. B. per Cron um 03:15):
#   15 3 * * * cd /opt/schaftboeller && ./deploy/backup.sh >> /var/log/schaftboeller-backup.log 2>&1
#
# Behält die letzten 14 Sicherungen. Sicherungen zusätzlich extern ablegen (z. B. Storage-Box)!
set -eu

BACKUP_DIR="${BACKUP_DIR:-/var/backups/schaftboeller}"
KEEP="${KEEP:-14}"
STAMP="$(date +%Y-%m-%d_%H%M)"
COMPOSE="docker compose --env-file .env.production"

mkdir -p "$BACKUP_DIR"

echo "[$STAMP] Datenbank sichern …"
# VACUUM INTO erzeugt im laufenden Betrieb eine konsistente Kopie der SQLite-Datei (inkl. WAL)
$COMPOSE exec -T app sh -c 'rm -f /tmp/backup.db && node -e "
  const { createClient } = require(\"@libsql/client\");
  const db = createClient({ url: process.env.DATABASE_URL });
  db.execute(\"VACUUM INTO '\''/tmp/backup.db'\''\").then(() => db.close(), (err) => { console.error(err); process.exit(1) });
" && gzip -c /tmp/backup.db && rm -f /tmp/backup.db' > "$BACKUP_DIR/db_$STAMP.db.gz"

echo "[$STAMP] Medien sichern …"
$COMPOSE exec -T app tar -C /app -czf - media > "$BACKUP_DIR/media_$STAMP.tar.gz"

echo "[$STAMP] Alte Sicherungen aufräumen (behalte $KEEP) …"
ls -1t "$BACKUP_DIR"/db_*.db.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f
ls -1t "$BACKUP_DIR"/media_*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f

echo "[$STAMP] Fertig."

# Wiederherstellen (App dafür kurz anhalten):
#   docker compose --env-file .env.production stop app
#   gunzip -c /var/backups/schaftboeller/db_<STAMP>.db.gz | docker compose --env-file .env.production run --rm -T --no-deps app \
#     sh -c 'rm -f /app/data/schaftboeller.db-wal /app/data/schaftboeller.db-shm && cat > /app/data/schaftboeller.db'
#   docker compose --env-file .env.production run --rm -T --no-deps app tar -C /app -xzf - < /var/backups/schaftboeller/media_<STAMP>.tar.gz
#   docker compose --env-file .env.production start app
