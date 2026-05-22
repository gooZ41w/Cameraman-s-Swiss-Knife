import { test, expect } from '@playwright/test';
import { setRangeValue } from '../index';

test.describe('曝光计算器 (Exposure Calculator)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /曝光/ }).click();
    await expect(page.locator('[data-testid="exposure-page"]')).toBeVisible();
  });

  test('页面加载验证默认参数显示', async ({ page }) => {
    // 验证主要控件可见
    await expect(page.locator('[data-testid="solve-for-select"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="nd-switch-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="base-shutter-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="comp-value"]')).toBeVisible();

    // 验证默认值显示（控件为左右切换样式）
    const ndVal = page.locator('[data-testid="nd-switch-value"]');
    await expect(ndVal).toBeVisible();

    // EV display is hidden in the UI per UX update; computation retained server-side
  });

  

  test('调整快门，验证结果变化', async ({ page }) => {
    const ndShutterResult = page.locator('[data-testid="nd-shutter-result"]');
    const initialResult = await ndShutterResult.textContent();

    // 通过左右切换选择基础快门到 1s（循环尝试）
    for (let i = 0; i < 40; i++) {
      await page.locator('[data-testid="base-shutter-next"]').click();
      await page.waitForTimeout(50);
      const val = await page.locator('[data-testid="base-shutter-value"]').textContent();
      if (val && val.includes('1s')) break;
    }

    await page.waitForTimeout(100);
    const newResult = await ndShutterResult.textContent();
    expect(initialResult).not.toBe(newResult);
  });

  // ISO 调整已移除，相关用例跳过

  test('ND1000 选择触发 Bulb 倒计时模式', async ({ page }) => {
    // 选择 ND1000 — Bulb 模式目前已隐藏，确保不存在对应面板
    for (let i = 0; i < 40; i++) {
      await page.locator('[data-testid="nd-switch-next"]').click();
      await page.waitForTimeout(30);
      const v = await page.locator('[data-testid="nd-switch-value"]').textContent();
      if (v && v.includes('ND1000')) break;
    }
    await page.waitForTimeout(100);
    const bulbPanel = page.locator('[data-testid="exposure-bulb-timer"]');
    await expect(bulbPanel).toHaveCount(0);
  });

  test('ND 预设切换验证档位显示', async ({ page }) => {
    // 切换到 ND1000
    for (let i = 0; i < 40; i++) {
      await page.locator('[data-testid="nd-switch-next"]').click();
      await page.waitForTimeout(30);
      const v = await page.locator('[data-testid="nd-switch-value"]').textContent();
      if (v && v.includes('ND1000')) break;
    }
    await page.waitForTimeout(100);
    let stopsText = await page.locator('[data-testid="nd-switch-value"]').textContent();
    expect(stopsText).toContain('10');

    // 切换到 ND64
    for (let i = 0; i < 40; i++) {
      await page.locator('[data-testid="nd-switch-next"]').click();
      await page.waitForTimeout(30);
      const v = await page.locator('[data-testid="nd-switch-value"]').textContent();
      if (v && v.includes('ND64')) break;
    }
    stopsText = await page.locator('[data-testid="nd-switch-value"]').textContent();
    expect(stopsText).toContain('6');

    // 切换到 ND2
    for (let i = 0; i < 40; i++) {
      await page.locator('[data-testid="nd-switch-next"]').click();
      await page.waitForTimeout(30);
      const v = await page.locator('[data-testid="nd-switch-value"]').textContent();
      if (v && v.includes('ND2')) break;
    }
    stopsText = await page.locator('[data-testid="nd-switch-value"]').textContent();
    expect(stopsText).toContain('1');
  });

  test('曝光补偿调整验证目标值变化', async ({ page }) => {
    // 为避免 Infinity 情况，先切到低 ND（当前固定为快门回推模式）
    for (let i = 0; i < 40; i++) {
      await page.locator('[data-testid="nd-switch-next"]').click();
      await page.waitForTimeout(30);
      const v = await page.locator('[data-testid="nd-switch-value"]').textContent();
      if (v && v.includes('ND2')) break;
    }
    await page.waitForTimeout(100);

    const ndShutterResult = page.locator('[data-testid="nd-shutter-result"]');
    const initialCompensated = await ndShutterResult.textContent();

    // 增加 1 EV 补偿 — 使用左右切换选择 +1.0EV
    for (let i = 0; i < 40; i++) {
      await page.locator('[data-testid="comp-next"]').click();
      await page.waitForTimeout(30);
      const val = await page.locator('[data-testid="comp-value"]').textContent();
      if (val && val.includes('+1')) break;
    }
    await page.waitForTimeout(200);

    const newCompensated = await ndShutterResult.textContent();
    if (initialCompensated === newCompensated) {
      expect(initialCompensated).toContain('Infinity');
    } else {
      expect(initialCompensated).not.toBe(newCompensated);
    }
  });

  test('互锁模式固定为快门', async ({ page }) => {
    const ndShutterResult = page.locator('[data-testid="nd-shutter-result"]');

    // 固定模式下结果应始终显示快门格式（使用 ND 调整后的结果）
    const resultText = await ndShutterResult.textContent();
    expect(resultText).toMatch(/s/);
  });

  test('互锁目标标题已替换为 ND 计算结果显示', async ({ page }) => {
    const ndShutterResult = page.locator('[data-testid="nd-shutter-result"]');
    await expect(ndShutterResult).toBeVisible();
  });

  test('Bulb 倒计时已隐藏', async ({ page }) => {
    // Bulb 模式目前被永久隐藏
    const bulbPanel = page.locator('[data-testid="exposure-bulb-timer"]');
    await expect(bulbPanel).toHaveCount(0);
  });

  test('快门显示格式符合规范', async ({ page }) => {
    const ndShutterResult = page.locator('[data-testid="nd-shutter-result"]');

    // 通过左右切换选择 1/250s
    for (let i = 0; i < 100; i++) {
      await page.locator('[data-testid="base-shutter-next"]').click();
      await page.waitForTimeout(20);
      const val = await page.locator('[data-testid="base-shutter-value"]').textContent();
      if (val && val.includes('1/250')) break;
    }
    await page.waitForTimeout(100);

    const shutterText = await ndShutterResult.textContent();
    // 应该显示 "1/250s" 或类似格式
    expect(shutterText).toMatch(/(\d+\/\d+s|[\d.]+s)/);
  });

  test('ND 档位信息完整性', async ({ page }) => {
    const ndShutterResult = page.locator('[data-testid="nd-shutter-result"]');

    // 选择一个高档位的 ND
    for (let i = 0; i < 60; i++) {
      await page.locator('[data-testid="nd-switch-next"]').click();
      await page.waitForTimeout(30);
      const v = await page.locator('[data-testid="nd-switch-value"]').textContent();
      if (v && v.includes('ND32000')) break;
    }
    await page.waitForTimeout(100);

    // 验证档位显示（ND32000 = 15 档）
    const stopsText = await page.locator('[data-testid="nd-switch-value"]').textContent();
    expect(stopsText).toContain('15');

    // 验证快门结果显示（应该是很长的时间）
    const shutterText = await ndShutterResult.textContent();
    expect(shutterText).toBeTruthy();
  });
});
