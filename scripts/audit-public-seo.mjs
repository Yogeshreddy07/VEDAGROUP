// Read-only public HTTP evidence. Never submits forms or prints secrets.
import fs from 'node:fs/promises';
const targets = ['https://vedagroup.uk/', 'https://vedagroup.uk/robots.txt', 'https://vedagroup.uk/sitemap.xml', 'https://vedagroup.uk/about', 'https://vedagroup.uk/services/international-market-entry', 'https://vedagroup.uk/contact', 'https://vedagroup.uk/services/not-a-service', 'https://vedagroup.uk/about/', 'http://vedagroup.uk/', ...['/', '/robots.txt', '/sitemap.xml', '/about', '/services/international-market-entry', '/contact', '/services/not-a-service', '/about/'].map(path => 'https://www.vedagroup.uk' + path)];
const agents = { browser: 'Mozilla/5.0 SEO read-only audit', googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', adsbot: 'AdsBot-Google (+http://www.google.com/adsbot.html)' };
const results = await Promise.all(targets.map(async url => {
  try {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': agents.browser } });
    const body = await r.text();
    return { url, status: r.status, headers: Object.fromEntries(['location', 'content-type', 'x-robots-tag', 'x-content-type-options', 'referrer-policy', 'x-frame-options', 'strict-transport-security'].map(key => [key, r.headers.get(key)])), title: body.match(/<title>(.*?)<\/title>/s)?.[1], robots: body.match(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/)?.[1], canonical: body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/)?.[1], h1Count: (body.match(/<h1\b/g) || []).length, ...(url.endsWith('.txt') || url.endsWith('.xml') ? { body } : {}) };
  } catch (e) { return { url, error: e.message, cause: e.cause?.code }; }
}));
for (const [agent, userAgent] of Object.entries(agents).slice(1)) {
  try { const r = await fetch(targets[0], { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': userAgent } }); results.push({ agent, url: r.url, status: r.status, serverRenderedH1: /<h1\b/.test(await r.text()) }); }
  catch (e) { results.push({ agent, error: e.message, cause: e.cause?.code }); }
}
await fs.mkdir('outputs/seo', { recursive: true });
await fs.writeFile('outputs/seo/production-http.json', JSON.stringify({ auditDate: '2026-10-13', limitation: 'User-agent simulation is not a verified Googlebot IP or Search Console live test.', results }, null, 2));
console.log(JSON.stringify(results, null, 2));
