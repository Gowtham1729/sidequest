// Feed ownership is decided before sending gameplay input. It never depends on
// how far a gameplay swipe travels, so a long Snake/2048 swipe cannot skip games.
// The rail width defaults to the 28px mobile rail; the shell passes the measured
// rail element width so wider desktop rails own their full visual width.
export function gestureOwner({phase,x,width,zone=false,touches=1,rail=28}){
  return phase!=='playing'||zone||x>=width-rail||touches>1?'feed':'game';
}
export function navigationIntent(dx,dy,{allowHorizontal=true,threshold=62}={}){
  if(Math.abs(dy)>=threshold&&Math.abs(dy)>Math.abs(dx)*1.25)return dy<0?'next':'prev';
  if(allowHorizontal&&Math.abs(dx)>=threshold&&Math.abs(dx)>Math.abs(dy)*1.25)return dx>0?'lineup':'help';
  return null;
}
export function isTap(dx,dy,duration){return Math.hypot(dx,dy)<12&&duration<500;}
export function centroid(points){let x=0,y=0;for(const p of points){x+=p.x;y+=p.y}return {x:x/points.length,y:y/points.length};}
// Per-game pointer policy declared by registry entries and consumed by the shell.
// 'press'  – a timing action is judged once, on pointer-down; the matching
//            release never repeats it.
// 'drag'   – the game owns the pointer from press to release (aim, steer,
//            trace, swipe), so the global hold-to-pause must stay out of it.
// omitted  – default: the action is judged on release and hold-to-pause applies.
export function pressTiming(policy){return policy==='press';}
export function holdPauses(policy){return policy!=='drag';}
