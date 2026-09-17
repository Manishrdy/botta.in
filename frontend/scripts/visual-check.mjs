import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true,channel:"chrome"});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});
await page.screenshot({path:'../.preference/qa/home-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../.preference/qa/home-mobile.png',fullPage:true});
console.log(JSON.stringify({title:await page.title(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors}));
await browser.close();
