export function applyBackground(element, config) {
  const mode = config.backgroundMode || 'stars';
  element.dataset.background = mode;
  element.style.setProperty('--background-color', config.background || '#000a14');
  element.style.setProperty('--background-image', mode === 'image' && config.backgroundImage ? `url(${JSON.stringify(config.backgroundImage)})` : 'none');
}
