# Source audit: 6 September 2026

Baseline commit: `6777c90a8e860f3882106620cf5cde141658b107`. Paths below are relative to the Sidequest root. Line numbers are initial pointers only; use the named functions when source changes. No live rendering or listening was possible. Browser checks in Chrome and the in-app browser both failed at an unavailable admin-policy verification step. Do not interpret this as an application defect.

## Confirmed implementation facts and their implications

| ID | Evidence | Player implication / recommended response | Confidence |
| --- | --- | --- | --- |
| A01 | `dist/games/merge.js`, `draw`: `cw` derives from field width and `ch` independently from field height. | 2048 cells are not constrained to squares. Make a square board fitted to the available region; inspect spare-space composition. | Source-confirmed geometry; current screen appearance unverified. |
| A02 | `merge.js`, `move`: assigns `board=result.board`, spawns, and draws immediately. | No tile travel/merge-state animation exists. Introduce presentation transitions without changing merge rules. | Source-confirmed. |
| A03 | `four.js`, `place` and `tick`: `dropFour` writes the final cell and the renderer draws it there. `reversi.js` applies all flips directly. `slide.js` swaps board state directly. | These physical actions need visible transitions. Add falling discs, coherent flips, and sliding tiles, preserving turn ownership. | Source-confirmed. |
| A04 | `shared.js`, `surface`; `art.js`, `surface`; `cabinet.js`, `layout`; CSS `.memory-grid`. | There are different composition systems: unrestricted original fields, bounded later fields, fixed logical expansion fields, and a stretching DOM grid. Difference is not itself a bug; lack of explicit layout roles invites inconsistency. | Source-confirmed architecture; aesthetic impact requires review. |
| A05 | `style.css`, `.top-hud`, `.bottom-hud`, play-state overrides; `cabinet.js`, `header/footer`; `four.js`, draw. | Shell and games can repeat titles/instructions and compete vertically. Four includes shell hint, in-board explanatory sentence, and footer. Reduce redundancy; measure the actual HUD before setting new budgets. | Source-confirmed duplication; exact pixels unknown. |
| A06 | `app.js` pointer-down handler: hold timer at 550ms; cancels after movement exceeds 10px. `golf.js` starts drag aiming on pointer-down and shoots on pointer-up. | A user who starts an aim and holds still can invoke global pause. Scope hold-to-pause to appropriate input modes and preserve aiming. | Source-confirmed conflict path; physical reproduction pending. |
| A07 | `app.js` calls `game.tap` on pointer-up; `rhythm.js`, `orbit.js`, and `stack.js` use tap for their timing action. `gestures.js` accepts taps under 500ms. | Touch judgments include how long the finger was down. A 100ms hold can shift a rhythm judgment past its 85ms perfect window. Use explicit press timing for those games, preserving release-based aims and preventing duplicate actions. | Source-confirmed path; device latency not measured. |
| A08 | `app.js`, `finish/setState/frame`; `cabinet.js`, `finish/frame`. Finishing immediately opens a blurred overlay; cabinet update/particles require active state. | Final actions can be obscured and newly emitted effects can freeze. Separate finishing presentation from running simulation, with one result event and interrupt-safe cleanup. | Source-confirmed lifecycle; actual visibility pending. |
| A09 | `app.js`, `stepCountdown`: three 350ms steps plus 180ms GO; used on every start/retry and skippable. | About 1.23s of nominal restart ceremony also applies to untimed board games. Adopt per-game start policy and instant retry where appropriate. | Source-confirmed timing. |
| A10 | `app.js`, `bests=new Map()`; index label `VISIT BEST`. | Records are intentionally session-only today. Persistent local bests could strengthen return motivation after core polish; this is a product enhancement, not a storage defect. | Source-confirmed. |
| A11 | `style.css`: DOM font stack begins Inter/Helvetica Neue. `shared.js`, `text`: Arial canvas text. | Mixed typography can reduce cohesion. Choose a consistently available text system and measure rendered text. | Source-confirmed fonts; perceptual mismatch unverified. |
| A12 | `style.css` reduced-motion query only affects CSS animations/transitions. Canvas games advance their own effects. | Canvas effects need an explicit reduced-motion path if more movement/shake is added. | Source-confirmed coverage gap. |
| A13 | `app.js`, `frame`: dt clamped at 35ms. `rhythm.js` accumulates dt for its clock and dispatches beat cues during ticks. | Under sustained slow frames, game time can lag wall/audio time. Assess intended time semantics, especially rhythm. Do not remove dt clamps globally without preserving collision safety. | Source-confirmed design; audible drift/performance issue unverified. |
| A14 | `tests/game-harness.mjs`: canvas test double, approximate text measurement, fixed HUD heights of 110/115px; no real DOM layout. | Passing render-contract tests cannot catch actual text wrap, occlusion, pointer capture conflicts, physical latency, or frame rate. Add browser/device evidence. | Source-confirmed test limitation. |
| A15 | `registry.js` + `games/expansion.js`: 34 entries; index meta description still says nineteen. | Small metadata inconsistency; fix alongside shell editorial cleanup, with count derived from authoritative registry where practical. | Source-confirmed. |
| A16 | `app.js` implements play/pause/browse/restart buttons in `.accessible-controls`; CSS visually hides these except on focus. Sound settings remains prominently visible. | Common touch actions depend on learned gestures. Assess a compact visible pause and browse affordance while reducing less useful persistent chrome. | Source-confirmed visibility design; discoverability needs play-test. |

## Preserve what already works

- Shared lifecycle and factory contracts allow targeted changes rather than rewriting the application.
- Audio is centralised, has semantic events, persisted preferences, and stale-handle/sample safeguards.
- Feed gestures already distinguish central gameplay, the edge, and two-finger navigation.
- Safe areas and observed HUD dimensions are already used by the field system.
- Later games include authored/reachable content, survival safeguards, varying materials, particles, and several collision fixes. Do not describe the entire collection as lacking feedback or fairness.
- The baseline's 55 tests passed. Existing tests include meaningful input-driven outcomes and rules, not merely syntax. Their specific limits should prompt additional evidence, not removal.

## Additional high-value investigations

1. Compare ready/playing/finished field dimensions and find jumps caused by HUD height changes.
2. Check the rightmost playable targets against the 28px feed rail. A visual board bound alone does not guarantee input ownership.
3. On short phones, measure actual expansion board cell sizes and rendered label sizes after cabinet scaling. Do not report sizes derived from nominal logical coordinates as CSS pixels.
4. Listen to action/music balance, loop joins, and repeated effects on phone speakers and headphones. Current volume being higher is not evidence of a balanced mix.
5. Test physical press timing, drag cancellation, and post-pause input across families.
6. Examine the score label and current-state indicator in strategy games; avoid a prominent zero score when the meaningful information is the current disc count or turn.
7. Review the first 10 seconds and the last 2 seconds of a round. These are frequent weak points even if the middle plays well.

## What this audit does not establish

It does not establish production parity, current device layout, measured performance, sound quality, player retention, preference over commercial games, or that every one of the 34 games has received detailed gameplay review. `catalogue.csv` is a complete review queue; unverified focus items there are proposals rather than diagnosed defects.
