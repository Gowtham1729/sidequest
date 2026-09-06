# Sidequest quality standard v1

This is a proposed product standard for the refinement programme, not a claim that the existing build meets it. Numerical targets below are starting acceptance targets chosen for Sidequest, not universal scientific thresholds. Record exceptions with player evidence and a reason.

## Product and visual direction

Sidequest is a collection of small, immediately understandable games with satisfying physical response. Preserve quick entry, one-thumb play where the mechanic allows it, and easy discovery. The visual thesis is **a tactile pocket arcade**: crisp objects, purposeful depth, clear silhouettes, restrained interface decoration, and an environment that gives each game character.

The shell is the consistent host. A puzzle board, a sport, and an action scene need different compositions. Share interaction conventions and craftsmanship without giving every game an identical rounded container.

Keep the established Sidequest identity and individual accents unless the current ticket specifically refines them. Use stronger contrast and material definition before adding visual complexity. Geometry-based art is a valid final aesthetic when its proportions, lighting, edges, and motion are intentional.

## 1. Composition and geometry

- Define three layout families: `board` (stable cell shapes), `portrait-action` (stable gameplay coordinates/camera), and `scene` (environment can extend behind safe UI). These names describe design responsibilities, not a mandated implementation API.
- Square-cell games keep equal cell width and height, within one rendered CSS pixel of rounding error. Size the board from the smaller available dimension. Do not distort pieces to occupy spare height.
- Centre boards optically in their usable region. Give action scenes a camera composition that reveals upcoming hazards. Reserve hand space when fingers would obscure the target.
- Starting spacing tokens in CSS pixels: 4, 8, 12, 16, 24, 32. Recommended outer inset 16–24; board gaps 6–12 depending on cell size; related labels 4–8. These are defaults, not permission to force a small board into unusable geometry.
- Define a few interface corner roles (small control, surface, sheet). Game geometry chooses its own shape. Avoid unrelated radii for equivalent interface components.
- Safe areas constrain critical content and controls. Background/environment may extend farther. Keep the feed gesture rail outside gameplay targets, or reserve explicit inset/ownership so visible targets remain reachable.
- Do not shrink an entire interface to fit a short viewport. Reflow or simplify secondary information. Preserve touch size and the board's intended proportions.
- During `ready → playing`, HUD changes must not unexpectedly resize the collision world or jump the board. Measure both phases. Animate presentation or keep stable geometry.

## 2. Information hierarchy and typography

- During action, show only the game state needed now: usually score plus lives/time/turn. Branding, catalogue location, help prose, and preferences are secondary. Avoid duplicating instructions in shell and canvas.
- Show first-use hints where the action happens; retire them after demonstrated success and retain discoverable help. Do not require a help-sheet visit to understand the first interaction.
- Score semantics must suit the game. A running Reversi disc count is different from an end-of-round score; fewer moves is better in a sliding puzzle. Label the correct quantity.
- Use a deliberate, consistently available font strategy. Current DOM and canvas fonts differ; choose matching families/weights where practical and handle font loading before final text measurement. Do not add a network font dependency casually.
- Starting rendered web text sizes: 14–16px for regular game instructions, at least 12px for secondary metadata, 24–36px for important numeric state. Optical testing overrides these ranges; avoid shrinking useful text to make a layout pass.
- Keep numeric widths stable; avoid score changes moving adjacent controls. Maintain text contrast of at least 4.5:1 for ordinary text and 3:1 for large text as a web accessibility target. Assess game symbols separately against their surroundings; never use colour as the only essential distinction.
- Regular controls should aim for at least a 44×44 CSS-pixel hit region. Dense board cells may be smaller: maximise the board, avoid overlapping hit areas, and demonstrate accurate selection on a real small phone. Do not claim dense controls pass solely because their centres are mathematically separate.

## 3. Input and responsiveness

- Define per-game intent: press timing, release timing, drag aim, continuous steer, discrete swipe, or cell selection. Do not move every game to pointer-down indiscriminately.
- Timing/reflex games should judge the intended press timestamp. Drag-to-launch games should fire on deliberate release. A single touch must not produce both a press action and a second release action.
- Long-hold pause must not steal an active aim/steer gesture. Prefer a compact explicit pause control plus carefully scoped optional hold behaviour. Preserve feed navigation ownership.
- Input acknowledgment should appear on the next rendered frame where practical. A preliminary trace target is ≤50ms from dispatched event to visible feedback under healthy conditions; this is not a physical finger-to-photon claim. Measure physical latency separately when equipment allows it.
- Movement may animate after accepting an input. Make buffering policy explicit: for example, one pending direction in 2048, with no unbounded input queue. Animation locks must be short and predictable.
- Test drag outside the playfield, pointer cancellation, a second finger, interrupted gestures, and resume. No ghost shot, stuck steer, duplicate score, or surprise game switch.
- Touch, mouse, and keyboard use equivalent rules; controller support is outside this programme unless requested.

## 4. Motion and physical response

Every important interaction has an input cue, an intelligible action, and a resolved outcome. Spend animation on these transitions before ambient particles.

Starting timing ranges for tuning:

| Motion | Starting range | Constraint |
| --- | --- | --- |
| Press acknowledgment | 50–90ms | Must not delay the actual action. |
| Tile travel | 100–160ms | Show origin and destination; preserve rule order. |
| Merge/land settle | 80–140ms | Small displacement/scale; no layout reflow. |
| Camera adjustment | 160–240ms | Preserve visibility and precision. |
| Decisive result reveal | 250–600ms after final action | Let players see why they won/lost; allow fast retry when safe. |

