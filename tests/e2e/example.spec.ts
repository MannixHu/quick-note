import { expect, test } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load with correct title and main content', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/快记/)

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    await page.goto('/')

    // Page should load without errors
    await expect(page).toHaveTitle(/快记/)

    // Main content should be visible on all viewport sizes
    await expect(page.locator('main')).toBeVisible()

    // Mobile-specific check: viewport should be smaller
    if (isMobile) {
      const viewport = page.viewportSize()
      expect(viewport?.width).toBeLessThan(768)
    }
  })

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out expected hydration warnings in development
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('Warning:') && !error.includes('hydrat')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
