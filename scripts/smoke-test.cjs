const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),assert=require('node:assert/strict');
const xlsx=require('../server/node_modules/node-xlsx');
const data=fs.mkdtempSync(os.tmpdir()+'/lottery-check-');
const base='http://127.0.0.1:18888';
const server=spawn(process.execPath,['server/index.js'],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,PORT:'18888',LOTTERY_DATA_DIR:data},stdio:'pipe'});
(async()=>{let browser;try{
 for(let i=0;i<60;i++){try{await fetch(base+'/health');break}catch{await new Promise(r=>setTimeout(r,100))}}
 const api=async(url,body={})=>{const r=await fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d};
 const snapshot=await api('/getTempData');
 const cfg={...snapshot.cfgData,prizes:[{type:1,text:'一等奖',title:'礼物一',count:2},{type:2,text:'二等奖',title:'礼物二',count:3}],EACH_COUNT:[2,3]};
 await api('/settings',cfg);
 for(const bad of [{mode:'weighted'},{mode:'designated',designatedIDs:['001']},{allowRepeat:true},{designatedIDs:['001']}]) {
  const r=await fetch(base+'/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...cfg,...bad})});assert.equal(r.status,400);
 }
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:process.env.LOTTERY_TEST_DISABLE_WEBGL?['--disable-webgl']:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.accept());
 await page.goto(base+'/admin.html#people');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('控制台已连接'));
 const downloading=page.waitForEvent('download');await page.click('#downloadTemplate');const download=await downloading;const templatePath=data+'/template.xlsx';await download.saveAs(templatePath);
 const sheets=xlsx.parse(templatePath);assert.deepEqual(sheets[0].data[0],['工号','姓名','部门','照片 URL']);assert.equal(sheets[0].data[1][0],'001');assert.equal(sheets[1].name,'填写说明');
 await page.setInputFiles('#file',templatePath);await page.click('#import');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('已导入 2 人'));
 assert.deepEqual((await api('/getTempData')).users.map(u=>u[0]),['001','002']);
 const invalid=await fetch(base+'/importUsers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({users:[['1','甲','','',100]]})});assert.equal(invalid.status,400);
 await api('/importUsers',{users:snapshot.users});
 await page.goto(base);await page.waitForFunction(()=>typeof window.lotteryRenderInfo==='function');
 assert.equal(await page.locator('.person-preview-card').count(),12);
 assert.ok(await page.locator('.person-name').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>=30);
 const first=await page.locator('.person-id').allTextContents();await page.click('#previewNext');assert.notDeepEqual(await page.locator('.person-id').allTextContents(),first);
 await page.click('#previewPrevious');assert.deepEqual(await page.locator('.person-id').allTextContents(),first);
 await page.click('#previewPause');assert.equal(await page.getAttribute('#previewPause','aria-pressed'),'true');
 await page.screenshot({path:'/tmp/lottery-bright-preview.png'});
 await page.click('#prizePanelToggle');assert.equal(await page.locator('#prizeList').isVisible(),false);
 await page.reload();await page.waitForFunction(()=>typeof window.lotteryRenderInfo==='function');assert.equal(await page.getAttribute('#prizePanelToggle','aria-expanded'),'false');
 await page.click('#prizePanelToggle');assert.equal(await page.locator('#prizeList').isVisible(),true);
 await page.click('[data-preview-view="sphere"]');await page.waitForTimeout(2000);
 const mode=await page.evaluate(()=>lotteryRenderInfo());assert.equal(mode.cardCount,119);assert.equal(mode.mode,process.env.LOTTERY_TEST_DISABLE_WEBGL?'css3d':'webgl2');
 if(mode.mode==='webgl2') {
  assert.equal(mode.drawCalls,1);assert.equal(mode.powerPreference,'high-performance');
  const old=mode.camera;await page.mouse.move(850,500);await page.mouse.down();await page.mouse.move(1080,590,{steps:10});await page.mouse.up();await page.waitForTimeout(250);
  const rotated=await page.evaluate(()=>lotteryRenderInfo().camera);assert.notDeepEqual(rotated,old);
  await page.mouse.wheel(0,600);await page.waitForTimeout(400);const zoomed=await page.evaluate(()=>lotteryRenderInfo().camera);assert.ok(Math.abs(Math.hypot(...zoomed)-Math.hypot(...rotated))>10);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
  const frame=await page.evaluate(()=>lotteryRenderInfo().frame);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>lotteryRenderInfo().frame),frame);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
  await page.evaluate(()=>{window.testLoseContext=document.querySelector('.gpu-scene').getContext('webgl2').getExtension('WEBGL_lose_context');window.testLoseContext.loseContext()});await page.waitForFunction(()=>document.documentElement.dataset.rendererState==='context-lost');
  await page.evaluate(()=>window.testLoseContext.restoreContext());await page.waitForFunction(()=>document.documentElement.dataset.rendererState==='ready');
 }
 await page.screenshot({path:'/tmp/lottery-bright-sphere.png'});
 await page.click('#enter');await page.waitForTimeout(2200);
 const draw=async()=>{await page.click('#lottery');await page.waitForTimeout(1400);await page.click('#lottery');await page.waitForTimeout(1900)};
 await draw();assert.equal(await page.locator('.prize').count(),3);
 const before=await api('/getTempData');assert.equal(before.luckyData[2].length,3);
 await page.click('#reLottery');await page.waitForTimeout(2300);const after=await api('/getTempData');assert.equal(after.luckyData[2].length,3);assert.equal(after.luckyData[2].filter(u=>before.luckyData[2].some(v=>u[0]===v[0])).length,2);
 await draw();assert.equal(await page.locator('.prize').count(),2);
 const results=await api('/getTempData');assert.equal(new Set(Object.values(results.luckyData).flat().map(u=>u[0])).size,5);
 assert.equal(await page.textContent('#lottery'),'查看抽奖结果');await page.click('#lottery');await page.locator('#resultsDialog').waitFor({state:'visible'});assert.equal(await page.locator('#resultsDialog').isVisible(),true);assert.equal(await page.locator('#allResultsBody tr').count(),5);
 assert.ok((await page.locator('#allResultsBody').textContent()).includes('一等奖'));assert.ok((await page.locator('#allResultsBody').textContent()).includes('二等奖'));
 await page.screenshot({path:'/tmp/lottery-final-results.png'});await page.click('#closeResults');await page.reload();await page.waitForFunction(()=>typeof window.lotteryRenderInfo==='function');
 assert.equal(await page.textContent('#lottery'),'查看抽奖结果');await page.click('#lottery');await page.locator('#resultsDialog').waitFor({state:'visible'});assert.equal(await page.locator('#allResultsBody tr').count(),5);
 const result=await fetch(base+'/results.xlsx');const exported=xlsx.parse(Buffer.from(await result.arrayBuffer()))[0].data;assert.equal(exported.length,6);assert.equal(exported[0].includes('权重'),false);
 await page.goto(base+'/admin.html#rules');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('控制台已连接'));assert.equal(await page.locator('#mode,#designated,#repeat').count(),0);
 await page.click('[data-panel="appearance"]');assert.equal(await page.locator('.theme-choice').count(),4);
 for(const id of ['violet','aurora','solar','nebula']){await page.click(`[data-id="${id}"]`);assert.equal(await page.locator('html').getAttribute('data-theme'),id);}
 await page.click('#save');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('设置已保存'));await page.screenshot({path:'/tmp/lottery-bright-settings.png'});
 await page.goto(base);await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>typeof window.lotteryRenderInfo==='function');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/tmp/lottery-bright-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: readable 12-person preview, paging, four-column Excel round trip, unfair API rejection, '+mode.mode+' rendering, sphere drag/zoom, draw, cross-prize exclusion, redraw, final results and reload, export, themes and mobile layout');
}finally{await browser?.close();server.kill();fs.rmSync(data,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
