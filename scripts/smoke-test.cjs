const { chromium }=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),assert=require('node:assert/strict');
const data=fs.mkdtempSync(os.tmpdir()+'/lottery-check-');
const server=spawn('/usr/bin/node',['server/index.js'],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,PORT:'18888',LOTTERY_DATA_DIR:data},stdio:'pipe'});
(async()=>{let browser;try{
 for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:18888/health');break}catch{await new Promise(r=>setTimeout(r,100))}}
 const api=async(url,body={})=>{const r=await fetch('http://127.0.0.1:18888'+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d};
 const snapshot=await api('/getTempData');
 await api('/settings',{...snapshot.cfgData,prizes:[{type:42,text:'测试奖',title:'礼物',count:7}],EACH_COUNT:[5]});
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:process.env.LOTTERY_TEST_DISABLE_WEBGL ? ['--disable-webgl'] : ['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.accept());
 await page.goto('http://127.0.0.1:18888');await page.waitForTimeout(4200);
 const mode=await page.evaluate(()=>window.lotteryRenderInfo());
 if(process.env.LOTTERY_TEST_DISABLE_WEBGL) {
   assert.equal(mode.mode,'css3d'); assert.equal(await page.locator('.element').count(),407);
 } else {
   assert.equal(mode.mode,'webgl2'); assert.equal(mode.powerPreference,'high-performance');assert.equal(mode.cardCount,407);assert.equal(mode.drawCalls,2);
   assert.equal(await page.locator('.element').count(),0);
   const atlas=mode.atlasVersion;await page.waitForTimeout(250);assert.equal((await page.evaluate(()=>lotteryRenderInfo())).atlasVersion,atlas);
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
   const paused=await page.evaluate(()=>lotteryRenderInfo().frame);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>lotteryRenderInfo().frame),paused);
   await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
   await page.waitForFunction(frame=>lotteryRenderInfo().frame>frame,paused);
   await page.evaluate(()=>{window.testLoseContext=document.querySelector('.gpu-scene').getContext('webgl2').getExtension('WEBGL_lose_context');window.testLoseContext.loseContext()});
   await page.waitForFunction(()=>document.documentElement.dataset.rendererState==='context-lost');
   await page.evaluate(()=>window.testLoseContext.restoreContext());
   await page.waitForFunction(()=>document.documentElement.dataset.rendererState==='ready');
 }
 await page.click('#enter');await page.waitForTimeout(4200);
 await page.click('#lottery',{force:true});await page.waitForTimeout(700);await page.click('#lottery',{force:true});await page.waitForTimeout(2000);
 assert.equal(await page.locator('.prize').count(),5);const before=await api('/getTempData');assert.equal(before.luckyData[42].length,5);
 await page.screenshot({path:'/tmp/lottery-draw.png'});
 await page.click('#reLottery');await page.waitForTimeout(2600);const after=await api('/getTempData');assert.equal(after.luckyData[42].length,5);assert.equal(new Set(after.luckyData[42].map(u=>u[0])).size,5);
 assert.equal(after.luckyData[42].filter(u=>before.luckyData[42].some(v=>v[0]===u[0])).length,4);
 await page.click('#lottery',{force:true});await page.waitForTimeout(1700);await page.click('#lottery',{force:true});await page.waitForTimeout(2000);assert.equal(await page.locator('.prize').count(),2);
 await page.reload();await page.waitForTimeout(1500);assert.equal((await api('/getTempData')).luckyData[42].length,7);
 assert.equal(JSON.parse(fs.readFileSync(data+'/state.json')).winners[42].length,7);
 const result=await fetch('http://127.0.0.1:18888/results.xlsx');assert.equal(result.status,200);assert.ok((await result.arrayBuffer()).byteLength>1000);
 await page.goto('http://127.0.0.1:18888/admin.html#appearance'); await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('控制台已连接'));
 assert.equal(await page.locator('.theme-choice').count(),4);
 for (const id of ['violet','aurora','solar','nebula']) {
   await page.click(`[data-id="${id}"]`); assert.equal(await page.locator('html').getAttribute('data-theme'),id);
 }
 await page.click('[data-id="violet"]');
 await page.click('[data-panel="basic"]'); await page.fill('#title','星际盛典');
 await page.click('[data-panel="prizes"]'); assert.equal(await page.locator('#prizes tr').count(),1);
 await page.click('[data-panel="basic"]'); assert.equal(await page.inputValue('#title'),'星际盛典');
 await page.click('#save'); await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('设置已保存'));
 assert.equal((await api('/getTempData')).cfgData.theme,'violet');
 for(const section of ['people','winners','rules','appearance']) { await page.click(`[data-panel="${section}"]`); assert.equal(await page.locator('.settings-panel.active').getAttribute('id'),'panel-'+section); }
 await page.click('[data-panel="people"]'); await page.fill('#peopleSearch','OSAKA'); assert.equal(await page.locator('#peopleList tr').count(),1);
 await page.goto('http://127.0.0.1:18888');await page.waitForFunction(()=>document.documentElement.dataset.theme==='violet');
 for(const id of ['aurora','solar','nebula']) {
   await page.click('#themeToggle'); await page.click(`#themeMenu [data-theme="${id}"]`);
   await page.waitForFunction(id=>document.documentElement.dataset.theme===id,id);
   assert.equal((await api('/getTempData')).cfgData.theme,id);
 }
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.theme==='nebula');
 const invalid=await fetch('http://127.0.0.1:18888/theme',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({theme:'invalid'})});assert.equal(invalid.status,400);
 assert.equal((await api('/getTempData')).cfgData.theme,'nebula');
 await page.goto('http://127.0.0.1:18888/admin.html#appearance'); await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(!process.env.LOTTERY_TEST_DISABLE_WEBGL) {
   const saved=await api('/getTempData');await api('/settings',{...saved.cfgData,highlight:'星际抽奖幸运之旅'});
   await page.goto('http://127.0.0.1:18888');await page.waitForTimeout(4300);
   assert.equal((await page.evaluate(()=>lotteryRenderInfo())).cardCount,803);
   assert.equal(await page.locator('.element').count(),0);
   assert.equal(await page.evaluate(()=>{const gl=document.querySelector('.gpu-scene').getContext('webgl2');return gl.getError()}),0);
 }
 assert.deepEqual(errors,[]);console.log('PASS: '+mode.mode+' rendering, draw, partial redraw, persistence, export, themes, sidebar, search and mobile layout'+(mode.mode==='webgl2'?', 2 draw calls, no background card DOM, stable atlas, visibility pause, context restoration, 803-card wall':''));
 }finally{await browser?.close();server.kill();fs.rmSync(data,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
