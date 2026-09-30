// Автоматическая проверка мобильной вёрстки: переполнения, обрезка, зоны нажатия, шрифты.
// node scripts/mobile-scan.mjs [siteUrl] [outDir]
import { chromium } from 'playwright';
import fs from 'node:fs';

const site = process.argv[2] || 'http://localhost:4321/';
const out = process.argv[3];
if (out) fs.mkdirSync(out, { recursive: true });
const WIDTHS = [320, 360, 375, 390, 414, 430];

const browser = await chromium.launch();
const all = {};
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(site, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
  const res = await page.evaluate((vw) => {
    const issues = [];
    const sel = (el) => {
      const parts = [];
      for (let e = el, i = 0; e && e !== document.body && i < 4; e = e.parentElement, i++) {
        const cls = [...e.classList].filter((c) => !/^(is-|astro-)/.test(c)).slice(0, 2).join('.');
        parts.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (cls ? '.' + cls : ''));
      }
      return parts.join(' > ');
    };
    const visible = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const skipMedia = (el) => el.closest('picture, video, svg, .parallax-media, .hero__video, .stage-m__panel, .demo__bg, .fline, .flows__glow, .flows-m__glow, .footer__word, .tree__lines, .step__run, .step__fill');
    const els = [...document.querySelectorAll('header *, main *, footer *')].filter((el) => visible(el) && !el.closest('.d-only, .mnav, .flows-d, .mod-grid'));

    // 1. обрезка содержимого элементом с overflow hidden/clip
    for (const el of els) {
      const cs = getComputedStyle(el);
      if (!/(hidden|clip)/.test(cs.overflowX + cs.overflowY)) continue;
      if (skipMedia(el) || el.matches('.acc__inner, .h1-line, .bar, .hours__bar, .sr-only, .hp')) continue;
      for (const ch of el.querySelectorAll('*')) {
        if (!visible(ch) || skipMedia(ch) || ch.closest('.acc__panel[inert]')) continue;
        if (!ch.childNodes.length || ![...ch.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const pr = el.getBoundingClientRect(), cr = ch.getBoundingClientRect();
        const dx = Math.max(pr.left - cr.left, cr.right - pr.right), dy = Math.max(pr.top - cr.top, cr.bottom - pr.bottom);
        if (dx > 1 || dy > 1) issues.push({ type: 'clipped-text', sel: sel(ch), by: sel(el), px: Math.round(Math.max(dx, dy)), text: ch.textContent.trim().slice(0, 40) });
      }
    }
    // 2. текст, вылезающий за свой бокс (nowrap / ellipsis / фиксированная высота)
    for (const el of els) {
      if (skipMedia(el)) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      const cs = getComputedStyle(el);
      if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && cs.display !== 'inline')
        issues.push({ type: cs.textOverflow === 'ellipsis' ? 'ellipsis' : 'x-overflow', sel: sel(el), px: el.scrollWidth - el.clientWidth, text: el.textContent.trim().slice(0, 40) });
      if (el.scrollHeight > el.clientHeight + 2 && cs.height !== 'auto' && /px/.test(cs.height) && cs.overflowY !== 'visible')
        issues.push({ type: 'y-overflow', sel: sel(el), px: el.scrollHeight - el.clientHeight, text: el.textContent.trim().slice(0, 40) });
    }
    // 3. текст за пределами «карточки» (ближайший предок с фоном/рамкой и скруглением)
    const isCard = (e) => { const cs = getComputedStyle(e); return parseFloat(cs.borderTopLeftRadius) >= 12 && (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0); };
    for (const el of els) {
      if (skipMedia(el) || el.closest('[aria-hidden="true"] svg')) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      let card = el.parentElement; while (card && card !== document.body && !isCard(card)) card = card.parentElement;
      if (!card || card === document.body || card === el) continue;
      const r = document.createRange(); r.selectNodeContents(el); const tr = r.getBoundingClientRect(); const cr = card.getBoundingClientRect();
      const d = Math.max(cr.left - tr.left, tr.right - cr.right);
      if (d > 0.5) issues.push({ type: 'text-outside-card', sel: sel(el), card: sel(card), px: Math.round(d * 10) / 10, text: el.textContent.trim().slice(0, 40) });
    }
    // 4. выход за ширину экрана
    for (const el of els) {
      if (skipMedia(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        let clip = false; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (/(hidden|clip)/.test(cs.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 1 && pr.left >= -1) { clip = true; break; } } }
        if (!clip) issues.push({ type: 'offscreen', sel: sel(el), px: Math.round(Math.max(r.right - vw, -r.left)) });
      }
    }
    // 5. зоны нажатия
    for (const el of document.querySelectorAll('a, button, input, select, textarea, [role="button"]')) {
      if (!visible(el) || el.closest('.d-only, .mnav, [aria-hidden="true"], .hp, .mod-grid, .flows-d') || el.closest('p')) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 43.5 || r.width < 43.5) issues.push({ type: 'tap-target', sel: sel(el), size: `${Math.round(r.width)}x${Math.round(r.height)}`, text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30) });
    }
    // 6. поля ввода < 16px (iOS увеличивает страницу при фокусе)
    for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
      if (!visible(el) || el.closest('.hp')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 16) issues.push({ type: 'input-font<16', sel: sel(el), fs });
    }
    // 7. мелкий текст (не в иллюстрациях)
    for (const el of els) {
      if (el.closest('[aria-hidden="true"]')) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText && parseFloat(getComputedStyle(el).fontSize) < 12) issues.push({ type: 'small-text', sel: sel(el), fs: getComputedStyle(el).fontSize, text: el.textContent.trim().slice(0, 30) });
    }
    return { sw: document.documentElement.scrollWidth, issues };
  }, w);
  all[w] = res;
  if (out) await page.screenshot({ path: `${out}/full-${w}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();

// свод: одинаковые проблемы на разных ширинах — одной строкой
const merged = new Map();
for (const [w, r] of Object.entries(all)) {
  if (r.sw > +w) console.log(`!! horizontal scroll at ${w}: ${r.sw}`);
  for (const i of r.issues) {
    const key = `${i.type} | ${i.sel}${i.by ? ' ⟂ ' + i.by : ''}${i.card ? ' ⟂ ' + i.card : ''}`;
    const m = merged.get(key) || { ...i, widths: [] };
    m.widths.push(`${w}${i.px !== undefined ? `(${i.px})` : ''}${i.size ? `(${i.size})` : ''}`);
    merged.set(key, m);
  }
}
for (const [k, m] of merged) console.log(`${k}\n    widths: ${m.widths.join(' ')}${m.text ? `  «${m.text}»` : ''}${m.fs ? `  fs=${m.fs}` : ''}`);
console.log(`\n${merged.size} distinct issues`);
