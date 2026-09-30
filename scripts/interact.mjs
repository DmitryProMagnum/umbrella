// Проверка анимаций и интерактива (движение включено).
// node scripts/interact.mjs [outDir] [siteUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2] || 'interact-out';
const site = process.argv[3] || 'http://localhost:4321/';
fs.mkdirSync(out, { recursive: true });
const shot = (page, name, opts = {}) => page.screenshot({ path: path.join(out, name), ...opts });
const browser = await chromium.launch();

// --- desktop: загрузка hero, прокрутка, параллакс ---
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(site);
  await page.waitForTimeout(250);
  await shot(page, 'd-load-0250.png');
  await page.waitForTimeout(2200);
  await shot(page, 'd-load-2450.png');
  await page.mouse.wheel(0, 450);
  await page.waitForTimeout(600);
  await shot(page, 'd-scroll-450.png');
  const tilt = await page.$eval('[data-tilt]', (el) => el.style.transform);
  console.log('tilt @450:', tilt);
  for (const id of ['how', 'finance', 'projects', 'people', 'groups', 'ai', 'implementation']) {
    await page.$eval(`#${id}`, (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(1900);
    await shot(page, `d-${id}.png`);
  }
  console.log('header scrolled:', await page.$eval('[data-header]', (el) => el.className));
  // форма: пустая отправка → ошибки; затем валидная
  await page.$eval('#demo', (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.click('[data-demo-form] button[type=submit]');
  await page.waitForTimeout(300);
  console.log('errors shown:', await page.$$eval('.ffield__err', (els) => els.map((e) => e.textContent)));
  console.log('focused:', await page.evaluate(() => document.activeElement?.id));
  await page.fill('#d-name', 'Тест');
  await page.fill('#d-contact', 'abc');
  await page.click('[data-demo-form] button[type=submit]');
  await page.waitForTimeout(200);
  console.log('contact err:', await page.$eval('#d-contact-err', (e) => e.textContent));
  await page.fill('#d-contact', '+7 (900) 123-45-67');
  await page.click('[data-demo-form] button[type=submit]');
  await page.waitForTimeout(150);
  await shot(page, 'd-form-loading.png');
  await page.waitForTimeout(1500);
  console.log('form class:', await page.$eval('[data-demo-form]', (e) => e.className));
  await shot(page, 'd-form-success.png');
  // AI-кнопка
  await page.click('[data-demo-form] [data-form-again]');
  await page.$eval('#ai', (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.click('[data-ai-interest]');
  await page.waitForTimeout(1200);
  console.log('interest:', await page.$eval('[data-interest]', (e) => e.value), 'note hidden:', await page.$eval('[data-ai-note]', (e) => e.hidden));
  console.log('dataLayer:', JSON.stringify(await page.evaluate(() => window.dataLayer)));
  console.log('console errors:', errors);
  await ctx.close();
}

// --- mobile: меню, аккордеон ---
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(site);
  await page.waitForTimeout(1800);
  await shot(page, 'm-load.png');
  await page.click('[data-menu-open]');
  await page.waitForTimeout(500);
  await shot(page, 'm-menu.png');
  console.log('menu expanded:', await page.$eval('[data-menu-open]', (e) => e.getAttribute('aria-expanded')), 'focus:', await page.evaluate(() => document.activeElement?.getAttribute('aria-label')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  console.log('menu after Esc:', await page.$eval('[data-menu]', (e) => e.className));
  await page.$eval('#modules', (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForTimeout(600);
  await page.click('#acc-btn-2');
  await page.waitForTimeout(700);
  console.log('acc states:', await page.$$eval('.acc__btn', (els) => els.map((e) => e.getAttribute('aria-expanded')).join(',')));
  await shot(page, 'm-acc.png', { fullPage: false });
  await ctx.close();
}
await browser.close();
