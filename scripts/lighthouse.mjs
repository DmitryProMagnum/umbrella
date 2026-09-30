// Lighthouse (Chromium из Playwright). node scripts/lighthouse.mjs [url]
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const url = process.argv[2] || 'http://localhost:4322/';
const port = 9333;
const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
const flags = { port, output: 'json', logLevel: 'error', maxWaitForLoad: 30000, onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };
for (const [name, config] of [['desktop', desktopConfig], ['mobile', undefined]]) {
  const res = await lighthouse(url, flags, config);
  const r = res.lhr;
  console.log(`\n== ${name}`);
  for (const [k, v] of Object.entries(r.categories)) console.log(`${k}: ${Math.round(v.score * 100)}`);
  for (const a of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index']) console.log(`  ${a}: ${r.audits[a].displayValue}`);
  const low = Object.values(r.audits).filter((a) => a.score !== null && a.score < 0.9 && !['informative', 'manual', 'notApplicable'].includes(a.scoreDisplayMode));
  console.log('  low:', low.map((a) => `${a.id}${a.displayValue ? ` (${a.displayValue})` : ''}`).join(' | ') || '—');
}
await browser.close();
