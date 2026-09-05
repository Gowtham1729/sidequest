// Feed ownership is decided before sending gameplay input. It never depends on
// how far a gameplay swipe travels, so a long Snake/2048 swipe cannot skip games.
export function gestureOwner({phase,x,width,zone=false,touches=1}){
  return phase!=='playing'||zone||x>=width-28||touches>1?'feed':'game';
}
export function navigationIntent(dx,dy,{allowHorizontal=true,threshold=62}={}){
  if(Math.abs(dy)>=threshold&&Math.abs(dy)>Math.abs(dx)*1.25)return dy<0?'next':'prev';
  if(allowHorizontal&&Math.abs(dx)>=threshold&&Math.abs(dx)>Math.abs(dy)*1.25)return dx>0?'lineup':'help';
  return null;
}
export function isTap(dx,dy,duration){return Math.hypot(dx,dy)<12&&duration<500;}
export function centroid(points){let x=0,y=0;for(const p of points){x+=p.x;y+=p.y}return {x:x/points.length,y:y/points.length};}
