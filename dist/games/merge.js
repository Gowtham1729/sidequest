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
  const {ctx}=surface(mount);let board,score=0,running=false,startPoint,flash=0;
  const colors={2:'#dce5d5',4:'#c5d8a9',8:'#c9f86a',16:'#f1d782',32:'#f5ae75',64:'#ee8873',128:'#ee95b5',256:'#c7a3ee',512:'#a9c1f4',1024:'#7bdccf',2048:'#e5ff85'};
  function spawn(){const cells=[];board.forEach((row,r)=>row.forEach((v,c)=>{if(!v)cells.push([r,c])}));if(cells.length){const [r,c]=cells[Math.floor(Math.random()*cells.length)];board[r][c]=Math.random()<.9?2:4}}
  function reset(preview=false){board=preview?[[2,0,0,2],[4,8,0,0],[2,16,32,0],[4,8,64,128]]:Array.from({length:4},()=>[0,0,0,0]);score=0;flash=0;running=!preview;if(!preview){spawn();spawn()}draw();}
  function draw(){clear(ctx);rect(ctx,19,19,362,362,'#26372e',16);for(let r=0;r<4;r++)for(let c=0;c<4;c++){const v=board[r][c],x=29+c*88,y=29+r*88;rect(ctx,x,y,78,78,colors[v]||(v?'#f0ffb0':'#33463a'),10);if(v)text(ctx,v,x+39,y+40,v>=1024?25:34,'#293c27',700)}
    if(flash>0) {ctx.strokeStyle='#c9f86a80';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(19,19,362,362,16);ctx.stroke();}
  }
  function move(d){if(!running)return;const result=moveBoard(board,d);if(!result.changed)return;board=result.board;score+=result.gained;api.score(score);flash=.15;spawn();draw();
    if(board.some(row=>row.includes(2048))){running=false;api.finish('2048. You made it.',`${score.toLocaleString()} points. A very satisfying merge.`)}
    else if(!hasMoves(board)){running=false;api.finish('Out of room.',`${score.toLocaleString()} points. A fresh board awaits.`)}
  }
  reset(true);return {start(){reset();api.score(0)},direction:move,pointerDown(p){startPoint=p},pointerUp(p){const d=swipeDirection(startPoint,p);if(d)move(d);startPoint=null},tick(dt){flash=Math.max(0,flash-dt);draw()},destroy(){running=false}};
}
