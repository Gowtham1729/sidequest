import {surface,clear,rect,circle,text} from './shared.js';

export {rect,circle,text};
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const rand=(a,b)=>a+Math.random()*(b-a);
export const pick=a=>a[Math.floor(Math.random()*a.length)];
export const colors=['#8ce9d0','#ffbe80','#b9acff','#ff8eac','#aee57e','#88caff'];
export function line(c,x,y,xx,yy,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
export function ring(c,x,y,r,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);c.stroke();}
export function tile(c,x,y,w,h,color,label='',selected=false){
  rect(c,x,y+3,w,h,color+'28',9);rect(c,x,y,w,h,color,9);
  rect(c,x+5,y+3,w-10,2,'#ffffff40',1);
  if(label!=='')text(c,label,x+w/2,y+h/2,Math.min(24,h*.46),'#132432',750);
  if(selected){c.strokeStyle='#fff';c.lineWidth=2.5;c.beginPath();c.roundRect(x-3,y-3,w+6,h+6,11);c.stroke();}
}

// Every game uses one feed-owned clock and a transform derived from the safe HUD field.
// Coordinates and simulation stay stable through resizing; only presentation changes.
// Cabinet games are the 'portrait-action' layout family: a fixed logical field keeps
// gameplay coordinates and camera identical on every viewport (see shared.js families).
export function cabinet(mount,api,{accent='#8ce9d0',height=480,layout='portrait-action'}={}){
  const s=surface(mount,{maxFieldWidth:520}),c=s.ctx;let alive=true,active=false,score=0,elapsed=0,notice='',noticeTime=0,particles=[];
  s.view.layout=layout;
  const place=()=>{const f=s.view.field,k=Math.min(f.w/360,f.h/height);return {k,x:f.x+(f.w-360*k)/2,y:f.y+(f.h-height*k)/2};};
  const q={c,accent,height,get active(){return alive&&active;},get score(){return score;},get elapsed(){return elapsed;},get reducedMotion(){return s.view.reducedMotion;},
    local(p){const l=place();return {x:(p.x-l.x)/l.k,y:(p.y-l.y)/l.k};},
    start(){active=true;score=0;elapsed=0;noticeTime=0;particles=[];api.score(0);},
    add(n){if(!q.active)return;score+=n;api.score(score);},
    sound(event,pitch=0){if(q.active)api.audio?.play(event,{pitch});},
    say(value){notice=value;noticeTime=1.4;},
    burst(x,y,color=accent,n=14){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(30,100);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:rand(.3,.65),color});}particles=particles.slice(-100);},
    finish(title,subtitle,win=false,presentation){if(!q.active)return;active=false;api.finish(title,subtitle,score,win?'win':'finish',presentation);},
    header(left,right=''){
      const size=Math.max(14,Math.min(20,12/(place().k*s.view.scale)));
      c.font=`650 ${size}px Arial, sans-serif`;
      const stacked=c.measureText(left).width+c.measureText(right).width>324;
      text(c,left,8,stacked?10:16,size,'#dce8ed',650,'left');
      text(c,right,352,stacked?31:16,size,accent,650,'right');
    },
    footer(value){
      const size=Math.max(14,Math.min(20,12/(place().k*s.view.scale)));
      c.font=`500 ${size}px Arial, sans-serif`;
      if(c.measureText(value).width<=344){text(c,value,180,height-12,size,'#afc1cb');return;}
      const words=value.split(' ');let first='';
      while(words.length&&c.measureText(`${first} ${words[0]}`).width<324)first+=(first?' ':'')+words.shift();
      text(c,first,180,height-32,size,'#afc1cb');text(c,words.join(' '),180,height-10,size,'#afc1cb');
    },
    frame(dt,update,draw){if(!alive)return;dt=clamp(dt,0,.05);if(q.active&&dt>0){elapsed+=dt;update(dt);}q.present(q.active?dt:0,draw);},
    present(dt,draw){if(!alive)return;dt=clamp(dt,0,.05);
      noticeTime=Math.max(0,noticeTime-dt);
      particles=particles.filter(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;return p.t>0;});
      clear(c);const l=place();c.save();c.translate(l.x,l.y);c.scale(l.k,l.k);draw();
      for(const p of particles){c.globalAlpha=Math.min(1,p.t*3);circle(c,p.x,p.y,3,p.color);}c.globalAlpha=1;
      if(noticeTime>0){rect(c,22,height-67,316,32,'#101e32ed',12);text(c,notice,180,height-51,14,accent,700);}c.restore();},
    cancelPresentation(){particles=[];noticeTime=0;},
    destroy(){alive=false;active=false;particles=[];s.destroy();}
  };return q;
}
