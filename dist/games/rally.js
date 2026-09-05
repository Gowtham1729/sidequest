import {surface,clear,rect,text} from './shared.js';
export function createRally(mount,api){
  const {ctx}=surface(mount);let x,y,vx,vy,paddle,target,points=0,running=false,trail=[],pressed=new Set(),launch=0;
  function reset(preview=false){x=preview?263:200;y=preview?156:190;vx=125*(Math.random()<.5?-1:1);vy=145;paddle=200;target=200;points=0;running=!preview;trail=[];pressed.clear();launch=preview?0:.65;draw();}
  function draw(){clear(ctx);ctx.strokeStyle='#7585ac35';ctx.lineWidth=1;ctx.setLineDash([5,8]);ctx.beginPath();ctx.moveTo(27,200);ctx.lineTo(373,200);ctx.stroke();ctx.setLineDash([]);rect(ctx,22,23,4,346,'#677dac55',2);rect(ctx,374,23,4,346,'#677dac55',2);rect(ctx,22,23,356,4,'#677dac55',2);
    trail.forEach((p,i)=>{ctx.globalAlpha=i/trail.length*.22;rect(ctx,p.x-7,p.y-7,14,14,'#b9c7ff',7)});ctx.globalAlpha=1;
    rect(ctx,x-8,y-8,16,16,'#dae1ff',8);rect(ctx,paddle-44,341,88,11,'#b9c7ff',5);rect(ctx,paddle-34,355,68,3,'#b9c7ff1c',2);
    if(launch>0)text(ctx,'GET READY',200,105,16,'#bdc9f8',700);
  }
  function tick(dt){if(running){if(pressed.has('left'))target-=330*dt;if(pressed.has('right'))target+=330*dt;target=Math.max(71,Math.min(329,target));paddle+=(target-paddle)*Math.min(1,dt*25);
    if(launch>0){launch-=dt;draw();return;}
    const oldY=y;x+=vx*dt;y+=vy*dt;
    if(x<35){x=35;vx=Math.abs(vx)}if(x>365){x=365;vx=-Math.abs(vx)}if(y<36){y=36;vy=Math.abs(vy)}
    if(vy>0&&oldY+8<=341&&y+8>=341&&x>=paddle-51&&x<=paddle+51){y=332;points++;api.score(points);const speed=Math.min(440,225+points*14),angle=(x-paddle)/52*1.05;vx=Math.sin(angle)*speed;vy=-Math.cos(angle)*speed;}
    if(y>395){running=false;api.finish('Good rally.',`${points} returns. Keep the next one going.`)}
    trail.push({x,y});if(trail.length>9)trail.shift();
  }draw();}
  reset(true);return {start(){reset();api.score(0)},tick,pointerDown(p){target=p.x},pointerMove(p){target=p.x},direction(d){target+=d==='left'?-45:d==='right'?45:0},keyDown(d){pressed.add(d)},keyUp(d){pressed.delete(d)},pause(){pressed.clear()},destroy(){running=false}};
}
