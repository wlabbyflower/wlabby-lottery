const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let width, height, stars = [];
function resize() {
  width = canvas.width = innerWidth; height = canvas.height = innerHeight;
  stars = Array.from({length: Math.min(320, Math.floor(width * height / 5000))}, () => ({ x: Math.random()*width, y: Math.random()*height, r: Math.random()*1.2+.25, phase: Math.random()*6.3, speed: Math.random()*.08+.02 }));
}
resize(); window.addEventListener('resize', resize);
let previous = 0;
function frame(time) {
  requestAnimationFrame(frame);
  if (document.hidden || time - previous < 33) return;
  previous = time;
  context.fillStyle = window.lotteryBackground || '#050a18'; context.fillRect(0,0,width,height);
  const rgb = window.lotteryStarColor || '112,217,255';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const star of stars) {
    if(!reduced) { star.y += star.speed; if(star.y > height) star.y = 0; }
    context.fillStyle = `rgba(${rgb},${.18 + (1 + Math.sin(time*.0006 + star.phase))*.22})`;
    context.beginPath(); context.arc(star.x,star.y,star.r,0,Math.PI*2); context.fill();
  }
}
requestAnimationFrame(frame);
