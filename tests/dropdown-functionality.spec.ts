import { test, expect } from '@playwright/test'

test.describe('Dropdown Functionality - Local Development', () => {
  test('should populate industry dropdown on page load', async ({ page }) => {
    await page.goto('/')
    
    const industryTrigger = page.locator('button:has-text("Select service category")')
    await expect(industryTrigger).toBeVisible()
    
    await industryTrigger.click()
    
    await expect(page.locator('[role="option"]:has-text("Home Services")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("Legal")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("Real Estate")')).toBeVisible()
  })

  test('should populate sub-service dropdown when industry is selected', async ({ page }) => {
    await page.goto('/')
    
    await page.locator('button:has-text("Select service category")').click()
    await page.locator('[role="option"]:has-text("Home Services")').click()
    
    await expect(page.locator('button:has-text("Select sub-service")')).toBeVisible()
    await page.locator('button:has-text("Select sub-service")').click()
    
    await expect(page.locator('[role="option"]:has-text("Plumbing")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("Electrical")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("HVAC")')).toBeVisible()
  })

  test('should clear sub-service when industry changes', async ({ page }) => {
    await page.goto('/')
    
    await page.locator('button:has-text("Select service category")').click()
    await page.locator('[role="option"]:has-text("Home Services")').click()
    
    await page.locator('button:has-text("Select sub-service")').click()
    await page.locator('[role="option"]:has-text("Plumbing")').click()
    
    await page.locator('button:has-text("Home Services")').click()
    await page.locator('[role="option"]:has-text("Legal")').click()
    
    await expect(page.locator('button:has-text("Select sub-service")')).toBeVisible()
  })

  test('should work correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await page.locator('button:has-text("Select service category")').click()
    await page.locator('[role="option"]:has-text("Home Services")').click()
    
    await expect(page.locator('button:has-text("Select sub-service")')).toBeVisible()
    await page.locator('button:has-text("Select sub-service")').click()
    
    await expect(page.locator('[role="option"]:has-text("Plumbing")')).toBeVisible()
  })
})

test.describe('Dropdown Functionality - Live Site', () => {
  test('should verify industries function is accessible on live site', async ({ page }) => {
    const response = await page.request.get('https://customleadmatch.netlify.app/.netlify/functions/industries')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  test('should verify sub-services function is accessible on live site', async ({ page }) => {
    const response = await page.request.get('https://customleadmatch.netlify.app/.netlify/functions/sub-services?industry=home_services')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  test('should populate dropdowns correctly on live site', async ({ page }) => {
    await page.goto('https://customleadmatch.netlify.app/')
    
    const industryTrigger = page.locator('button:has-text("Select service category")')
    await expect(industryTrigger).toBeVisible()
    
    await industryTrigger.click()
    await expect(page.locator('[role="option"]:has-text("Home Services")')).toBeVisible()
    await page.locator('[role="option"]:has-text("Home Services")').click()
    
    await expect(page.locator('button:has-text("Select sub-service")')).toBeVisible()
    await page.locator('button:has-text("Select sub-service")').click()
    await expect(page.locator('[role="option"]:has-text("Plumbing")')).toBeVisible()
  })
})
