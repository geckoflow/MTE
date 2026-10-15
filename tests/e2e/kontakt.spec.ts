import { expect, test } from '@playwright/test'

test.describe('Kontaktformular', () => {
  test('verlangt Pflichtfelder und sendet eine Nachricht', async ({ page }) => {
    await page.goto('/kontakt?thema=verein')
    await expect(page.getByLabel('Anliegen')).toHaveValue('verein')
    await page.getByLabel('Name *').fill('Kontakt Test')
    await page.getByLabel('E-Mail *').fill('kontakt@example.com')
    await page.getByLabel('Nachricht *').fill('Wir interessieren uns für fünf Schaftböller für unseren Verein.')
    await page.getByRole('button', { name: 'Nachricht senden' }).click()
    // Datenschutz-Checkbox fehlt → Browser-Validierung verhindert das Senden
    await expect(page.locator('.form-status')).toHaveCount(0)
    await page.getByRole('checkbox', { name: /Datenschutzerklärung/ }).check()
    await page.waitForTimeout(2600)
    await page.getByRole('button', { name: 'Nachricht senden' }).click()
    await expect(page.locator('.form-status.ok')).toContainText('Danke für deine Nachricht')
  })

  test('Anfragen ohne Ausfüllzeit oder von fremden Seiten werden abgelehnt', async ({ request }) => {
    const base = { topic: 'allgemein', name: 'Test', email: 't@example.com', message: 'Hallo', consent: true }
    expect((await request.post('/api/anfrage', { data: base })).status()).toBe(422)
    const foreign = await request.post('/api/anfrage', { data: { ...base, startedAt: 1 }, headers: { origin: 'https://evil.example' } })
    expect(foreign.status()).toBe(403)
  })

  test('Honigtopf-Feld blockiert Bots still', async ({ request }) => {
    const res = await request.post('/api/anfrage', {
      data: {
        topic: 'allgemein',
        name: 'Bot',
        email: 'bot@example.com',
        message: 'spam',
        consent: true,
        startedAt: 1,
        website: 'http://spam.example',
      },
    })
    expect(res.status()).toBe(200)
  })
})
