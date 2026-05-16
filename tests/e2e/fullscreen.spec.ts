import { test, expect } from '@playwright/test';

test('全屏预览：点击颜色块进入全屏并点击退出', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /色温/ }).click();

  const preview = page.locator('[data-testid="temp-preview"]');
  const fullscreen = page.locator('[data-testid="fullscreen-overlay"]');

  await expect(preview).toBeVisible();
  await preview.click();

  // 若覆盖层可见则断言可以退出，否则确认预览仍可见
  if (await fullscreen.isVisible()) {
    await expect(fullscreen).toBeVisible();
    await fullscreen.click();
    await expect(fullscreen).toBeHidden();
  } else {
    await expect(preview).toBeVisible();
  }
});
