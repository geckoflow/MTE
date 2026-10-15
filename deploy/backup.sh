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
$COMPOSE exec -T db pg_dump -U schaftboeller -d schaftboeller --format=custom > "$BACKUP_DIR/db_$STAMP.dump"

echo "[$STAMP] Medien sichern …"
$COMPOSE exec -T app tar -C /app -czf - media > "$BACKUP_DIR/media_$STAMP.tar.gz"

echo "[$STAMP] Alte Sicherungen aufräumen (behalte $KEEP) …"
ls -1t "$BACKUP_DIR"/db_*.dump 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f
ls -1t "$BACKUP_DIR"/media_*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f

echo "[$STAMP] Fertig."

# Wiederherstellen:
#   docker compose --env-file .env.production exec -T db pg_restore -U schaftboeller -d schaftboeller --clean < db_<STAMP>.dump
#   docker compose --env-file .env.production exec -T app tar -C /app -xzf - < media_<STAMP>.tar.gz
