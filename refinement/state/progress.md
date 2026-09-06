# Programme progress

Updated 6 September 2026 (after R01 implementation). Coordinator owns this file and backlog.json.

## Established

- Direction: refine the current arcade; Stack, 2048, and Pocket Golf establish the flagship standard. No collection-wide 3D migration.
- Local source baseline at kit preparation: `6777c90a8e860f3882106620cf5cde141658b107` (not present in this checkout's history; kit note about the unpushed music-volume change applies). This session started from `f03bddc9403d115f3062e27e707bd94a5c7b93a7`.
- Registry has 34 entries. Complete catalogue mapping is in `refinement/sidequest-refinement/references/catalogue.csv`.
- **R01 is implemented** (uncommitted working tree; final checkpoint fingerprint `78a3170e4f81230d06a1c9bb70d62799013b33a30348ec440be6151167f813b4`, 62/62 tests). Per-game input policy: press = stack/orbit/rhythm (tap judged once on press), drag = 19 pointer-owning games (no hold-to-pause), 12 defaults unchanged. No gameplay rules changed. Code gate passed independent fresh-session review (`refinement/evidence/r01-review.md`); device gate unverified. Full handoff: `refinement/evidence/r01-handoff.md`.
- **Browser control is now available** through the user-approved Chrome DevTools integration (the earlier block was in a different harness). Real-browser verification of R01 was obtained this session (Chrome 152, macOS, emulated touch 390×844 and 320×568): `refinement/evidence/r01-browser/browser-record.md` + 5 screenshots. This route can serve R00's browser baseline and R02's visual gate; emulated viewports still do not satisfy the device gate.
- Source audit, standard, three implementation briefs, QA protocol, prompts, role/ownership rules, and 19-task backlog prepared.

## Blocked / unverified

- R01 device gate: no physical phone was available this session. The four acceptance scenarios are scripted and ready to run on hardware (see browser record); flip the gate when recorded.
- R00 remains `blocked` from kit preparation, but its browser-dependence is now resolvable: the coordinator should re-run R00's baseline captures through the approved Chrome DevTools route. Note the original baseline revision is not in this checkout; capture against the current revision and label it as such, or isolate the intended revision where authorized.
- Live deployment/source parity is still unknown. Do not label local audits as live-site audits.
- Real-device, audio listening, performance, and human-play gates are not yet passed anywhere in the programme.
- Known accepted gap (R02 must close): the 19 drag-policy games have no discoverable touch pause; also the help-dialog "Hold still" line in `index.html` is now inaccurate for those games.
- Pre-existing finding for R02: input during the ~300 ms scene entry animation after a game switch maps through the animated transform (observed ~122 px shift at 320×568).

## Exact next action

Start R02 ("Define compact HUD and stable layout families"; its dependency gate on R01 `implemented` is met), reading `refinement/evidence/r01-handoff.md` first. R02 priorities set by R01's handoff: (1) the visible compact pause control restoring discoverable touch pause for drag-policy games; (2) the help-dialog "Hold still" copy fix in `index.html`; (3) the entry-animation input-geometry finding; (4) the stale nineteen-game meta description already in R02's acceptance. R02's visual gate can now use the approved Chrome DevTools route; cover the remaining QA-matrix viewports (430×932, 844×390, 1440×900).

In parallel when hardware is available: run R01's four acceptance scenarios on a real phone per the QA-protocol device format and update R01's device gate; it is the only missing input to R01 acceptance.

Then R03 under its dependency gate, then the pilots. Do not mark R07 accepted or roll out speculative visuals across the catalogue while visual/device/player evidence is missing. If source-only pilot preparation is complete and browser access is again unavailable, leave a precise pending-evidence handoff rather than inventing approval.

## Ownership

R01's writer has finished and released its write paths (`dist/app.js`, `dist/gestures.js`, `dist/registry.js`, `dist/games/expansion.js`, `tests/gestures.test.mjs`, `tests/input-lifecycle.test.mjs`); all R01 changes are uncommitted in the working tree — the next coordinator decides commit strategy before R02 edits shared files. No implementation worker is currently assigned. The next coordinator assigns owners and evidence directories before edits. Preserve unrelated work if the checkout changed after this note.
