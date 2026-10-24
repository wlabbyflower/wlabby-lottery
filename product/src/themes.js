export const THEMES = [
  { id: 'nebula', name: '晴空蓝', subtitle: 'CLEAR BLUE', description: '明亮蓝白 · 清晰名牌', accent: '#2563eb', accent2: '#60a5fa', background: '#edf3ff', ink: '#162743', rgb: '37, 99, 235' },
  { id: 'violet', name: '柔雾紫', subtitle: 'SOFT VIOLET', description: '柔和浅紫 · 简洁优雅', accent: '#7c3aed', accent2: '#a78bfa', background: '#f4f0fc', ink: '#302041', rgb: '124, 58, 237' },
  { id: 'aurora', name: '清新绿', subtitle: 'FRESH GREEN', description: '清爽绿白 · 舒适易读', accent: '#047857', accent2: '#34d399', background: '#edf7f2', ink: '#17382c', rgb: '4, 120, 87' },
  { id: 'solar', name: '暖金庆典', subtitle: 'WARM GOLD', description: '温暖米金 · 适合庆典', accent: '#ad5a10', accent2: '#fbbf24', background: '#fff6e8', ink: '#432b18', rgb: '173, 90, 16' },
];
export function applyTheme(id = 'nebula') {
  const theme = THEMES.find(t => t.id === id) || THEMES[0];
  document.documentElement.dataset.theme = theme.id;
  document.documentElement.style.colorScheme='light';
  for (const [key, value] of Object.entries({ '--accent': theme.accent, '--accent-2': theme.accent2, '--accent-rgb': theme.rgb, '--space': theme.background, '--ink':theme.ink, '--surface':'#ffffff' })) document.documentElement.style.setProperty(key, value);
  window.dispatchEvent(new CustomEvent('lottery-theme-change', {detail:theme}));
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
