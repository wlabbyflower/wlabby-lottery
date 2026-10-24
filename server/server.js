const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const xlsx = require('node-xlsx');
const { timingSafeEqual } = require('node:crypto');
const { validateUsers, available, draw, redraw } = require('./engine');
const defaults = require('./config');
const dataDir = process.env.LOTTERY_DATA_DIR || path.join(__dirname, 'cache');
fs.mkdirSync(dataDir, { recursive: true });
const stateFile = path.join(dataDir, 'state.json');
const configFile = path.join(dataDir, 'settings.json');
function read(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function atomic(file, value) {
  fs.writeFileSync(file + '.tmp', JSON.stringify(value, null, 2));
  fs.renameSync(file + '.tmp', file);
}
function excelUsers(buffer) {
  const sheet = xlsx.parse(buffer)[0];
  if (!sheet) throw new Error('Excel 没有工作表');
  return validateUsers(sheet.data.slice(1).filter(r => r.some(v => v != null && String(v).trim())));
}
let cfg = read(configFile, { ...defaults, title: '幸运抽奖', highlight: '幸运抽奖', background: '#000a14', theme: 'nebula' });
delete cfg.mode; delete cfg.allowRepeat; delete cfg.designatedIDs;
let state = read(stateFile, { users: excelUsers(path.join(__dirname, 'data/users.xlsx')), winners: read(path.join(dataDir, 'temp.json'), {}), absent: read(path.join(dataDir, 'error.json'), []) });
state.users = state.users.map(user => user.slice(0,4));
const app = express();
app.disable('x-powered-by');
if (process.env.LOTTERY_TRUST_PROXY === '1') app.set('trust proxy', 1);
if (process.env.LOTTERY_PASSWORD) app.use((req, res, next) => {
  const supplied = Buffer.from((req.headers.authorization || '').replace(/^Basic /, ''), 'base64').toString();
  const password = Buffer.from(supplied.slice(supplied.indexOf(':') + 1));
  const expected = Buffer.from(process.env.LOTTERY_PASSWORD);
  if (password.length === expected.length && timingSafeEqual(password, expected)) return next();
  res.set('WWW-Authenticate', 'Basic realm="Lottery"').status(401).send('Login required');
});
app.use(express.json({ limit: '15mb' }));
app.use((req, res, next) => {
  if (req.method === 'POST' && req.headers.origin && req.headers.origin !== `${req.protocol}://${req.get('host')}` && req.headers.origin !== process.env.LOTTERY_PUBLIC_ORIGIN) return res.status(403).json({ error: '请从本站访问' });
  res.set('Cache-Control', 'no-store');
  next();
});
const snapshot = () => ({ cfgData: cfg, leftUsers: available(state, cfg), luckyData: state.winners, users: state.users });
function transaction(fn) {
  const next = structuredClone(state);
  const result = fn(next);
  atomic(stateFile, next);
  state = next;
  return result;
}
app.get('/health', (req,res) => res.json({ status: 'ok', users: state.users.length }));
app.post('/getTempData', (req,res) => res.json(snapshot()));
app.post('/getUsers', (req,res) => res.json(state.users));
app.post('/getPrizes', (req,res) => res.json(cfg.prizes));
app.post('/draw', (req,res) => {
  const users = transaction(s => draw(s, cfg, req.body.type));
  res.json({ ...snapshot(), users });
});
app.post('/redraw', (req,res) => {
  const users = transaction(s => redraw(s, cfg, req.body.type, req.body.ids || []));
  res.json({ ...snapshot(), users });
});
app.post('/reset', (req,res) => {
  transaction(s => { s.winners = {}; s.absent = []; });
  res.json({ type: 'success' });
});
const themeIDs = ['nebula', 'violet', 'aurora', 'solar'];
app.post('/theme', (req,res) => {
  if (!themeIDs.includes(req.body.theme)) return res.status(400).json({ error: '主题不存在' });
  const next = { ...cfg, theme: req.body.theme }; atomic(configFile, next); cfg = next;
  res.json({ theme: cfg.theme });
});
app.post('/settings', (req,res) => {
  if (!req.body.prizes) return res.json(cfg);
  const next = req.body;
  if (!Array.isArray(next.prizes) || !next.prizes.length || next.prizes.length > 100) throw new Error('请配置 1–100 个奖项');
  const ids = new Set();
  next.prizes.forEach(p => {
    if (!Number.isInteger(p.type) || ids.has(p.type) || !String(p.text || '').trim() || !Number.isInteger(p.count) || p.count < 1 || p.count > 100000) throw new Error('奖项需要唯一数字 type、名称和有效数量');
    ids.add(p.type);
  });
  if (!Array.isArray(next.EACH_COUNT) || next.EACH_COUNT.length !== next.prizes.length || next.EACH_COUNT.some(n => !Number.isInteger(n) || n < 1 || n > 119)) throw new Error('每轮人数必须为 1–119，并与奖项一一对应');
  if (!/^#[0-9a-f]{6}$/i.test(next.background)) throw new Error('背景颜色格式错误');
  if (Array.from(String(next.highlight || '')).length > 8) throw new Error('高亮文字最多 8 个字');
  for (const [type, users] of Object.entries(state.winners)) {
    if (users.length && (!ids.has(Number(type)) || next.prizes.find(p => p.type === Number(type)).count < users.length)) throw new Error('已开奖奖项不可删除或减少至已中奖人数以下，请先重置');
  }
  if (next.mode && next.mode !== 'random') throw new Error('仅支持等概率随机抽奖');
  if (next.allowRepeat === true) throw new Error('同一场活动不允许重复中奖');
  if (next.designatedIDs && (!Array.isArray(next.designatedIDs) || next.designatedIDs.length)) throw new Error('不支持指定中奖人员');
  if (next.theme && !themeIDs.includes(next.theme)) throw new Error('主题不存在');
  const validated = { theme: next.theme || cfg.theme || 'nebula', prizes: next.prizes.map(p => ({ type: p.type, text: String(p.text).slice(0,80), title: String(p.title || '').slice(0,120), count: p.count, img: /^https?:\/\//i.test(p.img || '') || /^\.?\.?\/img\//.test(p.img || '') ? p.img : '' })), EACH_COUNT: next.EACH_COUNT, COMPANY: String(next.COMPANY || '').slice(0,40), title: String(next.title || '幸运抽奖').slice(0,80), highlight: String(next.highlight || ''), background: next.background };
  atomic(configFile, validated); cfg = validated; res.json(cfg);
});
app.post('/importUsers', (req,res) => {
  if (Object.values(state.winners).some(u => u.length)) throw new Error('请先导出结果并重置，再更换名单');
  const users = req.body.excel ? excelUsers(Buffer.from(req.body.excel, 'base64')) : validateUsers(req.body.users);
  transaction(s => { s.users = users; s.absent = []; });
  res.json({ count: users.length });
});
app.post('/reloadUsers', (req,res) => {
  if (Object.values(state.winners).some(u => u.length)) throw new Error('请先导出结果并重置，再更换名单');
  const users = excelUsers(path.join(__dirname, 'data/users.xlsx'));
  transaction(s => { s.users = users; s.absent = []; });
  res.json({ count: users.length });
});
app.get('/users-template.xlsx', (req,res) => {
  const roster = [
    ['工号','姓名','部门','照片 URL'],
    ['001','张三','研发部',''],
    ['002','李四','运营部','']
  ];
  const instructions = [
    ['项目','填写说明'],
    ['操作步骤','在第一张“人员名单”表中替换示例人员，保留表头；保存为 .xlsx 后上传。第二张表仅供参考，不会导入。'],
    ['工号','必填且唯一。使用文本格式以保留 001 等前导零；不要重复使用相同工号。'],
    ['姓名','必填。'],
    ['部门','可选。'],
    ['照片 URL','可选；填写 http:// 或 https:// 开头的图片地址。不填可留空。'],
    ['注意','不要修改第一张表的列顺序。只在第一张表填写参与人员，不要把说明文字追加在人员行后。']
  ];
  res.attachment('users-template.xlsx').send(xlsx.build([
    { name: '人员名单', data: roster, options: { '!cols': [{wch:16},{wch:16},{wch:20},{wch:48}] } },
    { name: '填写说明', data: instructions, options: { '!cols': [{wch:18},{wch:110}] } }
  ]));
});
app.post('/export', (req,res) => res.json({ type: 'success', url: '/results.xlsx' }));
app.get('/results.xlsx', (req,res) => {
  const rows = [['奖项','奖品','工号','姓名','部门']];
  cfg.prizes.forEach(p => (state.winners[p.type] || []).forEach(u => rows.push([p.text,p.title,...u.slice(0,3)])));
  res.attachment('results.xlsx').send(xlsx.build([{ name: '抽奖结果', data: rows }]));
});
// Compatibility endpoint: results are already persisted by /draw.
app.post('/saveData', (req,res) => res.json({ type: 'success' }));
app.use(express.static(path.join(__dirname, '../product/dist')));
app.use((err,req,res,next) => { console.error(err.message); res.status(400).json({ error: err.message }); });
module.exports = { app, run(port = process.env.PORT || 8888) {
  return app.listen(Number(port), process.env.HOST || '0.0.0.0', () => console.log(`Lottery: http://0.0.0.0:${port}`));
} };
