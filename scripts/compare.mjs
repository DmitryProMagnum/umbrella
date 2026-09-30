// Сверка с эталоном: попарные скриншоты секций «эталон | сайт».
// Использование: node scripts/compare.mjs [outDir] [siteUrl]
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const out = process.argv[2] || 'compare-out';
const site = process.argv[3] || 'http://localhost:4321/';
fs.mkdirSync(out, { recursive: true });

const designs = {
  1440: pathToFileURL(path.resolve('design/desktop.html')).href,
  390: pathToFileURL(path.resolve('design/mobile.html')).href,
};

async function shoot(browser, url, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // прогрузить lazy-изображения
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
  const rects = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section, footer')).map((el) => {
      const r = el.getBoundingClientRect();
      return { y: Math.round(r.top + window.scrollY), h: Math.round(r.height), id: el.id || el.tagName };
    }),
  );
  const docW = await page.evaluate(() => document.documentElement.scrollWidth);
  const buf = await page.screenshot({ fullPage: true });
  await ctx.close();
  return { buf, rects, docW };
}

const browser = await chromium.launch();
for (const w of [1440, 390]) {
  const d = await shoot(browser, designs[w], w);
  const s = await shoot(browser, site, w);
  console.log(`width ${w}: site scrollWidth=${s.docW}`);
  // в эталоне шапка внутри hero, на сайте — отдельно: начинаем hero сайта с 0
  s.rects[0] = { ...s.rects[0], h: s.rects[0].h + s.rects[0].y, y: 0 };
  const n = Math.min(d.rects.length, s.rects.length);
  const dMeta = await sharp(d.buf).metadata();
  const sMeta = await sharp(s.buf).metadata();
  for (let i = 0; i < n; i++) {
    const a = d.rects[i], b = s.rects[i];
    const ha = Math.min(a.h, dMeta.height - a.y), hb = Math.min(b.h, sMeta.height - b.y);
    const ia = await sharp(d.buf).extract({ left: 0, top: a.y, width: w, height: ha }).toBuffer();
    const ib = await sharp(s.buf).extract({ left: 0, top: b.y, width: Math.min(w, sMeta.width), height: hb }).toBuffer();
    const H = Math.max(ha, hb), gap = 16;
    await sharp({ create: { width: w * 2 + gap, height: H, channels: 3, background: '#ff00aa' } })
      .composite([{ input: ia, left: 0, top: 0 }, { input: ib, left: w + gap, top: 0 }])
      .jpeg({ quality: 70 })
      .toFile(path.join(out, `${w}-${String(i).padStart(2, '0')}-${b.id}.jpg`));
    console.log(`  ${i} ${a.id}(${a.h}) vs ${b.id}(${b.h})`);
  }
}
await browser.close();
