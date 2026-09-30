// Проверка ширин: горизонтальный скролл, вылезающие элементы, скриншоты.
// node scripts/widths.mjs [outDir] [siteUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2] || 'widths-out';
const site = process.argv[3] || 'http://localhost:4321/';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const w of [360, 390, 768, 1024, 1280, 1440, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(site, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  const res = await page.evaluate((vw) => {
    const bad = [];
    for (const el of document.querySelectorAll('main *, footer *, header *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        // игнорируем то, что обрезано родителем с overflow
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) {
          const pc = getComputedStyle(p);
          if (/(hidden|clip)/.test(pc.overflow + pc.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 1 && pr.left >= -1) { clipped = true; break; } }
          p = p.parentElement;
        }
        if (!clipped) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
      }
    }
    return { sw: document.documentElement.scrollWidth, h: document.body.scrollHeight, bad: bad.slice(0, 12) };
  }, w);
  console.log(w, 'scrollWidth', res.sw, 'height', res.h, res.bad.length ? '\n   ' + res.bad.join('\n   ') : 'ok');
  await page.screenshot({ path: path.join(out, `w${w}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
