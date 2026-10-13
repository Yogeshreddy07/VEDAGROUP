import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const slugs=['business-development','international-market-entry','international-representation','export-business-development','strategic-partnerships','business-establishment-support','mergers-acquisitions','business-funding-finance','investor-connections','legal-professional-services'];
const routes=['/','/about','/services','/who-we-help','/our-approach',...slugs.map(s=>'/services/'+s)];
const browser=await chromium.launch();
const context=await browser.newContext();
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir('test-results/editorial',{recursive:true});
for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000});
  for(const route of routes){
    console.log(width,route);
    assert.equal((await page.goto('http://127.0.0.1:3847'+route)).status(),200,route);
    await page.locator('h1').waitFor();
    await page.evaluate(()=>{for(const i of document.images)i.loading='eager'});
    await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: ${route} overflow`);
    assert.deepEqual(await page.locator('main img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[],`${route} broken image`);
    assert.equal(await page.locator('h1').count(),1);
    if(width===1440||width===390){
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],`${width}: ${route}`);
    }
    await page.evaluate(()=>window.scrollTo(0,0));
    if(['/','/about','/services','/who-we-help','/our-approach','/services/business-development'].includes(route))await page.screenshot({path:`test-results/editorial/${route.replaceAll('/','-')||'home'}-${width}.png`,fullPage:true});
  }
}
await page.getByRole('button',{name:'Menu',exact:true}).click();
await page.locator('summary').filter({hasText:'Services'}).click();
await page.locator('.mega-item[href="/services/business-development"]').click();
await page.waitForURL('**/services/business-development');
await page.getByRole('link',{name:'Discuss This Service'}).click();
await page.waitForURL('**/contact?service=business-development');
assert.equal(await page.locator('#service').inputValue(),'business-development');
assert.deepEqual(errors,[]);
await browser.close();
console.log('Passed: 15 routes, all images loaded, 3 responsive widths, desktop/mobile accessibility, service navigation and contact selection.');
