# Sidequest

Sidequest is a full-screen, mobile-first pocket arcade: swipe into a game, play immediately, and keep exploring. The lineup includes 34 games, from Stack, Snake and 2048 to fifteen new classic, puzzle, sports and rhythm games.

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

The repository is prepared for the existing ChatGPT Site identified by `.openai/hosting.json`. Future changes can be edited here by another coding model, reviewed locally, and then published to the same Sidequest Site without creating a replacement Site.

## Sound and music

Tap **Sound on/off** below the Sidequest name to open the audio sheet. Music and effects have independent switches and volume sliders; **Mute all** silences both. `M` toggles mute outside dialogs. Preferences are saved only on the current device. Audio unlocks after a touch/click/key interaction; a browser that cannot play audio still runs the games normally.

All 34 games have tailored event sounds. Thirty-two use synthesized palettes; Echo and Beat Drop deliberately leave background music silent so memory cues and rhythm timing remain clear. Stack and Chop load short recorded loops (AI-generated, kept in `dist/audio/assets/`) the first time they are played. Game visuals and gameplay use the existing centralized audio lifecycle. Music plays only during an active round, stops for pause, feed gestures, dialogs, and backgrounding, and starts a fresh phrase on resume. Switching games stops the previous game's voices. Results have short ending cues without continuing the music. Apart from those two loops, no sound files, downloads, libraries, or third-party music services are required.

- `dist/audio/engine.js`: one lazy Web Audio context, separate music/effects gains, output limiter, short look-ahead music scheduler, bounded voices, device preferences, and lifecycle cleanup.
- `dist/audio/profiles.js`: declarative sound palettes and original music for the original 19 games; `dist/audio/expansion-profiles.js` supplies the 15 additions.
- `dist/audio/controls.js`: accessible audio settings and preference bindings.
- `tests/audio.test.mjs`: dependency-free regression tests using a mock audio backend.

### Add sounds to a game

1. Add an entry keyed by the game's ID to `audioProfiles` in `dist/audio/profiles.js`. The registry attaches that profile automatically. A missing profile receives the shared arcade baseline, including automatic score cues. A missing event is safely silent. Set `autoScore: true` on a custom profile if you want score-increase cues from the shell; omit it when the game emits its own reward events.
2. Emit a named event at the actual gameplay outcome, for example `api.audio?.play('collect')`. Use optional `{pitch: 3}` to transpose a synthesized cue up three semitones (clamped to ±12).
3. The shell handles `start` and the default `finish` cue. For a different ending, use `api.finish(title, subtitle, finalScore, 'win')` (or `'miss'`, `'crash'`, etc.). Do not also emit that ending in the game: the shell stops gameplay voices before playing the ending cue.
4. Let the shell own volume, unlocking, timing, and cleanup. Do not create an AudioContext or music timer in a game. Old game handles become silent automatically after switching games.

A small profile looks like:

```js
myGame: {
  sounds: {
    start: [{note: 60, duration: .15, gain: .2, wave: 'sine'}],
    collect: [
      {note: 72, at: 0, duration: .12, gain: .2, wave: 'sine'},
      {note: 79, at: .08, duration: .22, gain: .18, wave: 'triangle'}
    ],
    finish: [{note: 55, duration: .2, gain: .15, wave: 'triangle', endNote: 48}]
  },
  music: {
    bpm: 96,
    steps: 8,
    voices: [{wave: 'sine', gain: .08, duration: .3,
      notes: [60, null, 64, null, 67, null, 64, null]}]
  }
}
```

Notes are MIDI numbers (60 = middle C); `null` is a rest. Music advances in eighth-note steps. Effect `at` offsets and note `duration` use seconds; `gain` is 0–1. Keep music quiet and leave space for gameplay feedback. `endNote` creates a pitch glide. The included 32-step loops span four bars.

### Use recorded audio

Place audio that you have rights to use in `dist/audio/assets/`. Replace an effect's note array with `{src:'/audio/assets/collect.ogg', gain:.3}`. Replace a music pattern with `{src:'/audio/assets/my-loop.mp3', gain:.2}` for looping recorded music. Effects also support `playbackRate` (0.25–4). Choose formats supported on your target devices and trim loops at clean boundaries. Cut loops on bar boundaries at the game's BPM so they rejoin on the downbeat: 8 bars at 112 BPM ≈ 17.1s, 16 bars at 132 BPM ≈ 29.1s (Stack and Chop ship loops cut this way).

Files are fetched and decoded lazily, cached per session, and played through the same controls. Loading/decoding failures are silent; late loads cannot leak across a game switch, pause, or mute. The first play of an uncached file can be delayed, so keep files small. The supplied synthesized sounds have no loading delay.

### Validate

```bash
for file in dist/*.js dist/games/*.js dist/audio/*.js; do node --check "$file" || exit 1; done
node --test tests/*.test.mjs
```

