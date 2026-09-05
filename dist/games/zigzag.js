import {surface,clear,rect,text} from './shared.js';

export function createZigZag(mount,api){
  const s=surface(mount),{ctx,view}=s;
  let ballX=0,ballY=0,ballZ=0,dir=0,speed=210,score=0,running=false;
  let tiles=[],crystals=[],particles=[],falling=false,fallVy=0,trail=[],oldField;
  const TILE_SIZE=34;
  const BALL_R=9;

  // Directions in 2D isometric screen projection:
  // dir 0: diagonally up-right: dx = cos(-30°)*speed, dy = sin(-30°)*speed
  // dir 1: diagonally up-left: dx = -cos(-30°)*speed, dy = sin(-30°)*speed
  const ISO_X=Math.cos(Math.PI/6);
  const ISO_Y=Math.sin(Math.PI/6);

  function reset(preview=false){
    const f=view.field;
    ballX=f.x+f.w/2;
    ballY=f.y+f.h*0.62;
    ballZ=0;
    dir=0;
    speed=210;
    score=0;
    falling=false;
    fallVy=0;
    trail=[];
    particles=[];
    tiles=[];
    crystals=[];

    // Generate initial path
    let curX=ballX;
    let curY=ballY;
    tiles.push({x:curX,y:curY});

    for(let i=0;i<40;i++){
      const nextDir=Math.random()<0.5?0:1;
      curX+=nextDir===0?(TILE_SIZE*ISO_X):(-TILE_SIZE*ISO_X);
      curY-=TILE_SIZE*ISO_Y;
      tiles.push({x:curX,y:curY});

      if(Math.random()<0.35&&i>2){
        crystals.push({x:curX,y:curY,collected:false});
      }
    }

    running=!preview;
    oldField={...f};
  }

  function toggleDir(){
    if(!running||falling)return;
    dir=dir===0?1:0;
    score++;
    api.score(score);
    // Pulse particles
    for(let i=0;i<3;i++){
      particles.push({
        x:ballX,y:ballY,
        vx:(Math.random()*60-30),vy:(Math.random()*60-30),
        color:'#5cf4ff88',life:0.2,maxLife:0.2
      });
    }
  }

  function resizeState(){
    const f=view.field;
    if(oldField&&(f.w!==oldField.w||f.h!==oldField.h||f.y!==oldField.y)){
      oldField={...f};
    }
  }

  function drawTile(tx,ty){
    // Draw 2.5D isometric diamond top + side facets
    const hw=TILE_SIZE*ISO_X;
    const hh=TILE_SIZE*ISO_Y;
    const depth=14;

    // Left facet
    ctx.fillStyle='#18454a';
    ctx.beginPath();
    ctx.moveTo(tx-hw,ty);
    ctx.lineTo(tx,ty+hh);
    ctx.lineTo(tx,ty+hh+depth);
    ctx.lineTo(tx-hw,ty+depth);
    ctx.closePath();
    ctx.fill();

    // Right facet
    ctx.fillStyle='#235f66';
    ctx.beginPath();
    ctx.moveTo(tx,ty+hh);
    ctx.lineTo(tx+hw,ty);
    ctx.lineTo(tx+hw,ty+depth);
    ctx.lineTo(tx,ty+hh+depth);
    ctx.closePath();
    ctx.fill();

    // Top diamond surface
    ctx.fillStyle='#2f7a83';
    ctx.beginPath();
    ctx.moveTo(tx,ty-hh);
    ctx.lineTo(tx+hw,ty);
    ctx.lineTo(tx,ty+hh);
    ctx.lineTo(tx-hw,ty);
    ctx.closePath();
    ctx.fill();

    // Subtle edge highlight
    ctx.strokeStyle='#5cf4ff44';
    ctx.lineWidth=1;
    ctx.stroke();
  }

  function draw(){
    resizeState();
    const f=view.field;
    clear(ctx);

    // Tiles
    for(const t of tiles){
      drawTile(t.x,t.y);
    }

    // Crystals
    for(const c of crystals){
      if(!c.collected){
        ctx.fillStyle='#ff5cd6';
        ctx.beginPath();
        ctx.moveTo(c.x,c.y-10);
        ctx.lineTo(c.x+6,c.y-4);
        ctx.lineTo(c.x,c.y+2);
        ctx.lineTo(c.x-6,c.y-4);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Ball trail
    trail.forEach((p,i)=>{
      ctx.globalAlpha=(i/trail.length)*0.35;
      rect(ctx,p.x-6,p.y-6,12,12,'#5cf4ff',6);
    });
    ctx.globalAlpha=1;

    // Ball
    rect(ctx,ballX-BALL_R,ballY+ballZ-BALL_R,BALL_R*2,BALL_R*2,'#5cf4ff',BALL_R);
    // Specular highlight
    rect(ctx,ballX-BALL_R*0.4,ballY+ballZ-BALL_R*0.6,BALL_R*0.7,BALL_R*0.7,'#ffffff',BALL_R*0.35);

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

    if(running&&dt>0){
      if(!falling){
        // Movement
        const vx=dir===0?(ISO_X*speed):(-ISO_X*speed);
        const vy=-ISO_Y*speed;
        ballX+=vx*dt;
        ballY+=vy*dt;

        // Camera follow: keep ball around f.y + f.h * 0.62
        const targetY=f.y+f.h*0.62;
        const scrollDy=targetY-ballY;
        ballY+=scrollDy;
        for(const t of tiles)t.y+=scrollDy;
        for(const c of crystals)c.y+=scrollDy;

        // Camera follow X: center ball
        const targetX=f.x+f.w/2;
        const scrollDx=(targetX-ballX)*0.08;
        ballX+=scrollDx;
        for(const t of tiles)t.x+=scrollDx;
        for(const c of crystals)c.x+=scrollDx;

        // Append more tiles ahead
        const lastTile=tiles[tiles.length-1];
        if(lastTile.y>f.y-60){
          const nextDir=Math.random()<0.5?0:1;
          const nextX=lastTile.x+(nextDir===0?(TILE_SIZE*ISO_X):(-TILE_SIZE*ISO_X));
          const nextY=lastTile.y-TILE_SIZE*ISO_Y;
          tiles.push({x:nextX,y:nextY});

          if(Math.random()<0.3){
            crystals.push({x:nextX,y:nextY,collected:false});
          }
        }

        // Cleanup offscreen tiles
        if(tiles[0]&&tiles[0].y>f.y+f.h+80){
          tiles.shift();
        }

        // Check if ball is on any tile
        let onTile=false;
        for(const t of tiles){
          const dx=Math.abs(ballX-t.x);
          const dy=Math.abs(ballY-t.y);
          if(dx<TILE_SIZE*ISO_X*0.85&&dy<TILE_SIZE*ISO_Y*0.95){
            onTile=true;
            break;
          }
        }

        // Crystal pickup
        for(const c of crystals){
          if(!c.collected){
            const dist=Math.hypot(ballX-c.x,ballY-c.y);
            if(dist<18){
              c.collected=true;
              score+=2;
              api.score(score);
              for(let i=0;i<8;i++){
                particles.push({
                  x:c.x,y:c.y,
                  vx:Math.random()*120-60,vy:Math.random()*120-60,
                  color:'#ff5cd6',life:0.3,maxLife:0.3
                });
              }
            }
          }
        }

        if(!onTile){
          falling=true;
        }

        trail.push({x:ballX,y:ballY});
        if(trail.length>8)trail.shift();

        // Progressive speed ramp
        speed=Math.min(380,210+score*1.8);
      }else{
        // Falling animation
        fallVy+=880*dt;
        ballZ+=fallVy*dt;
        if(ballZ>350){
          running=false;
          api.finish('Fell Off!',`${score} steps navigated. Tap to retry.`,score);
          return;
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
    action:toggleDir,
    pointerDown:toggleDir,
    direction:toggleDir,
    keyDown:toggleDir,
    destroy(){running=false;s.destroy();}
  };
}
