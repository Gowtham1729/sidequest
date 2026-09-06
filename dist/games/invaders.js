// Sidequest - Invaders (Classic Space Invaders)
import { createCanvas, clear, rect, circle, text } from './shared.js';

export function createInvaders(mount, api) {
  const s = createCanvas(mount, { fit: 'contain', aspectRatio: 9 / 16 });
  const ctx = s.ctx;
  const view = s.view;

  let running = false;
  let score = 0;
  let wave = 1;
  let lives = 3;

  // Player Turret
  const TURRET_W = 28;
  const TURRET_H = 16;
  let tx = 0;
  let ty = 0;
  let tvx = 0;
  let targetX = null;
  let steerDir = 0;

  // Lasers
  let playerLasers = [];
  let fireCooldown = 0;
  const FIRE_RATE = 0.26; // auto-fire cadence

  // Alien Swarm
  const ROWS = 4;
  const COLS = 6;
  let aliens = [];
  let swarmDir = 1; // 1 = right, -1 = left
  let swarmSpeed = 45;
  let swarmStepDown = false;
  let alienDropCooldown = 0;
  let alienBombs = [];

  // Bunkers (3 bunkers, each a grid of 4x3 destructible blocks)
  let bunkers = [];

  // Particles
  let particles = [];

  function initBunkers() {
    const f = view.field;
    bunkers = [];
    const numBunkers = 3;
    const spacing = f.w / (numBunkers + 1);
    const bY = f.y + f.h - 90;

    for (let b = 1; b <= numBunkers; b++) {
      const bX = f.x + b * spacing - 18;
      // 4x3 cells per bunker
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          // Arch cutout at bottom center
          if (r === 2 && (c === 1 || c === 2)) continue;
          bunkers.push({
            x: bX + c * 9,
            y: bY + r * 7,
            w: 8,
            h: 6,
            hp: 3
          });
        }
      }
    }
  }

  function spawnSwarm() {
    const f = view.field;
    aliens = [];
    const startX = f.x + 30;
    const startY = f.y + 45;
    const spacingX = (f.w - 60) / COLS;
    const spacingY = 28;

    for (let r = 0; r < ROWS; r++) {
      // Row 0 = squid (30pts), Row 1,2 = crab (20pts), Row 3 = octopus (10pts)
      const type = r === 0 ? 3 : (r < 3 ? 2 : 1);
      for (let c = 0; c < COLS; c++) {
        aliens.push({
          x: startX + c * spacingX + spacingX / 2,
          y: startY + r * spacingY,
          w: 22,
          h: 16,
          type,
          alive: true,
          animFrame: 0
        });
      }
    }
    swarmDir = 1;
    swarmSpeed = 35 + (wave - 1) * 8;
  }

  function reset(isInit = false) {
    const f = view.field;
    tx = f.x + f.w / 2;
    ty = f.y + f.h - 40;
    score = 0;
    wave = 1;
    lives = 3;
    playerLasers = [];
    alienBombs = [];
    particles = [];
    fireCooldown = 0;
    steerDir = 0;
    targetX = null;

    initBunkers();
    spawnSwarm();

    if (!isInit) {
      running = true;
    }
  }

  function shootLaser() {
    if (!running) {
      reset(false);
      api.score(0);
      return;
    }
    if (playerLasers.length < 3) {
      playerLasers.push({
        x: tx,
        y: ty - TURRET_H / 2,
        vy: -480
      });
      fireCooldown = FIRE_RATE;
    }
  }

  function die() {
    running = false;
    api.finish('Invasion Failed!', `Cleared ${score} invaders across Wave ${wave}. Tap to fight again!`, score);
  }

  function hitPlayer() {
    lives--;
    // Turret damage explosion
    for (let i = 0; i < 15; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: tx,
        y: ty,
        vx: Math.cos(a) * 90,
        vy: Math.sin(a) * 90,
        color: '#00e676',
        size: 3,
        life: 0.35,
        maxLife: 0.35
      });
    }

    if (lives <= 0) {
      die();
    } else {
      // Clear alien bombs
      alienBombs = [];
    }
  }

  function update(dt) {
    const f = view.field;

    // Turret movement
    const maxSpeed = 360;
    if (targetX !== null) {
      const dx = targetX - tx;
      if (Math.abs(dx) > 4) {
        tx += Math.sign(dx) * Math.min(maxSpeed * dt, Math.abs(dx) * 12 * dt);
      }
    } else if (steerDir !== 0) {
      tx += steerDir * maxSpeed * dt;
    }

    // Clamp turret to field bounds
    tx = Math.max(f.x + TURRET_W / 2 + 4, Math.min(f.x + f.w - TURRET_W / 2 - 4, tx));

    // Auto-fire cadence
    fireCooldown -= dt;
    if (fireCooldown <= 0) {
      playerLasers.push({
        x: tx,
        y: ty - TURRET_H / 2,
        vy: -520
      });
      fireCooldown = FIRE_RATE;
    }

    // Update player lasers
    for (let i = playerLasers.length - 1; i >= 0; i--) {
      const l = playerLasers[i];
      l.y += l.vy * dt;

      // Laser off screen
      if (l.y < f.y) {
        playerLasers.splice(i, 1);
        continue;
      }

      // Check bunker collision
      let hitBunker = false;
      for (let b = bunkers.length - 1; b >= 0; b--) {
        const bk = bunkers[b];
        if (l.x >= bk.x && l.x <= bk.x + bk.w && l.y >= bk.y && l.y <= bk.y + bk.h) {
          bk.hp--;
          if (bk.hp <= 0) bunkers.splice(b, 1);
          playerLasers.splice(i, 1);
          hitBunker = true;
          break;
        }
      }
      if (hitBunker) continue;

      // Check alien collision
      let hitAlien = false;
      for (const al of aliens) {
        if (!al.alive) continue;
        if (
          l.x >= al.x - al.w / 2 &&
          l.x <= al.x + al.w / 2 &&
          l.y >= al.y - al.h / 2 &&
          l.y <= al.y + al.h / 2
        ) {
          al.alive = false;
          hitAlien = true;
          const pts = al.type * 10;
          score += pts;
          api.score(score);

          // Alien death particles
          const color = al.type === 3 ? '#ff4081' : (al.type === 2 ? '#00e5ff' : '#ffe57f');
          for (let p = 0; p < 10; p++) {
            const a = Math.random() * Math.PI * 2;
            particles.push({
              x: al.x,
              y: al.y,
              vx: Math.cos(a) * 70,
              vy: Math.sin(a) * 70,
              color,
              size: 2.5,
              life: 0.3,
              maxLife: 0.3
            });
          }
          break;
        }
      }
      if (hitAlien) {
        playerLasers.splice(i, 1);
      }
    }

    // Swarm movement
    const aliveAliens = aliens.filter(a => a.alive);
    if (aliveAliens.length === 0) {
      // Wave cleared!
      wave++;
      score += 100;
      api.score(score);
      spawnSwarm();
      return;
    }

    // Speed increases as aliens are eliminated
    const speedMultiplier = 1 + (1 - (aliveAliens.length / (ROWS * COLS))) * 1.5;
    const currentSpeed = swarmSpeed * speedMultiplier;

    let edgeHit = false;
    for (const a of aliveAliens) {
      a.x += swarmDir * currentSpeed * dt;
      if ((swarmDir > 0 && a.x + a.w / 2 > f.x + f.w - 8) || (swarmDir < 0 && a.x - a.w / 2 < f.x + 8)) {
        edgeHit = true;
      }
    }

    if (edgeHit) {
      swarmDir *= -1;
      for (const a of aliveAliens) {
        a.y += 14;
        // Game Over if aliens reach bunkers / defense line
        if (a.y + a.h / 2 >= ty - 10) {
          die();
          return;
        }
      }
    }

    // Alien Bomb dropping
    alienDropCooldown -= dt;
    if (alienDropCooldown <= 0) {
      alienDropCooldown = Math.max(0.4, 1.4 - wave * 0.1);
      // Pick random bottom alien to drop bomb
      const colsMap = {};
      for (const a of aliveAliens) {
        const colKey = Math.round(a.x / 20);
        if (!colsMap[colKey] || a.y > colsMap[colKey].y) {
          colsMap[colKey] = a;
        }
      }
      const bottomList = Object.values(colsMap);
      if (bottomList.length > 0) {
        const shooter = bottomList[Math.floor(Math.random() * bottomList.length)];
        alienBombs.push({
          x: shooter.x,
          y: shooter.y + shooter.h / 2,
          vy: 190 + wave * 15
        });
      }
    }

    // Update Alien Bombs
    for (let i = alienBombs.length - 1; i >= 0; i--) {
      const b = alienBombs[i];
      b.y += b.vy * dt;

      // Off screen
      if (b.y > f.y + f.h) {
        alienBombs.splice(i, 1);
        continue;
      }

      // Check bunker collision
      let hitBunker = false;
      for (let bkIdx = bunkers.length - 1; bkIdx >= 0; bkIdx--) {
        const bk = bunkers[bkIdx];
        if (b.x >= bk.x && b.x <= bk.x + bk.w && b.y >= bk.y && b.y <= bk.y + bk.h) {
          bk.hp--;
          if (bk.hp <= 0) bunkers.splice(bkIdx, 1);
          alienBombs.splice(i, 1);
          hitBunker = true;
          break;
        }
      }
      if (hitBunker) continue;

      // Check Player collision
      if (
        b.x >= tx - TURRET_W / 2 &&
        b.x <= tx + TURRET_W / 2 &&
        b.y >= ty - TURRET_H / 2 &&
        b.y <= ty + TURRET_H / 2
      ) {
        alienBombs.splice(i, 1);
        hitPlayer();
        break;
      }
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

    // Retro CRT deep space background
    rect(ctx, f.x, f.y, f.w, f.h, '#0b0c16');

    // Subtle starfield
    ctx.fillStyle = '#ffffff22';
    for (let i = 0; i < 24; i++) {
      const sx = f.x + ((i * 47) % f.w);
      const sy = f.y + ((i * 79) % f.h);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Draw Aliens
    for (const a of aliens) {
      if (!a.alive) continue;
      const color = a.type === 3 ? '#ff4081' : (a.type === 2 ? '#00e5ff' : '#ffe57f');

      // Alien body
      rect(ctx, a.x - a.w / 2, a.y - a.h / 2, a.w, a.h, color, 3);
      // Alien eyes
      circle(ctx, a.x - 5, a.y - 1, 2.5, '#0b0c16');
      circle(ctx, a.x + 5, a.y - 1, 2.5, '#0b0c16');
      // Antennae / legs
      rect(ctx, a.x - a.w / 2 + 2, a.y + a.h / 2, 4, 3, color, 1);
      rect(ctx, a.x + a.w / 2 - 6, a.y + a.h / 2, 4, 3, color, 1);
    }

    // Draw Bunkers
    for (const bk of bunkers) {
      const alpha = bk.hp === 3 ? 'ff' : (bk.hp === 2 ? 'aa' : '55');
      rect(ctx, bk.x, bk.y, bk.w, bk.h, `#4caf50${alpha}`, 1);
    }

    // Draw Lasers
    for (const l of playerLasers) {
      rect(ctx, l.x - 1.5, l.y - 6, 3, 10, '#00e676', 1);
    }

    // Draw Alien Bombs
    for (const b of alienBombs) {
      rect(ctx, b.x - 1.5, b.y - 4, 3, 8, '#ff5252', 1);
      circle(ctx, b.x, b.y, 2, '#ffffff');
    }

    // Draw Player Turret
    rect(ctx, tx - TURRET_W / 2, ty - TURRET_H / 2, TURRET_W, TURRET_H, '#00e676', 3);
    // Cannon nozzle
    rect(ctx, tx - 3, ty - TURRET_H / 2 - 6, 6, 6, '#00e676', 1);
    // Turret cockpit
    circle(ctx, tx, ty - 1, 3, '#103816');

    // Draw particles
    for (const pt of particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      circle(ctx, pt.x, pt.y, pt.size, pt.color);
      ctx.restore();
    }

    // HUD: Wave & Lives
    text(ctx, `WAVE ${wave}`, f.x + 16, f.y + 24, 13, '#ffffffaa', 600, 'left');
    // Lives icons (green turrets)
    for (let i = 0; i < lives; i++) {
      const lx = f.x + f.w - 18 - i * 16;
      rect(ctx, lx - 5, f.y + 14, 10, 8, '#00e676', 2);
      rect(ctx, lx - 1.5, f.y + 10, 3, 4, '#00e676', 1);
    }
  }

  function tick(dt) {
    if (running && dt > 0) {
      update(dt);
    }
    draw();
  }

  function handleTouch(x) {
    const f = view.field;
    targetX = Math.max(f.x + TURRET_W / 2, Math.min(f.x + f.w - TURRET_W / 2, x));
  }

  reset(true);

  return {
    start() {
      reset(false);
      api.score(0);
    },
    tick,
    action: shootLaser,
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
      } else if (dir === 'up' || dir === ' ') {
        shootLaser();
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
