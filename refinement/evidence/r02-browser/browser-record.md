# R02 browser verification record

Recorded 7 September 2026. Real-browser evidence through the user-approved Chrome
DevTools control route. Local server: `python3 -m http.server 8901 --directory dist`
(working tree, uncommitted R02 changes on top of `df98c09`). Baselines in
`refinement/evidence/r02-browser/baseline-*.png` were captured on the pre-change tree
at the start of this session and are immutable.

## Environment

- Browser: Chrome 152.0.0.0 (macOS host), automated via Chrome DevTools integration.
- Viewports (emulated): 390×844 @ DPR 3 (mobile + touch), 320×568 @ DPR 3 (mobile + touch),
  1440×900 @ DPR 1 (desktop).
- In-page instrumentation (test-only, page-session only, no repo files changed): a
  `fillText` wrapper recording drawn canvas text, synthetic PointerEvents through the
  real app handlers, and one diagnostic golf-factory wrapper recording game-level
  input calls.

## Baseline (pre-change tree, 390×844)

| Phase | top-hud | bottom-hud | Note |
| --- | --- | --- | --- |
| ready (Stack) | 114 | 124 | roomy paddings |
| countdown | 114 | 124 | |
| playing | 93 | 97 | compact paddings + smaller title |
| paused | 114 | 124 | jumps back: pause/resume moves the field twice |

A ready→playing transition changed total HUD height by 48 CSS px (~10% of the
viewport). A different game's ready screen measured 114/144 — HUD height also varies
per game with hint length. Both effects move the game field under a live session.

## Candidate results (post-change tree)

HUD heights are identical across ready/countdown/playing/paused/finished within each
game session, at every measured viewport:

| Viewport / game | ready | countdown | playing | paused | finished |
| --- | --- | --- | --- | --- | --- |
| 390×844 Stack | 93 / 99 | 93 / 99 | 93 / 99 | 93 / 99 | (same rules; forced at 320 instead) |
| 320×568 Stack | 91 / 99 | 91 / 99 | 91 / 99 | — | 91 / 99 |
| 320×568 Golf | — | — | 91 / 137 | 91 / 137 | — |
| 1440×900 Golf | 136 / 150 | — | 136 / 150 | — | — |
| 430×932 Crossy | 93 / 119 | 93 / 119 | 93 / 119 | — | — |
| 844×390 Stack | 123 / 98 | 123 / 98 | 123 / 98 | — | — |

Countdown shares the ready HUD rules by construction (the only countdown CSS touches
the absolute, pointer-events-none overlays), and was additionally measured directly
at 390×844, 320×568, 430×932, and 844×390. The ⏸/⊞ buttons render 44px at every
viewport (an earlier 40px short-viewport override was removed after review; buttons
are always rendered so the uniform size keeps every phase stable).

Golf's taller bottom HUD (137 at 320px) is content-driven and session-stable: its
title+category wraps to two lines and its two-line instruction is space-reserved while
hidden. Per-game heights still differ (each game mounts fresh under its own HUD), but
no ready→play→pause→resume transition moves the field anymore.

| # | Scenario | Input | Result |
| --- | --- | --- | --- |
| 1 | Phase-stable geometry | measured `offsetHeight` per phase (table above) | Δ=0 everywhere within a session |
| 2 | Compact pause/browse | trusted mouse clicks on `#hud-pause` / `#hud-games` | Pause→paused (glyph ⏸→▶), click again→playing; browse opens the lineup and pauses. Only ⏸ is ever disabled (outside playing/paused); ⊞ stays enabled in every phase. |
| 3 | Mouse-equivalent HUD controls | trusted clicks (see 2) | Initially FAILED: the arcade `pointerdown` handler's `preventDefault()` suppressed mouse clicks on the new buttons. Fixed by marking them `data-hud-control` and excluding them from gameplay/feed capture (same pattern as the audio chip). Re-verified passing. Touch path unaffected throughout. |
| 4 | Entry-animation input mapping | instrumented golf factory; identical client press mid-animation (scene translateY +25.9px in flight) vs settled | Game received byte-identical coordinates `(200, 410.3)` both times. Without the fix the mid-flight press would have read ~27px off, fabricating drag vectors from stationary holds. |
| 5 | Feed-rail ownership follows the rail | desktop 1440×900 (rail renders 38px): press at width−35 vs width−45 during golf | width−35 → feed-owned (no aim, no hold feedback); width−45 → gameplay (aim starts, POWER footer). The old fixed 28px threshold would have misclassified the 28–38px band. |
| 6 | Rightmost-cell reachability | taps on the rightmost column of Mines (clientX 330, rail starts 362) and Four in a Row at 390×844 | Mines revealed cells ("24 safe squares opened"); Four dropped the disc (CPU replied). 32px clearance to the rail. |
| 7 | Hint single-line check | `gesture-hint` height per phase at 320px, incl. the 52-char drag hint and 47-char paused hint | 18px (one line) everywhere — no copy shortening or clamping needed. |
| 8 | Redundant prose removal | playing screenshots | Bottom HUD shows title + count only; instruction and category hidden with space reserved. |
| 9 | Help copy | DOM read | "Pause" entry describes button / P / hold-except-aiming. |
| 10 | Meta description | DOM read | "34 games. An endless…" derived from the registry at boot. |
| 11 | Console | DevTools console list | Zero errors. One pre-existing warning (deprecated meta). One harness-caused error observed mid-session (synthetic KeyboardEvent dispatched on `document`, which has no `closest`); hardened the app keydown handler with `?.` and re-verified clean. |

## Artifacts (this directory)

- `baseline-ready-390x844.png`, `baseline-playing-390x844.png` — pre-change HUD (2 files, immutable).
- `candidate-ready-390x844.png` — compact HUD with dimmed ⏸ and enabled ⊞ flanking the score.
- `candidate-playing-390x844.png` — enabled ⏸/⊞; bottom HUD reduced to title + count.
- `candidate-paused-390x844.png` — ▶ glyph; geometry unchanged.
- `candidate-lineup-390x844.png` — lineup opened from the ⊞ button.
- `candidate-playing-320x568.png`, `candidate-golf-playing-320x568.png`, `candidate-finished-320x568.png` — small-viewport matrix coverage.
- `candidate-ready-430x932.png` (Crossy playing), `candidate-playing-844x390.png` (Stack playing) — remaining matrix viewports, pixel-inspected by the implementer: HUD readable, 44px buttons visible, game renders correctly at both.

## Findings and open points

- **F1 (R01 handoff) is closed by this ticket**: `point()` now maps every press to the
  settled scene geometry (scenario 4). The entry animation itself is unchanged.
- **Per-game HUD height variation is preserved, deliberately**: fix scope is
  within-session phase stability. A follow-up could keep long titles/instructions to
  one line, but that trades readability and is not required by R02 acceptance.
- **Disabled ⏸ in non-playing phases is a judgment call**: it teaches the control
  location before play at the cost of one dimmed circle on the ready screen. ⊞ stays
  enabled everywhere for discoverable browse. Kept; reviewer accepted the behavior.
- Real-device, audio-listening, and player gates remain unverified (no physical phone
  or human player this session). Desktop layout wider than 1440px was not inspected.
