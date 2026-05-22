import { test, expect } from '@playwright/test';
import fs from 'fs';

// Capture baseline and variant in one run by toggling CSS variables on :root
test('Exposure page mobile capture baseline and variant', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: /曝光/ }).click();
  await expect(page.locator('[data-testid="exposure-page"]')).toBeVisible();

  const outDir = 'test-results';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Baseline (original defaults)
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--selector-fade-width', '48px');
    document.documentElement.style.setProperty('--selector-fade-stop', '20%');
    document.documentElement.style.setProperty('--selector-fade-opacity', '1');
    document.documentElement.style.setProperty('--selector-fade-transition', '160ms');
  });
  await page.waitForTimeout(80);
  await page.locator('[data-testid="exposure-page"]').screenshot({ path: `${outDir}/exposure-mobile.png` });

  // Variant
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--selector-fade-width', '36px');
    document.documentElement.style.setProperty('--selector-fade-stop', '12%');
    document.documentElement.style.setProperty('--selector-fade-opacity', '0.9');
    document.documentElement.style.setProperty('--selector-fade-transition', '200ms');
  });
  await page.waitForTimeout(80);
  await page.locator('[data-testid="exposure-page"]').screenshot({ path: `${outDir}/exposure-mobile-variant.png` });
});
