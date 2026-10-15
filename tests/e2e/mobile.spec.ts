import { expect, test } from '@playwright/test'

test('Mobiles Menü öffnet, hebt den Konfigurator hervor und navigiert', async ({ page }) => {
  await page.goto('/faq')
  await page.getByRole('button', { name: 'Menü öffnen' }).click()
  const menu = page.locator('#mobile-nav')
  await expect(menu).toHaveClass(/open/)
  await menu.getByRole('link', { name: 'Konfigurator' }).click()
  await expect(page).toHaveURL(/\/konfigurator/)
  await expect(page.locator('#mobile-nav')).not.toHaveClass(/open/)
  await expect(page.getByTestId('total')).toBeVisible()
  // keine horizontale Scrollbar
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
