import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'

async function setRangeInputValue(locator: Locator, value: number) {
  await locator.evaluate((el: HTMLInputElement, nextValue: number) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    nativeSetter?.call(el, String(nextValue))
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

test.describe('景深计算器 (Depth of Field)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /景深/ }).click()
    await expect(page.locator('[data-testid="dof-result-card"]')).toBeVisible()
  })

  test('范围扩展和结果布局可用', async ({ page }) => {
    const focalRange = page.locator('[data-testid="dof-focal-length-range"]')
    const apertureRange = page.locator('[data-testid="dof-aperture-range"]')
    const focusRange = page.locator('[data-testid="dof-focus-distance-range"]')

    await setRangeInputValue(focalRange, 800)
    await setRangeInputValue(apertureRange, 0.95)
    await setRangeInputValue(focusRange, 400)

    await expect(focalRange).toHaveValue('800')
    await expect(apertureRange).toHaveValue('0.95')
    await expect(focusRange).toHaveValue('400')

    await expect(page.locator('[data-testid="dof-aperture-label"]')).toHaveText('光圈（f-number）: f/0.95')
    await expect(page.locator('[data-testid="dof-focus-distance-label"]')).toHaveText('对焦距离（米）: ∞')

    await expect(page.locator('[data-testid="dof-near-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="dof-far-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="dof-total-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="dof-hyperfocal-value"]')).toBeVisible()
  })
})
