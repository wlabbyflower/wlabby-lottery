const { test }=require('node:test'), assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const xlsx=require('node-xlsx').default;
test('original API saves a draw immediately, rejects duplicates, redraws, exports and reloads persistent data',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lottery-api-'));let child,base;
  async function start(){
    child=spawn(process.execPath,[path.join(__dirname,'index.js'),'0','n'],{cwd:dir,env:{...process.env,LOTTERY_DATA_DIR:dir,PORT:'19321'},stdio:['ignore','pipe','pipe']});
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('startup timeout')),10000);child.once('exit',code=>{clearTimeout(timer);reject(new Error('server exited '+code))});child.stdout.on('data',b=>{const m=String(b).match(/listening at http:\/\/.*:(\d+)/);if(m){base='http://127.0.0.1:'+m[1];clearTimeout(timer);resolve()}})});
  }
  async function stop(){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited}
  async function api(url,data={},expected=200){const r=await fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const json=await r.json();assert.equal(r.status,expected,JSON.stringify(json));return json}
  try{
    await start();const initial=await api('/getTempData');assert.equal(initial.cfgData.appearance.backgroundMode,'stars');
    const users=await api('/getUsers');assert.equal(users.length,132);assert.equal((await api('/getPrizes')).length,8);
    await api('/settings',{year:'2030',backgroundMode:'color',backgroundColor:'#123456'});
    await api('/settings',{year:'20x6'},400);
    await api('/saveData',{type:7,data:users.slice(0,5)});await api('/saveData',{type:6,data:users.slice(0,1)},400);
    await api('/errorData',{data:users.slice(0,2)});
    let saved=await api('/getTempData');assert.equal(saved.luckyData[7].length,3);assert.equal(saved.leftUsers.length,127);
    const exported=await api('/export');assert.equal(exported.url,'/results.xlsx');
    const sheet=xlsx.parse(Buffer.from(await(await fetch(base+exported.url)).arrayBuffer()))[0].data;
    assert.equal(sheet.filter(r=>users.slice(2,5).some(u=>String(u[0])===String(r[0]))).length,3);
    assert.equal((await fetch(base+'/server.js')).status,404);
    assert.equal((await fetch(base+'/settings',{method:'POST',headers:{'Origin':'https://evil.example','Content-Type':'application/json'},body:'{}'})).status,403);
    await stop();await start();const restored=await api('/getTempData');assert.deepEqual(restored.luckyData,saved.luckyData);assert.equal(restored.leftUsers.length,127);assert.equal(restored.cfgData.appearance.year,'2030');
    await api('/reset');assert.equal(Object.values((await api('/getTempData')).luckyData).flat().length,0);
  }finally{if(child&&!child.killed)await stop();fs.rmSync(dir,{recursive:true,force:true})}
});
