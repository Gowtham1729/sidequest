// Sidequest - Drop (Classic Fall Down)
import { createCanvas, clear, rect, circle, text } from './shared.js';

export function createDrop(mount, api) {
  const s = createCanvas(mount, { fit: 'contain', aspectRatio: 9 / 16 });
  const ctx = s.ctx;
  const view = s.view;

  let running = false;
  let score = 0;
  let depth = 0;

  // Ball
  const BALL_R = 10;
  let bx = 0;
  let by = 0;
  let bvx = 0;
  let bvy = 0;
  const GRAVITY = 1200;
  const ROLL_ACCEL = 1600;
  const ROLL_MAX_SPD = 360;
  const FRICTION = 0.88;

  // Input
  let steerDir = 0;
  let targetX = null;

  // Rising Platforms
  let platforms = [];
  let baseRiseSpeed = 120;
  let riseSpeed = baseRiseSpeed;
  const PLAT_H = 14;
  const ROW_GAP = 90;
  const CEILING_SPIKES_H = 34;

  // Collectibles & Particles
  let gems = [];
  let particles = [];

  function reset(isInit = false) {
    const f = view.field;
    bx = f.x + f.w / 2;
    by = f.y + 120;
    bvx = 0;
    bvy = 0;
    score = 0;
    depth = 0;
    steerDir = 0;
    targetX = null;
    riseSpeed = baseRiseSpeed;
    particles = [];
    gems = [];

    // Generate initial set of platforms
    platforms = [];
    let startY = f.y + 180;
    while (startY < f.y + f.h + ROW_GAP * 2) {
      spawnPlatformRow(startY);
      startY += ROW_GAP;
    }

    if (!isInit) {
      running = true;
    }
  }

  function spawnPlatformRow(y) {
    const f = view.field;
    const gapW = Math.max(52, 74 - Math.min(20, score * 0.4));
    const gapX = f.x + 20 + Math.random() * (f.w - gapW - 40);

    platforms.push({
      y,
      gapX,
      gapW,
      h: PLAT_H,
      passed: false
    });

    // 25% chance of gem on this platform
    if (Math.random() < 0.25) {
      const gemX = Math.random() < 0.5
        ? f.x + 15 + Math.random() * Math.max(10, gapX - f.x - 30)
        : gapX + gapW + 15 + Math.random() * Math.max(10, (f.x + f.w) - (gapX + gapW) - 30);
      gems.push({
        x: gemX,
        y: y - 14,
        platY: y,
        collected: false
      });
    }
  }

  function die() {
    running = false;
    // Crushed explosion
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      particles.push({
        x: bx,
        y: by,
        vx: Math.cos(a) * (80 + Math.random() * 100),
        vy: Math.sin(a) * (80 + Math.random() * 100),
        color: '#ff5252',
        size: 3.5,
        life: 0.45,
        maxLife: 0.45
      });
    }
    api.finish('Crushed by Spikes!', `Dropped through ${score} floors. Tap to drop again!`, score, 'crash');
  }

  function update(dt) {
    const f = view.field;

    // Difficulty scales speed gently
    riseSpeed = baseRiseSpeed + Math.min(130, score * 2.8);

    // Horizontal steering
    if (targetX !== null) {
      const dx = targetX - bx;
      if (Math.abs(dx) > 5) {
        bvx = Math.sign(dx) * Math.min(ROLL_MAX_SPD, Math.abs(dx) * 10);
      } else {
        bvx = 0;
      }
    } else if (steerDir !== 0) {
      bvx += steerDir * ROLL_ACCEL * dt;
      if (Math.abs(bvx) > ROLL_MAX_SPD) {
        bvx = Math.sign(bvx) * ROLL_MAX_SPD;
      }
    } else {
      bvx *= Math.pow(FRICTION, dt * 60);
    }

    bx += bvx * dt;

    // Constrain to horizontal bounds
    if (bx - BALL_R < f.x + 4) {
      bx = f.x + 4 + BALL_R;
      bvx = 0;
    } else if (bx + BALL_R > f.x + f.w - 4) {
      bx = f.x + f.w - 4 - BALL_R;
      bvx = 0;
    }

    // Apply gravity
    bvy += GRAVITY * dt;
    if (bvy > 650) bvy = 650;
    let nextY = by + bvy * dt;

    // Platforms move upward
    for (const p of platforms) {
      p.y -= riseSpeed * dt;
    }
    for (const g of gems) {
      g.y -= riseSpeed * dt;
    }

    // Platform collision
    let onFloor = false;
    for (const p of platforms) {
      const pTop = p.y;
      const prevBottom = by + BALL_R;
      const curBottom = nextY + BALL_R;

      // Check if ball lands on platform (swept collision check)
      if (prevBottom <= pTop + riseSpeed * dt + 6 && curBottom >= pTop) {
        // Check if ball is outside gap
        const inGap = (bx - BALL_R * 0.6 >= p.gapX && bx + BALL_R * 0.6 <= p.gapX + p.gapW);
        if (!inGap) {
          nextY = pTop - BALL_R;
          bvy = -riseSpeed; // Ride with platform
          onFloor = true;

          // Rolling dust
          if (Math.abs(bvx) > 40 && Math.random() < 0.3) {
            particles.push({
              x: bx,
              y: pTop,
              vx: -bvx * 0.2,
              vy: -Math.random() * 25,
              color: '#ffffff55',
              size: 2,
              life: 0.2,
              maxLife: 0.2
            });
          }
          break;
        }
      }

      // Check if passed through gap
      if (!p.passed && by > p.y + p.h) {
        p.passed = true;
        score++;
        api.score(score);
        api.audio?.play('drop',{pitch:Math.min(8,Math.floor(score/4))});
      }
    }

    by = nextY;

    // Collect gems
    for (const g of gems) {
      if (g.collected) continue;
      const dist = Math.hypot(bx - g.x, by - g.y);
      if (dist < BALL_R + 10) {
        g.collected = true;
        score += 3;
        api.score(score);
        api.audio?.play('gem');
        for (let i = 0; i < 8; i++) {
          const a = Math.random() * Math.PI * 2;
          particles.push({
            x: g.x,
            y: g.y,
            vx: Math.cos(a) * 80,
            vy: Math.sin(a) * 80,
            color: '#00e5ff',
            size: 3,
            life: 0.3,
            maxLife: 0.3
          });
        }
      }
    }

    // Spawn new platforms at bottom
    const lowestY = platforms.reduce((max, p) => Math.max(max, p.y), 0);
    if (lowestY < f.y + f.h + ROW_GAP) {
      spawnPlatformRow(lowestY + ROW_GAP);
    }

    // Cull old platforms above ceiling
    platforms = platforms.filter(p => p.y + p.h > f.y);
    gems = gems.filter(g => g.y > f.y);

    // Ceiling Spikes Death Check!
    if (by - BALL_R <= f.y + CEILING_SPIKES_H) {
      die();
      return;
    }

    // Bottom out check (if ball somehow falls way below screen)
    if (by - BALL_R > f.y + f.h + 60) {
      by = f.y + f.h - 10;
      bvy = 0;
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

    // Deep slate background
    rect(ctx, f.x, f.y, f.w, f.h, '#151722');

    // Platforms
    for (const p of platforms) {
      if (p.y < f.y - 10 || p.y > f.y + f.h + 10) continue;

      // Left segment
      const leftW = Math.max(0, p.gapX - f.x);
      if (leftW > 0) {
        rect(ctx, f.x, p.y, leftW, p.h, '#2a324b', 3);
        rect(ctx, f.x, p.y, leftW, 3, '#4a5578', 2);
      }

      // Right segment
      const rightX = p.gapX + p.gapW;
      const rightW = Math.max(0, (f.x + f.w) - rightX);
      if (rightW > 0) {
        rect(ctx, rightX, p.y, rightW, p.h, '#2a324b', 3);
        rect(ctx, rightX, p.y, rightW, 3, '#4a5578', 2);
      }

      // Gap edge glowing guide dots
      circle(ctx, p.gapX + 2, p.y + p.h / 2, 2.5, '#00e5ff88');
      circle(ctx, p.gapX + p.gapW - 2, p.y + p.h / 2, 2.5, '#00e5ff88');
    }

    // Gems
    for (const g of gems) {
      if (g.collected) continue;
      if (g.y < f.y || g.y > f.y + f.h) continue;

      // Diamond gem
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(Math.PI / 4);
      rect(ctx, -5, -5, 10, 10, '#00e5ff', 2);
      circle(ctx, 0, 0, 2.5, '#ffffff');
      ctx.restore();
    }

    // Particles
    for (const pt of particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      circle(ctx, pt.x, pt.y, pt.size, pt.color);
      ctx.restore();
    }

    // Player Ball
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff9100';
    circle(ctx, bx, by, BALL_R, '#ff9100');
    circle(ctx, bx - 2, by - 3, BALL_R * 0.45, '#ffe082');
    ctx.restore();

    // Dangerous Ceiling Spikes at top
    const spikeW = 16;
    const numSpikes = Math.ceil(f.w / spikeW);
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    for (let i = 0; i < numSpikes; i++) {
      const sx = f.x + i * spikeW;
      ctx.moveTo(sx, f.y);
      ctx.lineTo(sx + spikeW / 2, f.y + CEILING_SPIKES_H);
      ctx.lineTo(sx + spikeW, f.y);
    }
    ctx.fill();

    // Spikes danger bar backing
    rect(ctx, f.x, f.y, f.w, 10, '#b71c1c');

    // Score in top corner below danger spikes
    text(ctx, `${score}`, f.x + f.w - 18, f.y + CEILING_SPIKES_H + 26, 18, '#ffffffbb', 700, 'right');
  }

  function tick(dt) {
    if (running && dt > 0) {
      update(dt);
    }
    draw();
  }

  function handleTouch(x) {
    const f = view.field;
    targetX = Math.max(f.x + 10, Math.min(f.x + f.w - 10, x));
  }

  reset(true);

  return {
    start() {
      reset(false);
      api.score(0);
    },
    tick,
    direction(dir) {
      if (dir === 'left') steerDir = -1;
      else if (dir === 'right') steerDir = 1;
      else steerDir = 0;
      targetX = null;
    },
    keyDown(dir) {
      if (dir === 'left' || dir === 'ArrowLeft' || dir === 'a' || dir === 'A') {
        steerDir = -1;
        targetX = null;
      } else if (dir === 'right' || dir === 'ArrowRight' || dir === 'd' || dir === 'D') {
        steerDir = 1;
        targetX = null;
      }
    },
    keyUp(dir) {
      if (
        (dir === 'left' || dir === 'ArrowLeft' || dir === 'a' || dir === 'A') && steerDir === -1 ||
        (dir === 'right' || dir === 'ArrowRight' || dir === 'd' || dir === 'D') && steerDir === 1
      ) {
        steerDir = 0;
      }
    },
    pointerDown(e) {
      if (!running) {
        reset(false);
        api.score(0);
        return;
      }
      handleTouch(e.x);
    },
    pointerMove(e) {
      if (running) {
        handleTouch(e.x);
      }
    },
    pointerUp() {
      targetX = null;
    },
    destroy() {
      running = false;
      s.destroy();
    }
  };
}
