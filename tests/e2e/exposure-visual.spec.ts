import { test, expect, devices } from '@playwright/test';
import fs from 'fs';

// Mobile viewport (iPhone 12) screenshot baseline
test('Exposure page mobile visual snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: /曝光/ }).click();
  await expect(page.locator('[data-testid="exposure-page"]')).toBeVisible();

  const el = page.locator('[data-testid="exposure-page"]');
  const outDir = 'test-results';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await el.screenshot({ path: `${outDir}/exposure-mobile.png` });
});
