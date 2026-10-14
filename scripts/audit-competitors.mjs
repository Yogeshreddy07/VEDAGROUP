import fs from 'node:fs/promises';
const urls = ['https://www.thevedagroup.com/', 'https://vedagroup.org/about-us', 'https://vedagroup.in/', 'https://vedagroupco.com/', 'https://www.frenger.com/', 'https://delvinco.com/', 'https://evanssalesconsultancy.co.uk/international-market-entry'];
const results = await Promise.all(urls.map(async url => {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) }); const body = await r.text();
    const scripts = [...body.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(match => { try { return JSON.parse(match[1]); } catch { return { parseError: true }; } });
    const meta = [...body.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]).find(tag => /name=["']description["']/i.test(tag));
    const links = [...body.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map(match => match[1]);
    const text = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
    return { requestedUrl: url, finalUrl: r.url, status: r.status, title: body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1], description: meta?.match(/content=["']([^"']*)["']/i)?.[1], approximateExtractedWords: text.split(' ').length, links: [...new Set(links)].slice(0,70), structuredData: scripts };
  } catch (e) { return { url, error: e.message, cause: e.cause?.code }; }
}));
await fs.writeFile('outputs/seo/competitor-http.json', JSON.stringify({ auditDate: '2026-10-13', results }, null, 2));
console.log(JSON.stringify(results.map(({structuredData, links,...result})=>({...result, schemaBlocks: structuredData?.length, linksObserved: links?.length})),null,2));
