import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});const ok=(v,m)=>{if(!v)throw new Error(m)};
await page.goto(process.env.GHT_URL||'http://127.0.0.1:4173');await page.evaluate(()=>localStorage.clear());await page.reload();
for(const tab of ['today','goals']){await page.evaluate(t=>setTab(t),tab);ok(await page.locator('#fab').evaluate(el=>getComputedStyle(el).display)!=='none',`global FAB unexpectedly hidden on ${tab}`);}
await page.evaluate(()=>setTab('timeline'));ok(await page.locator('#fab').evaluate(el=>getComputedStyle(el).display)==='none','global FAB remains visible on timeline');ok(await page.locator('.sthead button[aria-label="加入時段"]').count()===1,'timeline local add entry missing');
for(const tab of ['garden','more']){await page.evaluate(t=>setTab(t),tab);ok(await page.locator('#fab').evaluate(el=>getComputedStyle(el).display)==='none',`global FAB unexpectedly visible on ${tab}`);}
ok(errors.length===0,`browser errors: ${errors.join(' | ')}`);console.log('PASS: Phase 3.29 timeline global FAB removal smoke');await browser.close();
