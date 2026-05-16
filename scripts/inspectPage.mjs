import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('BROWSER LOG:', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await page.goto('http://localhost:5175');

  const buttons = await page.$$eval('button', (nodes) => nodes.map((n) => ({ text: n.textContent?.trim(), outer: n.outerHTML })));
  console.log('buttons:', JSON.stringify(buttons, null, 2));

  try {
    await page.click('button:has-text("曝光")');
  } catch (e) {
    console.error('click failed', e.toString());
  }

  await page.waitForTimeout(500);

  const exp = await page.$('[data-testid="exposure-page"]');
  console.log('exposure-page found:', !!exp);
  if (exp) {
    const html = await exp.evaluate((n) => n.outerHTML);
    console.log('exposure outerHTML snippet:', html.slice(0, 400));
  }
  const full = await page.content();
  console.log('page content length:', full.length);
  console.log('contains 曝光计算器?', full.includes('曝光计算器'));
  console.log('full page content:\n', full);

  await browser.close();
})();
