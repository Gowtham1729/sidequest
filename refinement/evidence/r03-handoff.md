# R03 implementation handoff — 7 September 2026

- Ticket: Add only the motion and finishing support needed by the pilots.
- Base: `4563cf1` (R02 revision committed at the owner's request).
- Candidate: uncommitted; source fingerprint `71a0462e9fa8fde7f268c3ea320205ee636604ffd58976785edbee5bbf855606`.
- Writer: coordinator owns app.js, shared.js, cabinet.js, new motion.js, focused tests and R03 evidence/state. Read-only independent review by `/root/r03_review`.
- Scope: shared lifecycle and opt-in helpers. No production game was migrated, no rules changed, and no new product buttons/UI controls were added. Fixture assets stay outside dist.

## Consumer contract for R04–R06

Legacy `api.finish(title, subtitle, score, cue)` continues to show the result immediately.

To let a terminal visual resolve, a game must return `present(dt, progress)` and call:

```js
api.finish(title, subtitle, score, cue, {duration: 0.45});
```

- Seconds are finite and clamped to 0–0.6. Missing/invalid durations or a missing present callback use the immediate legacy path.
- Commit authoritative game state and report score with `api.score` before finish, as existing games do. Existing finalScore/best semantics are preserved.
- The first finish fixes the outcome and emits its cue once. Further score/finish calls are ignored after the terminal event. Retired instances cannot update a replacement's score/outcome.
- Shell disables gameplay input and stops calling tick entirely, including tick(0), for opted-in terminal games. It calls only present with presentation delta and normalized progress. Draw the whole scene there; do not advance rules, physics, random simulation draws or score.
- On pause, modal or feed drag, present receives dt=0. Hidden documents receive no render call. Resume continues the ending, never gameplay. Completed endings remain present(0,1) until replacement; final artwork survives resize/redraw.
- Tap/Space during finishing retries via the existing start flow. R restarts. Retry/switch invokes optional `cancelPresentation('replace')` before destroy. Natural completion retains the bounded final display state; it does not call cancelPresentation.
- Reduced motion is exposed as live getters `api.reducedMotion`, `surface(...).view.reducedMotion`, and `cabinet(...).reducedMotion`. No media listeners are installed. Reduced endings start at progress=1 and reveal results after at most 0.08 presentation seconds. A live preference change settles on the next frame.
- Opted-in replay recreates the game instance, retiring old API callbacks. Unmigrated games retain their existing restart path.

`motion.js` adds frame-driven named scalar transitions (`createMotion`, `to`, `tick`, `value`, `clear`) plus lerp/easing. Default 32 tracks, maximum 64, bounded durations, no timers or random draws. Feed dt=0 to freeze; clear on start/destroy; use a reducedMotion getter to settle immediately. Resizing should change draw mapping rather than authoritative coordinates.

Cabinet consumers may call `q.finish(title, subtitle, win, {duration})`, expose a separate game-level `present` method calling `q.present(dt, draw)`, and use `q.cancelPresentation()` to clear particles/notices. q.present never updates elapsed, rules, score or game sounds. Games decide how to suppress/de-emphasize their own decorative effects under reduced motion.

## Checks and review

| Check | Result | Evidence and limits |
| --- | --- | --- |
| Syntax, inventory, full suite | pass | `r03-checkpoint-final`: 81/81 tests; no game IDs or hosting identity changes |
| Targeted lifecycle | pass | 10 scenarios in tests/motion-lifecycle.test.mjs, including terminal tick call counts before/after reveal, once-only cue/score, pause/sheet/background, retry, switch, retired callbacks, bounded durations, reduced motion, bounded transitions and cabinet isolation |
| Independent code review | pass after repair | `/root/r03_review` found terminal tick(0) resuming after reveal; retained presentation ownership fixed it. Reviewer reran 10 scenarios and passed. Final tiny follow-up snaps initial reduced-motion progress to 1; covered by tests and browser injected-preference check, not a separate reviewer pass. |
| Real-browser fixture | partial visual evidence | Chrome 152 on macOS, emulated 390×844 and 320×568. In-page fixture runs actual app shell and canvas surface. Manual frames inspected in conversation show progress while result overlay is hidden, then result reveal. `r03-browser/native-frame-trace.json` records native RAF progress across 0.6 seconds, fixed simulation/score and exactly one dispatched cue. |
| Reduced motion in browser | pass for injected preference | `r03-browser/reduced-motion-trace.json`: first progress=1; final after .08s, fixed score, one cue. matchMedia result was injected in this test page; no OS preference/CSS claim. |
| Device/audio/player | unverified | Audio output deliberately stubbed in fixture; cue dispatch only. No physical phone or listening evidence. |

Native-frame trace and normal-motion screenshots came from fingerprint `5fbbd378bd51d85500e226d27253992c6fa363057dac4054c50cb1b1e9f16b36`. The final fingerprint adds only immediate reduced-motion settling on the initial present call and its test; the reduced-motion browser trace was obtained against the final source.

Fixture screenshot caveat: with its test-controlled RAF stopped, a native ResizeObserver can clear the canvas before another manual frame. Two initial captures were blank for that reason; after an explicit redraw, visible 9% and 42% frames were inspected. Native RAF run completed normally. This is a fixture scheduling limitation, not evidence of a production blank screen. Screenshots remain inline in the conversation; full archived screenshot/motion matrix and independent pixel review are still outstanding.

## State / next action

R03 is implemented, with code pass and partial browser evidence. Visual gate remains unverified pending full review; do not certify pilot quality from infrastructure tests. R02 is committed; the owner authorized moving on but that does not fabricate its remaining device/visual evidence.

Next: R04 Stack consumes the contract for overhang fall/settle/camera and a readable miss, preserving overlap/tolerance/scoring/speed. R05 and R06 consume it separately. Review pilot motion with real captures and hardware under their own gates. Shared-file ownership is released after this handoff.

Working tree is runnable. R03 is not committed, pushed or deployed; hosting identity unchanged.
