import {surface, clear, rect, text, swipeDirection} from './shared.js';
export function mergeLine(line){
  const values=line.filter(Boolean),out=[];let gained=0;
  for(let i=0;i<values.length;i++){if(values[i]===values[i+1]){const value=values[i]*2;out.push(value);gained+=value;i++;}else out.push(values[i]);}
  while(out.length<line.length)out.push(0);return {line:out,gained};
}
export function moveBoard(board,direction){
  const out=board.map(row=>[...row]);let gained=0;
  for(let i=0;i<4;i++){
    const coords=Array.from({length:4},(_,j)=>direction==='left'?[i,j]:direction==='right'?[i,3-j]:direction==='up'?[j,i]:[3-j,i]);
    const result=mergeLine(coords.map(([r,c])=>board[r][c]));gained+=result.gained;
    coords.forEach(([r,c],j)=>out[r][c]=result.line[j]);
  }
  return {board:out,gained,changed:out.some((row,r)=>row.some((v,c)=>v!==board[r][c]))};
}
export function hasMoves(board){return board.some((row,r)=>row.some((v,c)=>!v||(r<3&&v===board[r+1][c])||(c<3&&v===row[c+1])));}
// Cell coordinates keep travel valid when the viewport changes mid-move.
export function tilePaths(board,direction){
  const paths=[],merged=[];
  for(let i=0;i<4;i++){
    const coords=Array.from({length:4},(_,j)=>direction==='left'?[i,j]:direction==='right'?[i,3-j]:direction==='up'?[j,i]:[3-j,i]);
    const tiles=coords.filter(([r,c])=>board[r][c]).map(from=>({from,value:board[from[0]][from[1]]}));
    let target=0;
    for(let j=0;j<tiles.length;j++,target++){
      const to=coords[target],a=tiles[j],b=tiles[j+1];
      paths.push({...a,to});
      if(b&&a.value===b.value){paths.push({...b,to});merged.push(to);j++;}
    }
  }
  return {paths,merged};
}
export function boardGeometry(field,scale){
  const size=Math.min(field.w,field.h),gap=8/scale;
  return {x:field.x+(field.w-size)/2,y:field.y+(field.h-size)/2,size,gap,cell:(size-gap*3)/4};
}
export function createMerge(mount,api){
  const s=surface(mount,{layout:'board'}),{ctx,view}=s;
  let board,score=0,running=false,startPoint,transition=null,pending=null,blocked=0,destroyed=false;
  const travel=.12,settle=.10,reveal=.06,duration=travel+settle+reveal;
  const colors={2:'#dce5d5',4:'#c5d8a9',8:'#c9f86a',16:'#f1d782',32:'#f5ae75',64:'#ee8873',128:'#ee95b5',256:'#c7a3ee',512:'#a9c1f4',1024:'#7bdccf',2048:'#e5ff85'};
  function spawn(){const cells=[];board.forEach((row,r)=>row.forEach((v,c)=>{if(!v)cells.push([r,c])}));if(cells.length){const [r,c]=cells[Math.floor(Math.random()*cells.length)];board[r][c]=Math.random()<.9?2:4;return [r,c];}}
  function reset(preview=false){board=preview?[[2,0,0,2],[4,8,0,0],[2,16,32,0],[4,8,64,128]]:Array.from({length:4},()=>[0,0,0,0]);score=0;transition=null;pending=null;startPoint=null;blocked=0;running=!preview;if(!preview){spawn();spawn()}draw();}
  const same=(a,r,c)=>a&&a[0]===r&&a[1]===c;
  function draw(){
    if(destroyed)return;
    clear(ctx);const g=boardGeometry(view.field,view.scale),radius=8/view.scale;
    function tile(v,r,c,scale=1,alpha=1){
      const size=g.cell*scale,x=g.x+c*(g.cell+g.gap)+(g.cell-size)/2,y=g.y+r*(g.cell+g.gap)+(g.cell-size)/2;
      ctx.globalAlpha=alpha;
      rect(ctx,x,y+2/view.scale,size,size,'#101f1980',radius);
      rect(ctx,x,y,size,size,colors[v]||'#f0ffb0',radius);
      rect(ctx,x+radius,y+1/view.scale,Math.max(0,size-radius*2),1/view.scale,'#ffffff50');
      text(ctx,v,x+size/2,y+size/2,Math.min(size*(v>=1024?.30:.43),40/view.scale),'#293c27',700);
      ctx.globalAlpha=1;
    }
    rect(ctx,g.x-6/view.scale,g.y-6/view.scale,g.size+12/view.scale,g.size+12/view.scale,'#182b22',12/view.scale);
    for(let r=0;r<4;r++)for(let c=0;c<4;c++)rect(ctx,g.x+c*(g.cell+g.gap),g.y+r*(g.cell+g.gap),g.cell,g.cell,blocked>0?'#3c4b35':'#293a30',radius);
    const t=transition,reduced=view.reducedMotion;
    if(t&&!reduced&&t.elapsed<travel){
      const p=1-Math.pow(1-t.elapsed/travel,3);
      for(const a of t.paths)tile(a.value,a.from[0]+(a.to[0]-a.from[0])*p,a.from[1]+(a.to[1]-a.from[1])*p);
    }else{
      for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(board[r][c]){
        let scale=1,alpha=1;
        if(t&&!reduced){
          if(same(t.spawned,r,c)){
            const p=Math.max(0,Math.min(1,(t.elapsed-travel-settle)/reveal));
            if(!p)continue;scale=.85+.15*p;alpha=p;
          }else if(t.merged.some(a=>same(a,r,c))){
            const p=Math.min(1,(t.elapsed-travel)/settle);scale=1+.06*Math.sin(Math.PI*p);
          }
        }
        tile(board[r][c],r,c,scale,alpha);
      }
    }
  }
  function move(d){
    if(!running||destroyed||!['left','right','up','down'].includes(d))return;
    if(transition){pending=d;return;} // One slot, latest intent wins.
    const result=moveBoard(board,d);
    if(!result.changed){blocked=.09;api.audio?.play('blocked');draw();return;}
    transition={...tilePaths(board,d),elapsed:0};blocked=0;
    board=result.board;score+=result.gained;api.score(score);transition.spawned=spawn();
    api.audio?.play(result.gained?'merge':'slide',{pitch:result.gained?Math.min(7,Math.max(0,Math.round(Math.log2(result.gained)-2))):0});
    const win=board.some(row=>row.includes(2048));
    if(win||!hasMoves(board)){
      running=false;pending=null;
      api.finish(win?'2048. You made it.':'Out of room.',`${score.toLocaleString()} points. ${win?'A very satisfying merge.':'A fresh board awaits.'}`,undefined,win?'win':undefined,{duration:duration+.12});
    }
    if(view.reducedMotion)transition=null;
    draw();
  }
  function advance(dt,allowInput){
    if(destroyed)return;
    const step=Math.max(0,Math.min(dt||0,.05));blocked=Math.max(0,blocked-step);
    if(transition){transition.elapsed+=step;if(view.reducedMotion||transition.elapsed>=duration)transition=null;}
    if(allowInput&&step>0&&!transition&&pending){const d=pending;pending=null;move(d);}
    draw();
  }
  reset(true);return {
    start(){if(!destroyed){reset();api.score(0)}},direction:move,
    pointerDown(p){if(running)startPoint=p},pointerUp(p){const d=swipeDirection(startPoint,p);startPoint=null;if(d)move(d)},
    cancel(){startPoint=null;pending=null},cancelPresentation(){transition=null;pending=null;startPoint=null},
    tick(dt){advance(dt,true)},present(dt){advance(dt,false)},
    destroy(){destroyed=true;running=false;transition=null;pending=null;startPoint=null;s.destroy()}
  };
}
