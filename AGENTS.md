# Guidance for coding agents

Sidequest is a dependency-free static game feed. Make focused changes inside `dist/` and preserve the existing full-screen, mobile-first interaction model.

Before changing navigation, read `dist/app.js` and `dist/gestures.js` together. Gameplay owns the center of the screen; the feed owns the right-edge swipe, two-finger swipe, and feed-zone gestures. Do not make a game-level swipe listener navigate the feed.

When adding a game, follow the registry contract in `dist/registry.js`, use the shared helpers in `dist/games/shared.js`, and clean up all game-owned timers/listeners in `destroy()`. Add touch and keyboard behavior where it makes sense, but keep the game playable without buttons.

Validation for a static change:

```bash
for file in dist/*.js dist/games/*.js dist/audio/*.js; do node --check "$file" || exit 1; done
node --test tests/*.test.mjs
test -f dist/index.html
test -f .openai/hosting.json
```

Do not change `.openai/hosting.json`'s `project_id`, replace the Site with a new project, or add credentials to the repository.

Audio is centralized in `dist/audio/engine.js`. Add palettes in `dist/audio/profiles.js` and emit named events with `api.audio?.play(event, options)`. Do not add game-owned audio contexts, volume settings, or looping timers. See README for synthesized and recorded audio contracts. Keep the audio HUD controls excluded from gameplay/feed pointer capture.
