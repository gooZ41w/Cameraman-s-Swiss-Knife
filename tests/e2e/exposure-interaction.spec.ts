import { test, expect } from '@playwright/test'
import fs from 'fs'

test('Exposure page drag snaps the ND picker and shows fade state', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /曝光/ }).click()
  await expect(page.locator('[data-testid="exposure-page"]')).toBeVisible()

  const exposurePage = page.locator('[data-testid="exposure-page"]')
  const ndControl = page.locator('[data-testid="nd-switch-value"]')
  const initialValue = await ndControl.textContent()

  const box = await ndControl.boundingBox()
  if (!box) throw new Error('Unable to locate ND control bounding box')

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  const dragDistance = 96

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + dragDistance, startY, { steps: 8 })

  await expect(page.locator('.switch-inline.dragging')).toHaveCount(1)

  const outDir = 'test-results'
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  await exposurePage.screenshot({ path: `${outDir}/exposure-drag-state.png` })

  await page.mouse.up()
  await expect(page.locator('.switch-inline.dragging')).toHaveCount(0)

  const finalValue = await ndControl.textContent()
  expect(finalValue).not.toBe(initialValue)
})