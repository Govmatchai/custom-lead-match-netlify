import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should store session data after successful signup', async ({ page }) => {
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
    await page.fill('input[placeholder="12345, 12346, 12347"]', '12345')
    
    await page.click('button[type="submit"]')
    
    await page.waitForURL(/\/welcome/)
    
    const contractorId = await page.evaluate(() => localStorage.getItem('contractor_id'))
    const sessionToken = await page.evaluate(() => localStorage.getItem('contractor_session_token'))
    
    expect(contractorId).toBeTruthy()
    expect(sessionToken).toBeTruthy()
  })

  test('should redirect to dashboard from welcome page', async ({ page }) => {
    await page.goto('/welcome?contractor_id=test-id')
    
    await page.evaluate(() => {
      localStorage.setItem('contractor_id', 'test-id')
      localStorage.setItem('contractor_session_token', 'test-token')
    })
    
    await page.click('button:has-text("Go to Dashboard")')
    
    await expect(page).toHaveURL(/\/contractor\/test-id/)
  })
})
