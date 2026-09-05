# Sidequest

A self-contained, touch-first game feed. No build step or external runtime dependencies.

## Add a game

Create a module in `dist/games/` and register it in `dist/registry.js`. The feed chooses games from the registry in shuffled rounds, with no immediate repeats. A game factory receives a mount element and `{ score(value), finish(title, subtitle, finalScore?) }` callbacks. Return:

- `start()`, `tick(dt)`, and `destroy()`.
- Optional `action()`, `direction(name)`, `pointerDown(point)`, `pointerMove(point)`, `pointerUp(point)`, `keyDown(direction)`, `keyUp(direction)`, and `pause()`.

Canvas game coordinates are 400 × 400; the shared surface draws at 2× resolution. Use the supplied frame delta instead of independent timers so pause and background-tab behavior stay consistent. Destroy must release any resources a game owns. Memory Match demonstrates an accessible HTML game using the same lifecycle.

The app owns input, score display, game selection, pause, and results. Game gestures stay inside the arena. The separate swipe strip navigates the feed, and wheel navigation is only available when idle and when the page fits the viewport. Session bests are held in memory and reset when the page is reloaded. Lower-is-better scores are recorded only on a completed game.

Game counts update from the registry. Add new colors and instructions there, and update the introductory help copy when expanding beyond the initial five games.

## Publish

The Sites identity is in `.openai/hosting.json`. Static entrypoint: `dist/index.html`. All authored assets in `dist/` are source files and must be tracked. Use the Sites hosting workflow to save and deploy this same project.
