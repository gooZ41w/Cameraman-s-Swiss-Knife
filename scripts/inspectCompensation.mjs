import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('BROWSER LOG:', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

  await page.goto('http://localhost:5175');
  await page.click('button:has-text("曝光")');
  await page.selectOption('[data-testid="nd-select"]', 'ND2');
  await page.selectOption('[data-testid="solve-for-select"]', 'shutter');
  await page.waitForTimeout(200);

  const compVal = await page.$eval('[data-testid="compensation-slider"]', (el) => el.value);
  const compText = await page.$eval('[data-testid="compensated-shutter"]', (el) => el.textContent);
  console.log('comp slider value:', compVal);
  console.log('compensated_shutter text:', compText);
  const evDisplay = await page.$eval('[data-testid="ev-display"]', (el) => el.textContent);
  const apertureVal = await page.$eval('[data-testid="aperture-slider"]', (el) => el.value);
  const shutterVal = await page.$eval('[data-testid="shutter-slider"]', (el) => el.value);
  const isoVal = await page.$eval('[data-testid="iso-slider"]', (el) => el.value);
  const ndStops = await page.$eval('[data-testid="nd-stops-display"]', (el) => el.textContent);
  console.log('evDisplay:', evDisplay);
  console.log('aperture:', apertureVal, 'shutter:', shutterVal, 'iso:', isoVal, 'ndStops:', ndStops);

  // set compensation via input & change
  await page.$eval('[data-testid="compensation-slider"]', (el) => { el.value = '1'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(200);

  const compVal2 = await page.$eval('[data-testid="compensation-slider"]', (el) => el.value);
  const compText2 = await page.$eval('[data-testid="compensated-shutter"]', (el) => el.textContent);
  const evDisplay2 = await page.$eval('[data-testid="ev-display"]', (el) => el.textContent);
  const ndStops2 = await page.$eval('[data-testid="nd-stops-display"]', (el) => el.textContent);
  console.log('evDisplay after:', evDisplay2, 'ndStops after:', ndStops2);
  console.log('after set comp slider value:', compVal2);
  console.log('after set compensated_shutter text:', compText2);

  await browser.close();
})();
