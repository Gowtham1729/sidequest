import {cabinet,rect,text,tile,colors} from './cabinet.js';
import {shuffled} from './shared.js';
export const MINE_SIZE=7;
export function neighbors(i){const x=i%7,y=Math.floor(i/7),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if((dx||dy)&&xx>=0&&xx<7&&yy>=0&&yy<7)out.push(yy*7+xx);}return out;}
export function plantMines(first,random=Math.random){const safe=new Set([first,...neighbors(first)]);return new Set(shuffled(Array.from({length:49},(_,i)=>i).filter(i=>!safe.has(i)),random).slice(0,8));}
export function revealCells(board,mines,index){if(board[index]!==0||mines.has(index))return [];const opened=[],todo=[index];while(todo.length){const i=todo.pop();if(board[i]!==0)continue;board[i]=1;opened.push(i);if(!neighbors(i).some(n=>mines.has(n)))todo.push(...neighbors(i).filter(n=>!mines.has(n)&&board[n]===0));}return opened;}
export function createMines(mount,api){
 const q=cabinet(mount,api,{accent:'#88caff',height:440}),c=q.c;let board=Array(49).fill(0),mines=new Set(),first=true,flag=false,cursor=24,exploded=-1;
 function reset(){board=Array(49).fill(0);mines=new Set();first=true;flag=false;cursor=24;exploded=-1;}
 function choose(i){if(!q.active||i<0||i>=49)return;cursor=i;if(flag){if(board[i]!==1){board[i]=board[i]===2?0:2;q.sound('flag');}return;}if(board[i]!==0)return;
  if(first){mines=plantMines(i);first=false;}if(mines.has(i)){exploded=i;q.sound('miss');q.finish('A little too curious.',`${q.score} of 41 safe squares. The first reveal is always safe.`);return;}
  const cells=revealCells(board,mines,i);q.add(cells.length);q.sound('reveal',Math.min(cells.length,8));if(cells.length>4)q.say(`${cells.length} safe squares opened`);if(q.score===41)q.finish('Field cleared.',`All 41 safe squares in ${Math.ceil(q.elapsed)} seconds.`,true);
 }
 return {start(){reset();q.start();},tap(p){p=q.local(p);if(p.y>=378&&p.y<416){flag=!flag;q.sound('flag');return;}const x=Math.floor((p.x-19)/46),y=Math.floor((p.y-44)/46);if(x>=0&&x<7&&y>=0&&y<7)choose(y*7+x);},direction(d){cursor=Math.max(0,Math.min(48,cursor+({left:-1,right:1,up:-7,down:7}[d]||0)));},action(){choose(cursor);},tick(dt){q.frame(dt,()=>{},()=>{q.header('8 MINES',`${Math.floor(q.elapsed)}s · ${q.score}/41 SAFE`);for(let i=0;i<49;i++){const x=19+i%7*46,y=44+Math.floor(i/7)*46;if(board[i]===1){rect(c,x,y,42,42,'#213348',7);const n=neighbors(i).filter(n=>mines.has(n)).length;if(n)text(c,n,x+21,y+21,23,colors[(n-1)%6],750);}else tile(c,x,y,42,42,i===exploded?'#ff8eac':'#37536f',board[i]===2?'⚑':mines.has(i)&&exploded>=0?'✳':'',i===cursor);}
  rect(c,19,382,322,30,flag?'#88caff':'#24394d',9);text(c,flag?'FLAG MODE · tap here to reveal':'REVEAL MODE · tap here to flag',180,397,14,flag?'#142638':'#d8eaff',650);q.footer('Numbers count neighboring mines.');});},destroy:q.destroy};
}
