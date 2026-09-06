// Sidequest - Pop (Gem Collapse Chain Reaction)
import { createCanvas, clear, rect, circle, text } from './shared.js';

const GEMS = [
  { id: 0, name: 'ruby', color: '#ff1744', highlight: '#ff8a80', shape: 'diamond' },
  { id: 1, name: 'emerald', color: '#00e676', highlight: '#b9f6ca', shape: 'circle' },
  { id: 2, name: 'sapphire', color: '#2979ff', highlight: '#82b1ff', shape: 'square' },
  { id: 3, name: 'amethyst', color: '#d500f9', highlight: '#ea80fc', shape: 'star' },
  { id: 4, name: 'topaz', color: '#ffd600', highlight: '#ffff8d', shape: 'triangle' }
];

export function createPop(mount, api) {
  const s = createCanvas(mount, { fit: 'contain', aspectRatio: 9 / 16 });
  const ctx = s.ctx;
  const view = s.view;

  let running = false;
  let score = 0;
  let comboChain = 0;

  // Grid
  const COLS = 7;
  const ROWS = 9;
  let grid = []; // 2D array [c][r]
  let cellSize = 38;
  let gridLeft = 0;
  let gridTop = 0;

  // Timer
  let timeLeft = 45;
  const MAX_TIME = 60;

  // Visual effects
  let particles = [];
  let popups = [];

  function initGrid() {
    grid = [];
    for (let c = 0; c < COLS; c++) {
      grid[c] = [];
      for (let r = 0; r < ROWS; r++) {
        grid[c][r] = Math.floor(Math.random() * GEMS.length);
      }
    }
  }

  function resizeState() {
    const f = view.field;
    cellSize = Math.min(Math.floor((f.w - 52) / COLS), Math.floor((f.h - 100) / ROWS));
    gridLeft = f.x + (f.w - COLS * cellSize) / 2;
    gridTop = f.y + 64 + ((f.h - 100) - ROWS * cellSize) / 2;
  }

  function hasValidMoves() {
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const id = grid[c][r];
        if (id === -1) continue;
        if (c + 1 < COLS && grid[c + 1][r] === id) return true;
        if (r + 1 < ROWS && grid[c][r + 1] === id) return true;
      }
    }
    return false;
  }

  function ensureMoves() {
    if (!hasValidMoves()) {
      let attempts = 0;
      while (!hasValidMoves() && attempts < 20) {
        initGrid();
        attempts++;
      }
      popups.push({
        x: gridLeft + (COLS * cellSize) / 2,
        y: gridTop + (ROWS * cellSize) / 2,
        text: 'SHUFFLE!',
        color: '#ffd600',
        life: 0.9,
        maxLife: 0.9
      });
    }
  }

  function reset(isInit = false) {
    score = 0;
    comboChain = 0;
    timeLeft = 45;
    particles = [];
    popups = [];
    initGrid();
    ensureMoves();
    resizeState();

    if (!isInit) {
      running = true;
    }
  }

  function findCluster(c, r, targetId, visited = new Set()) {
    const key = `${c},${r}`;
    if (visited.has(key)) return [];
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return [];
    if (grid[c][r] !== targetId) return [];

    visited.add(key);
    let cluster = [{ c, r }];

    // 4 neighbors
    const neighbors = [
      [c + 1, r],
      [c - 1, r],
      [c, r + 1],
      [c, r - 1]
    ];

    for (const [nc, nr] of neighbors) {
      cluster = cluster.concat(findCluster(nc, nr, targetId, visited));
    }

    return cluster;
  }

  function popCluster(c, r) {
    if (!running) {
      reset(false);
      api.score(0);
      return;
    }
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;

    const gemId = grid[c][r];
    if (gemId === -1) return;

    const cluster = findCluster(c, r, gemId);
    if (cluster.length < 2) {
      // Too small, cannot pop 1 gem alone
      return;
    }

    // Calculate score: length * length * 10
    const pts = cluster.length * cluster.length * 10;
    comboChain++;
    score += pts;
    api.score(score);

    // Add time bonus: +1.2s per pop, up to MAX_TIME
    timeLeft = Math.min(MAX_TIME, timeLeft + 1.2 + Math.min(3, cluster.length * 0.2));

    // Gem pop particles and clear gems
    const gemMeta = GEMS[gemId];
    let avgX = 0;
    let avgY = 0;

    for (const cell of cluster) {
      const cellCenterX = gridLeft + cell.c * cellSize + cellSize / 2;
      const cellCenterY = gridTop + cell.r * cellSize + cellSize / 2;
      avgX += cellCenterX;
      avgY += cellCenterY;

      // Pop particles
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({
          x: cellCenterX,
          y: cellCenterY,
          vx: Math.cos(a) * (50 + Math.random() * 80),
          vy: Math.sin(a) * (50 + Math.random() * 80),
          color: gemMeta.color,
          size: 3 + Math.random() * 2,
          life: 0.35,
          maxLife: 0.35
        });
      }

      grid[cell.c][cell.r] = -1; // mark removed
    }

    avgX /= cluster.length;
    avgY /= cluster.length;

    // Floating popup text
    const label = cluster.length >= 5 ? `COMBO! +${pts}` : `+${pts}`;
    popups.push({
      x: avgX,
      y: avgY - 10,
      text: label,
      color: gemMeta.highlight,
      life: 0.75,
      maxLife: 0.75
    });

    // Apply gravity: collapse gems down in each column and refill top
    for (let col = 0; col < COLS; col++) {
      let emptyIdx = ROWS - 1;
      for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[col][row] !== -1) {
          if (emptyIdx !== row) {
            grid[col][emptyIdx] = grid[col][row];
            grid[col][row] = -1;
          }
          emptyIdx--;
        }
      }
      // Fill remaining top slots with fresh gems
      for (let row = emptyIdx; row >= 0; row--) {
        grid[col][row] = Math.floor(Math.random() * GEMS.length);
      }
    }

    ensureMoves();
  }

  function die() {
    running = false;
    api.finish('Time Up!', `Popped ${score} points! Tap to play again.`, score);
  }

  function update(dt) {
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
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
    resizeState();
    const f = view.field;
    clear(ctx);

    // Deep jewel tone background
    rect(ctx, f.x, f.y, f.w, f.h, '#12121e');

    // Timer Bar top
    const timerW = f.w * 0.7;
    const timerX = f.x + (f.w - timerW) / 2;
    const timerY = f.y + 16;
    rect(ctx, timerX, timerY, timerW, 8, '#ffffff14', 4);
    const fillW = Math.max(0, (timeLeft / MAX_TIME) * timerW);
    const timeColor = timeLeft < 10 ? '#ff1744' : '#00e5ff';
    rect(ctx, timerX, timerY, fillW, 8, timeColor, 4);

    // Time text
    text(ctx, `${Math.ceil(timeLeft)}s`, timerX + timerW + 16, timerY + 8, 13, '#ffffffaa', 600);

    // Grid board background panel
    rect(ctx, gridLeft - 6, gridTop - 6, COLS * cellSize + 12, ROWS * cellSize + 12, '#1a1a2b', 10);

    // Draw Gems
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const gemId = grid[c][r];
        if (gemId === -1) continue;

        const gx = gridLeft + c * cellSize + cellSize / 2;
        const gy = gridTop + r * cellSize + cellSize / 2;
        const gem = GEMS[gemId];
        const rad = cellSize * 0.38;

        // Gem shape rendering
        if (gem.shape === 'diamond') {
          ctx.save();
          ctx.translate(gx, gy);
          ctx.rotate(Math.PI / 4);
          rect(ctx, -rad * 0.8, -rad * 0.8, rad * 1.6, rad * 1.6, gem.color, 3);
          circle(ctx, -2, -2, rad * 0.35, gem.highlight);
          ctx.restore();
        } else if (gem.shape === 'circle') {
          circle(ctx, gx, gy, rad, gem.color);
          circle(ctx, gx - 2, gy - 2, rad * 0.45, gem.highlight);
        } else if (gem.shape === 'square') {
          rect(ctx, gx - rad, gy - rad, rad * 2, rad * 2, gem.color, 4);
          rect(ctx, gx - rad + 3, gy - rad + 3, rad * 0.8, rad * 0.8, gem.highlight, 2);
        } else if (gem.shape === 'triangle') {
          ctx.save();
          ctx.translate(gx, gy);
          ctx.fillStyle = gem.color;
          ctx.beginPath();
          ctx.moveTo(0, -rad);
          ctx.lineTo(rad, rad * 0.8);
          ctx.lineTo(-rad, rad * 0.8);
          ctx.closePath();
          ctx.fill();
          circle(ctx, 0, 0, rad * 0.3, gem.highlight);
          ctx.restore();
        } else if (gem.shape === 'star') {
          // Plus / cross star
          rect(ctx, gx - rad * 0.35, gy - rad, rad * 0.7, rad * 2, gem.color, 2);
          rect(ctx, gx - rad, gy - rad * 0.35, rad * 2, rad * 0.7, gem.color, 2);
          circle(ctx, gx, gy, rad * 0.3, gem.highlight);
        }
      }
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

    // Instruction footer
    if (running) {
      text(ctx, 'Tap matching clusters of 2 or more gems', f.x + f.w / 2, f.y + f.h - 16, 12, '#ffffff55', 500, 'center');
    }
  }

  function tick(dt) {
    if (running && dt > 0) {
      update(dt);
    }
    draw();
  }

  function handleTouch(x, y) {
    const c = Math.floor((x - gridLeft) / cellSize);
    const r = Math.floor((y - gridTop) / cellSize);
    popCluster(c, r);
  }

  reset(true);

  return {
    start() {
      reset(false);
      api.score(0);
    },
    tick,
    pointerDown(e) {
      handleTouch(e.x, e.y);
    },
    destroy() {
      running = false;
      s.destroy();
    }
  };
}
