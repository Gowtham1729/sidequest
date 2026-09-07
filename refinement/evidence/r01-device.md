# R01 device evidence record

Recorded 6 September 2026. Human device test by the project owner on personal hardware,
against the LAN-served working tree (commit `df98c09`, "Give game input explicit ownership
and reliable timing (R01)"; `dist/` + `tests/` identical to checkpoint fingerprint
`78a3170e4f81230d06a1c9bb70d62799013b33a30348ec440be6151167f813b4`).

## Environment

- Device: Google Pixel 8a (physical phone, real touch)
- OS: Android 17 (as reported by tester)
- Browser: Chrome (version not recorded)
- Served from: `http://192.168.1.9:8901` (`python3 -m http.server --directory dist` on the dev Mac, same Wi-Fi)
- Viewport CSS px: not recorded

## Scenarios and results

All four R01 acceptance scenarios were tried by the tester; every one worked perfectly:

| # | Scenario (from R01 acceptance) | Result reported |
| --- | --- | --- |
| 1 | Timing-game press judged once (Stack tap → instant drop; hold → pause, no extra block) | pass |
| 2 | Held Golf aim (~2 s) → no pause, no fire; release → exactly one putt | pass |
| 3 | Centre swipes stay in games; edge and two-finger feed behavior deliberate | pass |
| 4 | Cancel, pause, second finger, background and restart leave no stale gesture (incl. lock-screen interrupt mid-aim → clean pause, tap resumes, no phantom shot) | pass |

## What this record does not prove

- Single short session on one device/OS/browser; no QA-matrix viewport coverage, no iPhone/Safari check.
- No separate audio-listening note was given and none is claimed; no audio issues were reported.
- No frame-pacing, loading, or thermal measurements.
- Player-acceptance observations (first-use understanding, retry motivation) were not collected; the pilots still owe those gates.
