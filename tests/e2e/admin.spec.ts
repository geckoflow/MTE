import { expect, test } from '@playwright/test'

const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
const password = process.env.SEED_ADMIN_PASSWORD || 'admin-lokal-123'

test('Admin: Anmeldung, deutsche Oberfläche, Anfragen sichtbar', async ({ page, request }) => {
  const created = await request.post('/api/anfrage', {
    data: { topic: 'allgemein', name: 'Admin Test', email: 'admin-test@example.com', message: 'Test aus dem E2E-Lauf', consent: true },
  })
  expect(created.status()).toBe(201)

  await page.goto('/admin/login')
  await page.fill('#field-email', email)
  await page.fill('#field-password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin$/)
  await expect(page.getByText('Produkte').first()).toBeVisible()
  await expect(page.getByText('Einstellungen').first()).toBeVisible()

  await page.goto('/admin/collections/inquiries')
  await expect(page.getByRole('heading', { name: 'Anfragen' })).toBeVisible()
  await expect(page.getByText('Admin Test').first()).toBeVisible()

  await page.goto('/admin/collections/products')
  await expect(page.getByText('Schaftböller Klassik').first()).toBeVisible()
})