- Use acceleration/deceleration consistent with the material: a falling disc accelerates, a UI sheet eases, a ball obeys its simulation. Do not apply the same spring to every motion.
- Authoritative board/rules state remains distinct from animated display state. A merge happens once even if its animation is interrupted. Keep random simulation draws separate from cosmetic randomness.
- Camera motion, score changes, sound, and effects should express the same event. Avoid stacked unsynchronised reactions.
- Use bounded particles and small local impact reactions. Full-screen shake is exceptional, brief, and disabled under reduced motion. Avoid rapid flashing and obscuring active targets.
- Reduced motion uses clearer state changes, outlines, and short fades where helpful. CSS media rules alone do not disable canvas animations; handle canvas explicitly.
- Decorative or finishing animation must be able to complete after simulation stops. Pause/backgrounding must not advance score, timers, or physics. This requires clear lifecycle semantics, not arbitrary extra timeouts.

## 5. Sound and optional haptics

- Keep the existing central audio engine, event profiles, volume/mute persistence, and lifecycle isolation. Games emit semantic events.
- Define an event hierarchy: small action, meaningful success, combo/milestone, danger, final outcome. Match timing and perceived intensity; avoid giving every action a victory sound.
- Listen to repeated actions for at least one minute. Remove irritating repetition, clipping, sudden loudness changes, and music masking the action cue. Inspect adjacent game switches too.
- Preserve immediate synthesized feedback when recorded assets have not loaded. Music must never gate play. Keep rhythm timing aligned to an appropriate clock; verify drift rather than assuming animation-frame timing is musically exact.
- Haptics are optional enhancements only where genuinely supported; do not promise browser/device coverage. No essential information depends on vibration or audio alone.

## 6. Rules, fairness, depth, and return motivation

- Keep a cause-of-failure visible long enough to understand. Hitboxes should agree with the visible object or provide a deliberate, documented forgiving margin.
- Difficulty changes must be purposeful. Test at introduction, intermediate play, and near the intended challenge ceiling. Random content needs reachable paths and recoverable situations where the rules promise them.
- Preserve deterministic rules while improving feel. Treat any new life count, scoring formula, aim assist, or difficulty curve as an explicit gameplay change with separate evidence.
- First-session targets for a small formative study: at least four of five unfamiliar players can perform the basic action within ten seconds of interactive readiness and explain the first loss. This is a directional study, not statistical validation.
- Observe voluntary retries, abandoned starts, mis-taps, and perceived fairness. Do not optimise session length using extra waits, forced rewards, streak pressure, or other friction.
- After the pilots are polished, consider persistent personal bests and a small authored challenge set. Accounts, currencies, missions, monetisation, leaderboards, and new games are outside the initial refinement scope.

## 7. Performance and reliability

- Target stable 60fps for action games on the chosen representative phones. At 60Hz, inspect frame intervals against the 16.7ms budget; report median, p95, and gaps over 33ms from an appropriate trace. Do not infer frame rate from requestAnimationFrame being present.
- Starting acceptance target: fewer than 1% of active-play frame intervals above 33ms during a 60-second sample, excluding documented loading/background transitions. Record device, OS, browser, refresh rate, and thermal conditions; adapt interpretation for higher-refresh screens.
- Investigate input stalls and long tasks over 50ms during play. A desktop CPU-throttled trace is diagnostic, not a replacement for phones.
- Capture cold and warm interactive readiness on a documented connection. Provisional cold-play target: ≤2.5s on the team's recorded mobile test profile. Music loads asynchronously. Define the profile before comparing builds; do not claim an unspecified network target was met.
- Record transferred bytes by game and on first load. Do not eager-load every game's music to hide first-play delay. Any material payload increase needs measured benefit and a budget decision.
- Switch games 20 times and repeat once warm: no accumulating voices, timers, listeners, or unbounded allocations. Distinguish deliberate caches and garbage collection noise from leaks.
- Preserve the existing test suite. Add focused rule/lifecycle tests for new failure modes, not tests that mirror implementation wording or merely assert that an effect function exists.

## 8. Completion and rejection

Four independent assessments are required for a flagship: `code`, `visual`, `device`, and `player`. Each is `unverified`, `pass`, `fail`, or `blocked`, with evidence and revision. A reviewer describes concrete remaining issues rather than assigning an unsupported “9/10”.

Reject a candidate if a common input fails, a visible target is unreachable, a terminal outcome is hidden, a required state clips, rules regress, a critical signal is unreadable, or purported proof is missing. Do not average these failures away with attractive screenshots.

Visual approval requires matching before/after scenarios and inspection of motion, not screenshots alone. Device approval requires actual phone checks. Player acceptance requires observed human play; agents cannot impersonate participants. Work may be code-complete while these gates remain pending.

Choose a preferred candidate only when it improves the stated player problem, introduces no material regression, and survives a fresh review. Preserve useful negative findings. “Highest quality” is an ongoing evidence standard, not a guarantee conferred by a prompt.

## External grounding

The UI adaptation principles are consistent with [Apple's game-design guidance](https://developer.apple.com/videos/play/wwdc2024/10085/). Web contrast targets are described by [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). The concrete Sidequest timings, performance budgets, and study thresholds above are our proposed targets and still need calibration.
