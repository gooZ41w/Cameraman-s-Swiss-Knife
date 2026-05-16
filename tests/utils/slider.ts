import type { Page, Locator } from '@playwright/test';

/**
 * Reliable helpers for adjusting HTML range inputs in Playwright tests.
 *
 * Strategies (in order):
 * 1. Small adjustments: press ArrowLeft/ArrowRight on the locator.
 * 2. Large adjustments: compute target ratio and click the slider track (real mouse event).
 * 3. Fallback: set `value` / `valueAsNumber` and dispatch `input` + `change` events.
 *
 * The helpers aim to trigger React's controlled input handlers reliably.
 */
export async function setRangeValue(
  page: Page,
  selector: string | Locator,
  target: number | string,
  options?: { step?: number; maxPresses?: number; delay?: number }
) {
  const locator: Locator = typeof selector === 'string' ? page.locator(selector) : selector;
  await locator.focus();

  const currentStr = await locator.inputValue();
  const current = Number(currentStr);
  const targetNum = Number(target);

  const stepFromOption = options?.step;
  const step = stepFromOption ?? (await locator.evaluate((el: HTMLInputElement) => Number(el.step) || 1));

  const diff = targetNum - current;
  const steps = Math.round(diff / step);
  const dir = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
  const presses = Math.min(Math.abs(steps), options?.maxPresses ?? 200);

  // If only a few key presses required, simulate keyboard presses.
  if (presses <= 30) {
    for (let i = 0; i < presses; i++) {
      await locator.press(dir);
      if (options?.delay) await page.waitForTimeout(options.delay);
    }
    return;
  }

  // Otherwise try clicking on the slider track to approximate the target position.
  const min = await locator.evaluate((el: HTMLInputElement) => Number(el.min ?? 0));
  const max = await locator.evaluate((el: HTMLInputElement) => Number(el.max ?? 100));
  const ratio = Math.max(0, Math.min(1, (targetNum - min) / (max - min || 1)));
  const box = await locator.boundingBox();
  if (box) {
    const clickX = box.x + ratio * box.width;
    const clickY = box.y + box.height / 2;
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(options?.delay ?? 150);
    return;
  }

  // Final fallback: set value programmatically and dispatch trusted events.
  await locator.evaluate((el: HTMLInputElement, value: number) => {
    el.value = String(value);
    try {
      // @ts-ignore
      el.valueAsNumber = value;
    } catch (e) {
      // ignore
    }
    const inputEvent = new InputEvent('input', { bubbles: true });
    el.dispatchEvent(inputEvent);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, targetNum);
  await page.waitForTimeout(options?.delay ?? 150);
}

/**
 * Step a range locator by a number of Arrow key presses.
 * Positive steps press ArrowRight, negative press ArrowLeft.
 */
export async function stepRange(locator: Locator, steps: number, options?: { delay?: number; page?: Page }) {
  const dir = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
  for (let i = 0; i < Math.abs(steps); i++) {
    await locator.press(dir);
    if (options?.delay && options.page) await options.page.waitForTimeout(options.delay);
  }
}

export default setRangeValue;
