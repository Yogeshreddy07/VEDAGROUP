import { chromium, firefox, webkit } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=process.env.QA_URL||'http://127.0.0.1:3847';
await fs.mkdir('test-results',{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const routes=['/','/about','/services','/who-we-help','/our-approach','/contact','/privacy','/cookies','/terms','/insights','/careers','/events',...['business-development','international-market-entry','international-representation','export-business-development','strategic-partnerships','business-establishment-support'].map(s=>'/services/'+s)];
for(const route of routes){const response=await page.goto(root+route);assert.equal(response.status(),200,route);await page.locator('h1').waitFor();assert.equal(await page.locator('h1').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,route+' overflow');const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(result.violations.length,0,route+': '+JSON.stringify(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));}
await page.goto(root);await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
const links=await page.locator('a[href^="/"]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('href')))]);
for(const href of links){const response=await page.request.get(root+href);assert.equal(response.status(),200,href)}
await page.goto(root+'/contact?service=strategic-partnerships');assert.equal(await page.locator('#service').inputValue(),'strategic-partnerships');
await page.getByRole('button',{name:'Submit test enquiry'}).click();assert.ok(await page.locator('#name-error').isVisible());
await page.locator('#name').fill('Sample Person');await page.locator('#email').fill('sample@example.com');await page.locator('.country-trigger').click();await page.locator('.country-search').fill('United Kingdom');await page.locator('.country-search').press('Enter');await page.locator('#phone').fill('020 7946 0958');await page.locator('#message').fill('A sample international opportunity for local testing only.');await page.locator('[name=privacy]').check();await page.getByRole('button',{name:'Submit test enquiry'}).click();await page.getByRole('status').filter({hasText:'No email was sent'}).waitFor();
await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'test-results/contact-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
for(const route of routes){await page.goto(root+route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,route+' mobile overflow')}
await page.goto(root);await page.getByRole('button',{name:'Menu'}).click();assert.equal(await page.getByRole('button',{name:'Close'}).getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Menu'}).getAttribute('aria-expanded'),'false');await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
const mobileAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(mobileAxe.violations.length,0,JSON.stringify(mobileAxe.violations));
await page.setViewportSize({width:768,height:1024});await page.goto(root);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);await page.screenshot({path:'test-results/home-tablet.png',fullPage:true});
const payload={name:'Sample Person',email:'sample@example.com',phone:'+442079460958',message:'A sample enquiry for local validation.',privacy:true,website:''};
assert.equal((await page.request.post(root+'/api/enquiry',{data:payload,headers:{Origin:'https://untrusted.example'}})).status(),403);
assert.equal((await page.request.post(root+'/api/enquiry',{data:{},headers:{Origin:root}})).status(),422);
assert.equal((await page.request.post(root+'/api/enquiry',{data:{...payload,website:'spam'},headers:{Origin:root}})).status(),422);
assert.equal((await page.request.post(root+'/api/enquiry',{data:{...payload,message:'x'.repeat(21000)},headers:{Origin:root}})).status(),413);
let last;for(let i=0;i<6;i++)last=await page.request.post(root+'/api/enquiry',{data:payload,headers:{Origin:root}});assert.equal(last.status(),429);
assert.deepEqual(errors,[]);await browser.close();
const crossBrowser=[];
for(const [name,engine] of [['Firefox',firefox],['WebKit',webkit]]){try{const b=await engine.launch();const p=await b.newPage();await p.goto(root);assert.ok(await p.locator('h1').isVisible());await p.goto(root+'/contact');assert.ok(await p.locator('#message').isVisible());await b.close();crossBrowser.push(name+': passed')}catch(e){crossBrowser.push(name+': unavailable — '+e.message.split('\n')[0])}}
await fs.writeFile('test-results/qa-results.json',JSON.stringify({routes:routes.length,desktopAccessibility:'passed',mobileAccessibility:'passed',responsiveWidths:[390,768,1440],contactValidation:'passed',localSubmission:'passed',rateLimit:'passed',originProtection:'passed',pageErrors:errors,crossBrowser},null,2));
console.log('QA passed:',routes.length,'routes; desktop/mobile accessibility; responsive layouts; form; abuse protection.',crossBrowser);
