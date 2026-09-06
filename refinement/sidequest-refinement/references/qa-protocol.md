# QA and evidence protocol

## Current limitation

Browser automation was blocked during kit preparation by unavailable admin-enforced policy verification, in both Chrome and the in-app browser. Restore approved access before browser QA. Do not replace that blocked control route with a hidden browser, proxy, alternate automation library, or screenshots fabricated from code. Offline source checks remain permitted. This kit contains no captured live gameplay.

## The four gates

| Gate | What it establishes | Evidence |
| --- | --- | --- |
| Code | Rules and lifecycle checks pass on the tested source. | Checkpoint summary, syntax/test logs, relevant input-driven regressions. |
| Visual | Layout, state hierarchy, and motion meet the ticket's criteria. | Real browser captures and inspected motion; exact scenario and viewport. |
| Device | Touch, sound, safe areas, frame pacing, and lifecycle work on actual hardware. | Named device/browser/OS, reproduction, observations/traces, listening note. |
| Player | Unfamiliar humans understand the core action and outcome; the pilot feels worth retrying. | Consented, non-sensitive observation notes, participant count, tasks, and actual responses. |

Do not infer a gate from another. A model can review supplied real-player notes but cannot manufacture participants, preferences, or device observations. Source-only infrastructure can have visual/player gates marked not-applicable with rationale; its consuming games still need those gates.

## Capture matrix

Use CSS viewport sizes, not assumed device identity:

- 320×568: short/small phone stress case.
- 390×844: default portrait composition.
- 430×932: large portrait.
- 844×390: landscape stress case; preserve usable play or provide an intentional, accessible orientation treatment if the product adopts one.
- 1440×900: desktop composition and keyboard access.

For each pilot, inspect ready, active early play, meaningful success, failure/win, pause, restart, help, and game switch. Capture all five sizes for layout; capture the decisive motion at default portrait and the smallest problematic size. Inspect reduced motion and increased browser text size; canvas text requires a deliberate readability strategy rather than relying on DOM text zoom.

For later game batches, every changed game needs ready/active/end at small and default portrait, plus affected exceptional states. Recheck all games at default portrait after shared layout/input changes; target expanded checks according to the change's reach. Avoid blindly repeating the entire matrix after unrelated copy corrections.

## Comparing before and after

Use the same game, viewport, state, action, and fixture/seed where possible. Retain immutable baseline captures. Record source fingerprints for both. A screenshot after a font loads cannot be compared fairly with a baseline taken before load.

Random games should use deterministic test fixtures in test-only code where practical. Do not monkeypatch production randomness merely to stage a flattering result. If exact state matching is unavailable, label the difference and compare geometry rather than game outcomes.

For each capture or clip, record:

```text
ticket / game / source revision and fingerprint
environment: browser + version, OS, viewport CSS px, DPR
state: ready / playing / success / failure / paused / etc.
fixture or initial conditions; input sequence
artifact path and timestamp
observations; what this artifact cannot prove
```

Use an actual recording where the approved tools support it. Otherwise use a sequence of real observed frames plus a timing trace and mark recording unavailable. Do not label a reconstructed illustration as a screenshot. Keep captures outside `dist/`.

## Interaction scenarios across families

1. Tap/press: quick press, 100ms press, 1s hold, rapid presses. Exactly one expected action per gesture; pause only when intended.
2. Drag/release: start, hold still, move, leave playfield, release; cancel via pointer cancel, background, and second finger. No ghost launch.
3. Swipes: short, long, diagonal, fast repeated, central versus edge. Central game gestures do not navigate the feed.
4. Board selection: corners, edge cells, gaps, dense targets, selected/disabled state. No visible but unreachable target.
5. Lifecycle: pause while active, resume, restart during animation, switch during finish, background while music loads, resize while dragging. Score/timers remain valid; no stale sound/input.
6. Results: final action is visible, final score agrees with rules, retry is intentional, no double finish, next game loads cleanly.
7. Accessibility: keyboard navigation, visible focus, discoverable pause/browse/help, screen-reader announcement clarity for supported UI, mute, reduced motion, non-colour cues. Do not advertise full canvas-game screen-reader accessibility without validating the actual interaction model.

Use the pilot-specific scenarios in `pilot-briefs.md` as well.

## Device and performance checks

Use at least one real iPhone/Safari and one representative midrange Android/Chrome before claiming the final programme is ready for both. Record actual hardware rather than inventing a target model. One platform passing does not establish the other.

For action pilots and any game affected by new effects, play actively for 60 seconds or the longest available round, repeating if necessary. Capture frame pacing with appropriate permitted profiler tools. Report median/p95 frame interval and proportion over 33ms, device refresh rate, long tasks, and interruptions. Short scripted clicks are not a physical latency benchmark. Note thermal/battery behaviour qualitatively unless measured properly.

For loading, record cold/warm cache, connection profile, transferred bytes, and time to first usable play. Record music separately. Capture a source payload inventory using the checkpoint tool, but do not equate on-disk bytes with transferred/compressed bytes.

For cleanup, switch games 20 times, then repeat warm. Observe memory trend after ordinary garbage collection opportunities and deliberate cache limits; inspect voices/listeners/timers where tools expose them. Do not certify no leak from a single memory sample.

## Listening pass

Listen on phone speakers and headphones at a comfortable, consistent volume. Compare press/action, success, failure, and adjacent game transitions; listen through a loop join and one minute of repeated action. Record masking, harshness, clipping, repetition, and synchronization. If the agent has no audio listening modality, a human note is required; source inspection cannot establish a good mix.

## Small human study for the pilots

Ask five unfamiliar players to start each pilot and play freely for roughly two minutes. Explain neither the controls nor the intended design improvement first. Observe the first meaningful action, hesitation, accidental gestures, first failure explanation, and voluntary replay. Then ask: “What felt unclear?”, “Did anything respond differently from what you expected?”, and “Would you play another round?”

For a before/after preference comparison, counterbalance order and avoid identifying which build is newer. Treat five people as formative evidence only. Do not call a small preference result statistically significant. Store anonymous notes rather than unnecessary personal data.

## Reference inspection

The coordinator may inspect one or two mechanic-matched commercial references through official gameplay clips or legitimate access. Record source and timecode with transferable design observations. A mood board is useful for direction but does not certify implementation. Do not postpone useful source fixes indefinitely while collecting references.

## Release readiness

Run code checks on the integrated revision. Confirm the game registry and Site identity were preserved. Verify the applicable visual/device/player gates and unresolved issue list. A source edit after evidence collection invalidates affected evidence until rechecked; do not reuse an older PASS blindly.

Publication is a separate authorized step using the existing Sites workflow. Record intended source revision and terminal deployment success. Browser control being blocked is never evidence that the deployment failed or that another control route is permitted.
