// Проверка доступности (axe-core, WCAG 2.1 AA) на 1440 и 390.
// node scripts/axe.mjs [siteUrl]
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const site = process.argv[2] || 'http://localhost:4321/';
const browser = await chromium.launch();
let total = 0;
for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(site, { waitUntil: 'networkidle' });
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  console.log(`\n== ${width}px: ${res.violations.length} violations, ${res.passes.length} passes`);
  for (const v of res.violations) {
    total++;
    console.log(`- [${v.impact}] ${v.id}: ${v.help}`);
    for (const n of v.nodes.slice(0, 5)) console.log(`    ${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
  }
  await ctx.close();
}
await browser.close();
process.exit(total ? 1 : 0);
