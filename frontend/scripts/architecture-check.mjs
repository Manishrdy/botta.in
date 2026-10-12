import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('../.preference/qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const company of ['navi-technologies-inc','yellow-ai','tradeliv','cognizant']){
 await page.goto(`http://127.0.0.1:3000/experience/${company}/`);await page.locator('.architecture-figure').scrollIntoViewIfNeeded();
 await page.locator('.architecture-figure').screenshot({path:`../.preference/qa/architecture-${company}.png`});
 await page.getByRole('button',{name:'Expand diagram'}).click();await page.getByRole('dialog').waitFor();
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();assert.match(await page.locator('.architecture-zoom').innerText(),/125%/);
 await page.getByRole('button',{name:'Reset zoom'}).click();assert.match(await page.locator('.architecture-zoom').innerText(),/100%/);
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],company);
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByRole('button',{name:'Expand diagram'}).click();await page.getByRole('button',{name:'Close architecture diagram'}).click();
 await page.setViewportSize({width:1440,height:1000});
}
await page.getByRole('button',{name:'Toggle light and dark theme'}).click();await page.getByRole('button',{name:'Expand diagram'}).click();
const light=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(light.violations.map(v=>v.id),[]);
assert.deepEqual(errors,[]);await browser.close();console.log('All architecture diagrams passed: expanded view, zoom/reset, keyboard dismissal, accessibility, and mobile overflow.');
