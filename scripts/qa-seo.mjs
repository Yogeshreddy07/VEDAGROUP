import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = process.env.QA_URL || 'http://127.0.0.1:3848';
const indexable = process.env.QA_EXPECT_INDEXING !== 'false';
const approved = ['/', '/about', '/services', '/who-we-help', '/our-approach', '/contact', ...['business-development', 'international-market-entry', 'international-representation', 'export-business-development', 'strategic-partnerships', 'business-establishment-support', 'mergers-acquisitions', 'business-funding-finance', 'investor-connections', 'legal-professional-services'].map(slug => '/services/' + slug)];
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const sitemapResponse = await page.request.get(root + '/sitemap.xml');
  assert.equal(sitemapResponse.status(), 200);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, indexable ? approved.length : 0);
  assert.equal(new Set(urls).size, urls.length, 'duplicate sitemap URLs');
  if (indexable) assert.deepEqual(urls.map(url => new URL(url).pathname).sort(), [...approved].sort());
  const robots = await (await page.request.get(root + '/robots.txt')).text();
  if (indexable) {
    assert.match(robots, /Allow: \//);
    assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
    assert.match(robots, /Sitemap: https:\/\/vedagroup.uk\/sitemap.xml/);
  } else assert.match(robots, /Disallow: \/\s*$/m);
  const titles = new Set(), descriptions = new Set();
  const links = new Set(), canonicals = new Set();
  for (const url of approved.map(path => new URL(path, 'https://vedagroup.uk').href)) {
    const path = new URL(url).pathname;
    assert.equal(new URL(url).origin, 'https://vedagroup.uk');
    const response = await page.goto(root + path);
    assert.equal(response.status(), 200, path);
    if (!indexable) assert.match(response.headers()['x-robots-tag'], /noindex/);
    else assert.doesNotMatch(response.headers()['x-robots-tag'] || '', /noindex/);
    assert.equal(await page.locator('h1').count(), 1, path);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    assert.ok(title.includes('Veda Group'));
    assert.ok(!titles.has(title), 'duplicate title ' + path); titles.add(title);
    assert.ok(description && !descriptions.has(description), 'duplicate description ' + path); descriptions.add(description);
    assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).href, url);
    assert.ok(!canonicals.has(url)); canonicals.add(url);
    if (indexable) assert.doesNotMatch(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex|nofollow/);
    else assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    assert.equal(new URL(await page.locator('meta[property="og:url"]').getAttribute('content')).href, url);
    assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute('content'), 'summary_large_image');
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const schema of schemas) JSON.parse(schema);
    const graph = schemas.flatMap(schema => JSON.parse(schema)['@graph'] || []);
    for (const type of ['Organization', 'WebSite']) assert.equal(graph.filter(node => node['@type'] === type).length, 1, path + ' ' + type);
    const ids = new Set(graph.map(node => node['@id']));
    for (const node of graph) for (const property of ['publisher', 'provider', 'about', 'isPartOf', 'breadcrumb', 'mainEntityOfPage']) {
      if (node[property]?.['@id']) assert.ok(ids.has(node[property]['@id']), 'unresolved entity ' + path);
    }
    for (const href of await page.locator('a[href^="/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) links.add(href);
    await page.evaluate(() => { for (const img of document.images) img.loading = 'eager'; });
    await page.evaluate(async () => { await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
    assert.deepEqual(await page.locator('img').evaluateAll(nodes => nodes.filter(img => !img.complete || !img.naturalWidth || !img.hasAttribute('alt')).map(img => img.src)), [], path + ' image');
    assert.ok(schemas.some(schema => schema.includes('WebPage') || schema.includes('AboutPage') || schema.includes('ContactPage')));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path);
  }
  for (const href of links) assert.equal((await page.request.get(root + href)).status(), 200, href);
  const redirect = await page.request.get(root + '/about/?source=seo', { maxRedirects: 0 });
  assert.equal(redirect.status(), 308);
  assert.equal(redirect.headers().location, '/about?source=seo');
  const www = await page.request.get(root + '/about?source=seo', { headers: { Host: 'www.vedagroup.uk' }, maxRedirects: 0 });
  if (process.env.QA_WWW_REDIRECT === 'true') {
    assert.equal(www.status(), 308);
    assert.equal(www.headers().location, 'https://vedagroup.uk/about?source=seo');
  } else assert.equal(www.status(), 200, 'www redirect remains opt-in until hosting is corrected');
  for (const path of ['/privacy', '/cookies', '/terms', '/insights', '/careers', '/events']) {
    await page.goto(root + path);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  }
  await page.goto(root + '/contact?service=international-market-entry');
  assert.equal(await page.locator('#service').inputValue(), 'international-market-entry');
  assert.equal((await page.request.get(root + '/services/not-a-service')).status(), 404);
  const image = await page.request.get(root + '/opengraph-image');
  assert.equal(image.status(), 200); assert.match(image.headers()['content-type'], /image\/png/);
  assert.equal((await page.request.get(root + '/icon.svg')).status(), 200);
  await fs.mkdir('test-results', { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [...approved, '/privacy', '/cookies', '/terms', '/insights', '/careers', '/events']) {
      await page.goto(root + path);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(axe.violations.map(v => v.id), [], path);
    }
    await page.goto(root);
    await page.screenshot({ path: `test-results/seo-home-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  for (const path of ['/', '/services/international-market-entry', '/contact']) {
    const response = await staticPage.goto(root + path);
    assert.equal(response.status(), 200);
    assert.equal(await staticPage.locator('h1').count(), 1);
    assert.ok(await staticPage.locator('h1').isVisible());
    assert.ok(await staticPage.locator('a[href="/services"]').count());
  }
  await staticContext.close();
  console.log(`SEO QA passed (${indexable ? 'production' : 'nonindexable'}): 16 pages; unique metadata; canonicals; robots; sitemap; linked JSON-LD entities; images; internal links; redirects; draft noindex; 404; social image; 20 routes desktop/mobile accessibility and overflow. No enquiries submitted.`);
} finally { await browser.close(); }
