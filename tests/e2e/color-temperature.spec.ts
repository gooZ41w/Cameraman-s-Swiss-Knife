import { test, expect } from '@playwright/test';

test('色温采样：通过精确输入 6500K 显示期望 RGB', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /色温/ }).click();

  // 依赖页面实现提供 data-testid
  const input = page.locator('[data-testid="temp-input"]');
  const preview = page.locator('[data-testid="temp-preview"]');

  await input.fill('6500');
  await input.press('Enter');

  // 等待渲染稳定
  await expect(preview).toBeVisible();

  const bg = await preview.evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor);
  expect(bg).toContain('rgb(255, 254, 250)');
});
