import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const root = process.env.QA_URL || 'http://127.0.0.1:3848';
const browser = await chromium.launch();
const results = [];
try {
  for (const mobile of [false, true]) for (const path of ['/', '/services/international-market-entry', '/contact']) for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1440, height: 900 }, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage();
    await page.addInitScript(() => {
      // The site's progressive animation deliberately skips automated browsers.
      // Measure the visitor path, including the existing motion effects.
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.__seoMetrics = { lcp: 0, cls: 0, shifts: [] };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) { window.__seoMetrics.lcp = entry.startTime; window.__seoMetrics.lcpElement = entry.element?.tagName; } }).observe({ type: 'largest-contentful-paint', buffered: true });
      let sessionStart = 0, last = 0, value = 0;
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
        if (entry.startTime - last > 1000 || entry.startTime - sessionStart > 5000) { sessionStart = entry.startTime; value = 0; }
        last = entry.startTime; value += entry.value; window.__seoMetrics.cls = Math.max(window.__seoMetrics.cls, value);
        if (entry.value > .01) window.__seoMetrics.shifts.push({ value: entry.value, time: entry.startTime, nodes: entry.sources.map(source => ({ tag: source.node?.tagName, className: source.node?.className })) });
      } }).observe({ type: 'layout-shift', buffered: true });
    });
    if (mobile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1600000 / 8, uploadThroughput: 750000 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    await page.goto(root + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      return { ...window.__seoMetrics, ttfb: navigation.responseStart, documentBytes: navigation.encodedBodySize, jsBytes: resources.filter(r => /\.js(\?|$)/.test(r.name)).reduce((sum,r) => sum+r.encodedBodySize,0), imageBytes: resources.filter(r => /\/_next\/image|\.(png|jpe?g|webp|avif)(\?|$)/.test(r.name)).reduce((sum,r) => sum+r.encodedBodySize,0), fontBytes: resources.filter(r => /\.(woff2?|ttf)(\?|$)/.test(r.name)).reduce((sum,r) => sum+r.encodedBodySize,0) };
    });
    results.push({ path, device: mobile ? 'mobile-lab' : 'desktop-lab', run, ...metrics });
    if (run === 3) {
      await page.screenshot({ path: `outputs/seo/visitor-${mobile ? 'mobile' : 'desktop'}-${path === '/' ? 'home' : path.split('/').at(-1)}.png`, fullPage: true });
    }
    await context.close();
  }
} finally { await browser.close(); }
await fs.mkdir('outputs/seo', { recursive: true });
await fs.writeFile('outputs/seo/performance-lab.json', JSON.stringify({ auditDate: '2026-10-13', root, method: 'Fresh Chromium context per run; mobile 390px, 4x CPU, 150ms latency, 1.6Mbps download; desktop unthrottled. Existing visitor motion enabled. 3 runs/page/device. Local server; no field INP measured.', results }, null, 2));
console.log(JSON.stringify(results, null, 2));
