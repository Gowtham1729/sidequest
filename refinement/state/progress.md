# Programme progress

Updated 7 September 2026 after R02 commit and R03 implementation.

## Current state

- R00 is unblocked, as confirmed by the owner. Chrome DevTools is available. The backlog is queued for its actual baseline/reference evidence; no R00 pass is fabricated.
- R01 is accepted and committed at `df98c09`. Its Pixel 8a device evidence remains valid historical evidence; do not repeat the stale claim that its device gate is missing.
- Original R02 is committed at `a89640a`. Its old handoff references an uncommitted tree and describes the previous presentation only.
- R02 revision is committed as `4563cf1` at the owner's request, following the owner's dissatisfaction. See `refinement/evidence/r02-revision-handoff.md`. Source fingerprint: `a6a52ecd77e8a05057ad75919ece90e9022ca2e9e86e51b6d66692da0e377df7`. Code checkpoint: 71/71 tests; 47 JavaScript files pass syntax checks.
- The score now stands alone. Tap the top HUD to pause; tap Games in the footer to browse. Keyboard and assistive controls remain. Gameplay input, audio ownership, feed rail, settled pointer mapping and registry IDs are preserved.
- All 34 games were measured across the five QA viewport sizes with zero within-game HUD height changes across phases. The final landscape-only adjustment was rechecked across all 34 games and recovered 53px of playfield height. Measurements are browser geometry evidence, not complete visual or touch QA.

- R03 is implemented locally, uncommitted. Final fingerprint `71a0462e9fa8fde7f268c3ea320205ee636604ffd58976785edbee5bbf855606`; 81/81 tests. Independent code review passed after a terminal-rendering repair. See `refinement/evidence/r03-handoff.md` for the consumer contract and browser fixture evidence. No pilot game has been migrated yet.

## Evidence still needed

- Owner review of the revised presentation. R02 is implemented, not accepted on the owner's behalf.
- Complete independent visual review, real-device touch/safe-area checks and listening review of this revision. Selected screenshots were inspected in this session; browser artifact saving was rejected by the connector's workspace-root policy, so screenshot pixels are retained only in the conversation.
- Source/deployed parity remains unknown; this revision has not been published.
- R00 baseline/reference observations and the later pilot-specific work remain outstanding. 2048's rectangular cells and pilot composition issues are outside this shell revision and remain R04–R06 work.

## Exact next action

R04 Stack is next under its implemented dependency gate. Read the R03 handoff and pilot brief; preserve overlap rules while adding placement/miss presentation. R02 phone review and complete R03 visual review remain pending in parallel. Do not propagate catalogue visuals or mark the flagship gate passed early.

## Ownership

R02 committed as `4563cf1`. R03 had one writer and a read-only independent code reviewer; shared paths are released. Preserve the uncommitted R03 source/evidence/state changes. No push or deployment was performed.
