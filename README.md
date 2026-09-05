# Sidequest

Sidequest is a full-screen, mobile-first pocket arcade: swipe into a game, play immediately, and keep exploring. The current lineup is Stack, Snake, 2048, Rally, and Memory Match.

## Run it locally

The site is plain static HTML, CSS, and browser JavaScript with no build step or external dependencies.

```bash
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173` in a browser.

## Project layout

- `dist/index.html` — application shell, overlays, dialogs, and accessible controls.
- `dist/app.js` — feed lifecycle, game state, keyboard input, pause/restart behavior, and game transitions.
- `dist/registry.js` — the game registry and the metadata shown in the feed.
- `dist/games/` — one module per game plus shared helpers.
- `dist/gestures.js` — the boundary between feed navigation gestures and gameplay gestures.
- `dist/style.css` — full-screen responsive visual system and game layout.
- `.openai/hosting.json` — ChatGPT Sites identity and static output configuration. Keep the `project_id` unchanged.

## Add a game

1. Create `dist/games/<game-name>.js`.
2. Export a factory such as `createMyGame(mount, api)`.
3. Return `start()`, `tick(dt)`, and `destroy()`; add `action`, `tap`, `pointerDown`, `pointerMove`, `pointerUp`, `direction`, or keyboard handlers only when the game needs them.
4. Use `api.score(value)` for the HUD and `api.finish(title, subtitle, finalScore)` when a round ends.
5. Import the factory and add one metadata object to `dist/registry.js`.
6. Keep gameplay input inside the game module. Feed navigation is centralized in `app.js` and `gestures.js` so a long Snake or 2048 swipe cannot accidentally change rounds.

Games should work with touch first, remain playable with a keyboard, clean up timers and listeners in `destroy()`, and avoid adding dependencies unless the feature genuinely requires one.

## Publishing

The repository is prepared for the existing private ChatGPT Site identified by `.openai/hosting.json`. Future changes can be edited here by another coding model, reviewed locally, and then published to the same Sidequest Site without creating a replacement Site.
