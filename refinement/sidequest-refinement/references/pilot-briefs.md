# Three flagship briefs

Implement in the current stack first. Shared inputs/layout/finishing support precede integration, but do not build speculative systems for games outside the assigned slice. Specific motion durations are starting tuning ranges from the quality standard.

## Stack: precision with weight

**Player promise:** one exact tap produces a satisfying placement whose quality is obvious.

**Art direction:** clean, substantial blocks with one consistent light direction, legible top/side faces, subtle contact shadow, and a calm background. Retain the existing spatial character. Depth should make alignment clearer.

**Own:** `dist/games/stack.js` and focused Stack tests. Shared-file changes go to the coordinator. Preserve overlap tolerance, score, alternating movement, and speed curve initially.

**Implement:**

1. Accept timing on the chosen press event once; keep keyboard equivalence.
2. Snapshot placement and overhang at input time. Animate the cut-off portion falling away; successful overlap becomes the authoritative new top immediately according to existing rules.
3. Settle the placed block; ease camera framing as tower height changes. Keep the next placement readable and responsive.
4. Show perfect streak feedback with restrained increasing sound/colour emphasis using existing semantic audio events. Ordinary placements stay quieter.
5. On a miss, visibly show the failed placement before the result UI; retry starts rapidly.

**Reject:** particle showers covering the alignment edge; screen shake on every placement; simulated falling altering overlap; lost inputs while the camera moves; object jump on ready/play transition.

**Required scenarios:** perfect hit, small left overhang, small right overhang, complete miss, five perfect placements, long tower/camera movement, press-and-hold, rapid repeated input, pause in a settle, restart during a finish, switch game mid-effect, reduced motion. Demonstrate one action → one placement and unchanged `overlapBlock` outcomes.

**Evidence:** matching baseline/candidate clips or permitted frame sequences, small/default/large phone captures, real-phone press feel, code tests. Report any difficulty changes separately.

## 2048: a coherent tactile board

**Player promise:** every swipe has a clear path, readable arithmetic, and a quick resolved state.

**Art direction:** square tiles with clear numeral hierarchy and a restrained surface treatment. Value tiers should remain legible; animation and spacing carry much of the character. No idle animation competing with reading.

**Own:** `dist/games/merge.js` and focused merge/presentation tests. Preserve `mergeLine`, `moveBoard`, spawn distribution, and scoring.

**Implement:**

1. Use a square board; respect safe UI and reachable right-edge cells. Gaps belong to a consistent scale and remain visually even after rounding.
2. Track tile origins/destinations and merge identities. Draw travel before resolving the displayed merged value; authoritative logic still merges each source tile at most once per move.
3. Sequence travel, short merge emphasis, then new-tile reveal. Accept at most one buffered next direction if buffering is needed. Blocked swipes give a small local response without spawning a tile or changing score.
4. Make higher values readable, including four-digit values. Remove redundant instructions during established play.
5. Finish only after the last legal move is readable. Retry is immediate; reduced motion keeps outcomes clear.

**Reject:** stretching cells; crossfading the entire board instead of showing paths; delaying every swipe behind a long spring; merging an already merged tile again; altering spawn probability for nicer captures.

**Required rule examples:** `[2,2,2,2] → [4,4,0,0]` earns 8; `[2,2,4,0] → [4,4,0,0]` earns 4 for that move; a blocked move leaves state and score unchanged and spawns nothing. Test all four directions, rapid alternating swipes, loss, 2048 victory, resize mid-transition, backgrounding, restart, game switch, and reduced motion.

**Evidence:** deterministic fixture states for visual comparison, actual input-driven tests, and rendered cell dimensions. Any debug fixture mechanism is local/test-only, does not alter ordinary random play, and must not become a visible production control.

## Pocket Golf: controlled aim and a convincing miniature space

**Player promise:** the strength and direction of a putt are understandable before release, and its physical outcome feels fair.

**Art direction:** a composed miniature course with a clear green, solid rails, readable ball and cup, consistent contact shadows, and restrained depth. Keep the top-down game readable; do the first refinement in 2D/2.5D. Real 3D is not required.

**Own:** `dist/games/golf.js` and focused Golf tests. Preserve all five authored courses, stroke budget, collision rules, and existing aim mapping initially.

**Implement:**

1. Prevent global hold-to-pause from stealing an active aim. Show power and direction beside the aim, positioned away from finger occlusion.
2. Visually distinguish aim, release, moving, settling, cup capture, and next-hole states. Invalid/repeated releases never create an extra stroke.
3. Improve rail/ball/cup readability and synchronise contact/cup sound. Add a short visible sink and hole transition that does not advance physics or allow another shot.
4. Remove duplicated prose; make hole and remaining strokes easy to read.
5. Ensure the final hole's sink completes before the result presentation. Fast retry must cancel all old effects and restore the first course.

**Reject:** decorative perspective that makes aim inaccurate; changed physics hidden in an art pass; long camera orbit between putts; ball disappearing without an understandable capture; a trail that obscures the rail or cup.

**Required scenarios:** stationary aim held for 1s; light putt; hard putt; bank off each rail orientation; cancelled/out-of-bounds drag; capture near speed threshold; all five courses; exhausted stroke budget; last-hole win; resize/rotate while aiming; pause while rolling; switch during sink.

**Evidence:** same courses and intended shots before/after, frame sequence for cup capture, phone thumb-occlusion check, sound listening note, physics regression results.

## Shared dependency: finishing presentation

The current shell stops simulation and displays results immediately. Add a bounded presentation phase or equivalent explicit contract only as needed. Core requirements: outcome and final score emitted once; gameplay input disabled after the terminal event; final visual/audio cue has room to resolve; presentation can continue without advancing simulation; skip/retry cancels cleanly; no late effect leaks into another game. Preserve behaviour by default for games not yet migrated. Do not tell each game to invent its own wall-clock timers.

## Later 3D experiment decision

After these pilots pass, optionally compare one fixed-camera 3D Golf hole against its refined existing version. Hold rules and shot setup constant. Compare readability, aim confidence, startup time, frame pacing, payload, battery/heat observations, and which version players voluntarily choose. Continue only if the spatial treatment improves the actual game enough to justify its measured costs. This is a separate approved scope, not part of closing the current pilot tickets.
