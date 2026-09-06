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
export function createMerge(mount,api){
  const s=surface(mount),{ctx,view}=s;let board,score=0,running=false,startPoint,flash=0;
  const colors={2:'#dce5d5',4:'#c5d8a9',8:'#c9f86a',16:'#f1d782',32:'#f5ae75',64:'#ee8873',128:'#ee95b5',256:'#c7a3ee',512:'#a9c1f4',1024:'#7bdccf',2048:'#e5ff85'};
  function spawn(){const cells=[];board.forEach((row,r)=>row.forEach((v,c)=>{if(!v)cells.push([r,c])}));if(cells.length){const [r,c]=cells[Math.floor(Math.random()*cells.length)];board[r][c]=Math.random()<.9?2:4}}
  function reset(preview=false){board=preview?[[2,0,0,2],[4,8,0,0],[2,16,32,0],[4,8,64,128]]:Array.from({length:4},()=>[0,0,0,0]);score=0;flash=0;running=!preview;if(!preview){spawn();spawn()}draw();}
  function draw(){clear(ctx);const f=view.field,gap=9/view.scale,cw=(f.w-gap*3)/4,ch=(f.h-gap*3)/4;
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){const v=board[r][c],x=f.x+c*(cw+gap),y=f.y+r*(ch+gap);rect(ctx,x,y,cw,ch,colors[v]||(v?'#f0ffb0':'#293a30'),12);if(v)text(ctx,v,x+cw/2,y+ch/2,Math.min(cw*.43,ch*.4,v>=1024?33:48),'#293c27',700)}
    if(flash>0){ctx.strokeStyle='#c9f86a70';ctx.lineWidth=2;ctx.strokeRect(f.x-3,f.y-3,f.w+6,f.h+6);}
  }
  function move(d){if(!running)return;const result=moveBoard(board,d);if(!result.changed){api.audio?.play('blocked');return;}api.audio?.play(result.gained?'merge':'slide',{pitch:result.gained?Math.min(7,Math.max(0,Math.round(Math.log2(result.gained)-2))):0});board=result.board;score+=result.gained;api.score(score);flash=.15;spawn();draw();
    if(board.some(row=>row.includes(2048))){running=false;api.finish('2048. You made it.',`${score.toLocaleString()} points. A very satisfying merge.`,undefined,'win')}
    else if(!hasMoves(board)){running=false;api.finish('Out of room.',`${score.toLocaleString()} points. A fresh board awaits.`)}
  }
  reset(true);return {start(){reset();api.score(0)},direction:move,pointerDown(p){startPoint=p},pointerUp(p){const d=swipeDirection(startPoint,p);if(d)move(d);startPoint=null},cancel(){startPoint=null},tick(dt){flash=Math.max(0,flash-dt);draw()},destroy(){running=false;s.destroy()}};
}
