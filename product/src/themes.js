export const THEMES = [
  { id: 'nebula', name: '深空星舰', subtitle: 'DEEP SPACE', description: '冰蓝星光 · 舰桥仪表 · 深空轨道', accent: '#70d9ff', accent2: '#387bff', background: '#050a18', rgb: '112, 217, 255' },
  { id: 'violet', name: '紫域星云', subtitle: 'NEBULA VOYAGE', description: '紫色星云 · 瑰丽光晕 · 星际漫游', accent: '#c4a0ff', accent2: '#f07acb', background: '#0c071a', rgb: '196, 160, 255' },
  { id: 'aurora', name: '极光航线', subtitle: 'AURORA SIGNAL', description: '翡翠极光 · 清透能量 · 远航信号', accent: '#72f4ca', accent2: '#25a6c6', background: '#041410', rgb: '114, 244, 202' },
  { id: 'solar', name: '日冕远征', subtitle: 'SOLAR EXPEDITION', description: '琥珀日冕 · 温暖星尘 · 星际远征', accent: '#ffd293', accent2: '#ec7b49', background: '#160d09', rgb: '255, 210, 147' },
];
export function applyTheme(id = 'nebula') {
  const theme = THEMES.find(t => t.id === id) || THEMES[0];
  document.documentElement.dataset.theme = theme.id;
  for (const [key, value] of Object.entries({ '--accent': theme.accent, '--accent-2': theme.accent2, '--accent-rgb': theme.rgb, '--space': theme.background })) document.documentElement.style.setProperty(key, value);
  window.lotteryBackground = theme.background;
  window.lotteryStarColor = theme.rgb;
  return theme;
}
export const icons = {
  gear: '<path d="m9.7 4.3.6-2.3h3.4l.6 2.3 2 .9 2.1-.7 1.7 2.9-1.5 1.7.2 2.2 1.5 1.7-1.7 2.9-2.1-.7-2 .9-.6 2.3h-3.4l-.6-2.3-2-.9-2.1.7-1.7-2.9 1.5-1.7V9.4L4.2 7.7l1.7-2.9 2.1.7z"/><circle cx="12" cy="10.8" r="3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 1.6 1.6 0 0 1 1-2.8h2A4 4 0 0 0 21 10a9 9 0 0 0-9-7Z"/><path d="M7 10h.01M10 6h.01M15 6h.01M18 10h.01"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2"/>',
  trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v6m-5 2h10"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13m0-13C3 9 5 0 9 4Zm0 0c9 1 7-8 3-4Z"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  arrow: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  save: '<path d="M5 3h12l4 4v14H3V3Zm2 0v6h10V3M7 21v-8h10v8"/>',
  spark: '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
};
export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
