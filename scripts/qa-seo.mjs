import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = process.env.QA_URL || 'http://127.0.0.1:3848';
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const sitemap = await (await page.request.get(root + '/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, 16);
  const robots = await (await page.request.get(root + '/robots.txt')).text();
  assert.match(robots, /Allow: \//);
  assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
  const titles = new Set(), descriptions = new Set();
  for (const url of urls) {
    const path = new URL(url).pathname;
    assert.equal(new URL(url).origin, 'https://vedagroup.uk');
    const response = await page.goto(root + path);
    assert.equal(response.status(), 200, path);
    assert.equal(await page.locator('h1').count(), 1, path);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    assert.ok(title.includes('Veda Group'));
    assert.ok(!titles.has(title), 'duplicate title ' + path); titles.add(title);
    assert.ok(description && !descriptions.has(description), 'duplicate description ' + path); descriptions.add(description);
    assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).href, url);
    assert.doesNotMatch(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex|nofollow/);
    assert.equal(new URL(await page.locator('meta[property="og:url"]').getAttribute('content')).href, url);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const schema of schemas) JSON.parse(schema);
    assert.ok(schemas.some(schema => schema.includes('WebPage') || schema.includes('AboutPage') || schema.includes('ContactPage')));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path);
  }
  for (const path of ['/privacy', '/cookies', '/terms', '/insights']) {
    await page.goto(root + path);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  }
  assert.equal((await page.request.get(root + '/services/not-a-service')).status(), 404);
  const image = await page.request.get(root + '/opengraph-image');
  assert.equal(image.status(), 200); assert.match(image.headers()['content-type'], /image\/png/);
  assert.equal((await page.request.get(root + '/icon.svg')).status(), 200);
  await fs.mkdir('test-results', { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/', '/services/international-market-entry', '/contact']) {
      await page.goto(root + path);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(axe.violations.map(v => v.id), [], path);
    }
    await page.goto(root);
    await page.screenshot({ path: `test-results/seo-home-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log('SEO QA passed: 16 pages; unique metadata; canonicals; robots; sitemap; JSON-LD; draft noindex; 404; social image; desktop/mobile accessibility and overflow. No enquiries submitted.');
} finally { await browser.close(); }
