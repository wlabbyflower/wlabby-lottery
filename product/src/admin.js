import './admin.css';
import './admin-event.css';
import { THEMES, applyTheme, icon } from './themes.js';
const $ = id => document.getElementById(id);
let cfg, state, selectedTheme = 'nebula', dirty = false;
const panels = {
  basic: ['基础设置', '设置活动名称、人员名牌和大屏展示内容。'],
  appearance: ['UI 主题', '选择明亮清晰的配色，预览大屏名牌的显示效果。'],
  people: ['名单导入', '下载 Excel 模板，导入和检查全部参与人员。'],
  winners: ['中奖名单', '按奖项查看中奖人员，导出本场活动结果。'],
  prizes: ['奖品设置', '为每一份期待，准备值得揭晓的惊喜。'],
  rules: ['抽奖规则', '设置参与方式，让每一次开奖都清晰有序。'],
};
const status = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); };
function navigate(name, updateHash = true) {
  const id = panels[name] ? name : 'basic';
  document.querySelectorAll('.nav-item').forEach(button => { const active = button.dataset.panel === id; button.classList.toggle('active', active); if(active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current'); });
  document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'panel-' + id));
  $('pageTitle').textContent = $('breadcrumb').textContent = panels[id][0]; $('pageDescription').textContent = panels[id][1];
  if(updateHash) history.replaceState(null, '', '#' + id);
}
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
document.querySelectorAll('[data-panel]').forEach(button => button.onclick = () => navigate(button.dataset.panel));
document.querySelectorAll('[data-goto]').forEach(button => button.onclick = () => navigate(button.dataset.goto));
window.addEventListener('hashchange', () => navigate(location.hash.slice(1), false));
navigate(location.hash.slice(1), false);
async function api(url, data = {}) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error || '请求失败');
  return result;
}
function markDirty() { if(!cfg) return; dirty = true; status('有未保存的修改 · 切换分类会保留修改，完成后点击右上角保存。'); }
document.querySelectorAll('input:not([type=file]),textarea,select').forEach(el => { if(!['peopleSearch','winnerFilter','rows'].includes(el.id)) el.addEventListener('input',markDirty); });
window.addEventListener('beforeunload', event => { if(dirty) { event.preventDefault(); event.returnValue = ''; } });
function chooseTheme(id, changed = false) {
  const theme = applyTheme(id); selectedTheme = theme.id; $('background').value = theme.background;
  document.querySelectorAll('.theme-choice').forEach(button => { const active = button.dataset.id === theme.id; button.classList.toggle('selected',active); button.setAttribute('aria-pressed', String(active)); });
  $('previewThemeName').textContent = theme.name;
  if(changed) markDirty();
}
for(const theme of THEMES) {
  const button = document.createElement('button'); button.className = 'theme-choice'; button.dataset.id = theme.id; button.style.setProperty('--swatch', theme.accent); button.style.setProperty('--theme-bg',theme.background); button.setAttribute('aria-label',`${theme.name}：${theme.description}`);
  button.innerHTML = `<div class="theme-art"><i></i></div><div class="theme-choice-info"><strong>${theme.name}</strong><small>${theme.subtitle}</small></div><span class="theme-check" aria-hidden="true">✓</span>`;
  button.onclick = () => chooseTheme(theme.id, true); $('themeCards').append(button);
}
$('title').addEventListener('input', () => $('previewTitle').textContent = $('title').value || '幸运抽奖');
$('file').addEventListener('change', () => $('fileLabel').textContent = $('file').files[0]?.name || '支持 .xlsx、.xls，文件不超过 8MB');
function prizeRow(prize, count) {
  const tr = document.createElement('tr'); tr.dataset.type = prize.type; tr.dataset.img = prize.img || '';
  for (const [key, value] of [['text',prize.text],['title',prize.title],['count',prize.count],['each',count]]) {
    const td = document.createElement('td'), input = document.createElement('input');
    input.dataset.key = key; input.value = value ?? ''; input.type = ['count','each'].includes(key) ? 'number' : 'text'; input.min = 1; input.setAttribute('aria-label', ({text:'奖项名称',title:'奖品名称',count:'奖品总数',each:'每轮人数'})[key]);
    if (key === 'each') input.max = 119;
    input.oninput = markDirty; td.append(input); tr.append(td);
  }
  const td = document.createElement('td'), button = document.createElement('button'); button.textContent = '删除'; button.setAttribute('aria-label','删除' + prize.text); button.onclick = () => { tr.remove(); markDirty(); }; td.append(button); tr.append(td); $('prizes').append(tr);
}
function row(table, values) {
  const tr = document.createElement('tr');
  for (const value of values) { const td = document.createElement('td'); td.textContent = value || '—'; tr.append(td); }
  table.append(tr);
}
function empty(table, columns, message) { const tr = document.createElement('tr'), td = document.createElement('td'); td.colSpan = columns; td.className = 'empty-state'; td.textContent = message; tr.append(td); table.append(tr); }
function renderPeople() {
  const search = $('peopleSearch').value.trim().toLowerCase();
  const users = state.users.filter(u => u.slice(0,3).some(v=>String(v || '').toLowerCase().includes(search)));
  const table = $('peopleList'); table.replaceChildren(); users.slice(0,200).forEach(u=>row(table,u.slice(0,3)));
  if(!users.length) empty(table,3,'没有找到匹配的参与人员');
  $('peopleListCount').textContent = users.length > 200 ? `匹配 ${users.length} 人，显示前 200 人；可通过搜索缩小范围。` : `共 ${users.length} 位参与人员`;
}
function renderWinners() {
  const filter = $('winnerFilter').value, table = $('winnerList'); table.replaceChildren(); let count = 0;
  for(const prize of state.cfgData.prizes) {
    if(filter && String(prize.type) !== filter) continue;
    for(const user of state.luckyData[prize.type] || []) { row(table, [prize.text,prize.title,...user.slice(0,3)]); count++; }
  }
  if(!count) empty(table,5,'尚无中奖记录，下一份幸运正在途中。');
  $('results').textContent = `共 ${count} 条中奖记录 · 所有结果已自动保存`;
}
function renderData() {
  $('statPeople').replaceChildren(document.createTextNode(String(state.users.length)), Object.assign(document.createElement('small'),{textContent:'人'}));
  $('statPrizes').textContent = state.cfgData.prizes.length;
  $('statWinners').replaceChildren(document.createTextNode(String(Object.values(state.luckyData).flat().length)), Object.assign(document.createElement('small'),{textContent:'人次'}));
  $('userCount').textContent = `已导入 ${state.users.length} 人，当前奖池 ${state.leftUsers.length} 人。`;
  const selected = $('winnerFilter').value; $('winnerFilter').replaceChildren(new Option('全部奖项',''));
  state.cfgData.prizes.forEach(p => $('winnerFilter').append(new Option(p.text,String(p.type))));
  if(Array.from($('winnerFilter').options).some(o=>o.value===selected)) $('winnerFilter').value = selected;
  renderPeople(); renderWinners();
}
async function refreshData() { state = await api('/getTempData'); renderData(); }
async function load() {
  state = await api('/getTempData'); cfg = state.cfgData;
  $('title').value = cfg.title; $('previewTitle').textContent = cfg.title; $('company').value = cfg.COMPANY; $('highlight').value = cfg.highlight;
  chooseTheme(cfg.theme); $('prizes').replaceChildren(); cfg.prizes.forEach((p,i) => prizeRow(p,cfg.EACH_COUNT[i]));
  renderData(); dirty = false;
}
$('peopleSearch').oninput = () => state && renderPeople(); $('winnerFilter').onchange = () => state && renderWinners();
function on(id, fn) { $(id).onclick = async () => { $(id).disabled = true; try { await fn(); } catch(error) { status(error.message,true); } finally { $(id).disabled = false; } }; }
on('add', () => {
  const type = Math.max(-1,...cfg.prizes.map(p=>p.type),...Array.from($('prizes').children,tr=>Number(tr.dataset.type)))+1;
  prizeRow({type,text:'新奖项',title:'',count:1},1); markDirty();
});
on('save', async () => {
  if(!cfg) throw new Error('设置仍在加载，请稍后重试。');
  const prizes = [], counts = [];
  for(const tr of $('prizes').children) {
    const values = Object.fromEntries(Array.from(tr.querySelectorAll('input'), input=>[input.dataset.key,input.value]));
    prizes.push({ type: Number(tr.dataset.type), text: values.text, title: values.title, count: Number(values.count), img: tr.dataset.img }); counts.push(Number(values.each));
  }
  await api('/settings', { theme: selectedTheme, title: $('title').value, COMPANY: $('company').value, highlight: $('highlight').value, background: $('background').value, prizes, EACH_COUNT: counts });
  await load(); status('设置已保存 · 刷新抽奖大屏即可应用。');
});
on('import', async () => {
  const file = $('file').files[0]; if(!file) throw new Error('请先选择 Excel 文件');
  if(file.size > 8*1024*1024) throw new Error('文件不能超过 8MB');
  const excel = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = () => reject(new Error('文件读取失败')); reader.readAsDataURL(file); });
  const result = await api('/importUsers', {excel}); await refreshData(); status(`已导入 ${result.count} 人 · 请刷新抽奖大屏。`);
});
on('paste', async () => { const users = $('rows').value.trim().split(/\r?\n/).map(row=>row.split('\t')); const result = await api('/importUsers',{users}); await refreshData(); status(`已导入 ${result.count} 人 · 请刷新抽奖大屏。`); });
on('reload', async () => { await api('/reloadUsers'); await refreshData(); status('已重新读取服务器 Excel · 请刷新抽奖大屏。'); });
on('reset', async () => { if(!confirm('确定清空所有中奖记录？请先下载结果。')) return; await api('/reset'); await refreshData(); status('中奖结果已重置，人员名单、奖项和主题已保留。'); });
on('refreshResults', async () => { await refreshData(); status('中奖名单已更新。'); });
load().then(()=>status('控制台已连接 · 所有中奖结果自动保存，设置修改请点击右上角保存。')).catch(error=>status(error.message,true));
