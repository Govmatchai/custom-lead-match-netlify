import { test, expect } from '@playwright/test'

test.describe('Contractor Signup Flow', () => {
  test('should complete full signup flow with dropdowns', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[placeholder="Smith Construction LLC"]', 'Test Construction LLC')
    await page.fill('input[placeholder="John Smith"]', 'John Smith')
    await page.fill('input[placeholder="john@smithconstruction.com"]', 'john@testconstruction.com')
    await page.fill('input[placeholder="(555) 123-4567"]', '555-123-4567')
    
    await page.locator('button:has-text("Select service category")').click()
    await page.locator('[role="option"]:has-text("Home Services")').click()
    
    await page.locator('button:has-text("Select sub-service")').click()
    await page.locator('[role="option"]:has-text("Plumbing")').click()
    
    await page.fill('input[placeholder="Choose a unique username"]', 'johnsmith123')
    await page.fill('input[type="password"]:first-of-type', 'testpassword123')
    await page.fill('input[type="password"]:last-of-type', 'testpassword123')
    await page.fill('input[placeholder*="zip codes"]', '12345, 12346')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/welcome/)
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible()
  })

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[placeholder="Smith Construction LLC"]', 'Test Construction LLC')
    await page.fill('input[placeholder="John Smith"]', 'John Smith')
    await page.fill('input[placeholder="john@smithconstruction.com"]', 'john@testconstruction.com')
    await page.fill('input[placeholder="(555) 123-4567"]', '555-123-4567')
    
    await page.locator('button:has-text("Select service category")').click()
    await page.locator('[role="option"]:has-text("Home Services")').click()
    
    await page.locator('button:has-text("Select sub-service")').click()
    await page.locator('[role="option"]:has-text("Plumbing")').click()
    
    await page.fill('input[placeholder="Choose a unique username"]', 'johnsmith123')
    await page.fill('input[type="password"]:first-of-type', 'testpassword123')
    await page.fill('input[type="password"]:last-of-type', 'differentpassword')
    await page.fill('input[placeholder="12345, 12346, 12347"]', '12345')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })
})
