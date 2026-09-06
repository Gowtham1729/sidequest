# Implementation handoff — R01

- Ticket: R01 "Give game input explicit ownership and reliable timing" (foundation, implementation)
- Base revision/fingerprint: `f03bddc9403d115f3062e27e707bd94a5c7b93a7` (working tree at session start; kit baseline commit `6777c90a…` is not in this checkout's history — kit note about the unpushed music-volume change applies)
- Candidate revision/fingerprint: uncommitted working tree; final checkpoint `refinement/evidence/r01-checkpoint-final` — `78a3170e4f81230d06a1c9bb70d62799013b33a30348ec440be6151167f813b4` (62/62 tests). Earlier same-session checkpoint `r01-checkpoint` (`afa58fd9…`) predates a test-only margin edit.
- Writer and exclusive write paths: single writer (this session, implementer + coordinator roles, sequential); `dist/app.js`, `dist/gestures.js`, `dist/registry.js`, `dist/games/expansion.js`, `tests/gestures.test.mjs`, `tests/input-lifecycle.test.mjs`, plus coordinator-owned `refinement/state/*` and `refinement/evidence/r01-*`.
- Changed files; committed or uncommitted: `dist/app.js`, `dist/gestures.js`, `dist/registry.js`, `dist/games/expansion.js`, `tests/gestures.test.mjs` (modified), `tests/input-lifecycle.test.mjs` (new), evidence + state files. **All uncommitted.** No push, no deploy, no commit was authorized for this session.
- Player-visible before/after:
  - Stack/Orbit/Beat Drop: the timing action now fires the instant the finger presses, judged once; a slightly-late release no longer downgrades the judgment, and a held press can no longer silently drop the input; keyboard unchanged.
  - Pocket Golf, bubbles, hoops, target, slice, maze, and the other 13 pointer-owning games: holding an active aim/steer/trace no longer triggers pause at 550 ms and no longer cancels the gesture; the in-play hint now reads "Edge swipe to switch · Two-finger swipe to browse".
  - Four in a Row, memory, mines, lights, slide, echo, reversi, flap, pin, zigzag, chop, chroma: unchanged (release-tap + hold-to-pause preserved, verified in browser and node).
- Rules or shared contracts changed (or none): **no gameplay rules changed** — registry/expansion diffs only add `input:'press'|'drag'` metadata. New shared contract: per-game input policy consumed by the shell (`gestures.js` `pressTiming`/`holdPauses`; defaults backward-compatible for any entry without `input`). Game factory contract unchanged; press-policy games must not define `pointerDown` (none do; documented in `gestures.js`).
- Evidence directory: `refinement/evidence/r01-browser/` (browser record + 5 screenshots), `refinement/evidence/r01-checkpoint-final/` (offline checkpoint), `refinement/evidence/r01-review.md` (independent review).

## Checks

| Check | Result | Evidence path | Limitation |
| --- | --- | --- | --- |
| Syntax and existing suite | pass — 62/62, `node --check` clean across dist | `refinement/evidence/r01-checkpoint-final/` | Offline only; not a quality claim |
| Targeted behavioral regression | pass — 8 new scenarios incl. held golf aim, press timing, stale gestures, feed ownership; reviewer verified the scenario tests fail on the base revision | `tests/input-lifecycle.test.mjs`, `tests/gestures.test.mjs`; `r01-review.md` | Node DOM double ≠ browser (see next row) |
| Browser layout and motion | pass for R01 scope — real Chrome 152, emulated touch 390×844 + 320×568, all four acceptance scenarios + console clean; served-source parity verified | `refinement/evidence/r01-browser/browser-record.md` | Emulated touch, macOS desktop; automation click-tool travels (F3 in record); 430×932/844×390/1440×900 not exercised |
| Real device and listening | unverified — no physical phone/speaker available this session | — | Blocks R01 acceptance until run |
| Player observations, if required | not applicable for R01 (foundation input ticket); pilots owe them | — | — |

## Open issues and integration

- Demonstrated remaining failures: none. Independent review verdict: code gate **pass**; decision "evidence pending" solely on the device gate.
- Missing observations: real-device runs of the four acceptance scenarios (script ready in the browser record); audio listening; QA matrix viewports beyond the two exercised.
- Shared-file change request, if any: **to R02** — (a) ship the visible compact pause control: the 19 drag-policy games currently have no discoverable touch pause (hold-to-pause intentionally disabled; reachable only via keyboard, focus-revealed accessible button, or the sound chip's sheet); (b) fix `index.html` help-dialog "Hold still — Pause your game" line, now wrong for drag-policy games (index.html is R02's write path, not R01's); (c) pre-existing finding F1: input dispatched during the ~300 ms `.scene.enter-next` animation after a game switch maps through the animated transform (`point()` reads the live arena rect; observed ~122 px shift at 320×568) — decide whether to freeze input geometry during the transition or exclude input until settled; (d) stale "nineteen games" meta description (already in R02 acceptance).
- Compatibility/migration notes: registry `input` policy is optional and defaults to current behavior — new games can omit it. Press-policy games must not define `pointerDown` (gestures.js comment documents this). Stack test schedule in `tests/input-lifecycle.test.mjs` is coupled to Stack's frozen speed curve (`105+height*7`, ±6 px window) — R04 must update it if Stack is retuned (reviewer F2).
- Exact next action: start R02 (dependency gate on R01 `implemented` is met), beginning with the visible pause control that restores discoverable touch pause for drag-policy games; in parallel, obtain real-device evidence for R01's four acceptance scenarios and flip R01's device gate.
- Is the current tree runnable? Evidence: yes — served and driven end-to-end in Chrome (browser record); 62/62 offline suite; `node --check` clean. Not deployed; `.openai/hosting.json` untouched.

Do not mark an observation passed without obtaining it. This is an implementer handoff plus an independent review reference, not a device or player approval.
