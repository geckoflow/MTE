import 'server-only'

import fs from 'fs/promises'
import path from 'path'

/** Schriften und Logos aus /public – im Docker-Image unter /app/public verfügbar */
const PUBLIC_DIR = path.join(process.cwd(), 'public')

const cache = new Map<string, Promise<Buffer>>()

export function publicFile(rel: string): Promise<Buffer> {
  if (!cache.has(rel)) cache.set(rel, fs.readFile(path.join(PUBLIC_DIR, rel)))
  return cache.get(rel)!
}

export async function publicDataUri(rel: string, mime: string): Promise<string> {
  const buf = await publicFile(rel)
  return `data:${mime};base64,${buf.toString('base64')}`
}

type SatoriFont = { name: string; data: ArrayBuffer; weight: 400 | 600 | 800; style: 'normal' | 'italic' }

const toArrayBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer

export async function satoriFonts(): Promise<SatoriFont[]> {
  const f = (file: string) => publicFile(`fonts/${file}`).then(toArrayBuffer)
  const [m800, m800i, m600, i400, i600, unifraktur, pinyon, cormorant] = await Promise.all([
    f('montserrat-latin-800-normal.woff'),
    f('montserrat-latin-800-italic.woff'),
    f('montserrat-latin-600-normal.woff'),
    f('inter-latin-400-normal.woff'),
    f('inter-latin-600-normal.woff'),
    f('unifrakturmaguntia-latin-400-normal.woff'),
    f('pinyon-script-latin-400-normal.woff'),
    f('cormorant-garamond-latin-600-normal.woff'),
  ])
  return [
    { name: 'Montserrat', data: m800, weight: 800, style: 'normal' },
    { name: 'Montserrat', data: m800i, weight: 800, style: 'italic' },
    { name: 'Montserrat', data: m600, weight: 600, style: 'normal' },
    { name: 'Inter', data: i400, weight: 400, style: 'normal' },
    { name: 'Inter', data: i600, weight: 600, style: 'normal' },
    { name: 'UnifrakturMaguntia', data: unifraktur, weight: 400, style: 'normal' },
    { name: 'Pinyon Script', data: pinyon, weight: 400, style: 'normal' },
    { name: 'Cormorant Garamond', data: cormorant, weight: 600, style: 'normal' },
  ]
}
