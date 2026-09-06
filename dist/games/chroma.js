import {surface,clear,circle,text,ring,orb,badge,specks,TAU} from './art.js';
const COLORS=['#f58cac','#7edbe4','#efd17f','#b5a0ef'];
const MARKS=['I','II','III','IV'];
export function createChroma(mount,api){
  const s=surface(mount,'jewel'),{ctx,view}=s;
  let running=false,score=0,py=0,vy=0,camera=0,floor=0,color=0,hoops=[],clock=0,trail=[];
  const radius=67,ballR=9,thick=12;
  function makeHoop(y,index){return {y,angle:index*.9,speed:(index%2?-1:1)*Math.min(1.25,.7+index*.04),passed:false};}
  function reset(){const f=view.field;score=0;color=0;clock=0;vy=0;py=f.h*.75;floor=py+ballR;camera=0;trail=[];hoops=[makeHoop(py-150,0),makeHoop(py-400,1)];}
  function hop(){if(!running)return;vy=-255;api.audio?.play('bounce');}
  function lose(){if(!running)return;running=false;api.finish('Almost in sync',`${score} rings cleared. Wait for your matching segment.`,score,'crash');}
  function step(dt){
    clock+=dt;const oldY=py;vy=Math.min(380,vy+680*dt);py+=vy*dt;
    if(py+ballR>floor){py=floor-ballR;vy=0;}
    for(const h of hoops){
      h.angle+=h.speed*dt;if(h.passed)continue;
      for(const side of [-1,1]){
        const boundary=h.y+side*radius;
        if(Math.min(oldY,py)-ballR-thick/2<=boundary&&Math.max(oldY,py)+ballR+thick/2>=boundary){
          const a=((side===1?Math.PI/2:Math.PI*1.5)-h.angle+TAU*100)%TAU;
          // Match the ball's full visible width at quadrant seams.
          const spread=Math.asin(ballR/radius)*.7;
          if([a-spread,a,a+spread].some(v=>Math.floor(((v+TAU)%TAU)/(Math.PI/2))!==color)){lose();return;}
        }
      }
      if(py+ballR<h.y-radius-thick/2){
        h.passed=true;score++;api.score(score);api.audio?.play('star');
        floor=h.y-radius-22; color=score%4;api.audio?.play('switch');
        const last=hoops[hoops.length-1];hoops.push(makeHoop(last.y-250,score+1));
      }
    }
    camera=Math.min(camera,py-view.field.h*.63);
    hoops=hoops.filter(h=>h.y-camera<view.field.h+130);
    trail.push({y:py,color:COLORS[color]});if(trail.length>12)trail.shift();
  }
  function draw(){clear(ctx);const f=view.field,cx=f.x+f.w/2; specks(ctx,f,'#d8bfe9',-camera*.1);
    for(const h of hoops){const sy=f.y+h.y-camera;if(sy<f.y-90||sy>f.y+f.h+90)continue;
      ring(ctx,cx,sy,radius+14,'#e3cefa0f');
      for(let i=0;i<4;i++){const a=h.angle+i*Math.PI/2;ring(ctx,cx,sy,radius,COLORS[i],thick,a,a+Math.PI/2);const mid=a+Math.PI/4;text(ctx,MARKS[i],cx+Math.cos(mid)*(radius+23),sy+Math.sin(mid)*(radius+23),10,COLORS[i],600);}
      if(!h.passed){ring(ctx,cx,sy,12,'#f9e6b133');text(ctx,'✦',cx,sy,22,'#f4d895');}
    }
    const fy=f.y+floor-camera;if(fy<f.y+f.h){ring(ctx,cx,fy+3,15,COLORS[color]+'55',2,0,Math.PI);}
    trail.forEach((p,i)=>{ctx.globalAlpha=i/trail.length*.18;circle(ctx,cx,f.y+p.y-camera,ballR*.7,p.color);});ctx.globalAlpha=1;
    orb(ctx,cx,f.y+py-camera,ballR,COLORS[color]);
    badge(ctx,'MATCH '+MARKS[color],cx,f.y+25,COLORS[color]);
    if(vy===0)badge(ctx,score?'TAKE YOUR TIME':'TAP TO LIFT',cx,f.y+py-camera+36,'#d7c8e5');
  }
  reset();return {start(){reset();running=true;api.score(0);},tick(dt){let left=running?dt:0;while(left>0&&running){const d=Math.min(left,1/120);step(d);left-=d;}draw();},action:hop,pointerDown:hop,direction(d){if(d==='up')hop();},destroy(){running=false;s.destroy();}};
}
