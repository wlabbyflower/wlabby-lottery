const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'lottery-settings-'));
process.env.LOTTERY_DATA_DIR = folder;
const { validate, updateSettings, getSettings } = require('./settings');
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
test('year and local background persist together; omitted fields retain their saved value', () => {
  updateSettings({year:'2030',backgroundMode:'image',backgroundImage:png});
  const disk = JSON.parse(fs.readFileSync(path.join(folder,'appearance.json')));
  assert.equal(disk.year,'2030');assert.equal(disk.backgroundImage,png);
  updateSettings({year:'2031'});assert.equal(getSettings().backgroundImage,png);
});
test('invalid year, image content, executable URL, background mode and oversized upload are rejected', () => {
  for (const input of [{year:'202A'},{year:'26'},{backgroundMode:'video'},{backgroundColor:'red'},{backgroundImage:'javascript:alert(1)'},{backgroundImage:'https://a:b@example.com/a.png'},{backgroundImage:'data:image/svg+xml;base64,PHN2Zy8+'},{backgroundImage:'data:image/png;base64,PHN2Zy8+'},{backgroundImage:'data:image/png;base64,'+'A'.repeat(7*1024*1024)}]) assert.throws(()=>validate(input));
  assert.equal(getSettings().year,'2031');
});
process.on('exit',()=>fs.rmSync(folder,{recursive:true,force:true}));
