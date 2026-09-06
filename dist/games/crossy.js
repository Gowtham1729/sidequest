import {surface,clear,rect,circle,text,slab,orb,line,badge,clamp} from './art.js';
const STEP=46;
export function createCrossy(mount,api){
 const s=surface(mount,'wood'),{ctx,view}=s;let oldField={...view.field};let running=false,score=0,row=0,px=0,hop=null,camera=0,rows=[],clock=0,down=null,facing='up';
 const base=()=>view.field.h*.77;
 function spawn(index){const f=view.field,previous=rows[rows.length-1];const type=index<2||index%4===0?'grass':Math.random()<.3&&previous?.type!=='river'?'river':'road';const speed=(index%2?-1:1)*(35+Math.min(50,index*1.1)),items=[];const cycle=f.w+140;const count=type==='river'?3:2;for(let i=0;i<count;i++)items.push({x:f.x+i*cycle/count-60,w:type==='river'?94:52+(index%3)*9,color:['#e9b773','#a3c9c3','#d4919c'][i%3]});return {index,type,speed,cycle,items};}
 function reset(){running=false;score=0;row=0;px=view.field.x+view.field.w/2;hop=null;camera=0;clock=0;down=null;rows=[];for(let i=-2;i<18;i++)rows.push(spawn(i));}
 function move(dir){if(!running||hop)return;const f=view.field;const targetRow=Math.max(0,row+(dir==='up'?1:dir==='down'?-1:0));const targetX=clamp(px+(dir==='left'?-STEP:dir==='right'?STEP:0),f.x+16,f.x+f.w-16);if(targetRow===row&&targetX===px)return;facing=dir;hop={fromX:px,toX:targetX,fromRow:row,toRow:targetRow,t:0};api.audio?.play('hop');}
 function lose(message){if(!running)return;running=false;api.finish(message,`${score} lanes crossed. Find your next opening.`,score,'crash');}
 function step(dt){clock+=dt;for(const r of rows)for(const item of r.items){item.x+=r.speed*dt;const f=view.field;if(item.x>f.x+f.w+100)item.x-=r.cycle;if(item.x+item.w<f.x-100)item.x+=r.cycle;}
  if(hop){hop.t=Math.min(1,hop.t+dt*7);px=hop.fromX+(hop.toX-hop.fromX)*hop.t;if(hop.t===1){row=hop.toRow;hop=null;if(row>score){score=row;api.score(score);api.audio?.play('lane',{pitch:Math.min(8,score/4)});}}}
  const actualRow=hop?hop.fromRow+(hop.toRow-hop.fromRow)*hop.t:row;
  for(const r of rows){if(r.type==='road'&&Math.abs(actualRow-r.index)<.43)for(const car of r.items)if(px+8>car.x&&px-8<car.x+car.w){lose('Traffic got you');return;}}
  const current=rows.find(r=>r.index===row);
  if(!hop&&current?.type==='river'){const log=current.items.find(o=>px>o.x+4&&px<o.x+o.w-4);if(!log){lose('A little splash');return;}px+=current.speed*dt;if(px<view.field.x+10||px>view.field.x+view.field.w-10){lose('Swept downstream');return;}}
  camera+=(Math.max(camera,actualRow*STEP-view.field.h*.15)-camera)*(1-Math.exp(-8*dt));
  while(rows[rows.length-1].index<row+16)rows.push(spawn(rows[rows.length-1].index+1));rows=rows.filter(r=>r.index>row-9);
 }
 function draw(){clear(ctx);const f=view.field;
  for(const r of rows){const y=f.y+base()-r.index*STEP+camera;if(y<f.y-STEP||y>f.y+f.h+STEP)continue;
   const color=r.type==='grass'?(r.index%2?'#496d54':'#527a5c'):r.type==='river'?'#306b79':'#303943';rect(ctx,f.x,y-STEP/2,f.w,STEP,color);line(ctx,f.x,y+STEP/2,f.x+f.w,y+STEP/2,'#0c1c2033',2);
   if(r.type==='grass'){for(let i=0;i<9;i++){const x=f.x+((i*57+r.index*13+1000)%f.w);line(ctx,x,y+10,x+2,y+5,'#a6cc8560',2);}}
   if(r.type==='road'){for(let x=f.x+7;x<f.x+f.w;x+=32)rect(ctx,x,y-STEP/2+3,17,2,'#d4d0b02a',1);for(const car of r.items){rect(ctx,car.x+5,y-14,9,28,'#14222a',3);rect(ctx,car.x+car.w-14,y-14,9,28,'#14222a',3);slab(ctx,car.x,y-12,car.w,24,car.color,5);rect(ctx,car.x+12,y-9,car.w-24,18,'#233b4a',3);rect(ctx,car.x+18,y-8,car.w-35,16,car.color,2);const front=r.speed>0?car.x+car.w-3:car.x+1;rect(ctx,front,y-8,3,4,'#fff2c4',1);rect(ctx,front,y+4,3,4,'#fff2c4',1);}}
   if(r.type==='river'){for(let i=0;i<9;i++){const x=f.x+((i*63+clock*r.speed*.2+10000)%f.w);line(ctx,x,y+13,x+19,y+13,'#afd6dc40');}for(const log of r.items){slab(ctx,log.x,y-14,log.w,28,'#ad8760',12);line(ctx,log.x+14,y-5,log.x+log.w-14,y-5,'#e7c59860',2);line(ctx,log.x+15,y+5,log.x+log.w-18,y+5,'#583e3655',2);}}
  }
  const rr=hop?hop.fromRow+(hop.toRow-hop.fromRow)*hop.t:row,y=f.y+base()-rr*STEP+camera,jump=hop?Math.sin(hop.t*Math.PI)*13:0;circle(ctx,px,y+6,11,'#13271e55');
  ctx.save();ctx.translate(px,y-jump);orb(ctx,0,0,12,'#f5edd5');circle(ctx,0,-11,4,'#df8e88');const direction=facing==='left'?-1:1;if(facing==='left'||facing==='right'){circle(ctx,direction*5,-3,2,'#223333');rect(ctx,direction*10-2,0,5,4,'#eabd69',1);}else{circle(ctx,-4,-3,1.7,'#223333');circle(ctx,4,-3,1.7,'#223333');rect(ctx,-2,0,4,5,'#eabd69',1);}ctx.restore();
  if(score<2)badge(ctx,'TAP FORWARD · SWIPE TO STEER',f.x+f.w/2,f.y+25,'#e1eaca');
 }
 reset();return {start(){reset();running=true;api.score(0);},tick(dt){const f=view.field;if(f.x!==oldField.x||f.w!==oldField.w){const dx=f.x-oldField.x;px=clamp(px+dx,f.x+16,f.x+f.w-16);for(const r of rows){r.cycle=f.w+140;for(const item of r.items)item.x+=dx;}hop=null;oldField={...f};}let left=running?dt:0;while(left>0&&running){const d=Math.min(left,1/120);step(d);left-=d;}draw();},action(){move('up');},direction:move,pointerDown(p){down=p;},pointerUp(p){if(!down)return;const dx=p.x-down.x,dy=p.y-down.y;down=null;move(Math.max(Math.abs(dx),Math.abs(dy))<16?'up':Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');},cancel(){down=null;},pause(){down=null;},destroy(){running=false;s.destroy();}};
}
