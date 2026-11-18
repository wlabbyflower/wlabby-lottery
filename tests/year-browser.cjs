process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('/home/lazycat/presales-tracker/app/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/home/lazycat/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome'});
 try{
  const context=await browser.newContext({locale:'zh-CN',viewport:{width:1600,height:1100}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:18120/log-lottery/config/global/face',{waitUntil:'domcontentloaded'});
  const year=page.getByLabel('年份图案',{exact:true});await year.waitFor();
  const before=await page.evaluate(()=>({persons:localStorage.getItem('personConfig'),prizes:localStorage.getItem('prizeConfig')}));
  await year.fill('2038');await page.getByRole('button',{name:'添加并应用年份',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('globalConfig')).globalConfig.theme.patternYear==='2038');
  let data=await page.evaluate(()=>JSON.parse(localStorage.getItem('globalConfig')).globalConfig);
  assert.ok(data.yearOptions.includes('2038'));assert.ok(data.theme.patternList.length>0);
  await year.fill('2099');await page.getByRole('button',{name:'添加并应用年份',exact:true}).click();
  await page.getByRole('button',{name:'2038',exact:true}).click();
  await page.reload({waitUntil:'domcontentloaded'});await year.waitFor();
  data=await page.evaluate(()=>JSON.parse(localStorage.getItem('globalConfig')).globalConfig);
  assert.equal(data.theme.patternYear,'2038');assert.ok(data.yearOptions.includes('2099'));
  await page.getByRole('button',{name:'2038',exact:true}).click();
  await year.fill('0000');await page.getByRole('button',{name:'添加并应用年份',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'请输入 1000'}).waitFor();
  const after=await page.evaluate(()=>({persons:localStorage.getItem('personConfig'),prizes:localStorage.getItem('prizeConfig')}));assert.deepEqual(after,before);
  await page.evaluate(()=>{const v=JSON.parse(localStorage.getItem('globalConfig'));delete v.globalConfig.yearOptions;delete v.globalConfig.theme.patternYear;v.globalConfig.theme.patternList=[2,18,40];localStorage.setItem('globalConfig',JSON.stringify(v));});
  await page.reload({waitUntil:'domcontentloaded'});await year.waitFor();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('globalConfig')).globalConfig.theme.patternList),[2,18,40]);
  await year.fill('2048');await page.getByRole('button',{name:'添加并应用年份',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('globalConfig')).globalConfig.theme.patternYear==='2048');
  fs.mkdirSync('tests/results',{recursive:true});await page.screenshot({path:'tests/results/year-settings.png',fullPage:true});
  await page.goto('http://127.0.0.1:18120/log-lottery/home',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1700);await page.screenshot({path:'tests/results/year-home.png'});
  assert.deepEqual(errors,[]);console.log('Year add/switch/reload/validation/legacy compatibility and home render OK');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
