// Sidequest - Crossy (Endless Road & River Hopper)
import { createCanvas, clear, rect, circle, text } from './shared.js';

export function createCrossy(mount, api) {
  const s = createCanvas(mount, { fit: 'contain', aspectRatio: 9 / 16 });
  const ctx = s.ctx;
  const view = s.view;

  let running = false;
  let score = 0;
  let maxRowReached = 0;

  // Grid sizing
  const GRID_SIZE = 36;
  let cols = 9;
  let startX = 0;

  // Player grid pos & smooth visual lerp pos
  let playerGridX = 4;
  let playerGridY = 0; // forward rows
  let px = 0;
  let py = 0;
  let targetPx = 0;
  let targetPy = 0;
  let hopT = 1; // 0 to 1 hop interpolation
  let facing = 'up'; // 'up', 'left', 'right'

  // Camera
  let cameraY = 0;
  let baseY = 0;

  // Rows generator
  // row types: 'grass', 'road', 'river'
  let rows = [];
  let nextRowY = 0;

  // Idle timer (eagle snatch if idling > 4.5 seconds)
  let idleTime = 0;
  const MAX_IDLE = 4.5;

  // Particles
  let particles = [];

  function reset(isInit = false) {
    const f = view.field;
    cols = 9;
    startX = f.x + (f.w - cols * GRID_SIZE) / 2;
    baseY = f.y + f.h - 90;

    playerGridX = 4;
    playerGridY = 0;
    maxRowReached = 0;
    score = 0;
    idleTime = 0;
    hopT = 1;
    particles = [];

    px = startX + playerGridX * GRID_SIZE + GRID_SIZE / 2;
    py = baseY;
    targetPx = px;
    targetPy = py;
    cameraY = py - f.h * 0.65;

    // Generate rows
    rows = [];
    // First 3 safe grass rows
    for (let r = -1; r <= 1; r++) {
      rows.push({
        index: r,
        type: 'grass',
        y: baseY - r * GRID_SIZE,
        items: []
      });
    }

    nextRowY = 2;
    while (nextRowY < 18) {
      spawnRow();
    }

    if (!isInit) {
      running = true;
    }
  }

  function spawnRow() {
    const rIdx = nextRowY;
    const y = baseY - rIdx * GRID_SIZE;

    // Row types: grass, road, river
    const roll = Math.random();
    let type = 'road';
    if (roll < 0.28) {
      type = 'grass';
    } else if (roll < 0.65) {
      type = 'road';
    } else {
      type = 'river';
    }

    const dir = Math.random() < 0.5 ? 1 : -1;
    const speed = (Math.random() * 45 + 55 + Math.min(60, rIdx * 1.5)) * dir;

    const row = {
      index: rIdx,
      type,
      y,
      speed,
      dir,
      items: []
    };

    const f = view.field;
    if (type === 'road') {
      // Spawn 2-3 cars
      const carCount = Math.random() < 0.5 ? 2 : 3;
      const spacing = f.w / carCount;
      const colors = ['#e53935', '#fbc02d', '#1e88e5', '#8e24aa'];
      for (let i = 0; i < carCount; i++) {
        row.items.push({
          x: f.x + i * spacing + Math.random() * 20,
          w: 42,
          h: 22,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    } else if (type === 'river') {
      // Spawn floating logs
      const logCount = 2;
      const spacing = f.w / logCount;
      for (let i = 0; i < logCount; i++) {
        row.items.push({
          x: f.x + i * spacing + Math.random() * 30,
          w: 68,
          h: 24
        });
      }
    }

    rows.push(row);
    nextRowY++;
  }

  function hop(dir) {
    if (!running) {
      reset(false);
      api.score(0);
      return;
    }

    idleTime = 0; // reset idle
    facing = dir;

    if (dir === 'up') {
      playerGridY++;
      if (playerGridY > maxRowReached) {
        maxRowReached = playerGridY;
        score = maxRowReached;
        api.score(score);
        api.audio?.play('lane',{pitch:Math.min(8,Math.floor(score/4))});
      } else {
        api.audio?.play('hop');
      }
    } else {
      api.audio?.play('hop');
      if (dir === 'left') {
        if (playerGridX > 0) playerGridX--;
      } else if (dir === 'right') {
        if (playerGridX < cols - 1) playerGridX++;
      }
    }

    targetPx = startX + playerGridX * GRID_SIZE + GRID_SIZE / 2;
    targetPy = baseY - playerGridY * GRID_SIZE;
    hopT = 0; // start hop jump animation
  }

  function die(reason) {
    running = false;
    // Splash / crunch burst
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(a) * 80,
        vy: Math.sin(a) * 80,
        color: reason.includes('Water') ? '#29b6f6' : '#ffeb3b',
        size: 3,
        life: 0.4,
        maxLife: 0.4
      });
    }
    api.finish(reason, `Crossed ${score} lanes. Tap to hop again!`, score, 'crash');
  }

  function update(dt) {
    const f = view.field;

    // Idle timer check
    idleTime += dt;
    if (idleTime >= MAX_IDLE) {
      die('Eagle snatched you!');
      return;
    }

    // Hop animation interpolation
    if (hopT < 1) {
      hopT = Math.min(1, hopT + dt * 7.5);
      px += (targetPx - px) * Math.min(1, dt * 18);
      py += (targetPy - py) * Math.min(1, dt * 18);
    } else {
      px = targetPx;
      py = targetPy;
    }

    // Update moving items in rows
    for (const r of rows) {
      if (r.type === 'road') {
        for (const car of r.items) {
          car.x += r.speed * dt;
          if (r.speed > 0 && car.x > f.x + f.w + 20) {
            car.x = f.x - car.w - 20;
          } else if (r.speed < 0 && car.x + car.w < f.x - 20) {
            car.x = f.x + f.w + 20;
          }
        }
      } else if (r.type === 'river') {
        for (const log of r.items) {
          log.x += r.speed * dt;
          if (r.speed > 0 && log.x > f.x + f.w + 20) {
            log.x = f.x - log.w - 20;
          } else if (r.speed < 0 && log.x + log.w < f.x - 20) {
            log.x = f.x + f.w + 20;
          }
        }
      }
    }

    // Find current player row
    const currentRow = rows.find(r => r.index === playerGridY);
    if (currentRow) {
      if (currentRow.type === 'river') {
        // Must be on a log
        let onLog = false;
        let logSpeed = 0;
        for (const log of currentRow.items) {
          if (px >= log.x - 6 && px <= log.x + log.w + 6) {
            onLog = true;
            logSpeed = currentRow.speed;
            break;
          }
        }

        if (onLog) {
          // Drift with log
          px += logSpeed * dt;
          targetPx = px;
          playerGridX = Math.max(0, Math.min(cols - 1, Math.round((px - startX - GRID_SIZE / 2) / GRID_SIZE)));

          // Check if carried off screen
          if (px < f.x + 8 || px > f.x + f.w - 8) {
            die('Drifted off-screen!');
            return;
          }
        } else if (hopT >= 0.7) {
          // Fell in water!
          die('Fell in the Water!');
          return;
        }
      } else if (currentRow.type === 'road') {
        // Check car collisions
        for (const car of currentRow.items) {
          if (
            px + 10 >= car.x &&
            px - 10 <= car.x + car.w &&
            Math.abs(py - (currentRow.y + GRID_SIZE / 2)) < 16
          ) {
            die('Hit by a Car!');
            return;
          }
        }
      }
    }

    // Camera follow smoothly
    const targetCamY = py - f.h * 0.65;
    if (targetCamY < cameraY) {
      cameraY += (targetCamY - cameraY) * Math.min(1, dt * 6);
    }

    // Generate new rows ahead
    while (nextRowY < playerGridY + 16) {
      spawnRow();
    }

    // Cull old rows behind camera
    const killY = cameraY + f.h + 80;
    rows = rows.filter(r => r.y < killY);

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

    // Deep backdrop
    rect(ctx, f.x, f.y, f.w, f.h, '#1a1f1b');

    // Draw rows
    for (const r of rows) {
      const screenY = r.y - cameraY + f.y;
      if (screenY < f.y - GRID_SIZE || screenY > f.y + f.h + GRID_SIZE) continue;

      if (r.type === 'grass') {
        rect(ctx, f.x, screenY, f.w, GRID_SIZE, '#2e7d32');
        rect(ctx, f.x, screenY + GRID_SIZE - 4, f.w, 4, '#1b5e20');
        // Flowers
        circle(ctx, f.x + 30 + ((r.index * 43) % (f.w - 60)), screenY + 14, 2, '#fff59d');
      } else if (r.type === 'road') {
        rect(ctx, f.x, screenY, f.w, GRID_SIZE, '#37474f');
        // Dashed center divider
        ctx.fillStyle = '#ffffff33';
        for (let x = f.x + 8; x < f.x + f.w; x += 28) {
          ctx.fillRect(x, screenY + GRID_SIZE / 2 - 1, 14, 2);
        }
        // Cars
        for (const car of r.items) {
          const cy = screenY + (GRID_SIZE - car.h) / 2;
          rect(ctx, car.x, cy, car.w, car.h, car.color, 4);
          // Windshield
          rect(ctx, car.x + 8, cy + 3, car.w - 16, car.h - 6, '#ffffff55', 2);
          // Headlights
          const headX = r.dir > 0 ? car.x + car.w - 3 : car.x + 1;
          circle(ctx, headX, cy + 4, 2, '#fff9c4');
          circle(ctx, headX, cy + car.h - 4, 2, '#fff9c4');
        }
      } else if (r.type === 'river') {
        rect(ctx, f.x, screenY, f.w, GRID_SIZE, '#0277bd');
        // Animated water ripple lines
        ctx.fillStyle = '#ffffff1a';
        ctx.fillRect(f.x, screenY + 4, f.w, 2);
        ctx.fillRect(f.x, screenY + GRID_SIZE - 6, f.w, 2);
        // Logs
        for (const log of r.items) {
          const ly = screenY + (GRID_SIZE - log.h) / 2;
          rect(ctx, log.x, ly, log.w, log.h, '#6d4c41', 6);
          rect(ctx, log.x + 6, ly + 4, log.w - 12, 3, '#8d6e63', 1);
          rect(ctx, log.x + 6, ly + log.h - 7, log.w - 12, 3, '#5d4037', 1);
        }
      }
    }

    // Particles
    for (const pt of particles) {
      const screenY = pt.y - cameraY + f.y;
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      circle(ctx, pt.x, screenY, pt.size, pt.color);
      ctx.restore();
    }

    // Draw Player (Cute Chicken)
    const playerScreenY = py - cameraY + f.y;
    // Jump arc height
    const jumpOffset = Math.sin(hopT * Math.PI) * 12;

    ctx.save();
    ctx.translate(px, playerScreenY - jumpOffset);

    // Shadow on ground
    circle(ctx, 0, jumpOffset + 8, Math.max(4, 9 - jumpOffset * 0.4), '#00000044');

    // Body
    circle(ctx, 0, 0, 11, '#ffffff');

    // Comb
    circle(ctx, 0, -11, 4, '#e53935');

    // Eyes & Beak according to facing
    if (facing === 'left') {
      circle(ctx, -6, -3, 2, '#212121');
      rect(ctx, -13, -1, 5, 4, '#ff9800', 1);
    } else if (facing === 'right') {
      circle(ctx, 6, -3, 2, '#212121');
      rect(ctx, 8, -1, 5, 4, '#ff9800', 1);
    } else {
      // Facing forward
      circle(ctx, -4, -4, 2, '#212121');
      circle(ctx, 4, -4, 2, '#212121');
      rect(ctx, -2.5, -1, 5, 4, '#ff9800', 1);
    }

    ctx.restore();

    // Idle countdown bar (alerting eagle)
    if (idleTime > 2.0) {
      const alertRatio = (idleTime - 2.0) / (MAX_IDLE - 2.0);
      rect(ctx, f.x + f.w / 2 - 30, f.y + 12, 60, 4, '#ffffff22', 2);
      rect(ctx, f.x + f.w / 2 - 30, f.y + 12, 60 * (1 - alertRatio), 4, '#ff1744', 2);
    }

    // On-screen Touch Steering Controls (Safe Inset from edge guard)
    const btnH = 46;
    const btnY = f.y + f.h - btnH - 12;

    // Left Button
    rect(ctx, f.x + 14, btnY, 68, btnH, '#ffffff14', 12);
    text(ctx, '◀', f.x + 14 + 34, btnY + btnH / 2 + 5, 18, '#ffffffaa', 700, 'center');

    // Forward Hop Button (Main Big Button)
    const midW = f.w - 180;
    const midX = f.x + 88;
    rect(ctx, midX, btnY, midW, btnH, '#ffffff22', 12);
    text(ctx, '▲ HOP', midX + midW / 2, btnY + btnH / 2 + 5, 16, '#ffffffdd', 700, 'center');

    // Right Button (safely inset 34px away from right screen edge)
    const rightBtnX = Math.min(f.x + f.w - 14 - 68, view.width - 68 - 34);
    rect(ctx, rightBtnX, btnY, 68, btnH, '#ffffff14', 12);
    text(ctx, '▶', rightBtnX + 34, btnY + btnH / 2 + 5, 18, '#ffffffaa', 700, 'center');

    // Score top right
    text(ctx, `${score}`, f.x + f.w - 18, f.y + 26, 20, '#ffffffcc', 700, 'right');
  }

  function tick(dt) {
    if (running && dt > 0) {
      update(dt);
    }
    draw();
  }

  function handleTouch(x, y) {
    const f = view.field;
    const btnY = f.y + f.h - 60;

    // Check bottom steering buttons
    if (y >= btnY) {
      if (x < f.x + 85) {
        hop('left');
      } else if (x > f.x + f.w - 85) {
        hop('right');
      } else {
        hop('up');
      }
    } else {
      // Tap anywhere in upper playfield hops forward
      if (x < f.x + f.w * 0.3) {
        hop('left');
      } else if (x > f.x + f.w * 0.7) {
        hop('right');
      } else {
        hop('up');
      }
    }
  }

  reset(true);

  return {
    start() {
      reset(false);
      api.score(0);
    },
    tick,
    action() {
      hop('up');
    },
    direction(dir) {
      if (dir === 'up') hop('up');
      else if (dir === 'left') hop('left');
      else if (dir === 'right') hop('right');
    },
    keyDown(dir) {
      if (dir === 'up' || dir === 'ArrowUp' || dir === 'w' || dir === 'W' || dir === ' ') {
        hop('up');
      } else if (dir === 'left' || dir === 'ArrowLeft' || dir === 'a' || dir === 'A') {
        hop('left');
      } else if (dir === 'right' || dir === 'ArrowRight' || dir === 'd' || dir === 'D') {
        hop('right');
      }
    },
    pointerDown(e) {
      handleTouch(e.x, e.y);
    },
    destroy() {
      running = false;
      s.destroy();
    }
  };
}
