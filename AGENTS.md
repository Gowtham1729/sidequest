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

## Refinement and game quality

When asked to refine game visuals, layout, controls, motion, or feel, read `refinement/START_HERE.md` and `refinement/sidequest-refinement/SKILL.md`. The quality standard, source audit, pilot briefs, and task state there are the durable handoff for this programme. Verify dated findings against the current source.

Keep changes bounded to the user's task. A routine fix does not require executing the whole programme. For programme work, establish Stack, 2048, and Pocket Golf as reviewed flagships before spreading the new presentation through the catalogue. Shared files have one assigned writer; preserve each game's rules and central lifecycle.

Keep code, visual, real-device, and player evidence separate. Test-double rendering is not browser QA; a browser screenshot is not a touch or audio test. Missing evidence stays unverified. Do not claim premium quality from self-assigned scores or bypass browser security failures. Record source-bound evidence and the next action in `refinement/state/` when handing off programme work.
