import { expect, test } from '@playwright/test'

test.describe('Website', () => {
  test('Startseite mit Logo-Intro, das sich überspringen lässt und nur einmal erscheint', async ({ page }) => {
    await page.goto('/')
    const intro = page.getByTestId('intro')
    await expect(intro).toBeVisible()
    await page.getByRole('button', { name: 'Überspringen' }).click()
    await expect(intro).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tradition')
    await expect(page).toHaveTitle(/Schaftböller Ebner/)

    // Zweiter Aufruf in derselben Sitzung: kein Intro
    await page.reload()
    await expect(page.getByTestId('intro')).toBeHidden()
  })

  test('Intro erscheint nicht beim Einstieg über eine Unterseite', async ({ page }) => {
    await page.goto('/faq')
    await page.getByRole('link', { name: 'Schaftböller Ebner – Startseite' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('intro')).toBeHidden()
  })

  const pages: [string, RegExp][] = [
    ['/schaftboeller', /Schaftböller/i],
    ['/schaftboeller/klassik-20', /Schaftböller Klassik/i],
    ['/zubehoer', /Zubehör/i],
    ['/zubehoer/standhalterung', /Standhalterung/i],
    ['/handwerk', /Vom Baum/i],
    ['/galerie', /Fertige/i],
    ['/faq', /Häufige/i],
    ['/kontakt', /Lass uns/i],
    ['/impressum', /Impressum/i],
    ['/datenschutz', /Datenschutz/i],
  ]
  for (const [path, heading] of pages) {
    test(`Seite ${path} lädt`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
    })
  }

  for (const path of ['/diese-seite-gibt-es-nicht', '/schaftboeller/gibt/es/nicht']) {
    test(`unbekannte Seite ${path} liefert die eigene 404-Seite`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(404)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/Hier ist/i)
    })
  }

  test('REST-API ist für Gäste geschlossen (Preise, Einstellungen, Anfragen)', async ({ request }) => {
    for (const path of ['/api/products', '/api/globals/settings', '/api/inquiries', '/api/configurations', '/api/users']) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(403)
    }
    // Bilder bleiben öffentlich
    const media = await request.get('/api/media')
    expect(media.ok()).toBeTruthy()
  })

  test('SEO: Sitemap, robots.txt, strukturierte Daten und Sicherheits-Header', async ({ page, request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('/schaftboeller/klassik-20')
    const robots = await request.get('/robots.txt')
    expect(await robots.text()).toContain('Disallow: /admin')

    const res = await page.goto('/schaftboeller/klassik-20')
    expect(res?.headers()['content-security-policy']).toContain("default-src 'self'")
    expect(res?.headers()['x-content-type-options']).toBe('nosniff')
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ld.join(' ')).toContain('"@type":"Product"')
  })

  test('Health-Check antwortet', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    expect(await res.json()).toEqual({ ok: true })
  })
})
