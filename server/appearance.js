const MAX_BACKGROUND_BYTES = 5 * 1024 * 1024;

function validateAppearance(input, current) {
  const year = String(input.year ?? current.year ?? new Date().getFullYear()).trim();
  if (!/^\d{4}$/.test(year)) throw new Error('年份必须为 4 位数字');
  const backgroundMode = input.backgroundMode ?? current.backgroundMode ?? 'stars';
  if (!['stars', 'image', 'solid'].includes(backgroundMode)) throw new Error('背景模式无效');
  const backgroundImage = String(input.backgroundImage ?? current.backgroundImage ?? '').trim();
  if (backgroundImage) {
    if (backgroundImage.startsWith('data:')) {
      const match = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/.exec(backgroundImage);
      if (!match || match[2].length > Math.ceil(MAX_BACKGROUND_BYTES / 3) * 4) throw new Error('背景图片只支持 5MB 以内的 PNG、JPEG、WebP 或 GIF');
      const bytes = Buffer.from(match[2], 'base64');
      const valid = {
        png: bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
        jpeg: bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
        webp: bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
        gif: /^GIF8[79]a$/.test(bytes.toString('ascii', 0, 6)),
      };
      if (!valid[match[1]] || bytes.length > MAX_BACKGROUND_BYTES) throw new Error('背景图片格式或大小无效');
    } else {
      let url;
      try { url = new URL(backgroundImage); } catch { throw new Error('请输入完整的 HTTP 或 HTTPS 背景图片地址'); }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || backgroundImage.length > 2048) throw new Error('背景图片地址无效');
    }
  }
  if (backgroundMode === 'image' && !backgroundImage) throw new Error('请上传背景图片或填写图片地址');
  return { year, backgroundMode, backgroundImage };
}

module.exports = { validateAppearance };
