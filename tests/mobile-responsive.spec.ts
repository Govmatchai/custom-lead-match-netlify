import { test, expect } from '@playwright/test'

test.describe('Mobile Responsive Design', () => {
  test('should render signup form correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    expect(inputCount).toBeGreaterThan(5)
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      await expect(input).toBeVisible()
    }
  })

  test('should handle dropdown interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await page.selectOption('select[id="industry"]', 'home_services')
    await page.waitForSelector('select[id="sub-service"]')
    
    const subServiceSelect = page.locator('select[id="sub-service"]')
    await expect(subServiceSelect).toBeVisible()
    
    await page.selectOption('select[id="sub-service"]', 'plumbing')
    
    const selectedValue = await subServiceSelect.inputValue()
    expect(selectedValue).toBe('plumbing')
  })

  test('should maintain form layout on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    const formWidth = await form.boundingBox()
    expect(formWidth?.width).toBeLessThanOrEqual(768)
  })
})
