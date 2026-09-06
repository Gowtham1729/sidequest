// Sidequest - Hop (Vertical Climber)
import { createCanvas, clear, rect, circle, text } from './shared.js';

export function createHop(mount, api) {
  const s = createCanvas(mount, { fit: 'contain', aspectRatio: 9 / 16 });
  const ctx = s.ctx;
  const view = s.view;

  let running = false;
  let score = 0;
  let maxHeight = 0;

  // Player physics
  const PLAYER_R = 14;
  let px = 0;
  let py = 0;
  let vx = 0;
  let vy = 0;
  const GRAVITY = 1100;
  const BOUNCE_VY = -580;
  const SUPER_BOUNCE_VY = -920;
  let facing = 1; // 1 = right, -1 = left
  let squash = 1; // vertical stretch factor for bounce animation

  // Camera
  let cameraY = 0;

  // Input
  let steerDir = 0; // -1, 0, 1 from keys or touch
  let targetX = null; // from pointer drag

  // Platforms
  // types: 'normal', 'moving', 'fragile', 'spring'
  let platforms = [];
  let nextPlatY = 0;
  const PLAT_W = 62;
  const PLAT_H = 14;

  // Particles & Clouds
  let particles = [];
  let clouds = [];

  function reset(isInit = false) {
    const f = view.field;
    px = f.x + f.w / 2;
    py = f.y + f.h - 80;
    vx = 0;
    vy = BOUNCE_VY * 0.8;
    cameraY = py - f.h * 0.6;
    maxHeight = 0;
    score = 0;
    steerDir = 0;
    targetX = null;
    squash = 1;
    particles = [];

    // Background clouds
    clouds = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: f.x + Math.random() * f.w,
        y: f.y + Math.random() * f.h * 2 - f.h,
        w: 50 + Math.random() * 60,
        speed: 8 + Math.random() * 12
      });
    }

    // Initial platforms
    platforms = [];
    // Solid base platform under player
    platforms.push({
      x: f.x + f.w / 2 - PLAT_W / 2,
      y: f.y + f.h - 50,
      w: PLAT_W * 1.4,
      h: PLAT_H,
      type: 'normal',
      broken: false,
      vx: 0
    });

    nextPlatY = f.y + f.h - 110;
    while (nextPlatY > cameraY - 100) {
      spawnPlatform();
    }

    if (!isInit) {
      running = true;
    }
  }

  function spawnPlatform() {
    const f = view.field;
    const gap = 52 + Math.min(30, (score / 40) * 20);
    nextPlatY -= gap;

    // Platform types distribution based on height/score
    let type = 'normal';
    const roll = Math.random();
    if (score > 15 && roll < 0.25) {
      type = 'moving';
    } else if (score > 25 && roll < 0.45) {
      type = 'fragile';
    } else if (roll < 0.12) {
      type = 'spring';
    }

    const margin = 20;
    const x = f.x + margin + Math.random() * (f.w - margin * 2 - PLAT_W);
    const speed = (Math.random() < 0.5 ? 1 : -1) * (45 + Math.min(65, score * 0.8));

    platforms.push({
      x,
      y: nextPlatY,
      w: PLAT_W,
      h: PLAT_H,
      type,
      broken: false,
      vx: type === 'moving' ? speed : 0
    });
  }

  function die() {
    running = false;
    api.finish('Fell down!', `Reached height of ${score}m. Tap to leap again!`, score);
  }

  function addBounceParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) + (Math.random() * Math.PI / 2);
      const spd = 60 + Math.random() * 90;
      particles.push({
        x: x + (Math.random() * 20 - 10),
        y,
        vx: Math.cos(angle) * spd * (Math.random() < 0.5 ? 1 : -1),
        vy: -Math.sin(angle) * spd,
        color,
        size: 3 + Math.random() * 3,
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  function update(dt) {
    const f = view.field;

    // Horizontal steering
    const moveSpeed = 340;
    if (targetX !== null) {
      const dx = targetX - px;
      if (Math.abs(dx) > 4) {
        vx = Math.sign(dx) * Math.min(moveSpeed, Math.abs(dx) * 8);
        facing = Math.sign(dx);
      } else {
        vx = 0;
      }
    } else if (steerDir !== 0) {
      vx = steerDir * moveSpeed;
      facing = steerDir;
    } else {
      vx *= Math.pow(0.001, dt); // smooth deceleration
    }

    px += vx * dt;

    // Screen horizontal wrapping (like classic Doodle Jump)
    if (px < f.x - PLAYER_R) {
      px = f.x + f.w + PLAYER_R - 2;
    } else if (px > f.x + f.w + PLAYER_R) {
      px = f.x - PLAYER_R + 2;
    }

    // Vertical gravity
    vy += GRAVITY * dt;
    py += vy * dt;

    // Squash animation recovers to 1
    squash += (1 - squash) * Math.min(1, dt * 10);

    // Update moving platforms
    for (const p of platforms) {
      if (p.type === 'moving' && !p.broken) {
        p.x += p.vx * dt;
        if (p.x < f.x + 8) {
          p.x = f.x + 8;
          p.vx *= -1;
        } else if (p.x + p.w > f.x + f.w - 8) {
          p.x = f.x + f.w - 8 - p.w;
          p.vx *= -1;
        }
      }
    }

    // Collision with platforms (only when falling downward: vy > 0)
    if (vy > 0) {
      const feetY = py + PLAYER_R;
      for (const p of platforms) {
        if (p.broken) continue;

        // Check if feet are crossing platform top
        if (
          feetY >= p.y &&
          feetY <= p.y + p.h + 10 &&
          px + PLAYER_R * 0.7 >= p.x &&
          px - PLAYER_R * 0.7 <= p.x + p.w
        ) {
          if (p.type === 'fragile') {
            p.broken = true;
            addBounceParticles(px, p.y, '#c4824d');
            // Small stumble bounce
            vy = BOUNCE_VY * 0.55;
            squash = 0.7;
          } else if (p.type === 'spring') {
            vy = SUPER_BOUNCE_VY;
            squash = 0.5;
            addBounceParticles(px, p.y, '#ffd24c');
          } else {
            vy = BOUNCE_VY;
            squash = 0.65;
            addBounceParticles(px, p.y, '#69f0ae');
          }
          break;
        }
      }
    }

    // Camera scrolling (smooth upward follow)
    const targetCamY = py - f.h * 0.55;
    if (targetCamY < cameraY) {
      const scrollDiff = cameraY - targetCamY;
      cameraY = targetCamY;
      maxHeight += scrollDiff;
      const newScore = Math.floor(maxHeight / 18);
      if (newScore > score) {
        score = newScore;
        api.score(score);
      }
    }

    // Spawn new platforms as camera moves up
    while (nextPlatY > cameraY - 120) {
      spawnPlatform();
    }

    // Clean up platforms far below camera
    const killY = cameraY + f.h + 50;
    platforms = platforms.filter(p => p.y < killY);

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    // Update clouds
    for (const c of clouds) {
      c.x += c.speed * dt;
      if (c.x > f.x + f.w + c.w) {
        c.x = f.x - c.w;
        c.y = cameraY + Math.random() * f.h;
      }
    }

    // Check Fall Death (below camera bottom)
    if (py - PLAYER_R > cameraY + f.h + 20) {
      die();
    }
  }

  function draw() {
    const f = view.field;
    clear(ctx);

    // Sky gradient background
    const grad = ctx.createLinearGradient(0, f.y, 0, f.y + f.h);
    grad.addColorStop(0, '#1a103c');
    grad.addColorStop(0.5, '#162447');
    grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad;
    ctx.fillRect(f.x, f.y, f.w, f.h);

    // Gentle background clouds
    ctx.fillStyle = '#ffffff0f';
    for (const c of clouds) {
      const relY = c.y - cameraY + f.y;
      if (relY > f.y - 40 && relY < f.y + f.h + 40) {
        rect(ctx, c.x, relY, c.w, 16, '#ffffff0c', 8);
        rect(ctx, c.x + 12, relY - 8, c.w * 0.6, 14, '#ffffff0c', 7);
      }
    }

    // Draw Platforms
    for (const p of platforms) {
      if (p.broken) continue;
      const screenY = p.y - cameraY + f.y;
      if (screenY < f.y - 20 || screenY > f.y + f.h + 20) continue;

      if (p.type === 'normal') {
        // Neon green platform
        rect(ctx, p.x, screenY, p.w, p.h, '#43a047', 4);
        rect(ctx, p.x + 2, screenY + 2, p.w - 4, 3, '#76d275', 2);
      } else if (p.type === 'moving') {
        // Cyan moving platform
        rect(ctx, p.x, screenY, p.w, p.h, '#0288d1', 4);
        rect(ctx, p.x + 2, screenY + 2, p.w - 4, 3, '#81d4fa', 2);
        // Arrow accent
        circle(ctx, p.x + p.w / 2, screenY + p.h / 2, 2.5, '#ffffff99');
      } else if (p.type === 'fragile') {
        // Brown fragile cracked platform
        rect(ctx, p.x, screenY, p.w, p.h, '#8d6e63', 4);
        // Crack line
        rect(ctx, p.x + p.w * 0.45, screenY, 3, p.h, '#4e342e', 1);
      } else if (p.type === 'spring') {
        // Gold platform with bounce spring
        rect(ctx, p.x, screenY, p.w, p.h, '#f57c00', 4);
        rect(ctx, p.x + 2, screenY + 2, p.w - 4, 3, '#ffb74d', 2);
        // Spring coil
        const springX = p.x + p.w / 2;
        rect(ctx, springX - 5, screenY - 6, 10, 6, '#ffd54f', 2);
        rect(ctx, springX - 4, screenY - 9, 8, 3, '#fff59d', 1);
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

    // Draw Player
    const playerScreenY = py - cameraY + f.y;
    ctx.save();
    ctx.translate(px, playerScreenY);
    ctx.scale(facing * (2 - squash), squash);

    // Cute green alien hopper
    // Shadow underneath when bouncing
    circle(ctx, 0, 0, PLAYER_R, '#00e676');
    circle(ctx, -2, -3, PLAYER_R * 0.7, '#69f0ae'); // Highlight

    // Snout / trunk pointing forward
    rect(ctx, 4, -2, 10, 6, '#00c853', 3);

    // Big expressive eyes
    circle(ctx, 2, -6, 5, '#ffffff');
    circle(ctx, 4, -6, 2.5, '#1b5e20'); // pupil

    // Spring feet
    rect(ctx, -6, PLAYER_R - 2, 5, 5, '#ffd600', 2);
    rect(ctx, 1, PLAYER_R - 2, 5, 5, '#ffd600', 2);

    ctx.restore();

    // Height meter top right
    text(ctx, `${score}m`, f.x + f.w - 18, f.y + 24, 15, '#ffffffcc', 700, 'right');
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
