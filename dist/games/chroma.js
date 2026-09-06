// Sidequest - Chroma (Color Match Jumper)
import { createCanvas, clear, rect, circle, text } from './shared.js';

const COLORS = [
  { id: 0, name: 'pink', hex: '#ff2a70' },
  { id: 1, name: 'cyan', hex: '#00e5ff' },
  { id: 2, name: 'yellow', hex: '#ffe600' },
  { id: 3, name: 'purple', hex: '#b388ff' }
];

export function createChroma(mount, api) {
  const s = createCanvas(mount, { fit: 'contain', aspectRatio: 9 / 16 });
  const ctx = s.ctx;
  const view = s.view;

  let running = false;
  let score = 0;

  // Player
  const BALL_R = 10;
  let py = 0;
  let vy = 0;
  let playerColorIdx = 0;
  const GRAVITY = 900;
  const JUMP_IMP = -360;

  // Camera
  let cameraY = 0;

  // Obstacles & Pickups
  let obstacles = [];
  let pickups = []; // stars & color switchers
  let nextObsY = 0;

  // Particles
  let particles = [];

  function reset(isInit = false) {
    const f = view.field;
    playerColorIdx = Math.floor(Math.random() * COLORS.length);
    py = f.y + f.h - 120;
    vy = 0;
    cameraY = py - f.h * 0.65;
    score = 0;
    particles = [];
    obstacles = [];
    pickups = [];

    nextObsY = py - 180;
    while (nextObsY > cameraY - 300) {
      spawnObstaclePair();
    }

    if (!isInit) {
      running = true;
    }
  }

  function spawnObstaclePair() {
    const f = view.field;
    const cx = f.x + f.w / 2;
    const y = nextObsY;

    // Type of obstacle: 0 = single ring, 1 = dual ring, 2 = cross
    const typeRoll = Math.random();
    let type = 'ring';
    if (score > 6 && typeRoll < 0.35) {
      type = 'cross';
    } else if (score > 12 && typeRoll < 0.65) {
      type = 'dualRing';
    }

    const rotSpeed = (Math.random() < 0.5 ? 1 : -1) * (1.1 + Math.min(1.4, score * 0.06));

    if (type === 'ring') {
      obstacles.push({
        type: 'ring',
        y,
        radius: 65,
        thick: 14,
        rot: Math.random() * Math.PI * 2,
        rotSpeed
      });
    } else if (type === 'dualRing') {
      obstacles.push({
        type: 'ring',
        y,
        radius: 72,
        thick: 12,
        rot: 0,
        rotSpeed
      });
      obstacles.push({
        type: 'ring',
        y,
        radius: 46,
        thick: 11,
        rot: 0,
        rotSpeed: rotSpeed
      });
    } else if (type === 'cross') {
      obstacles.push({
        type: 'cross',
        y,
        armLen: 62,
        thick: 14,
        rot: Math.random() * Math.PI * 2,
        rotSpeed
      });
    }

    // Star in center of obstacle
    pickups.push({
      type: 'star',
      y,
      collected: false,
      pulse: 0
    });

    // Color switcher halfway between this and next obstacle
    pickups.push({
      type: 'changer',
      y: y - 110,
      collected: false
    });

    nextObsY -= 220;
  }

  function hop() {
    if (!running) {
      reset(false);
      api.score(0);
      return;
    }
    vy = JUMP_IMP;
    api.audio?.play('bounce');

    // Small jump puff particles
    const f = view.field;
    const cx = f.x + f.w / 2;
    const pColor = COLORS[playerColorIdx].hex;
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: cx + (Math.random() * 8 - 4),
        y: py + BALL_R,
        vx: (Math.random() - 0.5) * 60,
        vy: Math.random() * 40 + 20,
        color: pColor,
        size: 3,
        life: 0.2,
        maxLife: 0.2
      });
    }
  }

  function die() {
    running = false;
    api.finish('Color Mismatch!', `Passed through ${score} color rings. Tap to try again!`, score, 'crash');
    // Explode into colored bits
    const f = view.field;
    const cx = f.x + f.w / 2;
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const spd = 120 + Math.random() * 120;
      particles.push({
        x: cx,
        y: py,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color: COLORS[i % 4].hex,
        size: 4 + Math.random() * 3,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  function checkCollision() {
    const f = view.field;
    const cx = f.x + f.w / 2;

    for (const obs of obstacles) {
      if (obs.type === 'ring') {
        // A ring has 4 segments (each 90 degrees / Math.PI/2)
        // Check top entry/exit (y around obs.y - radius) and bottom entry/exit (y around obs.y + radius)
        const dTop = Math.abs(py - (obs.y - obs.radius));
        const dBottom = Math.abs(py - (obs.y + obs.radius));

        // When ball crosses the bottom arc
        if (dBottom < BALL_R + obs.thick / 2) {
          // Bottom segment angle is Math.PI / 2 in circle space
          const angleAtBottom = (Math.PI / 2 - obs.rot) % (Math.PI * 2);
          const normA = (angleAtBottom + Math.PI * 2) % (Math.PI * 2);
          const segIdx = Math.floor(normA / (Math.PI / 2)) % 4;
          if (segIdx !== playerColorIdx) {
            die();
            return;
          }
        }

        // When ball crosses the top arc
        if (dTop < BALL_R + obs.thick / 2) {
          // Top segment angle is 3 * Math.PI / 2 in circle space
          const angleAtTop = (3 * Math.PI / 2 - obs.rot) % (Math.PI * 2);
          const normA = (angleAtTop + Math.PI * 2) % (Math.PI * 2);
          const segIdx = Math.floor(normA / (Math.PI / 2)) % 4;
          if (segIdx !== playerColorIdx) {
            die();
            return;
          }
        }
      } else if (obs.type === 'cross') {
        // Cross with 4 arms from center. Ball passes along vertical center line x = cx.
        // Arms hit when vertical distance is small and horizontal arm crosses cx
        for (let i = 0; i < 4; i++) {
          const armAngle = obs.rot + (i * Math.PI / 2);
          const tipX = cx + Math.cos(armAngle) * obs.armLen;
          const tipY = obs.y + Math.sin(armAngle) * obs.armLen;

          // Check distance from player center (cx, py) to line segment (cx, obs.y) -> (tipX, tipY)
          const dx = tipX - cx;
          const dy = tipY - obs.y;
          const lenSq = dx * dx + dy * dy;
          const t = Math.max(0, Math.min(1, ((cx - cx) * dx + (py - obs.y) * dy) / lenSq));
          const projX = cx + t * dx;
          const projY = obs.y + t * dy;
          const dist = Math.hypot(cx - projX, py - projY);

          if (dist < BALL_R + obs.thick / 2 && Math.hypot(cx - projX, py - obs.y) > 16) {
            if (i !== playerColorIdx) {
              die();
              return;
            }
          }
        }
      }
    }

    // Pickups check
    for (const p of pickups) {
      if (p.collected) continue;
      const distY = Math.abs(py - p.y);
      if (distY < BALL_R + 14) {
        p.collected = true;
        if (p.type === 'star') {
          score++;
          api.score(score);
          api.audio?.play('star',{pitch:Math.min(8,Math.floor(score/3))});
          // Star sparks
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            particles.push({
              x: cx,
              y: p.y,
              vx: Math.cos(a) * 90,
              vy: Math.sin(a) * 90,
              color: '#ffd700',
              size: 3,
              life: 0.35,
              maxLife: 0.35
            });
          }
        } else if (p.type === 'changer') {
          // Pick a different color
          let newColor = Math.floor(Math.random() * COLORS.length);
          if (newColor === playerColorIdx) {
            newColor = (newColor + 1) % COLORS.length;
          }
          playerColorIdx = newColor;
          api.audio?.play('switch');

          // Color explosion
          for (let i = 0; i < 16; i++) {
            const a = Math.random() * Math.PI * 2;
            const spd = 60 + Math.random() * 80;
            particles.push({
              x: cx,
              y: p.y,
              vx: Math.cos(a) * spd,
              vy: Math.sin(a) * spd,
              color: COLORS[playerColorIdx].hex,
              size: 3.5,
              life: 0.4,
              maxLife: 0.4
            });
          }
        }
      }
    }
  }

  function update(dt) {
    const f = view.field;

    // Ball gravity & motion
    vy += GRAVITY * dt;
    py += vy * dt;

    // Obstacle rotations
    for (const obs of obstacles) {
      obs.rot += obs.rotSpeed * dt;
    }

    // Camera follow upward smoothly
    const targetCamY = py - f.h * 0.62;
    if (targetCamY < cameraY) {
      cameraY += (targetCamY - cameraY) * Math.min(1, dt * 10);
    }

    // Spawn more ahead
    while (nextObsY > cameraY - 260) {
      spawnObstaclePair();
    }

    // Cull old obstacles below camera
    const killY = cameraY + f.h + 80;
    obstacles = obstacles.filter(o => o.y < killY);
    pickups = pickups.filter(p => p.y < killY);

    // Collisions
    checkCollision();

    // Bottom screen fall death
    if (py - BALL_R > cameraY + f.h + 20) {
      die();
    }

    // Particles
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
    const cx = f.x + f.w / 2;
    clear(ctx);

    // Deep modern dark background
    rect(ctx, f.x, f.y, f.w, f.h, '#12131c');

    // Obstacles
    for (const obs of obstacles) {
      const sy = obs.y - cameraY + f.y;
      if (sy < f.y - 100 || sy > f.y + f.h + 100) continue;

      if (obs.type === 'ring') {
        ctx.lineWidth = obs.thick;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const startA = obs.rot + (i * Math.PI / 2);
          const endA = startA + Math.PI / 2;
          ctx.arc(cx, sy, obs.radius, startA, endA);
          ctx.strokeStyle = COLORS[i].hex;
          ctx.stroke();
        }
      } else if (obs.type === 'cross') {
        ctx.lineWidth = obs.thick;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          const armAngle = obs.rot + (i * Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(cx, sy);
          ctx.lineTo(cx + Math.cos(armAngle) * obs.armLen, sy + Math.sin(armAngle) * obs.armLen);
          ctx.strokeStyle = COLORS[i].hex;
          ctx.stroke();
        }
      }
    }

    // Pickups
    for (const p of pickups) {
      if (p.collected) continue;
      const sy = p.y - cameraY + f.y;
      if (sy < f.y - 30 || sy > f.y + f.h + 30) continue;

      if (p.type === 'star') {
        // Spinning golden star
        p.pulse = (p.pulse || 0) + 0.05;
        const starSize = 9 + Math.sin(p.pulse) * 1.5;
        circle(ctx, cx, sy, starSize, '#ffd700');
        circle(ctx, cx, sy, starSize * 0.5, '#fff9c4');
      } else if (p.type === 'changer') {
        // Color switcher 4-quadrant sphere
        const r = 12;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx, sy);
          ctx.arc(cx, sy, r, i * Math.PI / 2, (i + 1) * Math.PI / 2);
          ctx.fillStyle = COLORS[i].hex;
          ctx.fill();
        }
        circle(ctx, cx, sy, 3, '#ffffffcc');
      }
    }

    // Particles
    for (const pt of particles) {
      const sy = pt.y - cameraY + f.y;
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      circle(ctx, pt.x, sy, pt.size, pt.color);
      ctx.restore();
    }

    // Player Ball
    const psy = py - cameraY + f.y;
    const curHex = COLORS[playerColorIdx].hex;

    // Glowing halo
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = curHex;
    circle(ctx, cx, psy, BALL_R, curHex);
    circle(ctx, cx - 2, psy - 2, BALL_R * 0.45, '#ffffffcc');
    ctx.restore();

    // On-screen HUD score
    text(ctx, `${score}`, cx, f.y + 36, 26, '#ffffffcc', 700, 'center');
  }

  function tick(dt) {
    if (running && dt > 0) {
      update(dt);
    }
    draw();
  }

  reset(true);

  return {
    start() {
      reset(false);
      api.score(0);
    },
    tick,
    action: hop,
    pointerDown: hop,
    direction(dir) {
      if (dir === 'up') hop();
    },
    keyDown(dir) {
      if (dir === 'up' || dir === ' ' || dir === 'ArrowUp' || dir === 'w' || dir === 'W') {
        hop();
      }
    },
    destroy() {
      running = false;
      s.destroy();
    }
  };
}
