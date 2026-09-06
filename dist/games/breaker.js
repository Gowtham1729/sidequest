import {surface,clear,rect,text} from './shared.js';

export function createBreaker(mount,api){
  const s=surface(mount),{ctx,view}=s;
  let x,y,vx,vy,paddle,target,score=0,running=false;
  let bricks=[],particles=[],pressed=new Set(),oldField;
  const ROWS=5,COLS=6;
  const ROW_COLORS=['#ff6b8b','#ffa26b','#f7d070','#6fe3a2','#5ed1ff'];
  const ROW_POINTS=[50,40,30,20,10];

  const paddleWidth=()=>Math.max(78,view.field.w*.22);
  const paddleHeight=10;

  function initBricks(){
    const f=view.field;
    bricks=[];
    const gap=4;
    const bw=(f.w-(COLS+1)*gap)/COLS;
    const bh=Math.min(18,f.h*.04);
    const startY=f.y+22;

    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        bricks.push({
          x:f.x+gap+c*(bw+gap),
          y:startY+r*(bh+gap),
          w:bw,
          h:bh,
          color:ROW_COLORS[r],
          points:ROW_POINTS[r],
          alive:true
        });
      }
    }
  }

  function reset(preview=false){
    const f=view.field;
    paddle=f.x+f.w/2;
    target=paddle;
    score=0;
    particles=[];
    pressed.clear();
    initBricks();

    x=paddle;
    y=f.y+f.h-42;
    const angle=(Math.random()*.4-.2);
    const speed=280;
    vx=speed*Math.sin(angle);
    vy=-speed*Math.cos(angle);

    running=!preview;
    oldField={...f};
  }

  function resizeState(){
    const f=view.field;
    if(oldField&&(f.w!==oldField.w||f.h!==oldField.h||f.y!==oldField.y)){
      paddle=f.x+(paddle-oldField.x)/oldField.w*f.w;
      target=paddle;
      x=f.x+(x-oldField.x)/oldField.w*f.w;
      y=f.y+(y-oldField.y)/oldField.h*f.h;
      initBricks();
      oldField={...f};
    }
  }

  function spawnParticles(bx,by,color){
    for(let i=0;i<8;i++){
      const angle=Math.random()*Math.PI*2;
      const spd=Math.random()*160+60;
      particles.push({
        x:bx,y:by,
        vx:Math.cos(angle)*spd,
        vy:Math.sin(angle)*spd,
        color,
        life:0.4,
        maxLife:0.4
      });
    }
  }

  function draw(){
    resizeState();
    const f=view.field,pw=paddleWidth();
    clear(ctx);

    // Arena side & top walls
    rect(ctx,f.x,f.y,2,f.h,'#f7d07033',1);
    rect(ctx,f.x+f.w-2,f.y,2,f.h,'#f7d07033',1);
    rect(ctx,f.x,f.y,f.w,2,'#f7d07033',1);

    // Bricks
    for(const b of bricks){
      if(b.alive){
        rect(ctx,b.x,b.y,b.w,b.h,b.color,3);
        // Highlight shine
        rect(ctx,b.x+2,b.y+1,b.w-4,2,'#ffffff44',1);
      }
    }

    // Particles
    for(const p of particles){
      ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
      rect(ctx,p.x-2,p.y-2,4,4,p.color,2);
    }
    ctx.globalAlpha=1;

    // Paddle
    const py=f.y+f.h-26;
    rect(ctx,paddle-pw/2,py,pw,paddleHeight,'#f7d070',5);
    rect(ctx,paddle-pw*.35,py-3,pw*.7,2,'#f7d07033',1);

    // Ball
    rect(ctx,x-6,y-6,12,12,'#ffffff',6);
  }

  function tick(dt){
    resizeState();
    const f=view.field,pw=paddleWidth(),py=f.y+f.h-26;

    if(running&&dt>0){
      // Keyboard input
      if(pressed.has('left'))target-=520*dt;
      if(pressed.has('right'))target+=520*dt;
      target=Math.max(f.x+pw/2+4,Math.min(f.x+f.w-pw/2-4,target));
      paddle+=(target-paddle)*Math.min(1,dt*28);

      // Update particles
      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];
        p.x+=p.vx*dt;
        p.y+=p.vy*dt;
        p.life-=dt;
        if(p.life<=0)particles.splice(i,1);
      }

      const prevX=x,prevY=y;
      x+=vx*dt;
      y+=vy*dt;

      // Wall collisions
      if(x<f.x+8){x=f.x+8;vx=Math.abs(vx);api.audio?.play('wall');}
      if(x>f.x+f.w-8){x=f.x+f.w-8;vx=-Math.abs(vx);api.audio?.play('wall');}
      if(y<f.y+8){y=f.y+8;vy=Math.abs(vy);api.audio?.play('wall');}

      // Paddle collision
      if(vy>0&&prevY+6<=py&&y+6>=py&&Math.abs(x-paddle)<=pw/2+6){
        y=py-7;
        api.audio?.play('hit');
        const hitOffset=(x-paddle)/(pw/2+6);
        const speed=Math.min(520,300+score*.15);
        vx=Math.sin(hitOffset*1.15)*speed;
        vy=-Math.cos(hitOffset*1.15)*speed;
      }

      // Brick collisions
      let hit=false;
      let remaining=0;
      for(const b of bricks){
        if(!b.alive)continue;
        remaining++;
        if(!hit&&x+6>=b.x&&x-6<=b.x+b.w&&y+6>=b.y&&y-6<=b.y+b.h){
          b.alive=false;
          hit=true;
          remaining--;
          score+=b.points;
          api.score(score);
          api.audio?.play('break',{pitch:Math.min(8,Math.floor(score/60))});
          spawnParticles(b.x+b.w/2,b.y+b.h/2,b.color);

          // Determine bounce direction
          const overlapLeft=(x+6)-b.x;
          const overlapRight=(b.x+b.w)-(x-6);
          const overlapTop=(y+6)-b.y;
          const overlapBottom=(b.y+b.h)-(y-6);
          const minOverlapX=Math.min(overlapLeft,overlapRight);
          const minOverlapY=Math.min(overlapTop,overlapBottom);

          if(minOverlapX<minOverlapY){
            vx=-vx;
          }else{
            vy=-vy;
          }
        }
      }

      // Win condition: All bricks cleared
      if(remaining===0){
        running=false;
        api.finish('Board Cleared!','You smashed all the bricks!',score,'win');
      }

      // Ball falls below paddle
      if(y>f.y+f.h+12){
        running=false;
        api.finish('Ball dropped',`${score} points scored. Play again to beat it.`,score,'miss');
      }
    }
    draw();
  }

  reset(true);

  return {
    start(){reset(false);api.score(0);},
    tick,
    pointerDown(p){target=p.x;},
    pointerMove(p){target=p.x;},
    direction(d){target+=d==='left'?-50:d==='right'?50:0;},
    keyDown(d){pressed.add(d);},
    keyUp(d){pressed.delete(d);},
    pause(){pressed.clear();},
    destroy(){running=false;s.destroy();}
  };
}
