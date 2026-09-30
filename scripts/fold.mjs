// Первый экран: что помещается без прокрутки. node scripts/fold.mjs [outDir] [siteUrl]
import { chromium } from 'playwright';
const out = process.argv[2] || 'fold-out';
const site = process.argv[3] || 'http://localhost:4321/';
const browser = await chromium.launch();
for (const [w, h] of [[1280, 680], [1366, 768], [1440, 900], [1508, 680], [1920, 1080], [1024, 768], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(site, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const q = (s) => document.querySelector(s)?.getBoundingClientRect();
    const btn = [...document.querySelectorAll('.hero__ctas')].map((e) => e.getBoundingClientRect()).find((b) => b.height);
    const stage = [...document.querySelectorAll('.stage-wrap')].map((e) => e.getBoundingClientRect()).find((b) => b.height);
    return { h1: Math.round(parseFloat(getComputedStyle(document.querySelector('.hero .h1')).fontSize)), ctasBottom: Math.round(btn.bottom), stageTop: Math.round(stage.top) };
  });
  console.log(`${w}x${h}: h1=${r.h1}px, кнопки до ${r.ctasBottom}px, сцена с ${r.stageTop}px → видно сцены ${Math.max(0, h - r.stageTop)}px`);
  await page.screenshot({ path: `${out}/fold-${w}x${h}.png` });
  await ctx.close();
}
await browser.close();
