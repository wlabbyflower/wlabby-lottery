// Exercise the packaged chooser hook against real modal dialogs and file inputs.
// Only the cloud picker service is simulated; native selection, fetch, preview,
// app confirmation and IndexedDB persistence run in Chromium.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/home/lazycat/presales-tracker/app/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64');
const base = 'http://127.0.0.1:18136';
const server = spawn(process.execPath, ['lpk/serve.mjs'], { cwd: root, env: { ...process.env, PORT: '18136', LOTTERY_WEB_ROOT: path.join(root, 'dist') }, stdio: 'pipe' });
(async () => {
  let browser;
  try {
    for (let i=0;i<80;i++) { try { if((await fetch(base+'/health')).ok) break; } catch {} await new Promise(r=>setTimeout(r,100)); }
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/home/lazycat/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome' });
    const context = await browser.newContext({ locale:'zh-CN', viewport:{width:1400,height:1000} });
    await context.addInitScript(() => {
      window.testPickerCount = 0;
      customElements.define('lzc-file-picker', class extends HTMLElement {
        connectedCallback() {
          window.testPickerCount++;
          const shadow=this.attachShadow({mode:'open'});
          const button=document.createElement('button');button.textContent='选择测试图片';
          button.onclick=()=>this.dispatchEvent(new CustomEvent('submit',{detail:[window.testCloudEmpty ? [] : [{
            filename:'/shared/cloud.png', basename:'cloud.png', owner:'shared-owner', webdavUrl:'https://file.test.heiyu.space/files/home/shared/cloud.png'
          }],'cloud']}));
          shadow.append(button);
        }
      });
    });
    await context.addInitScript({path:path.join(root,'lpk/content/lazycat-injects/lzc-file-chooser-inject.js')});
    const cloudReads=[];
    await context.route('**/__lazycat_file_bridge/**', async route=>{
      cloudReads.push({url:route.request().url(),owner:route.request().headers().owner});
      await route.fulfill({status:200,contentType:'image/png',body:png});
    });
    const page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/log-lottery/config/global/image',{waitUntil:'domcontentloaded'});
    const appDialog=page.locator('dialog#my_modal').filter({has:page.locator('h3').filter({hasText:'上传图片'})});
    const input=appDialog.locator('input[type=file]');
    const trigger=()=>appDialog.locator('label[for]').click();
    const chooser=page.locator('dialog[data-lzc-file-chooser]');
    const chooseLocal=async(files)=>{
      await trigger();await chooser.waitFor({state:'visible'});
      const pending=page.waitForEvent('filechooser');
      await chooser.getByRole('button',{name:'本地文件',exact:true}).click();
      await (await pending).setFiles(files);
      await chooser.waitFor({state:'detached'});
    };
    const openUpload=async()=>{await page.getByText('上传',{exact:true}).click();await appDialog.waitFor({state:'visible'});};
    const assertPreview=async()=>{await appDialog.locator('label img').waitFor();await page.waitForFunction(()=>document.querySelector('dialog#my_modal label img')?.naturalWidth===1);};
    const stored=async name=>{await page.waitForFunction(name=>JSON.parse(localStorage.getItem('globalConfig')).globalConfig.imageList.some(x=>x.name===name&&x.url==='Storage'),name);};

    await openUpload();console.log('Upload dialog opened');
    // Closing the nested chooser leaves the application's upload dialog active.
    await trigger();await chooser.waitFor({state:'visible'});await page.keyboard.press('Escape');await chooser.waitFor({state:'detached'});assert.ok(await appDialog.evaluate(el=>el.open));
    // Cancelling an OS file dialog must not throw or leave interception locked.
    console.log('Testing native cancel');await chooseLocal([]);assert.equal(await input.evaluate(el=>el.files.length),0);
    console.log('Testing local selection');await chooseLocal({name:'local.png',mimeType:'image/png',buffer:png});await assertPreview();
    console.log('Local preview ready');const count=await page.evaluate(()=>window.testPickerCount);
    const previewBox=await appDialog.locator('label').boundingBox();await page.mouse.click(previewBox.x+previewBox.width/2,previewBox.y+previewBox.height/2);assert.equal(await chooser.count(),0);assert.equal(await page.evaluate(()=>window.testPickerCount),count);
    // Removing a selection allows picking the very same file again.
    await input.locator('..').locator('button').click();assert.equal(await input.inputValue(),'');
    console.log('Testing local selection');await chooseLocal({name:'local.png',mimeType:'image/png',buffer:png});await assertPreview();
    await appDialog.getByRole('button',{name:'确认',exact:true}).click();await stored('local.png');
    await openUpload();assert.equal(await appDialog.locator('input[type=text]').inputValue(),'');assert.ok(await appDialog.locator('input[type=text]').isDisabled());
    console.log('Testing cloud selection');
    await page.evaluate(()=>{window.testCloudEmpty=true});
    await trigger();await chooser.getByRole('button',{name:'选择测试图片',exact:true}).click();await chooser.waitFor({state:'detached'});
    assert.equal(await input.evaluate(el=>el.files.length),0);
    await page.evaluate(()=>{window.testCloudEmpty=false});
    await trigger();await chooser.getByRole('button',{name:'选择测试图片',exact:true}).click();await assertPreview();
    assert.equal(cloudReads.length,1);assert.equal(cloudReads[0].owner,'shared-owner');assert.ok(cloudReads[0].url.endsWith('/__lazycat_file_bridge/shared/cloud.png'));
    assert.equal(await chooser.count(),0);
    await appDialog.getByRole('button',{name:'确认',exact:true}).click();await stored('cloud.png');
    console.log('Testing persistence');await page.reload({waitUntil:'domcontentloaded'});await stored('local.png');await stored('cloud.png');
    for (const name of ['local.png','cloud.png']) {
      const row=page.locator('li').filter({has:page.getByText(name,{exact:true})});
      await row.waitFor();await row.locator('img').evaluate(img=>img.decode());assert.equal(await row.locator('img').evaluate(img=>img.complete&&img.naturalWidth===1),true);
    }
    const blobs=await page.evaluate(()=>new Promise((resolve,reject)=>{
      const request=indexedDB.open('imgStore');request.onerror=()=>reject(request.error);request.onsuccess=()=>{
        const db=request.result;const get=db.transaction('keyvaluepairs').objectStore('keyvaluepairs').getAll();
        get.onsuccess=()=>{const files=get.result;resolve(files.map(v=>({name:v.fileName,size:v.data.size,type:v.data.type})));db.close()};get.onerror=()=>reject(get.error);
      };
    }));
    assert.deepEqual(blobs.map(v=>v.name).sort(),['cloud.png','local.png']);assert.ok(blobs.every(v=>v.size===png.length&&v.type==='image/png'));
    // The same hook still works when the input is outside an application modal.
    await page.evaluate(()=>{const input=document.createElement('input');input.type='file';input.id='plain-upload';input.style.cssText='position:fixed;top:0;left:0;z-index:100000';document.body.append(input)});
    await page.locator('#plain-upload').click();
    const native=page.waitForEvent('filechooser');await chooser.getByRole('button',{name:'本地文件',exact:true}).click();
    await(await native).setFiles({name:'plain.png',mimeType:'image/png',buffer:png});
    assert.equal(await page.locator('#plain-upload').evaluate(el=>el.files[0].name),'plain.png');
    await page.locator('#plain-upload').evaluate(el=>el.remove());
    fs.mkdirSync(path.join(root,'tests/results'),{recursive:true});
    await page.screenshot({path:path.join(root,'tests/results/upload-fixed.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: modal chooser hit targets, local/native cancel and retry, same-file reselection, disabled preview, shared-cloud bridge/Owner, confirmation and IndexedDB reload persistence');
  } finally { await browser?.close();server.kill(); }
})().catch(e=>{console.error(e);process.exitCode=1});
