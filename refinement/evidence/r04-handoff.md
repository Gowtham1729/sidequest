# R04 Stack handoff — 7 September 2026

- Base: `6932caf` (R03 committed and pushed to origin/main at the owner's request; push also included R02 `4563cf1`).
- Candidate: uncommitted, final fingerprint `0fc046faf8586e24f5ca61612b346e1f317c8c3b5ac6c08f813fcd1a7b33fd1f`.
- Ownership: coordinator wrote only dist/games/stack.js plus evidence/state; delegated tests/stack-refinement.test.mjs to /root/r03_review, which subsequently performed a read-only source review. Coordinator added the final long-tower test. Shared runtime unchanged.

## Changes

- Overlap is committed and scored immediately on the existing press/tap/action path. Cut-off portions are snapshotted and fall away independently, with at most eight pieces retained.
- Placed blocks settle for 120ms. New moving blocks remain immediately playable; there is no animation lock or extra input queue.
- Camera follows tower growth over 200ms. Blocks have absolute levels so dropping old blocks from the 80-block store does not move the remaining tower. One named camera track avoids transition-cache eviction; settle ages live on bounded blocks.
- Consistent top/side lighting, small edge highlights and a contact shadow improve block definition. Tower anchor leaves room below the active stack. Clipping protects the HUD.
- Perfect streaks use restrained count feedback and the existing semantic pitch ladder. Ordinary placements retain their quieter place cue; no particles or shake added.
- Complete miss uses R03's 0.5s finishing phase. The failed block stays visible and falls before the result appears. Under reduced motion, it stays at the failed placement while R03 reveals the result promptly.
- Cancel/restart/destroy clear all presentation state. No wall-clock timers, new listeners, independent RAF loops, random cosmetic draws or per-game audio engines.

Preserved verbatim overlapBlock behavior: inclusive six-unit perfect tolerance, overlap calculation and miss condition. Alternating direction, travel boundaries, 105+height*7 speed capped at 235, score and existing perfect-sound pitch ladder are unchanged.

## Evidence

| Check | Status | Evidence / limitation |
| --- | --- | --- |
| Full code checkpoint | pass | r04-checkpoint-final: 88/88 tests, 48 JavaScript syntax checks |
| Stack regression | pass | Seven focused tests: tolerance; original travel speeds; immediate perfect/partial score; rapid taps; once-only bounded miss; pause cosmetics; reduced ending; restart/destroy; 100-perfect tower and resize beyond storage capacity |
| Source review | pass | /root/r03_review inspected the game and ran the then-current 87-test suite. No concrete blockers. Final added long-tower test brings suite to 88. Reviewer also authored the six initial focused tests; implementation review is independent of the game writer, test authorship is not. |
| Browser visual | partial; no defects found in the exercised paths | Chrome DevTools against the current local `dist/` at 390×844 and 320×568 emulated touch. Verified boot, phase-stable HUD, no horizontal overflow, one-tap scoring, hold-to-pause/resume, right-edge game switch, miss finishing phase and result reveal, retry reset, and final `Tap anywhere to retry` copy after cache-busting reload. This is synthetic browser input and selected viewport evidence; it does not establish physical touch, complete motion captures, or device-safe-area behavior. |
| Reference observations | unverified | No external gameplay reference observation completed in this turn. Do not infer reference parity. |
| Real-device smoke | limited pass, owner-reported | Pixel 8a: height increments to 1, tapping the result retries, clipping is fine, and behavior works as described. Report received before R05 implementation, on the R04 local candidate. |
| Listening, performance, broader player acceptance | unverified | No explicit listening or performance report, or broader player study. |

## Reproduction and next action

Serve the repository root with `python3 -m http.server 4173`. Use `/refinement/evidence/r04-browser/fixture.html?baseline` for the immutable pre-R04 Stack module and the same URL without `?baseline` for the candidate. The fixture uses the actual shell and game factory with a test-controlled RAF and stubbed audio dispatch. It is outside dist and is not shipped.

After layout settles, run `r04.begin(); r04.advance(66/105); r04.tap(); r04.tap(); r04.advance(.06)` for a perfect placement followed by a right overhang. Call `r04.game.tick(0)` after a ResizeObserver redraw if the manually stopped fixture clock leaves a cleared canvas. Use the same input schedule for both variants. Additional immediate taps produce a left cut, then a miss. Candidate `present(dt, progress)` can provide fixed ending frames; separately run native live gameplay to assess actual motion and touch behavior. Controlled frame captures are not latency measurements.

The earlier browser comparison was blocked by an account usage-limit message. A later Chrome DevTools pass was available and found no defect in the exercised paths. Full motion comparison, reduced-motion browser review, tall-tower visual inspection and phone play tests remain open. The browser pass used the current local source and did not bypass browser controls.

R04 is implemented, not accepted: full visual and device gates remain open. The owner confirmed the short Pixel 8a touch/retry/clipping check; do not request that same smoke check again. Listening and broader performance/player evidence remain unverified. Do not declare flagship acceptance or propagate through the catalogue yet. R04 is not committed/pushed/deployed.
