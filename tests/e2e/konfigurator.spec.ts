import { expect, test } from '@playwright/test'

/** Erwartete Summe mit den Beispielpreisen aus dem Seed: 2.490 + 60 (Beschriftung) + 180 (Edelweiß) + 150 (Standhalterung) */
const EXPECTED = /2\.880/

async function configure(page: import('@playwright/test').Page) {
  await page.goto('/konfigurator')
  await expect(page.getByTestId('total')).toContainText(/2\.490/)
  await page.getByRole('tab', { name: /Schaft/ }).click()
  await page.locator('label.opt', { hasText: 'Nuss dunkel' }).click()
  await page.locator('label.opt', { hasText: 'Rot' }).click()
  await page.getByRole('tab', { name: /Gestaltung/ }).click()
  await page.locator('label.switch', { hasText: 'Namensbeschriftung' }).click()
  await page.getByLabel('Text (Name, Verein, Datum)').fill('Josef Ebner 1926')
  await page.locator('label.opt', { hasText: 'Fraktur' }).click()
  await page.locator('label.opt', { hasText: 'Edelweiß' }).click()
  await page.getByRole('tab', { name: /Zubehör/ }).click()
  await page.locator('label.opt', { hasText: 'Standhalterung' }).click()
  await expect(page.getByTestId('total')).toContainText(EXPECTED)
  // Vorschau zeigt die Beschriftung
  await expect(page.locator('.stage-svg svg text').first()).toHaveText('Josef Ebner 1926')
}

test.describe('Konfigurator', () => {
  test('Preis, Übersicht, Teilen-Link und PDF', async ({ page, context, request }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await configure(page)

    // Auswahl bleibt nach dem Neuladen erhalten (URL-Zustand)
    await page.reload()
    await expect(page.getByTestId('total')).toContainText(EXPECTED)

    await page.getByRole('tab', { name: /Übersicht/ }).click()
    const summary = page.locator('.summary')
    await expect(summary).toContainText('Kerbschnitzerei: Edelweiß')
    await expect(summary).toContainText('„Josef Ebner 1926“ · Fraktur')
    await expect(summary).toContainText('Standhalterung')

    await page.getByRole('button', { name: 'Link teilen' }).click()
    const code = page.getByTestId('code')
    await expect(code).toHaveText(/^SE-[0-9A-Z]{4}-[0-9A-Z]{4}$/)
    const codeText = (await code.textContent())!

    // Gespeicherte Konfiguration öffnen
    await page.goto(`/konfigurator/${codeText}`)
    await expect(page.getByTestId('code')).toHaveText(codeText)
    await expect(page.getByTestId('total')).toContainText(EXPECTED)

    // PDF und Link-Vorschaubild
    const pdf = await request.get(`/konfigurator/${codeText}/pdf`)
    expect(pdf.headers()['content-type']).toBe('application/pdf')
    expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF')
    const ogUrl = await page.locator('meta[property="og:image"]').getAttribute('content')
    const og = await request.get(new URL(ogUrl!).pathname + new URL(ogUrl!).search)
    expect(og.headers()['content-type']).toBe('image/png')
  })

  test('unverbindliche Anfrage mit Konfiguration', async ({ page }) => {
    await configure(page)
    await page.getByRole('tab', { name: /Übersicht/ }).click()
    await page.getByRole('button', { name: 'Unverbindlich anfragen' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Name *').fill('E2E Test')
    await dialog.getByLabel('E-Mail *').fill('e2e@example.com')
    await dialog.getByLabel('Verein').fill('Prangerschützen Test')
    await dialog.getByRole('checkbox').check()
    await page.waitForTimeout(2600) // Mindest-Ausfüllzeit (Spam-Schutz)
    await dialog.getByRole('button', { name: 'Anfrage senden' }).click()
    await expect(dialog).toContainText('Deine Anfrage ist bei uns eingegangen')
    await expect(dialog).toContainText(/SE-[0-9A-Z]{4}-[0-9A-Z]{4}/)
  })

  test('Server lehnt manipulierte Auswahl ab und rechnet selbst', async ({ request }) => {
    const bad = await request.post('/api/konfiguration', { data: { product: 'klassik-20', selection: { holz: 'gold' } } })
    expect(bad.status()).toBe(422)
    const price = await request.post('/api/preis', {
      data: { product: 'klassik-20', selection: { schnitzerei: 'edelweiss' }, totalCents: 1 },
    })
    const json = await price.json()
    expect(json.quote.totalCents).toBe(249000 + 18000)
  })
})
