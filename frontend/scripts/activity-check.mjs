import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('../.preference/qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const days=Array.from({length:365},(_,i)=>({date:new Date(Date.UTC(2025,8,18+i)).toISOString().slice(0,10),count:i%5,level:i%5}));
const events=Array.from({length:14},(_,i)=>({id:String(i),type:i===0?'PullRequestEvent':i===1?'WatchEvent':'PushEvent',created_at:`2026-09-${i<8?'17':'16'}T${String(22-i).padStart(2,'0')}:00:00Z`,repo:{name:`Manishrdy/${i%2?'coldstart':'role-collector'}`},payload:i===0?{action:'closed',pull_request:{merged:true,number:12,title:'Improve discovery and deduplication'}}:{ref:'refs/heads/main',commits:[{message:'Improve workflow reliability'}]}}));
await page.route('https://github-contributions-api.jogruber.de/**',r=>r.fulfill({json:{contributions:days}}));
await page.route('https://api.github.com/**',r=>r.fulfill({json:r.request().url().includes('/events/')?events:{public_repos:24,followers:8}}));
await page.goto('http://127.0.0.1:3000/activity/');await page.locator('.calendar-day').first().waitFor();await page.locator('.event-card').first().waitFor();
assert.equal(await page.locator('.event-card').count(),10);
assert.ok(await page.locator('.calendar-scroll').evaluate(e=>e.scrollLeft>0 && Math.abs(e.scrollWidth-e.clientWidth-e.scrollLeft)<2),'mobile starts at latest months');
assert.ok(await page.locator('.calendar-scroll-hint').isVisible());
assert.equal(await page.locator('.event-card').nth(2).locator('h4 a').getAttribute('href'),'https://github.com/Manishrdy/role-collector/tree/main');
await page.getByRole('button',{name:'Show more activity'}).click();assert.equal(await page.locator('.event-card').count(),14);
await page.getByRole('button',{name:'Reviews & issues',exact:true}).click();assert.equal(await page.locator('.event-card').count(),1);await page.getByText('Merged pull request',{exact:true}).waitFor();
await page.getByRole('button',{name:'All activity',exact:true}).click();
await page.locator('.calendar-day').last().focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('.calendar-day').nth(357).evaluate(e=>e===document.activeElement),true);
for(const theme of ['dark','light']){
 if(theme==='light')await page.getByRole('button',{name:'Toggle light and dark theme'}).click();
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})});
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],`${theme} ${width}`);
  await page.screenshot({path:`../.preference/qa/activity-${theme}-${width}.png`,fullPage:true});
 }
}
await page.goto('http://127.0.0.1:3000/');
assert.equal(await page.locator('.home-contributions .calendar-day').count(),0,'home calendar waits until near viewport');
await page.locator('.home-contributions').scrollIntoViewIfNeeded();await page.locator('.home-contributions .calendar-day').first().waitFor();
// A new page clears the in-memory successful calendar cache.
await page.route('https://github-contributions-api.jogruber.de/**',r=>r.fulfill({status:503,body:'{}'}));
await page.route('https://api.github.com/**',r=>r.fulfill({status:403,body:'{}'}));
await page.reload();await page.locator('.home-contributions').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Retry calendar'}).waitFor();
await page.route('https://github-contributions-api.jogruber.de/**',r=>r.fulfill({json:{contributions:days.map(d=>({...d,count:0,level:0}))}}));
await page.getByRole('button',{name:'Retry calendar'}).click();await page.locator('.calendar-day').first().waitFor();assert.match(await page.locator('.contribution-summary').innerText(),/^0 contributions/);
assert.deepEqual(errors,[]);await browser.close();console.log('Activity checks passed: graph placement, keyboard navigation, zero/error/retry states, event filters/pagination, responsive layouts, accessibility in both themes.');
