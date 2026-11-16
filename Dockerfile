# syntax=docker/dockerfile:1
# Schaftböller Ebner – Produktions-Image (Next.js standalone + Payload CMS)

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Abhängigkeiten ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Optionale cookielose Statistik – fließt beim Build in die Content-Security-Policy ein
ARG PLAUSIBLE_DOMAIN=""
ARG PLAUSIBLE_SCRIPT_URL=""
ENV PLAUSIBLE_DOMAIN=$PLAUSIBLE_DOMAIN PLAUSIBLE_SCRIPT_URL=$PLAUSIBLE_SCRIPT_URL
# Für den Build wird keine Datenbank benötigt (alle Inhaltsseiten werden zur Laufzeit gerendert)
RUN DATABASE_URL=file:/tmp/build.db PAYLOAD_SECRET=build-only npm run build

# ---- Laufzeit ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media \
    DATABASE_URL=file:/app/data/schaftboeller.db
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs \
  && mkdir -p /app/media /app/data && chown nextjs:nodejs /app/media /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Bilder für die optionalen Startinhalte (SEED_ON_INIT=true)
COPY --from=builder /app/src/seed/images ./src/seed/images

USER nextjs
EXPOSE 3000
# SQLite-Datenbank (/app/data) und Uploads (/app/media) liegen in Volumes
VOLUME ["/app/data", "/app/media"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

# Die SQLite-Datei wird beim ersten Start angelegt, Migrationen laufen automatisch (prodMigrations in payload.config.ts)
CMD ["node", "server.js"]
