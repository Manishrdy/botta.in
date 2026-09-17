import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://api.github.com/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(route.request().url().includes('/events/')?[]:{public_repos:24,followers:8})}));
await page.route('https://github-contributions-api.jogruber.de/**',route=>route.fulfill({status:503,body:'{}'}));
const routes=['/','/about/','/projects/','/projects/coldstart/','/posts/','/posts/filter-before-you-score/','/contact/','/activity/','/resume/','/experience/microsoft/','/experience/yellow-ai/','/experience/tradeliv/','/experience/cognizant/'];
for(const route of routes){
 await page.goto(`http://127.0.0.1:3000${route}`);await page.waitForTimeout(150);
 for(const width of [390,1440]){
 await page.setViewportSize({width,height:900});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${route} ${width}`);
 }
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],`accessibility ${route}`);
 for(const href of await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){
 if(href.startsWith('/')&&!href.startsWith('//')){const url=new URL(href,'http://localhost');assert.ok(fs.existsSync(`out${url.pathname}${url.pathname.endsWith('/')?'index.html':''}`),`broken link ${href}`);}
 }
}
await page.goto('http://127.0.0.1:3000/projects/');await page.getByLabel('Search projects or technologies').fill('zzzzmissing');await page.getByText('No projects match that search.').waitFor();await page.getByRole('button',{name:'Clear filters'}).click();assert.equal(await page.locator('.project-card').count(),10);
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
await page.getByRole('button',{name:'Toggle light and dark theme'}).click();await page.waitForTimeout(150);assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
const light=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(light.violations.map(v=>v.id),[],'light accessibility');
await page.screenshot({path:'../.preference/qa/projects-light-mobile.png',fullPage:true});
await page.goto('http://127.0.0.1:3000/contact/');await page.evaluate(()=>{navigator.clipboard.writeText=async text=>{window.copied=text}});await page.getByLabel('Your name').fill('Visitor');await page.getByLabel('What’s on your mind?').fill('Engineering');await page.getByLabel('Message',{exact:true}).fill('Hello');await page.getByRole('button',{name:'Copy message'}).click();assert.match(await page.evaluate(()=>window.copied),/Hello/);
await page.route('https://api.github.com/**',route=>route.fulfill({status:403,body:'{}'}));await page.goto('http://127.0.0.1:3000/activity/');await page.getByRole('button',{name:'Try again'}).waitFor();
assert.deepEqual(errors,[]);await browser.close();console.log('Browser checks passed: accessibility, responsive layouts, local links, filters, mobile navigation, theme, contact and activity failure state.');
