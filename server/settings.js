const fs = require('node:fs');
const path = require('node:path');
const { atomicJSON, dataDir } = require('./help');
const file = path.join(dataDir, 'appearance.json');
const defaults = () => ({ year: String(new Date().getFullYear()), backgroundMode: 'stars', backgroundColor: '#000a14', backgroundImage: '' });
let settings = fs.existsSync(file) ? { ...defaults(), ...JSON.parse(fs.readFileSync(file, 'utf8')) } : defaults();
const maxBytes = 5 * 1024 * 1024;
function validate(input) {
  const next = { ...settings };
  for (const key of Object.keys(defaults())) if (Object.hasOwn(input, key)) next[key] = input[key];
  next.year = String(next.year).trim();
  if (!/^\d{4}$/.test(next.year)) throw new Error('年份必须为 4 位数字');
  if (!['stars', 'image', 'color'].includes(next.backgroundMode)) throw new Error('背景模式无效');
  if (!/^#[\da-f]{6}$/i.test(next.backgroundColor)) throw new Error('背景颜色无效');
  if (typeof next.backgroundImage !== 'string') throw new Error('背景图片无效');
  if (next.backgroundImage.startsWith('data:')) {
    const match = /^data:image\/(png|jpeg|webp|gif);base64,([\da-z+/]+={0,2})$/i.exec(next.backgroundImage);
    if (!match || match[2].length > Math.ceil(maxBytes / 3) * 4) throw new Error('仅支持 5MB 以内 PNG、JPEG、WebP、GIF 图片');
    const bytes = Buffer.from(match[2], 'base64');
    const kind = match[1].toLowerCase();
    const valid = kind === 'png' ? bytes.subarray(0,8).toString('hex') === '89504e470d0a1a0a'
      : kind === 'jpeg' ? bytes.subarray(0,3).toString('hex') === 'ffd8ff'
      : kind === 'gif' ? /^GIF8[79]a$/.test(bytes.toString('ascii',0,6))
      : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
    if (!valid || bytes.length > maxBytes) throw new Error('图片内容或大小无效');
  } else if (next.backgroundImage) {
    let url;
    try { url = new URL(next.backgroundImage); } catch { throw new Error('请输入完整图片网址'); }
    if (!['http:','https:'].includes(url.protocol) || url.username || url.password || next.backgroundImage.length > 2048) throw new Error('图片网址无效');
  }
  if (next.backgroundMode === 'image' && !next.backgroundImage) throw new Error('请先上传图片或填写图片网址');
  return next;
}
module.exports = {
  getSettings: () => ({ ...settings }),
  validate,
  updateSettings(input) { const next = validate(input); atomicJSON('appearance.json', next); settings = next; return { ...settings }; }
};
