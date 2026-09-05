import {surface, clear, grid, text} from './shared.js';
export function overlapBlock(previous, moving, tolerance=6) {
  if(Math.abs(previous.x-moving.x)<=tolerance)return {x:previous.x,w:previous.w,perfect:true};
  const x=Math.max(previous.x,moving.x),w=Math.min(previous.x+previous.w,moving.x+moving.w)-x;
  return {x,w:Math.max(0,w),perfect:false};
}
export function createStack(mount, api) {
  const {ctx}=surface(mount);
  let blocks=[],moving,dir=1,speed=100,height=0,running=false,flash=0,perfect=false;
  function reset(preview=false){
    height=0;speed=105;dir=1;flash=0;running=!preview;
    blocks=preview ? Array.from({length:7},(_,i)=>({x:102+i*5,w:195-i*6})) : [{x:100,w:200}];
    moving={x:preview?72:15,w:blocks.at(-1).w};draw();
  }
  function block(x,y,w,hue){
    ctx.fillStyle=`hsl(${hue} 61% 48%)`;ctx.fillRect(x,y,w,18);
    ctx.fillStyle=`hsl(${hue} 65% 29%)`;ctx.beginPath();ctx.moveTo(x+w,y);ctx.lineTo(x+w+26,y-17);ctx.lineTo(x+w+26,y+1);ctx.lineTo(x+w,y+18);ctx.fill();
    ctx.fillStyle=`hsl(${hue} 82% 70%)`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+26,y-17);ctx.lineTo(x+w+26,y-17);ctx.lineTo(x+w,y);ctx.fill();
  }
  function draw(){
    clear(ctx);grid(ctx);
    const shown=blocks.slice(-10),base=325;
    ctx.strokeStyle='#a9da7e18';ctx.beginPath();ctx.ellipse(214,350,135,22,0,0,Math.PI*2);ctx.stroke();
    shown.forEach((b,i)=>block(b.x,base-i*24,b.w,102-i*3));
    block(moving.x,base-shown.length*24-12,moving.w,80);
    if(flash>0)text(ctx,perfect?'PERFECT!':'NICE DROP',200,30,16,'#d1ff8a',700);
  }
  function drop(){if(!running)return;
    const result=overlapBlock(blocks.at(-1),moving);
    if(result.w<=0){running=false;api.finish('One block too far.',`${height} blocks high. Give your tower another shot.`);return;}
    blocks.push({x:result.x,w:result.w});height++;api.score(height);perfect=result.perfect;flash=.7;
    dir=height%2===0?1:-1;moving={x:dir===1?8:366-result.w,w:result.w};speed=Math.min(240,105+height*7);
    if(blocks.length>12)blocks.shift();draw();
  }
  reset(true);
  return {start(){reset();api.score(0)},tick(dt){if(running){moving.x+=dir*speed*dt;if(moving.x<8){moving.x=8;dir=1}if(moving.x+moving.w>366){moving.x=366-moving.w;dir=-1}flash=Math.max(0,flash-dt)}draw()},action:drop,pointerDown:drop,destroy(){running=false}};
}
