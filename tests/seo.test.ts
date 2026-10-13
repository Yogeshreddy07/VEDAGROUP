import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indexingEnabled, resolveSiteUrl, pageSchema } from '../lib/seo';
import { searchPages } from '../lib/content';

test('only production allows indexing, with staging override', () => {
  assert.equal(indexingEnabled({ NODE_ENV: 'development', SEO_INDEXING: 'true' }), false);
  assert.equal(indexingEnabled({ NODE_ENV: 'production', VERCEL_ENV: 'preview' }), false);
  assert.equal(indexingEnabled({ NODE_ENV: 'production', SEO_INDEXING: 'false' }), false);
  assert.equal(indexingEnabled({ NODE_ENV: 'production', VERCEL_ENV: 'production' }), true);
  assert.equal(indexingEnabled({ NODE_ENV: 'production' }), true);
});
test('canonical origin rejects paths, credentials and non-web protocols', () => {
  assert.equal(resolveSiteUrl('https://vedagroup.uk/'), 'https://vedagroup.uk');
  for (const value of ['https://example.com/path', 'https://user:pass@example.com', 'javascript:alert(1)', 'https://example.com?q=x']) assert.throws(() => resolveSiteUrl(value));
});
test('sitemap excludes unfinished pages and service breadcrumbs preserve hierarchy', () => {
  assert.equal(searchPages.length, 16);
  for (const path of ['/privacy', '/cookies', '/terms', '/insights']) assert.ok(!searchPages.includes(path));
  const graph = pageSchema('/services/international-market-entry', 'International Market Entry', 'Market entry support')['@graph'];
  const breadcrumb = graph.find(node => node['@type'] === 'BreadcrumbList')!;
  assert.deepEqual((breadcrumb.itemListElement as {name:string;position:number}[]).map(item => [item.name, item.position]), [['Home', 1], ['Services', 2], ['International Market Entry', 3]]);
  assert.ok(graph.some(node => node['@type'] === 'Service'));
});
