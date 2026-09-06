# Programme progress

Updated 6 September 2026. Coordinator owns this file and backlog.json.

## Established

- Direction: refine the current arcade; Stack, 2048, and Pocket Golf establish the flagship standard. No collection-wide 3D migration.
- Local source baseline: `6777c90a8e860f3882106620cf5cde141658b107`.
- Source fingerprint: `daf4fac93220f072d6c81516b78ca7c04b4592e33b551676cc8d6cee5e1248c9`.
- Registry has 34 entries. Complete catalogue mapping is in `refinement/sidequest-refinement/references/catalogue.csv`.
- Checkpoint completed: all 55 existing tests passed, syntax checks passed. Logs and inventory: `refinement/evidence/baseline/`.
- Source audit, standard, three implementation briefs, QA protocol, prompts, role/ownership rules, and 19-task backlog prepared.
- `refinement/` was added and the repository's `AGENTS.md` now routes refinement requests here. No `dist/`, test, hosting, or synced source files were changed; no commit/push/deployment was performed during kit preparation.

## Blocked / unverified

- R00 browser baseline is blocked. Chrome and in-app browser failed admin-enforced policy verification. No gameplay screenshots or recordings were obtained.
- Live deployment/source parity is unknown. Do not label the local audit as a complete live-site audit.
- Visual, real-device, audio listening, performance, and human-play gates are not yet passed.

## Exact next action

For a fresh GitHub checkout, run a new checkpoint first. The preparation baseline includes a previously unpushed music-volume change, which is excluded from the kit-only publication. Preserve the historical baseline evidence and do not assume that its commit is available in the clone.

Start R01: reproduce the current input dispatch and hold-pause paths in the current source; create a focused test scenario for a held Golf aim and one-action-only timing presses; implement the smallest compatible per-game input policy. The R01 writer exclusively owns its named files until handoff. The source work does not depend on browser availability; the device gate remains pending until actual testing.

In parallel only if permitted and useful, establish R00's browser baseline after the normal approved browser connection/policy is restored. Do not attempt a control workaround. If source has advanced before the baseline can be captured, preserve the original baseline revision in an isolated checkout where authorized and compare matched revisions through approved browser tools.

After R01 is implemented, proceed to R02 and R03 under their dependency gates, then the pilots. Do not mark R07 accepted or roll out speculative visuals across the catalogue while visual/device/player evidence is missing. If source-only pilot preparation is complete and browser access remains blocked, leave a precise pending-evidence handoff rather than inventing approval.

## Ownership

No implementation worker is currently assigned. The next coordinator assigns owners and evidence directories before edits. Preserve unrelated work if the checkout changed after this note.
