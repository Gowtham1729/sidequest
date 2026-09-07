# Programme progress

Updated 6 September 2026 (after R01 implementation). Coordinator owns this file and backlog.json.

## Established

- Direction: refine the current arcade; Stack, 2048, and Pocket Golf establish the flagship standard. No collection-wide 3D migration.
- Local source baseline at kit preparation: `6777c90a8e860f3882106620cf5cde141658b107` (not present in this checkout's history; kit note about the unpushed music-volume change applies). This session started from `f03bddc9403d115f3062e27e707bd94a5c7b93a7`.
- Registry has 34 entries. Complete catalogue mapping is in `refinement/sidequest-refinement/references/catalogue.csv`.
- **R01 is accepted** (commit `df98c09`, pushed to `origin/main`; final checkpoint fingerprint `78a3170e4f81230d06a1c9bb70d62799013b33a30348ec440be6151167f813b4`, 62/62 tests). Per-game input policy: press = stack/orbit/rhythm (tap judged once on press), drag = 19 pointer-owning games (no hold-to-pause), 12 defaults unchanged. No gameplay rules changed. Code gate passed independent fresh-session review (`refinement/evidence/r01-review.md`); **device gate passed** via a human test by the project owner on a Pixel 8a (Android 17, Chrome) covering all four acceptance scenarios (`refinement/evidence/r01-device.md`). No separate listening note; pilots still owe player gates. Full handoff: `refinement/evidence/r01-handoff.md`.
- **Browser control is now available** through the user-approved Chrome DevTools integration (the earlier block was in a different harness). Real-browser verification of R01 was obtained this session (Chrome 152, macOS, emulated touch 390×844 and 320×568): `refinement/evidence/r01-browser/browser-record.md` + 5 screenshots. This route can serve R00's browser baseline and R02's visual gate; emulated viewports still do not satisfy the device gate.
- Source audit, standard, three implementation briefs, QA protocol, prompts, role/ownership rules, and 19-task backlog prepared.
- **R02 is accepted** (uncommitted working tree; final checkpoint fingerprint `46aac3fa26cf45abff00b4bb0aedba60d2c296e004f092a1a748a25bd77f7ae2`, 70/70 tests). One phase-stable compact HUD (Δ=0 within-session at 5 viewports), visible 44px ⏸/⊞ buttons, rail-following feed ownership, settled-geometry pointer mapping, explicit layout-family tags with unchanged defaults, registry-derived catalogue description. No gameplay rules changed. Code gate passed twice-in reviewed; visual gate passed on follow-up review (CSS audit + measurement table + 11 artifacts; pixel inspection by the implementing session, independence limitation stated). Device/player unverified, out of required gates. Handoff: `refinement/evidence/r02-handoff.md`.

## Blocked / unverified

- R01 device gate: no physical phone was available this session. The four acceptance scenarios are scripted and ready to run on hardware (see browser record); flip the gate when recorded.
- R00 remains `blocked` from kit preparation, but its browser-dependence is now resolvable: the coordinator should re-run R00's baseline captures through the approved Chrome DevTools route. Note the original baseline revision is not in this checkout; capture against the current revision and label it as such, or isolate the intended revision where authorized.
- Live deployment/source parity is still unknown. Do not label local audits as live-site audits.
- Real-device, audio listening, performance, and human-play gates are not yet passed anywhere in the programme.
- Known accepted gap (R02 must close): the 19 drag-policy games have no discoverable touch pause; also the help-dialog "Hold still" line in `index.html` is now inaccurate for those games.
- Pre-existing finding for R02: input during the ~300 ms scene entry animation after a game switch maps through the animated transform (observed ~122 px shift at 320×568).

## Exact next action

R02 is accepted (code + visual gates pass; device/player unverified but out of its
required gates). R02's write paths are released. Next: start R03 ("Add only the motion
and finishing support needed by the pilots"; dependency gate on R02 `implemented` is
met — R02 is accepted). Read `refinement/evidence/r02-handoff.md` first.

In parallel when hardware is available: run R01's four acceptance scenarios on a real phone per the QA-protocol device format and update R01's device gate; it is the only missing input to R01 acceptance.

Then R03 under its dependency gate, then the pilots. Do not mark R07 accepted or roll out speculative visuals across the catalogue while visual/device/player evidence is missing. If source-only pilot preparation is complete and browser access is again unavailable, leave a precise pending-evidence handoff rather than inventing approval.

## Ownership

R01's writer has finished and released its write paths (`dist/app.js`, `dist/gestures.js`, `dist/registry.js`, `dist/games/expansion.js`, `tests/gestures.test.mjs`, `tests/input-lifecycle.test.mjs`); all R01 changes are uncommitted in the working tree — the next coordinator decides commit strategy before R02 edits shared files. No implementation worker is currently assigned. The next coordinator assigns owners and evidence directories before edits. Preserve unrelated work if the checkout changed after this note.
