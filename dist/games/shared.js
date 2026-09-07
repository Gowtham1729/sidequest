export const SIZE = 400;
// Layout families describe design responsibilities, not a mandated API:
// - 'board': stable cell shapes centred in the usable region (puzzle boards;
//   square-cell enforcement arrives with the 2048 pilot, not here).
// - 'portrait-action': stable gameplay coordinates/camera independent of the
//   viewport (cabinet's fixed logical field).
// - 'scene': full-field play where the environment may extend behind safe UI.
// The tag is advisory today and every helper keeps its current geometry by
// default; it lets later tickets address each family without re-auditing.
export function viewport(width,height,safeTop=0,safeBottom=0,topInset=null,bottomInset=null){
  const scale=Math.min(width/400,height/720);
  const top=topInset??((height<550?80:100)+safeTop),bottom=bottomInset??((height<550?106:130)+safeBottom);
  return {width:width/scale,height:height/scale,scale,field:{x:18/scale,y:top/scale,w:(width-36)/scale,h:Math.max(100,height-top-bottom)/scale}};
}
export function surface(mount,{maxFieldWidth=Infinity,layout='scene'}={}){
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');mount.replaceChildren(canvas);
  const ctx=canvas.getContext('2d'),preference=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
  const view={layout,get reducedMotion(){return preference.matches;}};
  function resize(){
    const width=mount.clientWidth||window.innerWidth,height=mount.clientHeight||window.innerHeight;
    const style=getComputedStyle(mount);
    Object.assign(view,viewport(width,height,parseFloat(style.getPropertyValue('--safe-top'))||0,parseFloat(style.getPropertyValue('--safe-bottom'))||0,document.getElementById('top-hud')?.offsetHeight+8,document.getElementById('bottom-hud')?.offsetHeight+8));
    if(view.field.w>maxFieldWidth){view.field.x+=(view.field.w-maxFieldWidth)/2;view.field.w=maxFieldWidth;}
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr*view.scale,0,0,dpr*view.scale,0,0);
  }
  resize();const observer=new ResizeObserver(resize);observer.observe(mount);observer.observe(document.getElementById('top-hud'));observer.observe(document.getElementById('bottom-hud'));
  return {canvas,ctx,view,destroy(){observer.disconnect();canvas.remove();}};
}
// Client coordinates always map to the settled (#scene untranslated) geometry,
// so a press dispatched during the scene entry animation (which translates
// #scene for 300ms) lands on the same game point as the identical press after
// settling. Without this, one gesture's press and release would be mapped
// through different transforms and fabricate phantom vectors (e.g. a
// stationary hold mid-animation could read as a 100px+ drag). Movement deltas
// inherit the same consistency for free.
// The translation is read by parsing the computed matrix (no DOMMatrix
// dependency); anything unparseable safely falls back to no correction.
function sceneShift(scene){
  try{
    const t=scene&&getComputedStyle(scene).transform;
    if(!t||t==='none')return {x:0,y:0};
    const flat=t.match(/^matrix3?d?\((.+)\)$/);
    if(!flat)return {x:0,y:0};
    const v=flat[1].split(',').map(Number);
    const parts=t.startsWith('matrix3d')?[v[12],v[13]]:[v[4],v[5]];
    return {x:parts[0]||0,y:parts[1]||0};
  }catch{return {x:0,y:0};}
}
export function point(event,arena,scene){
  const r=arena.getBoundingClientRect();const scale=Math.min(r.width/400,r.height/720);
  const shift=sceneShift(scene??arena.parentElement);
  return {x:(event.clientX-r.left+shift.x)/scale,y:(event.clientY-r.top+shift.y)/scale};
}
export function clear(ctx){ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);}
export function rect(ctx,x,y,w,h,fill,radius=0){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,radius);ctx.fill();}
export function text(ctx,value,x,y,size,fill,weight=500,align='center'){ctx.fillStyle=fill;ctx.font=`${weight} ${size}px Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(value,x,y);}
export function circle(ctx,x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,Math.PI*2);ctx.fill();}
export function createCanvas(mount){return surface(mount);}
export function grid(ctx,view,step=28){ctx.fillStyle='#c9f86a0a';for(let x=14;x<view.width;x+=step)for(let y=14;y<view.height;y+=step){ctx.beginPath();ctx.arc(x,y,.8,0,Math.PI*2);ctx.fill();}}
export function shuffled(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export const DIRECTIONS={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
export function swipeDirection(start,end){if(!start)return null;const dx=end.x-start.x,dy=end.y-start.y;if(Math.max(Math.abs(dx),Math.abs(dy))<16)return null;return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');}
