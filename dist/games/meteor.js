import {surface,clear,rect,text,circle,orb,slab,ring,line,badge,specks,diamond} from './art.js';

export function createMeteor(mount,api){
  const s=surface(mount,'space'),{ctx,view}=s;
  let elapsed=0,shield=1,invulnerable=0;
  let shipX,shipTarget,meteors=[],stars=[],particles=[],score=0,running=false;
  let spawnTimer=0,gemTimer=0,gems=[],pressed=new Set(),oldField;
  const SHIP_W=28;
  const SHIP_H=32;

  function reset(preview=false){
    const f=view.field;
    shipX=f.x+f.w/2;
    shipTarget=shipX;
    score=0;elapsed=0;shield=1;invulnerable=0;
    meteors=[];
    gems=[];
    particles=[];
    spawnTimer=0.4;
    gemTimer=1.2;
    pressed.clear();

    // Background stars
    stars=[];
    for(let i=0;i<45;i++){
      stars.push({
        x:f.x+Math.random()*f.w,
        y:f.y+Math.random()*f.h,
        spd:Math.random()*90+30,
        size:Math.random()*2+1,
        alpha:Math.random()*0.7+0.3
      });
    }

    if(preview){
      meteors.push(
        {x:f.x+f.w*0.35,y:f.y+f.h*0.3,r:18,spd:160,rot:0,vrot:1.5},
        {x:f.x+f.w*0.7,y:f.y+f.h*0.5,r:24,spd:140,rot:0,vrot:-1}
      );
    }

    running=!preview;
    oldField={...f};
  }

  function resizeState(){
    const f=view.field;
    if(oldField&&(f.w!==oldField.w||f.h!==oldField.h||f.y!==oldField.y)){
      shipX=f.x+(shipX-oldField.x)/oldField.w*f.w;
      shipTarget=shipX;
      for(const list of [meteors,gems,stars,particles])for(const p of list){p.x=f.x+(p.x-oldField.x)/oldField.w*f.w;p.y=f.y+(p.y-oldField.y)/oldField.h*f.h;}
      oldField={...f};
    }
  }

  function spawnMeteor(){
    const f=view.field;
    const r=Math.random()*14+12; // radius 12..26
    const x=f.x+r+Math.random()*(f.w-r*2);
    const spd=Math.random()*70+190+Math.min(220,score*3.5);
    meteors.push({
      x,y:f.y-r-10,r,
      spd,rot:0,vrot:(Math.random()-0.5)*3
    });
  }

  function spawnGem(){
    const f=view.field;
    const x=f.x+20+Math.random()*(f.w-40);
    gems.push({
      x,y:f.y-20,spd:160,collected:false
    });
  }

  function explode(x,y,color='#ff7543'){
    for(let i=0;i<16;i++){
      const angle=Math.random()*Math.PI*2;
      const spd=Math.random()*220+50;
      particles.push({
        x,y,
        vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,
        color:Math.random()<0.5?color:'#ffd700',
        r:Math.random()*3+2,life:0.45,maxLife:0.45
      });
    }
  }

  function draw(){
    resizeState();
    const f=view.field;
    const shipY=f.y+f.h-42;
    clear(ctx);

    badge(ctx,shield?'SHIELD READY':'HULL EXPOSED',f.x+f.w/2,f.y+24,'#d3c7f6');
    // Stars
    for(const st of stars){
      ctx.globalAlpha=st.alpha;
      rect(ctx,st.x,st.y,st.size,st.size*1.8,'#ffffff',1);
    }
    ctx.globalAlpha=1;

    // Gems (Energy Stars)
    for(const g of gems){
      if(!g.collected){
        ctx.fillStyle='#ffd700';
        ctx.beginPath();
        ctx.arc(g.x,g.y,7,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle='#ffffff';
        ctx.beginPath();
        ctx.arc(g.x-2,g.y-2,2.5,0,Math.PI*2);
        ctx.fill();
      }
    }

    // Meteors
    for(const m of meteors){
      ctx.save();
      ctx.translate(m.x,m.y);
      ctx.rotate(m.rot);

      // Meteor Body
      orb(ctx,0,0,m.r,'#9e89b5');
      // Crater details
      rect(ctx,-m.r*0.4,-m.r*0.3,m.r*0.6,m.r*0.6,'#4d446888',m.r*0.3);
      rect(ctx,m.r*0.2,m.r*0.1,m.r*0.5,m.r*0.5,'#4d446888',m.r*0.25);

      ctx.restore();
    }

    // Particles
    for(const pt of particles){
      ctx.globalAlpha=Math.max(0,pt.life/pt.maxLife);
      rect(ctx,pt.x-pt.r,pt.y-pt.r,pt.r*2,pt.r*2,pt.color,pt.r);
    }
    ctx.globalAlpha=1;

    if(shield||invulnerable>0)ring(ctx,shipX,shipY,25,invulnerable>0?'#ffffffaa':'#a9ceff55',1.5);
    // Ship Thruster trail
    rect(ctx,shipX-4,shipY+SHIP_H/2-2,8,12,'#56d6ff99',4);
    rect(ctx,shipX-2,shipY+SHIP_H/2+2,4,8,'#ffffff',2);

    // Spaceship (Neo-Vector style)
    ctx.fillStyle='#bd7bff';
    ctx.beginPath();
    ctx.moveTo(shipX,shipY-SHIP_H/2);
    ctx.lineTo(shipX+SHIP_W/2,shipY+SHIP_H/2);
    ctx.lineTo(shipX,shipY+SHIP_H*0.25);
    ctx.lineTo(shipX-SHIP_W/2,shipY+SHIP_H/2);
    ctx.closePath();
    ctx.fill();

    // Ship Cockpit
    rect(ctx,shipX-3,shipY-6,6,10,'#56d6ff',3);
  }

  function tick(dt){
    resizeState();
    const f=view.field;
    const shipY=f.y+f.h-42;

    if(running&&dt>0){
      elapsed+=dt;invulnerable=Math.max(0,invulnerable-dt);
      // Keyboard input
      if(pressed.has('left'))shipTarget-=540*dt;
      if(pressed.has('right'))shipTarget+=540*dt;
      shipTarget=Math.max(f.x+SHIP_W/2+4,Math.min(f.x+f.w-SHIP_W/2-4,shipTarget));
      shipX+=(shipTarget-shipX)*Math.min(1,dt*28);

      // Starfield parallax
      for(const st of stars){
        st.y+=st.spd*dt;
        if(st.y>f.y+f.h){
          st.y=f.y-5;
          st.x=f.x+Math.random()*f.w;
        }
      }

      // Spawn meteors
      spawnTimer-=dt;
      if(spawnTimer<=0){
        spawnMeteor();
        spawnTimer=Math.max(0.28,0.75-score*0.015);
      }

      // Spawn gems
      gemTimer-=dt;
      if(gemTimer<=0){
        spawnGem();
        gemTimer=Math.random()*2+2;
      }

      // Move & collide gems
      for(let i=gems.length-1;i>=0;i--){
        const g=gems[i];
        g.y+=g.spd*dt;
        if(!g.collected&&Math.hypot(shipX-g.x,shipY-g.y)<22){
          g.collected=true;
          score+=3;
          api.score(score);
          api.audio?.play('star');
          explode(g.x,g.y,'#ffd700');
          gems.splice(i,1);
          continue;
        }
        if(g.y>f.y+f.h+20)gems.splice(i,1);
      }

      // Move & collide meteors
      for(let i=meteors.length-1;i>=0;i--){
        const m=meteors[i];
        m.y+=m.spd*dt;
        m.rot+=m.vrot*dt;

        // Meteor collision with ship
        const dist=Math.hypot(shipX-m.x,shipY-m.y);
        if(dist<m.r+SHIP_W*.3&&invulnerable<=0){
          if(shield){shield=0;invulnerable=1.5;explode(m.x,m.y,'#bdd7ff');meteors.splice(i,1);api.audio?.play('star');continue;}
          running=false;
          explode(shipX,shipY,'#bd7bff');
          explode(m.x,m.y,'#ff7543');
          api.finish('Hull Breached!',`${score} points in ${Math.floor(elapsed)} seconds. Fly again.`,score,'crash');
          return;
        }

        // Passed safely
        if(m.y-m.r>f.y+f.h){
          meteors.splice(i,1);
          score++;
          api.score(score);
          api.audio?.play('pass');
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
    pointerDown(p){shipTarget=p.x;},
    pointerMove(p){shipTarget=p.x;},
    direction(d){shipTarget+=d==='left'?-50:d==='right'?50:0;},
    keyDown(d){pressed.add(d);},
    keyUp(d){pressed.delete(d);},
    pause(){pressed.clear();},
    cancel(){pressed.clear();},
    destroy(){running=false;s.destroy();}
  };
}
