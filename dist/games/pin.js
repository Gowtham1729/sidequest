import {surface,clear,rect,text,circle,orb,slab,ring,line,badge,specks,diamond} from './art.js';

export function createPin(mount,api){
  const s=surface(mount,'rose'),{ctx,view}=s;
  let wheelAngle=0,wheelSpeed=1.85,pins=[],flyingPin=null,score=0,running=false;
  let round=1,roundPins=0,roundTimer=0;
  let particles=[],oldField,flashTimer=0;
  let WHEEL_R=46;
  let PIN_LEN=72;
  const PIN_HEAD_R=8;
  const MIN_DIST=0.19; // ~16 degrees minimum clearance

  function reset(preview=false){
    const f=view.field;
    wheelAngle=0;
    wheelSpeed=1.35;round=1;roundPins=0;roundTimer=0;
    score=0;
    flyingPin=null;
    particles=[];
    flashTimer=0;
    pins=[];

    // Start with a few initial pins embedded
    const startCount=preview?4:3;
    for(let i=0;i<startCount;i++){
      pins.push({
        angle:(i*(Math.PI*2/startCount))+(Math.random()*0.3-0.15),
        id:i+1
      });
    }

    running=!preview;
    oldField={...f};
  }

  function resizeState(){
    const f=view.field;const scale=Math.min(1,f.h/440,f.w/330);WHEEL_R=46*scale;PIN_LEN=72*scale;
    if(oldField&&(f.w!==oldField.w||f.h!==oldField.h||f.y!==oldField.y)){
      oldField={...f};
    }
  }

  function shoot(){
    if(!running||flyingPin||roundTimer>0)return;resizeState();
    api.audio?.play('shoot');
    const f=view.field;
    const cx=f.x+f.w/2;
    const cy=f.y+f.h*0.38;
    const startY=f.y+f.h-PIN_LEN-24;
    flyingPin={
      x:cx,
      y:startY,
      targetY:cy+WHEEL_R,
      speed:1250,
      id:score+1
    };
  }

  function spawnSparks(x,y,color='#ff5c77'){
    for(let i=0;i<10;i++){
      const angle=Math.random()*Math.PI*2;
      const spd=Math.random()*150+50;
      particles.push({
        x,y,
        vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,
        color,life:0.35,maxLife:0.35
      });
    }
  }

  function draw(){
    resizeState();
    const f=view.field;
    const cx=f.x+f.w/2;
    const cy=f.y+f.h*0.38;
    clear(ctx);

    badge(ctx,'ROUND '+round,cx,f.y+24,'#efbdca');
    ring(ctx,cx,cy,WHEEL_R+PIN_LEN+12,'#ecadc01c');
    for(let i=0;i<60;i++){const a=i*Math.PI/30;line(ctx,cx+Math.cos(a)*(WHEEL_R+PIN_LEN+17),cy+Math.sin(a)*(WHEEL_R+PIN_LEN+17),cx+Math.cos(a)*(WHEEL_R+PIN_LEN+(i%5===0?24:20)),cy+Math.sin(a)*(WHEEL_R+PIN_LEN+(i%5===0?24:20)),'#edb4c433');}
    // Subtle target grid ring
    ctx.strokeStyle='#ff5c7715';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.arc(cx,cy,WHEEL_R+PIN_LEN,0,Math.PI*2);
    ctx.stroke();

    // Embedded pins
    for(const p of pins){
      const a=p.angle+wheelAngle;
      const x1=cx+Math.cos(a)*WHEEL_R;
      const y1=cy+Math.sin(a)*WHEEL_R;
      const x2=cx+Math.cos(a)*(WHEEL_R+PIN_LEN);
      const y2=cy+Math.sin(a)*(WHEEL_R+PIN_LEN);

      // Pin needle stem
      ctx.strokeStyle='#ff5c7788';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();

      // Pin head
      rect(ctx,x2-PIN_HEAD_R,y2-PIN_HEAD_R,PIN_HEAD_R*2,PIN_HEAD_R*2,'#ff5c77',PIN_HEAD_R);
    }

    // Flying pin
    if(flyingPin){
      const fy=flyingPin.y;
      ctx.strokeStyle='#ff5c77bb';
      ctx.lineWidth=2.5;
      ctx.beginPath();
      ctx.moveTo(cx,fy);
      ctx.lineTo(cx,fy+PIN_LEN);
      ctx.stroke();

      rect(ctx,cx-PIN_HEAD_R,fy+PIN_LEN-PIN_HEAD_R,PIN_HEAD_R*2,PIN_HEAD_R*2,'#ffffff',PIN_HEAD_R);
    }

    // Next pin waiting at bottom launcher
    if(!flyingPin&&running){
      const launchY=f.y+f.h-PIN_LEN-24;
      ctx.strokeStyle='#ff5c7744';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(cx,launchY);
      ctx.lineTo(cx,launchY+PIN_LEN);
      ctx.stroke();

      rect(ctx,cx-PIN_HEAD_R,launchY+PIN_LEN-PIN_HEAD_R,PIN_HEAD_R*2,PIN_HEAD_R*2,'#ff5c77',PIN_HEAD_R);
      text(ctx,String(score+1),cx,launchY+PIN_LEN,10,'#161c22',700);
    }

    // Central Wheel
    const wheelColor=flashTimer>0?'#ffffff':'#ff5c77';
    rect(ctx,cx-WHEEL_R,cy-WHEEL_R,WHEEL_R*2,WHEEL_R*2,wheelColor,WHEEL_R);
    rect(ctx,cx-WHEEL_R+4,cy-WHEEL_R+4,(WHEEL_R-4)*2,(WHEEL_R-4)*2,'#1e1418',WHEEL_R-4);

    // Center score inside wheel
    text(ctx,String(8-roundPins),cx,cy-5,30,'#f6c4d1',700);text(ctx,'TO GO',cx,cy+20,10,'#d59cac',600);
    if(roundTimer>0)badge(ctx,'BEAUTIFULLY PLACED',cx,f.y+f.h-35,'#f6c4d1');

    // Particles
    for(const pt of particles){
      ctx.globalAlpha=Math.max(0,pt.life/pt.maxLife);
      rect(ctx,pt.x-2,pt.y-2,4,4,pt.color,2);
    }
    ctx.globalAlpha=1;
  }

  function tick(dt){
    resizeState();
    const f=view.field;
    const cx=f.x+f.w/2;
    const cy=f.y+f.h*0.38;

    if(running&&dt>0){
      if(roundTimer>0){roundTimer-=dt;if(roundTimer<=0){round++;roundPins=0;pins=Array.from({length:Math.min(6,2+round)},(_,i)=>({angle:i*Math.PI*2/Math.min(6,2+round)}));wheelSpeed=(1.25+Math.min(1,round*.12))*(round%2?1:-1);}draw();return;}
      // Rotate wheel
      wheelAngle+=wheelSpeed*dt;
      if(flashTimer>0)flashTimer-=dt;

      // Move flying pin
      if(flyingPin){
        flyingPin.y-=flyingPin.speed*dt;
        if(flyingPin.y<=flyingPin.targetY){
          // Embedded at angle = PI/2 (straight down from center)
          // Relative to current wheelAngle:
          const embedAngle=((Math.PI*0.5)-wheelAngle)%(Math.PI*2);
          const normEmbed=(embedAngle+Math.PI*2)%(Math.PI*2);

          // Check collision with all existing pins
          let collided=false;
          for(const p of pins){
            const normP=(p.angle%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
            let diff=Math.abs(normEmbed-normP);
            if(diff>Math.PI)diff=Math.PI*2-diff;
            if(diff<MIN_DIST){
              collided=true;
              break;
            }
          }

          if(collided){
            running=false;
            const hitX=cx;
            const hitY=cy+WHEEL_R+PIN_LEN;
            spawnSparks(hitX,hitY,'#ff3b30');
            api.finish('Pin Clash!',`${score} pins placed cleanly. Tap to play again.`,score,'crash');
            return;
          }else{
            // Successfully embedded!
            pins.push({angle:embedAngle,id:flyingPin.id});
            score++;
            api.score(score);
            api.audio?.play('pin',{pitch:Math.min(8,Math.floor(score/3))});
            flashTimer=0.08;
            spawnSparks(cx,cy+WHEEL_R+PIN_LEN,'#ff5c77');

            // Slightly increase speed or alternate occasionally for excitement
            roundPins++;if(roundPins===8){roundTimer=1;api.audio?.play('win');}
            flyingPin=null;
          }
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
    start(){reset(false);api.score(0);},
    tick,
    action:shoot,
    pointerDown:shoot,
    direction:shoot,
    destroy(){running=false;s.destroy();}
  };
}
