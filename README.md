# Sidequest

Sidequest is a full-screen, mobile-first pocket arcade: swipe into a game, play immediately, and keep exploring. The lineup includes Stack, Snake, 2048, Rally, Memory Match, and 14 additional arcade games.

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

The original five games have tailored synthesized loops and event sounds. The 14 newer games use a shared arcade loop with start, score, and finish cues until their own profiles are added. Music plays only during an active round, stops for pause, feed gestures, dialogs, and backgrounding, and starts a fresh phrase on resume. Switching games stops the previous game's voices. Results have short ending cues without continuing the music. No sound files, downloads, libraries, or third-party music services are required for the included games.

- `dist/audio/engine.js`: one lazy Web Audio context, separate music/effects gains, output limiter, short look-ahead music scheduler, bounded voices, device preferences, and lifecycle cleanup.
- `dist/audio/profiles.js`: declarative sound palettes and original music for all five games.
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

### Use recorded audio later

Place audio that you have rights to use in `dist/audio/assets/`. Replace an effect's note array with `{src:'/audio/assets/collect.ogg', gain:.3}`. Replace a music pattern with `{src:'/audio/assets/my-loop.mp3', gain:.2}` for looping recorded music. Effects also support `playbackRate` (0.25–4). Choose formats supported on your target devices and trim loops at clean boundaries.

Files are fetched and decoded lazily, cached per session, and played through the same controls. Loading/decoding failures are silent; late loads cannot leak across a game switch, pause, or mute. The first play of an uncached file can be delayed, so keep files small. The supplied synthesized sounds have no loading delay.

### Validate

```bash
for file in dist/*.js dist/games/*.js dist/audio/*.js; do node --check "$file" || exit 1; done
node --test tests/*.test.mjs
```

Regression tests cover lifecycle isolation, preferences, music scheduling, and sample loading. They do not replace listening and gesture checks on actual iOS/Android devices. The browser-audio approach follows [MDN's Web Audio guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).
