const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateUsers, available, draw, redraw } = require('./engine');
const users = Array.from({length:20},(_,i)=>[String(i),'用户'+i,'部门']);
const config = { prizes: [{type:8,count:7,text:'奖一'},{type:42,count:30,text:'奖二'}], EACH_COUNT:[5,10], allowRepeat:false };
const fresh = () => ({ users:structuredClone(users), winners:{}, absent:[] });
test('validate unique IDs across numeric and string cells', () => {
  assert.throws(()=>validateUsers([[1,'甲'],['1','乙']]), /重复/);
  assert.throws(()=>validateUsers([['','甲']]), /工号/);
});
test('remaining prize quantity and exhausted pool never cause duplicates', () => {
  const s=fresh(); assert.equal(draw(s,config,8).length,5); assert.equal(draw(s,config,8).length,2);
  assert.throws(()=>draw(s,config,8),/抽完/);
  assert.equal(draw(s,config,42).length,10); assert.equal(draw(s,config,42).length,3);
  assert.throws(()=>draw(s,config,42),/没有剩余/);
  assert.equal(new Set(Object.values(s.winners).flat().map(u=>u[0])).size,20);
});
test('single absent user redraw retains the other winners and excludes original batch',()=>{
 const s=fresh(), initial=draw(s,config,8), absent=initial[0];
 const replacement=redraw(s,config,8,[absent[0]]);
 assert.equal(replacement.length,1); assert.equal(s.winners[8].length,5);
 for(const user of initial.slice(1)) assert.ok(s.winners[8].some(u=>u[0]===user[0]));
 assert.ok(!initial.some(u=>u[0]===replacement[0][0])); assert.equal(s.absent[0][0],absent[0]);
});
test('failed redraw leaves results intact',()=>{
 const s=fresh(); s.users=s.users.slice(0,5); draw(s,config,8); const old=structuredClone(s);
 assert.throws(()=>redraw(s,config,8,[s.users[0][0]]),/不足/); assert.deepEqual(s,old);
});
test('legacy repeat or restricted configuration cannot alter the eligible pool',()=>{
 const s=fresh(),cfg={...config,allowRepeat:true,mode:'weighted',designatedIDs:['0']};
 const first=draw(s,cfg,42), second=draw(s,cfg,42);
 assert.equal(new Set([...first,...second].map(u=>u[0])).size,20);
 assert.equal(available(s,cfg).length,0);
});
test('imports reject additional probability or targeting columns',()=>{
 assert.throws(()=>validateUsers([['1','甲','','',100]]),/四列/);
 assert.deepEqual(validateUsers([['001','甲','','']])[0],['001','甲','','']);
});
test('every eligible ID is selected exactly once when the entire pool is exhausted',()=>{
 const s=fresh(),cfg={prizes:[{type:1,count:20}],EACH_COUNT:[1]};
 const selected=[];for(let i=0;i<20;i++) selected.push(draw(s,cfg,1)[0][0]);
 assert.deepEqual(selected.slice().sort(),users.map(u=>u[0]).sort());
 assert.equal(new Set(selected).size,20);
});
