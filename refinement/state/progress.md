# Programme progress

Updated 8 September 2026 after R05 implementation and Pixel 8a feedback.

## Current state

- R00 is unblocked, as confirmed by the owner. Chrome DevTools is available. The backlog is queued for its actual baseline/reference evidence; no R00 pass is fabricated.
- R01 is accepted and committed at `df98c09`. Its Pixel 8a device evidence remains valid historical evidence; do not repeat the stale claim that its device gate is missing.
- Original R02 is committed at `a89640a`. Its old handoff references an uncommitted tree and describes the previous presentation only.
- R02 revision is committed as `4563cf1` at the owner's request, following the owner's dissatisfaction. See `refinement/evidence/r02-revision-handoff.md`. Source fingerprint: `a6a52ecd77e8a05057ad75919ece90e9022ca2e9e86e51b6d66692da0e377df7`. Code checkpoint: 71/71 tests; 47 JavaScript files pass syntax checks.
- The score now stands alone. Tap the top HUD to pause; tap Games in the footer to browse. Keyboard and assistive controls remain. Gameplay input, audio ownership, feed rail, settled pointer mapping and registry IDs are preserved.
- All 34 games were measured across the five QA viewport sizes with zero within-game HUD height changes across phases. The final landscape-only adjustment was rechecked across all 34 games and recovered 53px of playfield height. Measurements are browser geometry evidence, not complete visual or touch QA.

- R03 is committed as `6932caf` and pushed to origin/main (including R02). Final fingerprint `71a0462e9fa8fde7f268c3ea320205ee636604ffd58976785edbee5bbf855606`; 81/81 tests. Independent code review passed after a terminal-rendering repair. See `refinement/evidence/r03-handoff.md` for the consumer contract and browser fixture evidence. Stack now consumes the contract in the local R04 candidate.

- R04 Stack is implemented locally, uncommitted. Final fingerprint `0fc046faf8586e24f5ca61612b346e1f317c8c3b5ac6c08f813fcd1a7b33fd1f`; 88/88 tests and read-only source review pass. Chrome DevTools smoke checks now pass at 390×844 and 320×568 for boot, stable HUD, one-tap scoring, hold pause/resume, edge switch, miss/reveal, retry and explicit retry copy; see `refinement/evidence/r04-browser/devtools-smoke.json`. Full visual comparison and device/player evidence remain unverified.

## Evidence still needed

- R05 2048 is implemented locally: square centered board, tile travel/merge/spawn sequence, one latest-direction buffer and bounded finishing. 95/95 tests and independent read-only code review pass. Fingerprint `9e4776ae3af5fcc4a0b7c000f8af42b9fabc5b25742bf2fb31d6f521154522f4`; see `refinement/evidence/r05-handoff.md`. Browser layouts/input and controlled terminal frames inspected at 320×568 and 390×844. Full independent visual, phone/listening and player acceptance remain open.
- R04 update: the owner confirmed placement, retry and clipping on Pixel 8a, with behavior working as described. That limited phone smoke check passes; do not ask to repeat it. Listening and full device/performance evidence remain unverified.

- Owner review of the revised presentation. R02 is implemented, not accepted on the owner's behalf.
- Complete independent visual review, real-device touch/safe-area checks and listening review of this revision. Selected screenshots were inspected in this session; browser artifact saving was rejected by the connector's workspace-root policy, so screenshot pixels are retained only in the conversation.
- Source/deployed parity remains unknown; this revision has not been published.
- R00 baseline work and Pocket Golf R06 remain outstanding. R05 fixes 2048's rectangular cells. R07 now explicitly includes consistent visual size within each game family, preserving documented gameplay-specific exceptions.

## Exact next action

Next implementation: R06 Pocket Golf. R05 minimal owner check is one short 2048 play on Pixel 8a for board size, swipe feel and merge audio; automated edge-case tests need not be repeated manually. Complete remaining pilot evidence before R07 acceptance; no flagship/catalogue approval is inferred.

## Ownership

R02 `4563cf1` and R03 `6932caf` are committed and pushed to origin/main. R04 and R05 remain uncommitted locally. Root wrote R05 game/tests/state; r03_review performed read-only review. Paths are released. Preserve all uncommitted game, test, evidence and state changes. No deployment was performed; port 8901 serves the local candidate.
