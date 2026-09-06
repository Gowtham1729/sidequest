import {surface,clear,rect,text} from './shared.js';

export function createFlap(mount,api){
  const s=surface(mount),{ctx,view}=s;
  let birdY,birdVy,birdRot,pipes=[],particles=[],score=0,running=false;
  let spawnTimer=0,passedPipes=new Set(),oldField;
  const BIRD_X=()=>view.field.x+view.field.w*.28;
  const BIRD_R=12;
  const GRAVITY=960;
  const JUMP=-310;
  const SPEED=135;
  const GAP=125;
  const PIPE_W=48;

  function reset(preview=false){
    const f=view.field;
    birdY=f.y+f.h*.45;
    birdVy=0;
    birdRot=0;
    pipes=[];
    particles=[];
    score=0;
    spawnTimer=0.6;
    passedPipes.clear();
    running=!preview;
    oldField={...f};

    if(preview){
      // Add a couple of backdrop pipes for preview
      pipes.push(
        {x:f.x+f.w*.65,top:f.h*.32,bot:f.h*.32+GAP,passed:false},
        {x:f.x+f.w*1.15,top:f.h*.42,bot:f.h*.42+GAP,passed:false}
      );
    }
  }

  function resizeState(){
    const f=view.field;
    if(oldField&&(f.w!==oldField.w||f.h!==oldField.h||f.y!==oldField.y)){
      birdY=f.y+(birdY-oldField.y)/oldField.h*f.h;
      pipes.forEach(p=>{
        p.x=f.x+(p.x-oldField.x)/oldField.w*f.w;
        p.top=(p.top/oldField.h)*f.h;
        p.bot=p.top+GAP;
      });
      oldField={...f};
    }
  }

  function flap(){
    if(!running)return;
    birdVy=JUMP;
    api.audio?.play('flap');
    // Spawn subtle puff particles behind bird
    const bx=BIRD_X();
    for(let i=0;i<4;i++){
      particles.push({
        x:bx-BIRD_R,y:birdY+(Math.random()*8-4),
        vx:-Math.random()*60-20,vy:Math.random()*40-20,
        r:Math.random()*3+2,life:0.25,maxLife:0.25,color:'#ffd15c88'
      });
    }
  }

  function spawnPipe(){
    const f=view.field;
    const minH=40;
    const maxH=f.h-GAP-minH;
    const topH=Math.floor(Math.random()*(maxH-minH))+minH;
    pipes.push({
      x:f.x+f.w+10,
      top:topH,
      bot:topH+GAP,
      passed:false
    });
  }

  function draw(){
    resizeState();
    const f=view.field,bx=BIRD_X();
    clear(ctx);

    // Subtle background horizon line
    ctx.strokeStyle='#ffd15c15';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(f.x,f.y+f.h-2);
    ctx.lineTo(f.x+f.w,f.y+f.h-2);
    ctx.stroke();

    // Pipes
    for(const p of pipes){
      // Top pipe body & cap
      rect(ctx,p.x,f.y,PIPE_W,p.top,'#32c262',4);
      rect(ctx,p.x-3,f.y+p.top-16,PIPE_W+6,16,'#48db77',4);
      // Highlights
      rect(ctx,p.x+3,f.y,4,p.top,'#ffffff33',2);

      // Bottom pipe body & cap
      const botH=f.h-p.bot;
      rect(ctx,p.x,f.y+p.bot,PIPE_W,botH,'#32c262',4);
      rect(ctx,p.x-3,f.y+p.bot,PIPE_W+6,16,'#48db77',4);
      // Highlights
      rect(ctx,p.x+3,f.y+p.bot,4,botH,'#ffffff33',2);
    }

    // Particles
    for(const pt of particles){
      ctx.globalAlpha=Math.max(0,pt.life/pt.maxLife);
      rect(ctx,pt.x-pt.r,pt.y-pt.r,pt.r*2,pt.r*2,pt.color,pt.r);
    }
    ctx.globalAlpha=1;

    // Bird
    ctx.save();
    ctx.translate(bx,birdY);
    ctx.rotate(birdRot);

    // Body
    rect(ctx,-BIRD_R,-BIRD_R,BIRD_R*2,BIRD_R*2,'#ffd15c',BIRD_R);
    // Belly highlight
    rect(ctx,-BIRD_R+2,-BIRD_R+2,BIRD_R*2-4,BIRD_R-1,'#ffe89c',6);
    // Eye
    rect(ctx,BIRD_R*0.3,-BIRD_R*0.5,6,6,'#ffffff',3);
    rect(ctx,BIRD_R*0.5,-BIRD_R*0.4,3,3,'#1b2a1a',2);
    // Beak
    ctx.fillStyle='#ff7a36';
    ctx.beginPath();
    ctx.moveTo(BIRD_R*0.6,-BIRD_R*0.1);
    ctx.lineTo(BIRD_R*1.4,BIRD_R*0.2);
    ctx.lineTo(BIRD_R*0.6,BIRD_R*0.4);
    ctx.fill();
    // Wing
    rect(ctx,-BIRD_R*0.8,0,BIRD_R*0.9,BIRD_R*0.7,'#f5b838',5);

    ctx.restore();
  }

  function tick(dt){
    resizeState();
    const f=view.field,bx=BIRD_X();

    if(running&&dt>0){
      // Update bird physics
      birdVy+=GRAVITY*dt;
      birdY+=birdVy*dt;
      birdRot=Math.max(-0.45,Math.min(1.1,birdVy*0.0024));

      // Ceiling / Floor collision
      if(birdY-BIRD_R<f.y){
        birdY=f.y+BIRD_R;
        birdVy=0;
      }
      if(birdY+BIRD_R>f.y+f.h){
        running=false;
        api.finish('Game Over',`${score} pipes passed. Tap to flap again!`,score,'crash');
        return;
      }

      // Pipes spawning & moving
      spawnTimer-=dt;
      if(spawnTimer<=0){
        spawnPipe();
        spawnTimer=Math.max(1.3,1.75-score*0.02);
      }

      const currentSpeed=Math.min(215,SPEED+score*3.5);
      for(let i=pipes.length-1;i>=0;i--){
        const p=pipes[i];
        p.x-=currentSpeed*dt;

        // Score passing check
        if(!p.passed&&p.x+PIPE_W<bx){
          p.passed=true;
          score++;
          api.score(score);
          api.audio?.play('pass',{pitch:Math.min(8,Math.floor(score/2))});
        }

        // Pipe collision
        if(bx+BIRD_R*0.8>p.x&&bx-BIRD_R*0.8<p.x+PIPE_W){
          if(birdY-BIRD_R*0.75<f.y+p.top||birdY+BIRD_R*0.75>f.y+p.bot){
            running=false;
            api.finish('Pipe Crash!',`You cleared ${score} pipes. Tap to retry.`,score,'crash');
            return;
          }
        }

        // Despawn offscreen
        if(p.x+PIPE_W<f.x-20){
          pipes.splice(i,1);
        }
      }

      // Update particles
      for(let i=particles.length-1;i>=0;i--){
        const pt=particles[i];
        pt.x+=pt.vx*dt;
        pt.y+=pt.vy*dt;
        pt.life-=dt;
        if(pt.life<=0)particles.splice(i,1);
      }
    }
    draw();
  }

  reset(true);

  return {
    start(){reset(false);api.score(0);flap();},
    tick,
    action:flap,
    pointerDown:flap,
    direction(d){if(d==='up')flap();},
    keyDown(d){if(d==='up')flap();},
    destroy(){running=false;s.destroy();}
  };
}
