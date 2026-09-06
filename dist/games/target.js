// Sidequest - Target (Archery Precision Shoot)
import { createCanvas, clear, rect, circle, text, orb, slab, ring, line, badge, specks, diamond } from './art.js';

export function createTarget(mount, api) {
  const s = createCanvas(mount, 'court');
  const ctx = s.ctx;
  const view = s.view;

  let oldField={...view.field};
  let running = false;
  let score = 0;
  let arrowsLeft = 5;
  let combo = 0,maxCombo=0;

  // Bow & Arrow at bottom center
  let bowX = 0;
  let bowY = 0;
  let isAiming = false;
  let aimAngle = -Math.PI / 2; // straight up by default
  let aimPower = 0; // 0 to 1
  let dragStartX = 0;
  let dragStartY = 0;

  // Active flying arrows
  let flyingArrows = [];
  const GRAVITY = 550;

  // Targets (bullseyes moving horizontally at different heights)
  let targets = [];


  // Wind factor (-40 to +40)
  let wind = 0;

  // Popups & particles
  let popups = [];
  let particles = [];

  function spawnTargets() {
    const f = view.field;
    targets = [];
    // 3 lanes of moving targets
    const lanes = [
      { y: f.y + f.h*.22, spd: 28, dir: 1, r: 26 },
      { y: f.y + f.h*.38, spd: 42, dir: -1, r: 29 },
      { y: f.y + f.h*.54, spd: 34, dir: 1, r: 32 }
    ];

    for (let i = 0; i < lanes.length; i++) {
      const l = lanes[i];
      targets.push({
        x: f.x + 40 + Math.random() * (f.w - 80),
        y: l.y,
        r: l.r,
        vx: l.spd * l.dir,
        minX: f.x + l.r + 10,
        maxX: f.x + f.w - l.r - 10,
        hitCooldown: 0
      });
    }

    // Random wind
    wind = (Math.random() - 0.5) * 60;
  }

  function reset(isInit = false) {
    const f = view.field;
    bowX = f.x + f.w / 2;
    bowY = f.y + f.h - 60;
    score = 0;
    arrowsLeft = 5;
    combo = 0;maxCombo=0;
    isAiming = false;
    aimAngle = -Math.PI / 2;
    aimPower = 0.7;
    flyingArrows = [];
    particles = [];
    popups = [];

    spawnTargets();

    if (!isInit) {
      running = true;
    }
  }

  function shoot() {
    if (!running) {
      reset(false);
      api.score(0);
      return;
    }
    if (arrowsLeft <= 0||flyingArrows.length) return;

    arrowsLeft--;
    api.audio?.play('shoot');

    const speed = 400 + aimPower * 420;
    flyingArrows.push({
      x: bowX,
      y: bowY - 10,
      vx: Math.cos(aimAngle) * speed,
      vy: Math.sin(aimAngle) * speed,
      rot: aimAngle,
      alive: true
    });

    isAiming = false;
  }

  function die() {
    running = false;
    api.finish('Out of Arrows!', `Scored ${score} points with ${maxCombo} best streak. Tap to shoot again!`, score, 'miss');
  }

  function update(dt) {
    const f = view.field;

    // Move targets
    for (const t of targets) {
      t.x += t.vx * dt;
      if (t.x < t.minX) {
        t.x = t.minX;
        t.vx *= -1;
      } else if (t.x > t.maxX) {
        t.x = t.maxX;
        t.vx *= -1;
      }
      if (t.hitCooldown > 0) t.hitCooldown -= dt;
    }

    // Update flying arrows
    for (let i = flyingArrows.length - 1; i >= 0; i--) {
      const a = flyingArrows[i];
      if (!a.alive) continue;

      const oldX=a.x,oldY=a.y;
      // Apply wind and gravity
      a.vx += wind * dt;
      a.vy += GRAVITY * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.rot = Math.atan2(a.vy, a.vx);

      // Check target collision
      let hit = false;
      for (const t of targets) {
        if (t.hitCooldown > 0) continue;
        const crosses=a.vy<0&&oldY>=t.y&&a.y<=t.y;
        const fraction=crosses?(oldY-t.y)/(oldY-a.y):0;
        const impactX=oldX+(a.x-oldX)*fraction;
        const dist=Math.abs(impactX-t.x);
        if (crosses&&dist <= t.r) {
          hit = true;
          t.hitCooldown = 0.4;
          a.alive = false;

          let pts = 2;
          let label = 'HIT! +2';
          let color = '#83bfc7';

          if (dist <= t.r * 0.3) {
            pts = 10;
            label = 'BULLSEYE +10 · +1 ARROW';
            color = '#efcf85';
            combo++;
            arrowsLeft++; // Bonus arrow for bullseye!
            api.audio?.play('bullseye');
          } else if (dist <= t.r * 0.65) {
            pts = 5;
            label = 'GREAT! +5';
            color = '#dd9390';
            combo++;
            api.audio?.play('hit', {pitch: combo > 1 ? Math.min(6, combo) : 0});
          } else {
            combo = 0;
            api.audio?.play('hit');
          }

          maxCombo=Math.max(maxCombo,combo);
          score += pts;
          api.score(score);

          // Popup message
          popups.push({
            x: t.x,
            y: t.y - 15,
            text: label,
            color,
            life: 0.8,
            maxLife: 0.8
          });

          // Spark particles
          for (let p = 0; p < 12; p++) {
            const ang = Math.random() * Math.PI * 2;
            particles.push({
              x: a.x,
              y: a.y,
              vx: Math.cos(ang) * (50 + Math.random() * 80),
              vy: Math.sin(ang) * (50 + Math.random() * 80),
              color,
              size: 3,
              life: 0.35,
              maxLife: 0.35
            });
          }

          // Wind shifts after a hit
          wind = (Math.random() - 0.5) * 70;
          break;
        }
      }

      // Check bounds / missed
      if (a.y < f.y - 30 || a.x < f.x - 30 || a.x > f.x + f.w + 30 || a.y > f.y + f.h) {
        a.alive = false;
        combo = 0;
        flyingArrows.splice(i, 1);
        continue;
      }

      if (!a.alive) {
        flyingArrows.splice(i, 1);
      }
    }

    // Check game over
    if (arrowsLeft <= 0 && flyingArrows.length === 0) {
      die();
      return;
    }

    // Update popups
    for (let i = popups.length - 1; i >= 0; i--) {
      const pop = popups[i];
      pop.y -= 25 * dt;
      pop.life -= dt;
      if (pop.life <= 0) popups.splice(i, 1);
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }
  }

  function draw() {
    const f = view.field;
    clear(ctx);

    for(const t of targets){line(ctx,f.x+16,t.y,f.x+f.w-16,t.y,'#d4dfcd17');}
    // Range lane lines

    // Wind indicator HUD
    const windSign = wind > 5 ? '⇨' : (wind < -5 ? '⇦' : '·');
    const windSpeed = (Math.abs(wind) / 10).toFixed(1);
    rect(ctx, f.x + 14, f.y + 12, 104, 24, '#ffffff14', 6);
    text(ctx, `WIND ${windSign} ${windSpeed}`, f.x + 14 + 52, f.y + 24, 11, '#81d4fa', 600, 'center');

    // Arrows left HUD
    for (let i = 0; i < Math.min(10,arrowsLeft); i++) {
      const ax = f.x + f.w - 20 - i * 14;
      rect(ctx, ax - 1.5, f.y + 16, 3, 16, '#ffb74d', 1);
      circle(ctx, ax, f.y + 16, 2.5, '#cfd8dc');
    }

    // Draw Targets (Concentric Bullseyes)
    for (const t of targets) {
      circle(ctx,t.x+2,t.y+4,t.r+3,'#00000035');
      ring(ctx,t.x,t.y,t.r+4,'#e3d5b166',2);
      // Outer White ring
      circle(ctx, t.x, t.y, t.r, '#ffffff');
      // Blue ring
      circle(ctx, t.x, t.y, t.r * 0.75, '#83bfc7');
      // Red ring
      circle(ctx, t.x, t.y, t.r * 0.5, '#dd9390');
      // Gold Bullseye center
      circle(ctx, t.x, t.y, t.r * 0.25, '#efcf85');
    }

    // Trajectory preview dots when aiming
    if (isAiming) {
      const speed = 400 + aimPower * 420;
      let simX = bowX;
      let simY = bowY - 10;
      let simVx = Math.cos(aimAngle) * speed;
      let simVy = Math.sin(aimAngle) * speed;
      const simDt = 0.045;

      for (let step = 0; step < 14; step++) {
        simVx += wind * simDt;
        simVy += GRAVITY * simDt;
        simX += simVx * simDt;
        simY += simVy * simDt;
        const alpha = Math.max(0.1, 1 - step / 14);
        ctx.save();
        ctx.globalAlpha = alpha;
        circle(ctx, simX, simY, 2.5, '#ffd54f');
        ctx.restore();
      }
    }

    // Draw Bow at bottom
    ctx.save();
    ctx.translate(bowX, bowY);
    ctx.rotate(aimAngle + Math.PI / 2);

    // Bow wood curve
    ctx.beginPath();
    ctx.arc(0, 0, 26, Math.PI * 0.25, Math.PI * 0.75, false);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Bowstring
    ctx.beginPath();
    ctx.moveTo(-18, 18);
    if (isAiming) {
      ctx.lineTo(0, 18 + aimPower * 14);
    } else {
      ctx.lineTo(0, 18);
    }
    ctx.lineTo(18, 18);
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ready arrow loaded in bow
    if (arrowsLeft > 0) {
      rect(ctx, -1.5, -24, 3, 38, '#ffb74d', 1);
      // Arrowhead
      circle(ctx, 0, -24, 3, '#eceff1');
    }

    ctx.restore();

    // Draw flying arrows
    for (const a of flyingArrows) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);
      rect(ctx, -14, -1.5, 28, 3, '#ffb74d', 1);
      circle(ctx, 14, 0, 3, '#eceff1'); // tip
      // Fletching feathers
      rect(ctx, -14, -4, 4, 8, '#e53935', 1);
      ctx.restore();
    }

    // Draw Popups
    for (const pop of popups) {
      const alpha = Math.max(0, pop.life / pop.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      text(ctx, pop.text, pop.x, pop.y, 14, pop.color, 700, 'center');
      ctx.restore();
    }

    // Draw particles
    for (const pt of particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      circle(ctx, pt.x, pt.y, pt.size, pt.color);
      ctx.restore();
    }

    // Touch Drag Aim guide instruction
    if (!isAiming && running) {
      badge(ctx,'PULL BACK · RELEASE',bowX,bowY+34,'#b7cccf');
    }
  }

  function tick(dt) {
    const f=view.field;
    if(f.w!==oldField.w||f.h!==oldField.h||f.x!==oldField.x||f.y!==oldField.y){
      const mapX=x=>f.x+(x-oldField.x)/oldField.w*f.w,mapY=y=>f.y+(y-oldField.y)/oldField.h*f.h;
      bowX=mapX(bowX);bowY=f.y+f.h-60;targets.forEach(t=>{t.x=mapX(t.x);t.y=mapY(t.y);t.minX=f.x+t.r+10;t.maxX=f.x+f.w-t.r-10;});flyingArrows.forEach(a=>{a.x=mapX(a.x);a.y=mapY(a.y);});isAiming=false;
      oldField={...f};
    }
    if (running && dt > 0) {
      let left=dt;while(left>0&&running){const step=Math.min(left,1/120);update(step);left-=step;}
    }
    draw();
  }

  function handleStart(x, y) {
    if (!running) {
      reset(false);
      api.score(0);
      return;
    }
    isAiming = true;
    dragStartX = x;
    dragStartY = y;
    updateAim(x, y);
  }

  function updateAim(x, y) {
    // Aim vector from touch point back to start (slingshot pullback)
    const dx = dragStartX - x;
    const dy = dragStartY - y;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      // Slingshot angle
      aimAngle = Math.max(-Math.PI*.9,Math.min(-Math.PI*.1,Math.atan2(Math.min(-1,dy),dx)));
      aimPower = Math.min(1, dist / 80);
    } else {
      // Direct angle towards touch
      aimAngle = Math.atan2(y - bowY, x - bowX);
      aimPower = 0.75;
    }
  }

  reset(true);

  return {
    start() {
      reset(false);
      api.score(0);
    },
    tick,
    action: shoot,
    pause() {
      isAiming = false;
    },
    cancel() {
      isAiming = false;
    },
    direction(dir) {
      if (dir === 'left') aimAngle -= 0.15;
      else if (dir === 'right') aimAngle += 0.15;
      else if (dir === 'up') shoot();
    },
    keyDown(dir) {
      if (dir === 'left' || dir === 'ArrowLeft' || dir === 'a' || dir === 'A') {
        aimAngle = Math.max(-Math.PI * 0.85, aimAngle - 0.12);
      } else if (dir === 'right' || dir === 'ArrowRight' || dir === 'd' || dir === 'D') {
        aimAngle = Math.min(-Math.PI * 0.15, aimAngle + 0.12);
      } else if (dir === 'up' || dir === ' ') {
        aimPower = 0.8;
        shoot();
      }
    },
    pointerDown(e) {
      handleStart(e.x, e.y);
    },
    pointerMove(e) {
      if (isAiming) {
        updateAim(e.x, e.y);
      }
    },
    pointerUp() {
      if (isAiming) {
        shoot();
      }
    },
    destroy() {
      running = false;
      s.destroy();
    }
  };
}
