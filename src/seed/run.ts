/**
 * Startinhalte anlegen: `npm run seed` (nur wenn noch keine Produkte existieren)
 * Erzwingen: `SEED_FORCE=true npm run seed` (legt Inhalte zusätzlich an – nur für leere Datenbanken gedacht)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './seed'

const payload = await getPayload({ config })
await seed(payload, { onlyIfEmpty: process.env.SEED_FORCE !== 'true' })
process.exit(0)
