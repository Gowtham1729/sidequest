import {surface,clear,rect,text} from './shared.js';

export function createChop(mount,api){
  const s=surface(mount),{ctx,view}=s;
  let playerSide='left',branches=[],chips=[],score=0,running=false;
  let timeLeft=4.0,maxTime=4.0,oldField,lastChopTime=0;
  const TRUNK_W=64;
  const SEG_H=52;
  const BRANCH_LEN=76;
  const BRANCH_H=18;

  function reset(preview=false){
    const f=view.field;
    playerSide='left';
    score=0;
    timeLeft=4.0;
    chips=[];
    branches=[];

    // Populate initial trunk segments
    // First 2 segments have no branches to give safe start
    branches.push(null,null);
    for(let i=2;i<12;i++){
      spawnBranch();
    }

    running=!preview;
    oldField={...f};
  }

  function spawnBranch(){
    const last=branches[branches.length-1];
    if(last!==null){
      // Don't spawn two branches in a row on opposite sides immediately
      branches.push(null);
    }else{
      const r=Math.random();
      if(r<0.4)branches.push('left');
      else if(r<0.8)branches.push('right');
      else branches.push(null);
    }
  }

  function chop(side){
    if(!running)return;
    playerSide=side;
    lastChopTime=performance.now();

    // Check if current bottom branch hits player
    if(branches[0]===playerSide){
      die('Squished by branch!');
      return;
    }

    // Chop bottom segment
    const removed=branches.shift();
    spawnBranch();
    score++;
    api.score(score);
    api.audio?.play('chop',{pitch:Math.min(8,Math.floor(score/6))});

    // Add time back
    timeLeft=Math.min(maxTime,timeLeft+0.22);

    // Check if the branch that just descended hits the player
    if(branches[0]===playerSide){
      die('Squished by branch!');
      return;
    }

    // Spawn flying wood chips
    const f=view.field;
    const cx=f.x+f.w/2;
    const chopX=side==='left'?(cx-TRUNK_W/2):(cx+TRUNK_W/2);
    const chopY=f.y+f.h-50;
    for(let i=0;i<7;i++){
      chips.push({
        x:chopX,y:chopY+(Math.random()*20-10),
        vx:(side==='left'?-1:1)*(Math.random()*160+80),
        vy:-Math.random()*140-40,
        rot:Math.random()*Math.PI*2,
        vrot:(Math.random()-0.5)*15,
        color:Math.random()<0.5?'#d49b5b':'#8a582b',
        life:0.45,maxLife:0.45
      });
    }
  }

  function die(reason){
    running=false;
    api.finish(reason,`${score} chops delivered. Tap to chop again!`,score,'crash');
  }

  function resizeState(){
    const f=view.field;
    if(oldField&&(f.w!==oldField.w||f.h!==oldField.h||f.y!==oldField.y)){
      oldField={...f};
    }
  }

  function draw(){
    resizeState();
    const f=view.field;
    const cx=f.x+f.w/2;
    const baseY=f.y+f.h-40;
    clear(ctx);

    // Time bar at top of field
    const barW=f.w*0.65;
    const barX=cx-barW/2;
    const barY=f.y+12;
    rect(ctx,barX,barY,barW,8,'#ffffff18',4);
    const fillW=Math.max(0,(timeLeft/maxTime)*barW);
    const barColor=timeLeft<1.2?'#ff4d4d':'#ff8843';
    rect(ctx,barX,barY,fillW,8,barColor,4);

    // Tree Trunk & Branches
    for(let i=0;i<branches.length;i++){
      const segY=baseY-i*SEG_H;
      const b=branches[i];

      // Trunk segment
      rect(ctx,cx-TRUNK_W/2,segY-SEG_H,TRUNK_W,SEG_H,'#82532a',2);
      // Trunk wood bark texture lines
      rect(ctx,cx-TRUNK_W/2+8,segY-SEG_H,4,SEG_H,'#5a3717',1);
      rect(ctx,cx+TRUNK_W/2-14,segY-SEG_H,6,SEG_H,'#996434',1);

      // Branch
      if(b==='left'){
        rect(ctx,cx-TRUNK_W/2-BRANCH_LEN,segY-SEG_H*0.7,BRANCH_LEN,BRANCH_H,'#5a3717',4);
        rect(ctx,cx-TRUNK_W/2-BRANCH_LEN+4,segY-SEG_H*0.7+2,BRANCH_LEN-8,4,'#82532a',2);
        // Green leaves cluster
        rect(ctx,cx-TRUNK_W/2-BRANCH_LEN-12,segY-SEG_H*0.7-6,22,24,'#4ea847',6);
      }else if(b==='right'){
        rect(ctx,cx+TRUNK_W/2,segY-SEG_H*0.7,BRANCH_LEN,BRANCH_H,'#5a3717',4);
        rect(ctx,cx+TRUNK_W/2+4,segY-SEG_H*0.7+2,BRANCH_LEN-8,4,'#82532a',2);
        // Green leaves cluster
        rect(ctx,cx+TRUNK_W/2+BRANCH_LEN-10,segY-SEG_H*0.7-6,22,24,'#4ea847',6);
      }
    }

    // Wood chips flying
    for(const c of chips){
      ctx.save();
      ctx.translate(c.x,c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha=Math.max(0,c.life/c.maxLife);
      rect(ctx,-5,-3,10,6,c.color,2);
      ctx.restore();
    }
    ctx.globalAlpha=1;

    // Lumberjack Character
    const px=playerSide==='left'?(cx-TRUNK_W/2-24):(cx+TRUNK_W/2+24);
    const py=baseY-16;

    // Body (Plaid red shirt)
    rect(ctx,px-12,py-28,24,24,'#ff4444',4);
    // Head & Cap
    rect(ctx,px-9,py-44,18,16,'#f5ce9f',4);
    rect(ctx,px-11,py-48,22,8,'#ff8843',3); // Cap
    // Beard
    rect(ctx,playerSide==='left'?px-4:px-8,py-36,12,8,'#5a3717',2);
    // Axe
    const axeDir=playerSide==='left'?1:-1;
    const swinging=(performance.now()-lastChopTime)<90;
    const axeAngle=swinging?(axeDir*0.7):(-axeDir*0.4);
    ctx.save();
    ctx.translate(px+(axeDir*10),py-20);
    ctx.rotate(axeAngle);
    rect(ctx,-3,-22,6,28,'#d49b5b',2); // Handle
    rect(ctx,-8,-24,16,10,'#cfd8dc',3); // Blade
    ctx.restore();

    // On-screen touch tap indicators (safely inset from feed edge guard)
    const padW=Math.min(110,f.w*0.32);
    rect(ctx,f.x+16,f.y+f.h-38,padW,28,'#ffffff12',8);
    text(ctx,'CHOP ◀',f.x+16+padW/2,f.y+f.h-24,12,'#ff8843cc',600);

    const rightPadX=Math.min(f.x+f.w-padW-16,view.width-padW-34);
    rect(ctx,rightPadX,f.y+f.h-38,padW,28,'#ffffff12',8);
    text(ctx,'▶ CHOP',rightPadX+padW/2,f.y+f.h-24,12,'#ff8843cc',600);
  }

  function tick(dt){
    resizeState();

    if(running&&dt>0){
      // Countdown timer accelerates as score increases
      const drainRate=1.0+Math.min(2.0,score*0.025);
      timeLeft-=dt*drainRate;
      if(timeLeft<=0){
        die('Time Out!');
        return;
      }

      // Update flying chips
      for(let i=chips.length-1;i>=0;i--){
        const c=chips[i];
        c.x+=c.vx*dt;
        c.y+=c.vy*dt;
        c.vy+=450*dt; // gravity
        c.rot+=c.vrot*dt;
        c.life-=dt;
        if(c.life<=0)chips.splice(i,1);
      }
    }
    draw();
  }

  reset(true);

  function handleTouch(p){
    const f=view.field;
    if(p.x<f.x+f.w/2){
      chop('left');
    }else{
      chop('right');
    }
  }

  return {
    start(){reset(false);api.score(0);},
    tick,
    pointerDown:handleTouch,
    direction(d){if(d==='left')chop('left');else if(d==='right')chop('right');},
    keyDown(d){if(d==='left')chop('left');else if(d==='right')chop('right');},
    destroy(){running=false;s.destroy();}
  };
}
