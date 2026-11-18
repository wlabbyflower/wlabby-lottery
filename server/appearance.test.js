const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateAppearance } = require('./appearance');
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
test('old clients retain saved year and embedded background when saving other settings', () => {
  const previous = { year:'2030',backgroundMode:'image',backgroundImage:png };
  assert.deepEqual(validateAppearance({}, previous), previous);
  assert.equal(validateAppearance({}, {}).year, String(new Date().getFullYear()));
});
test('invalid years, modes, executable URLs, fake images and oversized backgrounds are rejected', () => {
  for (const input of [{year:'20x6'},{year:'12345'},{backgroundMode:'video'}, {backgroundImage:'javascript:alert(1)'}, {backgroundImage:'https://user:pass@example.com/a.png'}, {backgroundImage:'data:image/svg+xml;base64,PHN2Zy8+'}, {backgroundImage:'data:image/png;base64,PHN2Zy8+'}, {backgroundMode:'image'}, {backgroundImage:'data:image/png;base64,'+'A'.repeat(7*1024*1024)}]) assert.throws(()=>validateAppearance(input,{}));
  assert.equal(validateAppearance({backgroundImage:'https://example.com/a.png', backgroundMode:'image'},{}).backgroundMode,'image');
});
