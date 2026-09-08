import {surface,clear,grid,text} from './shared.js';
import {createMotion,frameDelta} from './motion.js';
export function overlapBlock(previous,moving,tolerance=6){if(Math.abs(previous.x-moving.x)<=tolerance)return {x:previous.x,w:previous.w,perfect:true};const x=Math.max(previous.x,moving.x),w=Math.min(previous.x+previous.w,moving.x+moving.w)-x;return {x,w:Math.max(0,w),perfect:false};}

export function createStack(mount,api){
 const s=surface(mount),{ctx,view}=s;
 const reduced=()=>api.reducedMotion??view.reducedMotion;
 const motion=createMotion({reducedMotion:reduced});
 let blocks=[],moving,dir=1,speed=105,height=0,running=false,preview=true,flash=0,combo=0,pieces=[],miss=null,alive=true;
 const cameraTarget=level=>Math.max(0,level-5)*25;
 function reset(isPreview=false){
  preview=isPreview;height=0;speed=105;dir=1;flash=0;combo=0;pieces=[];miss=null;motion.clear();running=!preview;
  blocks=preview?Array.from({length:9},(_,i)=>({x:74+i*4,w:235-i*5,level:i})):[{x:70,w:240,level:0}];
  moving={x:preview?56:4,w:blocks.at(-1).w};
  const camera=cameraTarget(blocks.at(-1).level);motion.to('camera',camera,camera,0);draw();
 }
 function block(x,y,w,level,f,offset,alpha=1){
  x=offset+x*f;w*=f;const d=24*f,h=18*f,hue=100-Math.min(12,level%16)*1.4;
  ctx.save();ctx.globalAlpha=alpha;
  ctx.fillStyle=`hsl(${hue} 42% 39%)`;ctx.fillRect(x,y,w,h);
  ctx.fillStyle=`hsl(${hue} 40% 24%)`;ctx.beginPath();ctx.moveTo(x+w,y);ctx.lineTo(x+w+d,y-d*.65);ctx.lineTo(x+w+d,y+h-d*.65);ctx.lineTo(x+w,y+h);ctx.fill();
  ctx.fillStyle=`hsl(${hue} 64% ${level===blocks.at(-1).level+1?73:66}%)`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+d,y-d*.65);ctx.lineTo(x+w+d,y-d*.65);ctx.lineTo(x+w,y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#efffc638';ctx.lineWidth=Math.max(.6,f);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w+d,y-d*.65);ctx.stroke();
  ctx.fillStyle='#14220e25';ctx.fillRect(x,y+h-2*f,w,2*f);ctx.restore();
 }
 function draw(){
  if(!alive)return;
  clear(ctx);grid(ctx,view);
  const field=view.field,f=Math.min((view.width-36)/400,field.h/320),offset=(view.width-400*f)/2;
  const base=field.y+field.h*.78,camera=motion.value('camera'),y=level=>base+(camera-level*25)*f;
  ctx.save();ctx.beginPath();ctx.roundRect(0,field.y,view.width,field.h,0);ctx.clip();
  ctx.strokeStyle='#a9da7e18';ctx.beginPath();ctx.ellipse(view.width/2,base+27*f,155*f,20*f,0,0,Math.PI*2);ctx.stroke();
  for(const b of blocks){
   const top=y(b.level)+(reduced()?0:-15*((b.settle||0)/.12)**3)*f;
   if(top>field.y-30*f&&top<field.y+field.h+25*f)block(b.x,top,b.w,b.level,f,offset);
  }
  if(!miss){
   // Contact shadow stays on the last placed block; it never changes overlap.
   const top=blocks.at(-1),overlap=overlapBlock(top,moving,0);
   if(overlap.w>0){ctx.fillStyle='#172a1028';ctx.fillRect(offset+overlap.x*f,y(top.level)-3*f,overlap.w*f,3*f);}
   block(moving.x,y(top.level+1)-15*f,moving.w,top.level+1,f,offset);
  }
  for(const p of pieces){const t=p.age;block(p.x+p.side*t*35,y(p.level)+(380*t*t-15)*f,p.w,p.level,f,offset,Math.max(0,1-t/.55));}
  if(miss){
   const t=reduced()?0:miss.age;
   block(miss.x+miss.side*t*28,y(miss.level)+(330*t*t-15)*f,miss.w,miss.level,f,offset,1-(reduced()?0:Math.min(.55,t)));
  }
  ctx.restore();
  if(flash>0&&combo>0)text(ctx,combo>1?`PERFECT ×${combo}`:'PERFECT',view.width/2,field.y+28,combo>=5?20:18,'#d1ff8a',700);
 }
 function animate(dt){
  dt=frameDelta(dt);motion.tick(dt);for(const b of blocks)b.settle=reduced()?0:Math.max(0,(b.settle||0)-dt);flash=Math.max(0,flash-dt);
  if(reduced()){pieces=[];return;}
  pieces=pieces.filter(p=>{p.age+=dt;return p.age<.55;});
 }
 function drop(){
  if(!running||!alive)return;
  const previous=blocks.at(-1),r=overlapBlock(previous,moving),level=height+1;
  if(r.w<=0){
   running=false;flash=0;miss={...moving,level,age:0,side:moving.x<previous.x?-1:1};draw();
   api.finish('One block too far.',`${height} blocks high. Take it from the top.`,undefined,'miss',{duration:.5});return;
  }
  // Snapshot the cut before replacing the moving block. Geometry is cosmetic;
  // the accepted overlap becomes the authoritative top on this same input.
  if(!r.perfect&&!reduced()){
   if(moving.x<r.x)pieces.push({x:moving.x,w:r.x-moving.x,level,age:0,side:-1});
   const edge=r.x+r.w,end=moving.x+moving.w;
   if(end>edge)pieces.push({x:edge,w:end-edge,level,age:0,side:1});
   pieces=pieces.slice(-8);
  }
  blocks.push({x:r.x,w:r.w,level,settle:.12});height++;api.score(height);
  if(r.perfect){combo++;const ladder=[0,2,4,7,9,12,14];api.audio?.play('perfect',{pitch:ladder[Math.min(combo-1,ladder.length-1)]});}else{combo=0;api.audio?.play('place');}
  flash=.65;
  motion.to('camera',motion.value('camera'),cameraTarget(height),.2);
  dir=height%2===0?1:-1;moving={x:dir===1?4:370-r.w,w:r.w};speed=Math.min(235,105+height*7);
  if(blocks.length>80)blocks.shift();draw();
 }
 reset(true);
 return {
  start(){if(!alive)return;reset();api.score(0);},
  tick(dt){
   if(!alive)return;
   if(running||preview){moving.x+=dir*(preview?40:speed)*dt;if(moving.x<4){moving.x=4;dir=1;}if(moving.x+moving.w>370){moving.x=370-moving.w;dir=-1;}}
   animate(dt);draw();
  },
  present(dt,progress){if(!alive)return;animate(dt);if(miss)miss.age=reduced()?0:progress*.5;draw();},
  cancelPresentation(){pieces=[];miss=null;motion.clear();flash=0;},
  action:drop,tap:drop,
  destroy(){alive=false;running=false;pieces=[];miss=null;motion.clear();s.destroy();}
 };
}
