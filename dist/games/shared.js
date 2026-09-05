export const SIZE = 400;
export function surface(mount) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 800;
  canvas.setAttribute('aria-hidden', 'true');
  mount.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  return { canvas, ctx };
}
export function point(event, arena) {
  const r = arena.getBoundingClientRect();
  const scale = Math.min(r.width, r.height) / SIZE;
  return { x: (event.clientX - r.left - (r.width - SIZE * scale) / 2) / scale,
    y: (event.clientY - r.top - (r.height - SIZE * scale) / 2) / scale };
}
export function clear(ctx) { ctx.clearRect(0, 0, SIZE, SIZE); }
export function rect(ctx, x, y, w, h, fill, radius = 0) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill();
}
export function text(ctx, value, x, y, size, fill, weight = 500) {
  ctx.fillStyle = fill; ctx.font = `${weight} ${size}px Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(value, x, y);
}
export function grid(ctx, step = 25) {
  ctx.fillStyle = '#ffffff0e';
  for(let x=12;x<400;x+=step)for(let y=12;y<400;y+=step){ctx.beginPath();ctx.arc(x,y,.9,0,Math.PI*2);ctx.fill();}
}
export function shuffled(items, random = Math.random) {
  const a = [...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;
}
export const DIRECTIONS = { up: {x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
export function swipeDirection(start, end) {
  if(!start)return null;const dx=end.x-start.x,dy=end.y-start.y;
  if(Math.max(Math.abs(dx),Math.abs(dy))<16)return null;
  return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
}
