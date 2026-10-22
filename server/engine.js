const { randomInt } = require('node:crypto');
function validateUsers(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('人员名单不能为空');
  const ids = new Set();
  return rows.map(row => {
    if (!Array.isArray(row) || row[0] == null || !String(row[0]).trim() || !String(row[1] || '').trim()) throw new Error('每行必须有唯一工号和姓名');
    const user = row.slice(0, 5).map(v => String(v ?? '').trim());
    if (ids.has(user[0])) throw new Error('重复工号：' + user[0]);
    ids.add(user[0]);
    if (user[3] && !/^https?:\/\//i.test(user[3])) throw new Error('照片地址必须为 http/https URL');
    if (user[4] && (!Number.isFinite(Number(user[4])) || Number(user[4]) < 0 || Number(user[4]) > 1000000)) throw new Error("权重必须为 0–1000000 的数字");
    return user;
  });
}
const weight = user => user[4] == null || user[4] === '' ? 1 : Number(user[4]);
function available(state, cfg, excluded = []) {
  const used = new Set([...state.absent, ...excluded].map(u => u[0]));
  if (!cfg.allowRepeat) Object.values(state.winners).flat().forEach(u => used.add(u[0]));
  return state.users.filter(u => !used.has(u[0]) && (cfg.mode !== "weighted" || weight(u) > 0) && (cfg.mode !== "designated" || (cfg.designatedIDs || []).includes(u[0])));
}
function sample(pool, count, mode) {
  const copy = pool.slice(), result = [];
  for (let i = 0; i < count && copy.length; i++) {
    let index = randomInt(copy.length);
    if (mode === 'weighted') {
      let target = randomInt(0x100000000) / 0x100000000 * copy.reduce((n,u) => n + weight(u), 0);
      index = 0;
      while (index < copy.length - 1 && (target -= weight(copy[index])) >= 0) index++;
    }
    result.push(copy.splice(index, 1)[0]);
  }
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
  const users = sample(pool, count, cfg.mode);
  state.winners[type] = old.concat(users);
  return users;
}
function redraw(state, cfg, type, ids) {
  const old = state.winners[type] || [];
  const selected = old.filter(u => ids.includes(u[0]));
  if (!ids.length || selected.length !== ids.length || new Set(ids).size !== ids.length) throw new Error('请选择当前奖项的有效中奖人员');
  const pool = available(state, cfg, old);
  if (pool.length < selected.length) throw new Error('剩余人数不足以补抽，原结果已保留');
  const users = sample(pool, selected.length, cfg.mode);
  state.absent.push(...selected);
  state.winners[type] = old.filter(u => !ids.includes(u[0])).concat(users);
  return users;
}
module.exports = { validateUsers, available, draw, redraw };
