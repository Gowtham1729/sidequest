# Independent review — R01

- Ticket: R01 "Give game input explicit ownership and reliable timing"
- Reviewer/context independence: fresh subagent session (ses_f881dc39dffeIOKvjbM2SNxel8), no implementation involvement; all findings re-derived from source, tests, and reproduced checks.
- Base and candidate revisions/fingerprints: base `f03bddc9403d115f3062e27e707bd94a5c7b93a7`; candidate = uncommitted working tree. Reviewer recomputed SHA-256 for all 89 files in the first checkpoint manifest (`afa58fd93720d4496f9ede5a19f26718135061d4118f67de946455979301ec6b`) — byte-for-byte match at review time. A later test-only margin edit (resume-timer sleep 320→400 ms, reviewer's optional non-blocking suggestion) produced the final checkpoint `78a3170e4f81230d06a1c9bb70d62799013b33a30348ec440be6151167f813b4`, 62/62.
- Requirements reviewed: the four frozen R01 acceptance criteria; quality-standard §3 input constraints; write-path compliance; no gameplay-rule changes; test discrimination; honesty of the browser evidence record.
- Evidence actually inspected: full `git diff HEAD` and status; `dist/app.js`, `dist/gestures.js`, `dist/registry.js`, `dist/games/expansion.js`, both test files in full; dispatch-relevant parts of 16 game modules plus `shared.js`, `style.css`, `index.html`; backlog R01 entry, quality standard §3, source audit A06/A07/A16, QA protocol; `refinement/evidence/r01-browser/browser-record.md`; checkpoint summary. Independently ran the syntax loop and full suite (62/62 twice). Discrimination check: extracted the base revision read-only and ran the new tests against it — the golf-held-aim, Stack press-timing, Beat Drop press-timing, and policy-mapping tests fail on base; the default-policy, stale-gesture, and centre/edge tests pass on base (preservation guards). Screenshot files verified present at exact DPR-3 pixel dimensions; contents not viewable by the reviewer session (no image input).

## Verdicts

| Gate | Verdict | Evidence and rationale |
| --- | --- | --- |
| Code | pass | All four criteria traced in source by the reviewer; 62/62 tests and syntax reproduced; new tests demonstrably fail on base for exactly the acceptance scenarios; diff confined to authorized write paths; game rules untouched (registry/expansion diffs are original lines plus inserted `input:'…'` tokens). |
| Visual | not_applicable | R01 changes no rendering, layout, or motion; only gesture-hint/aria copy changes, DOM-verified in the browser record. Visual quality is R02 scope. |
| Device | unverified | Required gate. Browser evidence is Chrome 152 on macOS with emulated touch viewports; record itself states real-device, audio-listening, and player gates remain unverified. Missing required evidence blocks acceptance. |
| Player | not_applicable | Foundation input-semantics ticket; no player evidence claimed; record states no human player was involved. Consuming games still owe player gates later. |

## Primary findings

1. **F1 — 19 drag-policy games have no deliberate, discoverable touch pause (accepted, deferred to R02).** Medium severity, player capability tradeoff by design. Hold ≥550 ms does nothing (`app.js` hold branch is policy-scoped) and the visible HUD offers no pause control; touch pause remains reachable but undiscoverable (keyboard, focus-revealed accessible control, or the sound chip's sheet, which pauses). Recorded honestly in the browser record and pre-flagged by audit A16; R02's acceptance includes the compact visible pause. Repair acceptance: R02 ships a visible pause control during play that pauses any game without firing its release action, device-verified.
2. **F2 — new lifecycle tests have three brittleness risks (hypothesis; not demonstrated failing).** Low severity. Stack scenario couples to Stack's frozen speed tuning (`105+height*7`, ±6 px) via hand-tuned travel frames; rhythm scenario asserts exact score 102 at a computed clock; resume waits had a 40 ms margin over the 280 ms tap timer. Both reviewer suite runs passed; the resume margin was subsequently widened to 120 ms. Optional remaining hardening: derive the Stack travel schedule from the exported speed formula when R04 retunes Stack.

No third primary finding. Reviewer specifically checked and cleared: press-game finish-during-press, paused double-tap restart leak, tapTimer interplay, pointer capture, double-fire risk across all 34 games' handler combinations (none: `isTap` <12 px vs `swipeDirection` ≥16 px are mutually exclusive; the 12–16 px dead zone is pre-existing).

## Other findings

- Criterion 4 (no stale gesture) was largely already satisfied on base; R01's contribution is formalization via `clearHold` plus regression guards. Accurate to describe as preservation, not repair.
- Latent contract note: `app.js` runs `game.pointerDown` before the press-tap dispatch; a future press-policy game must not define `pointerDown` (none do; stack/orbit self-guard). The `gestures.js` policy comment covers this.
- Browser record cross-check: every scenario claim verifiable against source checks out; the pre-existing entry-animation input-geometry finding is real in source and correctly routed to R02; no overclaims found in the implementation summary.

## Decision

**Evidence pending.** The code gate passes outright (independent trace, reproduced checks, discriminating tests, clean diff). The required device gate is not satisfied: emulated-viewport browser evidence is not device evidence per the QA protocol, and the record says so. Nothing observed suggests the change is wrong; the required evidence type is absent.

**Single most useful next action:** run the four R01 acceptance scenarios on a physical phone (golf ≥1 s held aim → no pause/no fire, then one-putt release; Stack press timing + hold-pause; centre vs edge vs two-finger ownership; background/restart mid-aim cleanliness) and record it in the QA-protocol device format. The browser record's scenario list is a ready-made script.
