import {surface,clear,rect,text} from './shared.js';

export function createPong(mount,api){
  const s=surface(mount),{ctx,view}=s;
  let x,y,vx,vy,playerX,playerTarget,aiX;
  let playerScore=0,aiScore=0,running=false;
  let trail=[],pressed=new Set(),serveTimer=0,rally=0,oldField;
  const WIN_SCORE=5;

  const paddleWidth=()=>Math.max(76,view.field.w*.22);
  const paddleHeight=10;

  function resetMatch(preview=false){
    const f=view.field;
    playerScore=0;aiScore=0;rally=0;
    playerX=f.x+f.w/2;playerTarget=playerX;aiX=playerX;
    running=!preview;trail=[];pressed.clear();
    oldField={...f};
    serve(preview?0.3:1,preview?1:(Math.random()<.5?1:-1),preview);
  }

  function serve(delay=1,direction=1,preview=false){
    const f=view.field;
    x=f.x+f.w*(preview?.6:.5);
    y=f.y+f.h*.5;
    const baseSpeed=210;
    const angle=(Math.random()*.6-.3);
    vx=baseSpeed*Math.sin(angle);
    vy=baseSpeed*Math.cos(angle)*direction;
    serveTimer=delay;
    rally=0;
    trail=[];
  }

  function resizeState(){
    const f=view.field;
    if(oldField&&(f.w!==oldField.w||f.h!==oldField.h||f.y!==oldField.y)){
      x=f.x+(x-oldField.x)/oldField.w*f.w;
      y=f.y+(y-oldField.y)/oldField.h*f.h;
      playerX=f.x+(playerX-oldField.x)/oldField.w*f.w;
      playerTarget=playerX;
      aiX=f.x+(aiX-oldField.x)/oldField.w*f.w;
      oldField={...f};
      trail=[];
    }
  }

  function draw(){
    resizeState();
    const f=view.field,pw=paddleWidth();
    clear(ctx);

    // Court boundary lines
    rect(ctx,f.x,f.y,2,f.h,'#56d6ff33',1);
    rect(ctx,f.x+f.w-2,f.y,2,f.h,'#56d6ff33',1);

    // Center dividing dashed net
    ctx.strokeStyle='#56d6ff2a';
    ctx.lineWidth=2;
    ctx.setLineDash([8,10]);
    ctx.beginPath();
    ctx.moveTo(f.x,f.y+f.h/2);
    ctx.lineTo(f.x+f.w,f.y+f.h/2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Retro big scores on court
    text(ctx,String(aiScore),f.x+f.w/2,f.y+f.h*.32,46,'#ff757522',700);
    text(ctx,String(playerScore),f.x+f.w/2,f.y+f.h*.68,46,'#56d6ff22',700);

    // Ball trail
    trail.forEach((p,i)=>{
      ctx.globalAlpha=(i/trail.length)*.35;
      rect(ctx,p.x-6,p.y-6,12,12,'#56d6ff',6);
    });
    ctx.globalAlpha=1;

    // Ball
    rect(ctx,x-7,y-7,14,14,'#ffffff',7);

    // AI paddle (top)
    rect(ctx,aiX-pw/2,f.y+16,pw,paddleHeight,'#ff8585',5);
    rect(ctx,aiX-pw*.35,f.y+27,pw*.7,2,'#ff858522',1);

    // Player paddle (bottom)
    const playerY=f.y+f.h-26;
    rect(ctx,playerX-pw/2,playerY,pw,paddleHeight,'#56d6ff',5);
    rect(ctx,playerX-pw*.35,playerY-4,pw*.7,2,'#56d6ff33',1);

    // Serve / status cue
    if(serveTimer>0&&running){
      const msg=playerScore>=WIN_SCORE||aiScore>=WIN_SCORE?'MATCH OVER':'SERVE';
      text(ctx,msg,f.x+f.w/2,f.y+f.h*.5-28,15,'#56d6ffbb',600);
    }
  }

  function tick(dt){
    resizeState();
    const f=view.field,pw=paddleWidth();
    const aiY=f.y+16+paddleHeight;
    const playerY=f.y+f.h-26;

    if(running&&dt>0){
      // Keyboard movement
      if(pressed.has('left'))playerTarget-=520*dt;
      if(pressed.has('right'))playerTarget+=520*dt;
      playerTarget=Math.max(f.x+pw/2+4,Math.min(f.x+f.w-pw/2-4,playerTarget));
      playerX+=(playerTarget-playerX)*Math.min(1,dt*28);

      // AI movement (smooth tracking with dynamic error)
      let aiTarget=f.x+f.w/2;
      if(vy<0){
        aiTarget=x;
      }
      aiTarget=Math.max(f.x+pw/2+4,Math.min(f.x+f.w-pw/2-4,aiTarget));
      const aiSpeed=Math.min(390,260+rally*14);
      const aiDiff=aiTarget-aiX;
      aiX+=Math.sign(aiDiff)*Math.min(Math.abs(aiDiff),aiSpeed*dt);

      if(serveTimer>0){
        serveTimer-=dt;
        draw();
        return;
      }

      const prevY=y;
      x+=vx*dt;
      y+=vy*dt;

      // Side wall bounces
      if(x<f.x+9){x=f.x+9;vx=Math.abs(vx);api.audio?.play('wall');}
      if(x>f.x+f.w-9){x=f.x+f.w-9;vx=-Math.abs(vx);api.audio?.play('wall');}

      // AI paddle collision (top)
      if(vy<0&&prevY-7>=aiY&&y-7<=aiY&&Math.abs(x-aiX)<=pw/2+7){
        y=aiY+8;
        rally++;
        api.audio?.play('hit',{pitch:-5});
        const speed=Math.min(620,240+rally*18);
        const hitOffset=(x-aiX)/(pw/2+7);
        vx=Math.sin(hitOffset*1.1)*speed;
        vy=Math.cos(hitOffset*1.1)*speed;
      }

      // Player paddle collision (bottom)
      if(vy>0&&prevY+7<=playerY&&y+7>=playerY&&Math.abs(x-playerX)<=pw/2+7){
        y=playerY-8;
        rally++;
        api.audio?.play('hit',{pitch:Math.min(6,Math.floor(rally/3))});
        const speed=Math.min(620,240+rally*18);
        const hitOffset=(x-playerX)/(pw/2+7);
        vx=Math.sin(hitOffset*1.1)*speed;
        vy=-Math.cos(hitOffset*1.1)*speed;
      }

      // Player scores past AI (ball goes past top)
      if(y<f.y-10){
        playerScore++;
        api.score(playerScore);
        if(playerScore>=WIN_SCORE){
          running=false;
          api.finish('You win!',`Victory ${playerScore} to ${aiScore} against CPU!`,playerScore,'win');
        }else{
          serve(0.9,-1);
        }
      }

      // AI scores past player (ball goes past bottom)
      if(y>f.y+f.h+10){
        aiScore++;
        api.audio?.play('miss');
        if(aiScore>=WIN_SCORE){
          running=false;
          api.finish('CPU wins',`CPU defeated you ${aiScore} to ${playerScore}.`,playerScore,'miss');
        }else{
          serve(0.9,1);
        }
      }

      trail.push({x,y});
      if(trail.length>10)trail.shift();
    }
    draw();
  }

  resetMatch(true);

  return {
    start(){resetMatch(false);api.score(0);},
    tick,
    pointerDown(p){playerTarget=p.x;},
    pointerMove(p){playerTarget=p.x;},
    direction(d){playerTarget+=d==='left'?-50:d==='right'?50:0;},
    keyDown(d){pressed.add(d);},
    keyUp(d){pressed.delete(d);},
    pause(){pressed.clear();},
    destroy(){running=false;s.destroy();}
  };
}
