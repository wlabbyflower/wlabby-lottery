const { randomInt } = require('node:crypto');
function validateUsers(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('人员名单不能为空');
  const ids = new Set();
  return rows.map(row => {
    if (!Array.isArray(row) || row[0] == null || !String(row[0]).trim() || !String(row[1] || '').trim()) throw new Error('每行必须有唯一工号和姓名');
    if (row.slice(4).some(v => v != null && String(v).trim())) throw new Error('仅支持工号、姓名、部门、照片 URL 四列，请使用新版模板');
    const user = row.slice(0, 4).map(v => String(v ?? '').trim());
    if (ids.has(user[0])) throw new Error('重复工号：' + user[0]);
    ids.add(user[0]);
    if (user[3] && !/^https?:\/\//i.test(user[3])) throw new Error('照片地址必须为 http/https URL');
    return user;
  });
}
function available(state, cfg, excluded = []) {
  const used = new Set([...state.absent, ...excluded, ...Object.values(state.winners).flat()].map(u => String(u[0])));
  return state.users.filter(u => !used.has(String(u[0])));
}
function sample(pool, count) {
  const copy = pool.slice(), result = [];
  for (let i = 0; i < count && copy.length; i++) result.push(copy.splice(randomInt(copy.length), 1)[0]);
  return result;
}
function draw(state, cfg, type) {
  const index = cfg.prizes.findIndex(p => p.type === type);
  if (index < 0) throw new Error('奖项不存在');
  const prize = cfg.prizes[index], old = state.winners[type] || [];
  const left = prize.count - old.length;
  const pool = available(state, cfg);
  const count = Math.min(cfg.EACH_COUNT[index], left, pool.length, 119);
  if (count <= 0) throw new Error(left <= 0 ? '此奖项已抽完' : '没有剩余可抽奖人员');
  const users = sample(pool, count);
  state.winners[type] = old.concat(users);
  return users;
}
function redraw(state, cfg, type, ids) {
  const old = state.winners[type] || [];
  const selected = old.filter(u => ids.includes(u[0]));
  if (!ids.length || selected.length !== ids.length || new Set(ids).size !== ids.length) throw new Error('请选择当前奖项的有效中奖人员');
  const pool = available(state, cfg, old);
  if (pool.length < selected.length) throw new Error('剩余人数不足以补抽，原结果已保留');
  const users = sample(pool, selected.length);
  state.absent.push(...selected);
  state.winners[type] = old.filter(u => !ids.includes(u[0])).concat(users);
  return users;
}
module.exports = { validateUsers, available, draw, redraw };
