# Sidequest

A full-viewport, mobile-first arcade with five games and an endless randomized feed. Static files; no runtime dependencies or build step.

## Interaction

- Tap anywhere between rounds to start or replay.
- Hold still for 550 ms to pause; tap the paused screen to resume, or double-tap to restart.
- Swipe up/down between rounds for next/previous games.
- During gameplay, swipe at the right edge or use two fingers anywhere to navigate. The bottom HUD is also a feed gesture region. Ordinary one-finger gestures inside the playfield always belong to the current game, regardless of swipe distance.
- Swipe right between rounds (or on the bottom HUD while playing) for the game picker. Swipe left for gesture help. Swipe down from a sheet's handle to dismiss it.
- Keyboard: Space for start/action; arrows or WASD for gameplay; P/Escape to pause; N/B to browse; R to restart; G for the picker; ? for help. Focusable assistive controls remain available without occupying the normal screen.

The canvas matches the viewport at up to 2× device resolution with uniform coordinates. Snake generates a grid for the available aspect ratio, Rally uses the whole court, and 2048 and Memory Match stretch their tile layouts across the usable field. ResizeObserver owns canvas sizing and is released on every game change. Game state and visit bests are in memory only.

## Add a game

Create `dist/games/<name>.js` and register it in `dist/registry.js`. All selection controls and counts derive from the registry. A factory receives a mount and `{score(value),finish(title,subtitle,finalScore?)}`. Return `start()`, `tick(dt)`, `destroy()`, and optional `tap(point,target)`, `action()`, `direction(name)`, `pointerDown(point)`, `pointerMove(point)`, `pointerUp(point)`, `cancel()`, `keyDown(direction)`, `keyUp(direction)`, `pause()`.

Use `surface()` for a live viewport and canvas, and call its `destroy()` on teardown. `tick(0)` redraws a paused or resized game without advancing simulation. Keep mutations in game state; do not use independent timers. Destructive tap actions belong in `tap()`, not `pointerDown()`, so holds and navigation gestures cannot trigger them.

The gesture routing rules live in `dist/gestures.js` and are independent of game modules. The Site identity stays in `.openai/hosting.json`; publish the static `dist/` directory through the existing Sites project.