Regression tests cover lifecycle isolation, preferences, music scheduling, and sample loading. They do not replace listening and gesture checks on actual iOS/Android devices. The browser-audio approach follows [MDN's Web Audio guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).

## Arcade refinement

The original five games retain their existing rendering and rules. The other 14
use `dist/games/art.js` for bounded, safe-area-aware canvas fields and shared
materials, with individual palettes and game-specific objects. This remains a
static, dependency-free site.

- Pong: a scored court, bounded CPU speed, and angled paddle returns.
- Breaker: three balls, a serve grace period, dimensional bricks, and resize-safe progress.
- Flap: gentler gravity, wider gaps, and constrained changes between gates.
- Pin: eight-pin rounds, direction changes between rounds, and a corrected launcher.
- ZigZag: an approachable starting path, distance scoring, diamond collision bounds, and bounded collectibles.
- Chop: bark materials, chop movement, visible energy, and a gentler timer curve.
- Meteor: a one-hit shield, dimensional asteroids, and clearer survival results.
- Hop: reachable platform spacing, distinct platform types, swept landings, and cleared pause input.
- Chroma: complete-ring scoring, safe checkpoints, and segment symbols alongside color.
- Drop: constrained gap spacing, a gentler lift speed, and a textured shaft.
- Invaders: three animated pixel silhouettes, damage protection, stable collision steps, and wave transitions.
- Crossy: tap forward and directional swipes, aligned lane collisions, log riding, and safe waiting on grass.
- Target: center-plane hit scoring, reachable bullseyes, trajectory guidance, and an accurate best-streak result.
- Pop: a larger 6×7 board, falling gems, distinct gem shapes, a 60-second round, and timed chain multipliers.

`tests/games.test.mjs` exercises all 14 factories across phone, small-phone,
landscape, and desktop dimensions, plus pause/restart/cleanup and key scoring
regressions. It uses a validating canvas test double. It does **not** establish
browser rendering quality, measured frame rate, or real-device touch behavior.
Those still require browser and iOS/Android play-testing.


## Fifteen-game expansion

All additions live in `dist/games/expansion.js` and join the existing registry, feed, help sheet, score display, countdown, pause and centralized audio lifecycle. Existing game identifiers and feed gestures are preserved. Every new game has touch and keyboard controls.

| Game | Round and controls |
| --- | --- |
| Pocket Blocks | Seven-piece bag, rotation kicks, landing ghost, soft/hard drops, escalating gravity and a 40-line goal. Tap rotates; swipe sideways moves; swipe down drops. |
| Minesweeper | 7×7 board, eight mines, safe first neighborhood, flood reveal and optional flags. Reveal all 41 safe squares. |
| Slide Nine | Solvable 3×3 sliding puzzle, generated with legal moves. Tap adjacent tiles; arrows slide. Fewer moves is better. |
| Lights Out | Five solvable 4×4 toggle circuits. Tap flips the selected light and its four neighbors. |
| Echo | Four distinct musical pads; copy a growing sequence. Pads are ignored during playback. Arrows match the pad symbols. |
| Four in a Row | Standard 7×6 gravity board against a CPU with depth-limited lookahead, winning/blocking moves and diagonal detection. |
| Reversi | Quick 6×6 game, legal move hints, multi-direction flips, automatic passes and positional CPU play. |
| Bubble Sky | Hex-grid bubble shooting, wall banks, match-three clusters, unsupported drops, descending ceiling and a clear-board win. |
| Pocket Golf | Five authored courses, drag-to-putt, friction, rail rebounds, gentle cup capture, 20-stroke budget. |
| Swish | Ten ballistic basketball shots, trajectory guide, rim rebounds, moving hoop and consecutive-basket bonuses. |
| Lane Rush | Sixty-second three-lane racer, guaranteed gaps, collectible tokens, three lives and brief collision protection. |
| Prism Slice | Swept-pointer gem cuts, chained combos, marked hazards, three lives and a 45-second round. |
| Orbit | One-tap angular timing, perfect-hit bonus, shrinking windows, changing direction, three misses and 45 seconds. |
| Maze Escape | Three connected procedural mazes, three sparks each, visited trails, trace/swipe/tap movement, 55 seconds per maze. |
| Beat Drop | A 64-note four-lane phrase, faster second half, perfect/good timing windows, combos, five lives and quiet guide pulses. |

`dist/games/cabinet.js` adapts a stable logical playfield to the shared safe HUD bounds. It owns no animation frames, intervals or global input listeners. The feed supplies the clock and routes input; the cabinet handles scores, original synthesized event cues, bounded particles and result cleanup. Game-specific timers advance only with positive active frame time. Resizing changes presentation rather than physics state.

`tests/expansion.test.mjs` verifies generators and rules, actual input-driven wins and losses, all golf courses and maze rounds, the complete rhythm phrase, duplicate-score protection, audio parameters, and pause/restart/destruction. The existing canvas suite covers the original fourteen arcade additions plus the new fifteen at four viewport sizes. These are automated simulation and drawing-contract checks, not browser visual or listening tests.
