import {surface,clear,rect,circle,text,line,badge,clamp,TAU} from './art.js';
const COLORS=['#e9989f','#9ddbbf','#9ab8ed','#c6a0e5','#edcf88'];
export const COLS=6,ROWS=7;
export function clusterAt(grid,c,r){
  if(c<0||c>=COLS||r<0||r>=ROWS)return [];
  const id=grid[c][r].id,seen=new Set(),todo=[[c,r]],result=[];
  while(todo.length){const [x,y]=todo.pop(),k=x+','+y;if(x<0||y<0||x>=COLS||y>=ROWS||seen.has(k)||grid[x][y].id!==id)continue;seen.add(k);result.push({c:x,r:y});todo.push([x-1,y],[x+1,y],[x,y-1],[x,y+1]);}return result;
}
export function createPop(mount,api){
 const s=surface(mount,'jewel'),{ctx,view}=s;let running=false,score=0,time=60,grid=[],selected=[],particles=[],labels=[],combo=0,sincePop=9,settling=0,cursor={c:0,r:0},keyboard=false;
 function layout(){const f=view.field,cell=Math.min((f.w-28)/COLS,(f.h-88)/ROWS,57);return {cell,x:f.x+(f.w-cell*COLS)/2,y:f.y+55+(f.h-88-cell*ROWS)/2};}
 function fresh(){return {id:Math.floor(Math.random()*5),offset:0};}
 function ensureMoves(){for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++)if(clusterAt(grid,c,r).length>1)return;grid[1][0].id=grid[0][0].id;labels.push({text:'A little reshuffle',x:view.field.x+view.field.w/2,y:view.field.y+45,life:1});}
 function reset(){score=0;time=60;combo=0;sincePop=9;settling=0;selected=[];particles=[];labels=[];keyboard=false;cursor={c:0,r:0};grid=Array.from({length:COLS},()=>Array.from({length:ROWS},fresh));ensureMoves();}
 function pick(p){const l=layout();const c=Math.floor((p.x-l.x)/l.cell),r=Math.floor((p.y-l.y)/l.cell);return clusterAt(grid,c,r);}
 function pop(group){if(!running||settling>0||group.length<2)return;const l=layout();combo=sincePop<2.5?Math.min(combo+1,5):1;sincePop=0;const pts=group.length*group.length*10*combo;score+=pts;api.score(score);api.audio?.play(group.length>=5?'combo':'pop',{pitch:combo});
  const keys=new Set(group.map(p=>p.c+','+p.r));let x=0,y=0;
  for(const p of group){const gx=l.x+(p.c+.5)*l.cell,gy=l.y+(p.r+.5)*l.cell;x+=gx;y+=gy;for(let i=0;i<6;i++){const a=i*TAU/6;particles.push({x:gx,y:gy,vx:Math.cos(a)*90,vy:Math.sin(a)*90,life:.4,color:COLORS[grid[p.c][p.r].id]});}}
  labels.push({text:(combo>1?'×'+combo+'  ':'')+'+'+pts,x:x/group.length,y:y/group.length,life:.8});
  for(let c=0;c<COLS;c++){const kept=[];for(let r=0;r<ROWS;r++)if(!keys.has(c+','+r))kept.push({...grid[c][r],old:r});const missing=ROWS-kept.length;grid[c]=[...Array.from({length:missing},(_,i)=>({...fresh(),old:i-missing})),...kept].map((g,r)=>({id:g.id,offset:(g.old-r)*l.cell}));}
  selected=[];settling=.3;ensureMoves();
 }
 function gem(x,y,r,id,lit=false){const color=COLORS[id],sides=[4,8,4,6,3][id],rotation=[0,Math.PI/8,Math.PI/4,0,0][id];ctx.save();ctx.translate(x,y);if(lit){circle(ctx,0,0,r+5,color+'22');}
  const vertices=Array.from({length:sides},(_,i)=>({x:Math.sin(i*TAU/sides+rotation)*r,y:-Math.cos(i*TAU/sides+rotation)*r}));
  ctx.beginPath();vertices.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();
  for(let i=0;i<sides;i++){const a=vertices[i],b=vertices[(i+1)%sides];ctx.beginPath();ctx.moveTo(0,-r*.15);ctx.lineTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.closePath();ctx.fillStyle=i<sides/2?'#ffffff35':'#18132922';ctx.fill();}line(ctx,-r*.28,-r*.35,r*.22,-r*.5,'#ffffff99',2);ctx.restore();
 }
 function draw(){clear(ctx);const f=view.field,l=layout();badge(ctx,Math.ceil(time)+' SEC',f.x+15,f.y+25,time<10?'#f8a3aa':'#ddc6e8','left');badge(ctx,combo>1&&sincePop<2.5?'CHAIN ×'+combo:'60 SECOND RUSH',f.x+f.w-15,f.y+25,'#edcf88','right');
  rect(ctx,l.x-5,l.y-5,l.cell*COLS+10,l.cell*ROWS+10,'#0c101c66',14);
  for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){const g=grid[c][r],x=l.x+(c+.5)*l.cell,y=l.y+(r+.5)*l.cell;rect(ctx,x-l.cell/2+2,y-l.cell/2+2,l.cell-4,l.cell-4,'#ffffff05',8);gem(x,y+g.offset,l.cell*.34,g.id,selected.some(p=>p.c===c&&p.r===r));if(keyboard&&c===cursor.c&&r===cursor.r){ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.strokeRect(x-l.cell/2+2,y-l.cell/2+2,l.cell-4,l.cell-4);}}
  for(const p of particles){ctx.globalAlpha=clamp(p.life/.4,0,1);circle(ctx,p.x,p.y,3,p.color);}ctx.globalAlpha=1;
  for(const p of labels){ctx.globalAlpha=clamp(p.life/.4,0,1);badge(ctx,p.text,p.x,p.y,'#fff1cf');}ctx.globalAlpha=1;
  if(selected.length>1)badge(ctx,selected.length+' GEMS · RELEASE TO POP',f.x+f.w/2,f.y+f.h-17,'#dfcbe8');
 }
 function tick(dt){if(running&&dt>0){time=Math.max(0,time-dt);sincePop+=dt;settling=Math.max(0,settling-dt);for(const col of grid)for(const g of col)g.offset*=Math.exp(-18*dt);particles=particles.filter(p=>(p.life-=dt)>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;});labels=labels.filter(p=>(p.life-=dt)>0);labels.forEach(p=>p.y-=25*dt);if(time===0){running=false;api.finish('That felt good',`${score.toLocaleString()} points in 60 seconds.`,score,'win');}}draw();}
 reset();return {start(){reset();running=true;api.score(0);},tick,pointerDown(p){keyboard=false;if(settling<=0)selected=pick(p);},pointerMove(p){if(settling<=0)selected=pick(p);},pointerUp(){pop(selected);selected=[];},cancel(){selected=[];},pause(){selected=[];},direction(d){keyboard=true;cursor.c=clamp(cursor.c+(d==='right'?1:d==='left'?-1:0),0,COLS-1);cursor.r=clamp(cursor.r+(d==='down'?1:d==='up'?-1:0),0,ROWS-1);selected=clusterAt(grid,cursor.c,cursor.r);},action(){pop(clusterAt(grid,cursor.c,cursor.r));},destroy(){running=false;s.destroy();}};
}
