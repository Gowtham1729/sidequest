# R01 browser verification record

Recorded 6 September 2026, ~23:16–23:30 local. This is real-browser evidence obtained
through the user-approved Chrome DevTools control route (previously blocked in a different
harness; access was explicitly authorized for this session). It supplements, and does not
replace, the offline code gate. Real-device, audio-listening, and player gates remain
unverified: no physical phone, speaker, or human player was involved.

## Environment

- Browser: Chrome 152.0.0.0 (macOS 10.15.7, Apple Silicon host), automated via Chrome DevTools integration.
- Viewports (emulated, mobile + touch): 390×844 @ DPR 3, and 320×568 @ DPR 3.
- Served from the working tree: `python3 -m http.server 8901 --directory dist` (log excerpt below).
- Source: uncommitted R01 changes on top of `f03bddc9403d115f3062e27e707bd94a5c7b93a7`.
  Served-source parity checked in page: `dist/app.js` contains `pressTiming(current().input)`,
  `holdPauses(current().input)`, `!g.pressed&&isTap`; `dist/gestures.js` exports the policy helpers.
- In-page instrumentation (test-only, page-session only, no repo files changed):
  `CanvasRenderingContext2D.prototype.fillText` wrapper recording drawn text into
  `window.__texts`, and a wrapped golf factory recording game-level input calls.

## Scenarios and results (all observed live in the real browser)

| # | Scenario | Input | Result |
| --- | --- | --- | --- |
| 1 | Registry/policy data | in-page `import('./registry.js')` | 34 games; press = stack, orbit, rhythm; drag = 19 pointer-owning games; default = 12. Matches design. |
| 2 | Stack press timing | synthetic pointer tap; trusted click tool; trusted Space | Drop fires on pointer-down (`score` 01 before release), release does not repeat (still 01), rapid presses one each (02, 03), Space one per press (01→02). Third press legitimately missed (game over fired once). |
| 3 | Stack hold-to-pause | synthetic press + 750 ms hold | Hold indicator visible at 250 ms; paused at 750 ms; no extra drop; release after pause does nothing. Press games keep hold-to-pause. |
| 4 | Golf held aim (acceptance) | synthetic press + 1100 ms hold, both viewports | Phase stays `playing` (no pause), hold indicator never arms, `20 STROKES LEFT` throughout (no fire), `POWER …% · release to putt` footer drawn every frame (aim alive). Screenshots captured mid-hold at both viewports. |
| 5 | Golf release exactly-once | synthetic pull + release, both viewports | One putt: 20 → `19 STROKES LEFT`, stable after settling. Instrumented call log: `pointerDown → pointerMove → pointerUp`, each once. |
| 6 | Feed ownership during play | synthetic centre swipe up | Stayed in Pocket Golf, playing; the swipe became a game putt (18 left), no navigation. |
| 7 | Edge swipe during play | synthetic swipe at x=380 (390 vw) and x=310 (320 vw) | Navigated to next game both times; feed rail ownership correct at both widths. |
| 8 | Two-finger swipe during play | synthetic two distinct pointer ids | Second finger claimed feed ownership (game canceled); navigation fired only after both fingers lifted; Minesweeper → Crossy. |
| 9 | Keyboard pause mid-aim | trusted `p` during a live golf aim | Paused; the still-held finger's release fired nothing; single tap resumed; a fresh aim then putt exactly once (19). |
| 10 | `pointercancel` mid-aim | synthetic pointercancel + late pointerup | No putt, no crash, still playing. |
| 11 | Background mid-aim | `window` blur event | Paused via backgroundPause; release fired nothing; stroke count unchanged. |
| 12 | Four in a Row (default policy) | synthetic press/hold/release | Press alone places nothing (still "YOUR TURN"); release-tap drops the disc ("THINKING…"); 750 ms hold pauses. Default games keep release-tap + hold-to-pause. |
| 13 | Hint text per policy | DOM read | Playing golf: "Edge swipe to switch · Two-finger swipe to browse". Playing Stack/Four: "Hold to pause · Edge swipe to switch". |
| 14 | Console | DevTools console list | No errors across the session; one pre-existing warning (`apple-mobile-web-app-capable` meta deprecated). Recorded music loops for stack/golf/mines fetched and played through the central engine without errors. |

## Artifacts (this directory)

- `stack-hold-pause-390x844.png` — Stack paused via 750 ms hold, hold-ring cleared.
- `golf-held-aim-1100ms-390x844.png` — Pocket Golf, pointer held 1.1 s mid-aim, still playing.
- `golf-after-release-one-putt-390x844.png` — same hole after release: one putt spent (19 left).
- `golf-held-aim-1100ms-320x568.png` — held-aim acceptance at the short-phone viewport.
- `golf-paused-via-keyboard-320x568.png` — drag-policy game paused via keyboard path.

## Findings

- **F1 (pre-existing, not introduced by R01): input during the scene entry animation maps
  through the animated transform.** `.scene.enter-next` runs a 300 ms `translateY(17%)`
  animation after every game switch; `point()` uses `arena.getBoundingClientRect()`, so a
  press dispatched inside that window produces shifted game coordinates. Observed live:
  the same client y mapped to view y 258 mid-animation vs 380 settled (~122 px shift at
  320×568). Human presses inside 300 ms of a switch are rare, but board games could select
  a wrong cell. Hand to R02 (transition/geometry scope: "ready-to-play transitions do not
  unexpectedly change collision geometry").
- **F2 (unreproduced one-off):** in the first small-viewport run, an aim press issued
  immediately after the countdown skip did not start a drag (footer stayed "Pull back
  anywhere", no putt). Not reproducible across 5+ subsequent runs at both viewports,
  including an instrumented identical-input rerun where `pointerDown` reached the game and
  the drag started. Most plausibly related to the F1 entry-animation window (the press was
  dispatched within ~300 ms of the game remount). Recorded as unverified, not closed.
- **F3 (automation observation, not an app defect):** this harness's trusted click gesture
  includes pointer travel (>62 px) that the app correctly classifies as a swipe; it
  navigated the feed in the ready phase. Real-user taps are not expected to travel like
  this. Synthetic PointerEvents (which run the real app handlers in the real browser) were
  used for precise gesture control; trusted keyboard input and real dialog-button clicks
  were used where they fit.
- **Known accepted gap (by design, owned by R02):** the 19 drag-policy games no longer
  offer touch hold-to-pause. Pause remains reachable without the hold gesture via
  keyboard P/Escape, the focus-revealed accessible pause control, and the always-visible
  sound chip (tapping it opens the audio sheet, which pauses the game) — so touch pause
  is undiscoverable rather than impossible. R02's "discoverable compact pause/browse
  access" must ship a visible, direct touch pause.

## What this record does not prove

- No physical phone: touch latency, safe-area insets on real hardware, haptics, thermal,
  frame pacing on device, and real-speaker listening remain unverified (device gate).
- No human player observations (player gate).
- Visual/layout quality beyond the captured states (R02 scope); the audio mix was not
  listened to by a human (R14 scope), though the engine ran without errors.
- The 844×390, 430×932, and 1440×900 viewports of the QA matrix were not exercised in
  this session (R02 should cover them for layout work).
