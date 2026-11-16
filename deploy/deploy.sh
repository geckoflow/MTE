#!/usr/bin/env bash
# Startet die Website auf dem Server mit einem Image aus der Registry neu – wie aquaconfig (lamprecht):
#   docker run -d --name mte --restart unless-stopped -p 84:3000 -v /htdocs/mte:/htdocs/mte <image>
# Wird von der CI/CD-Pipeline per SSH ausgeführt, funktioniert aber auch von Hand:
#   ./deploy.sh ghcr.io/geckoflow/mte:<tag>
#
# Auf dem Server (Verzeichnis wird vom Host in den Container gemountet):
#   /htdocs/mte/.env.production   Konfiguration (Vorlage: .env.example), einmalig anlegen
#   /htdocs/mte/data/             SQLite-Datenbank (schaftboeller.db, -wal, -shm)
#   /htdocs/mte/media/            hochgeladene Bilder
#
# Optional über die Umgebung:
#   APP_DIR         Datenverzeichnis auf dem Server (Standard /htdocs/mte)
#   APP_PORT        Port auf dem Server, an dem die Website erreichbar ist (Standard 84)
#   APP_BIND        nur an diese Adresse binden, z. B. 127.0.0.1, wenn nginx auf demselben Server läuft
#   CONTAINER       Name des Containers (Standard mte)
#   REGISTRY_USER, REGISTRY_TOKEN   Anmeldung an ghcr.io für private Images
set -euo pipefail

IMAGE="${1:?Aufruf: deploy.sh <image:tag>}"
APP_DIR="${APP_DIR:-/htdocs/mte}"
APP_PORT="${APP_PORT:-84}"
APP_BIND="${APP_BIND:-}"
CONTAINER="${CONTAINER:-mte}"
ENV_FILE="$APP_DIR/.env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Fehler: $ENV_FILE fehlt. Vorlage: .env.example im Repository (siehe Betriebshandbuch)." >&2
  exit 1
fi

# Pflichtwerte prüfen, bevor der laufende Container ersetzt wird (docker liest die Datei wörtlich:
# keine Anführungszeichen, keine Windows-Zeilenenden)
env_value() { grep -E "^[[:space:]]*$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- || true; }
problems=()
if grep -q $'\r' "$ENV_FILE"; then
  problems+=("Windows-Zeilenenden (CRLF). Beheben mit: sed -i 's/\\r\$//' $ENV_FILE")
fi
secret="$(env_value PAYLOAD_SECRET)"
if [ -z "$secret" ] && [ ! -w "$ENV_FILE" ]; then
  problems+=("PAYLOAD_SECRET fehlt und die Datei ist nicht beschreibbar. Selbst eintragen: PAYLOAD_SECRET=\$(openssl rand -hex 32)")
elif [ -n "$secret" ] && [ "${#secret}" -lt 32 ]; then
  echo "Warnung: PAYLOAD_SECRET ist kürzer als 32 Zeichen (empfohlen: openssl rand -hex 32)" >&2
fi
case "$(env_value SERVER_URL)" in
  http://* | https://*) ;;
  *) problems+=("SERVER_URL fehlt oder ist ungültig, z. B. SERVER_URL=https://schaftboeller-ebner.at (ohne Anführungszeichen)") ;;
esac
if [ "${#problems[@]}" -gt 0 ]; then
  echo "Fehler in $ENV_FILE – der laufende Container bleibt unverändert:" >&2
  printf '  - %s\n' "${problems[@]}" >&2
  exit 1
fi
if [ -z "$secret" ]; then
  # Einmalig erzeugen und dauerhaft ablegen: Ein neues Secret würde alle Anmeldungen ungültig machen
  [ -z "$(tail -c 1 "$ENV_FILE")" ] || echo >> "$ENV_FILE"
  echo "PAYLOAD_SECRET=$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')" >> "$ENV_FILE"
  echo "PAYLOAD_SECRET fehlte – einmalig erzeugt und in $ENV_FILE gespeichert"
fi

if [ -n "${REGISTRY_TOKEN:-}" ]; then
  echo "$REGISTRY_TOKEN" | docker login ghcr.io -u "${REGISTRY_USER:?REGISTRY_USER fehlt}" --password-stdin >/dev/null
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
fi

echo "Image laden: $IMAGE"
docker pull "$IMAGE"

# Die App läuft im Container als Benutzer nextjs (uid 1001) und braucht Schreibrechte auf Datenbank und Medien
docker run --rm --user 0 -v "$APP_DIR:$APP_DIR" --entrypoint sh "$IMAGE" -c \
  "mkdir -p '$APP_DIR/data' '$APP_DIR/media' && chown -R 1001:1001 '$APP_DIR/data' '$APP_DIR/media'"

echo "Container $CONTAINER ersetzen"
docker stop "$CONTAINER" >/dev/null 2>&1 || true
# -v entfernt nur anonyme Volumes des alten Containers; die Daten liegen in $APP_DIR auf dem Server
docker rm -v "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" --restart unless-stopped \
  -p "${APP_BIND:+$APP_BIND:}$APP_PORT:3000" \
  --env-file "$ENV_FILE" \
  -e DATABASE_URL="file:$APP_DIR/data/schaftboeller.db" \
  -e MEDIA_DIR="$APP_DIR/media" \
  -v "$APP_DIR:$APP_DIR" \
  "$IMAGE" >/dev/null

# Migrationen laufen beim Start; erst der Health-Check (CMS + Datenbank) bestätigt den Deploy
echo "Warten auf den Health-Check …"
status="unbekannt"
for _ in $(seq 1 36); do
  status="$(docker inspect -f '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' "$CONTAINER")"
  case "$status" in
    "running healthy")
      echo "Deploy erfolgreich: $IMAGE läuft auf Port $APP_PORT, Daten in $APP_DIR"
      exit 0
      ;;
    "running unhealthy" | exited* | dead*)
      break
      ;;
  esac
  sleep 5
done

echo "Fehler: Container wurde nicht gesund (Status: $status). Letzte Log-Zeilen:" >&2
docker logs --tail 50 "$CONTAINER" >&2 || true
exit 1
