// Canvas materials shared by the newer arcade games. All coordinates remain in
// the feed's logical space, so touch input and safe-area geometry stay aligned.
// These are the 'scene' layout family: a bounded field with a themed backdrop
// that may extend behind safe UI (see shared.js families).
import {surface as baseSurface,rect,text,circle,clear as baseClear} from './shared.js';
export {rect,text,circle};
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const TAU=Math.PI*2;
const scenes=new WeakMap();
export function surface(mount,theme='night',{layout='scene'}={}){
  const s=baseSurface(mount,{maxFieldWidth:420,layout});scenes.set(s.ctx,{view:s.view,theme});return s;
}
export const createCanvas=surface;
const palettes={night:['#151d31','#090f1c','#7e9ddf'],court:['#193943','#10242c','#9cebd9'],jewel:['#2a203d','#151523','#e1b5f6'],sky:['#294d60','#112938','#d5e9b6'],wood:['#283c32','#14261f','#e9b778'],space:['#211c3a','#0b1123','#baa1f3'],amber:['#28263b','#121622','#ffc080'],rose:['#321d2c','#181724','#f8b3c5']};
export function clear(ctx){
  const scene=scenes.get(ctx);if(scene?.clipped)ctx.restore();baseClear(ctx);if(!scene)return;
  const {view,theme}=scene,f=view.field,p=palettes[theme]||palettes.night;
  const g=ctx.createLinearGradient(0,f.y,0,f.y+f.h);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);
  rect(ctx,f.x,f.y,f.w,f.h,g,20);
  ctx.save();ctx.strokeStyle=p[2]+'20';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(f.x+.5,f.y+.5,f.w-1,f.h-1,20);ctx.stroke();ctx.restore();
  ctx.save();ctx.beginPath();ctx.roundRect(f.x,f.y,f.w,f.h,20);ctx.clip();scene.clipped=true;
}
export function line(ctx,x1,y1,x2,y2,color,width=1){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
export function ring(ctx,x,y,r,color,width=1,start=0,end=TAU){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,Math.max(0,r),start,end);ctx.stroke();ctx.restore();}
export function orb(ctx,x,y,r,color){
  circle(ctx,x,y+r*.32,r,'#00000028');const g=ctx.createRadialGradient(x-r*.32,y-r*.38,r*.05,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.26,color);g.addColorStop(1,color+'80');circle(ctx,x,y,r,g);ring(ctx,x,y,r-.5,'#ffffff44');
}
export function slab(ctx,x,y,w,h,color,r=5){
  if(w<=0||h<=0)return;rect(ctx,x,y+3,w,h,'#00000035',r);const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,color);g.addColorStop(1,color+'aa');rect(ctx,x,y,w,h,g,r);line(ctx,x+r,y+1,x+w-r,y+1,'#ffffff60');
}
export function badge(ctx,label,x,y,color='#d8e3ef',align='center'){
  ctx.save();ctx.font='600 12px Arial';const w=ctx.measureText(label).width+24;const left=align==='left'?x:align==='right'?x-w:x-w/2;rect(ctx,left,y-14,w,28,'#08101b99',14);text(ctx,label,left+w/2,y,12,color,600);ctx.restore();
}
export function specks(ctx,f,color='#ffffff',offset=0){
  ctx.save();for(let i=0;i<38;i++){ctx.globalAlpha=.12+(i%4)*.07;circle(ctx,f.x+((i*97.7+19)%f.w),f.y+((i*73.3+offset+f.h*10)%f.h),i%6===0?1.6:.8,color);}ctx.restore();
}
export function burst(ctx,particles){for(const p of particles){ctx.save();ctx.globalAlpha=clamp(p.life/(p.maxLife||.4),0,1);circle(ctx,p.x,p.y,p.r||p.size||2,p.color);ctx.restore();}}
export function diamond(ctx,x,y,r,color){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.75,0);ctx.lineTo(0,r);ctx.lineTo(-r*.75,0);ctx.closePath();ctx.fillStyle=color;ctx.fill();line(ctx,0,-r,0,r,'#ffffff70');line(ctx,-r*.75,0,r*.75,0,'#ffffff40');ctx.restore();}
