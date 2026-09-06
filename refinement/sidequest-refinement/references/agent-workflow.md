# Agent workflow

Use the user's available coding models. “Sonnet-class” means the user's stated capability tier, not a benchmark guarantee or a required API model identifier. No model, subscription, or tool installation is purchased by this workflow.

## Roles and economical use

| Role | Responsibility | Suitable use of available models |
| --- | --- | --- |
| Coordinator | Own priorities, shared contracts, integration, state files, and final claims. | A high-volume coding model with the concise kit and current state. |
| Implementer | Solve one bounded ticket with named write paths. | High-volume model; one clear problem per context. |
| Reviewer | Inspect evidence and regressions independently, without editing the implementation. | Fresh session of the same model; another capable model can add a different perspective if already available. |
| Device/play tester | Real touch, audio, readability, and enjoyment observations. | Browser tools plus real human phone use; models cannot replace the human observations. |
| Scarce expert, optional | Resolve a specific design/architecture ambiguity after alternatives and evidence exist. | Astra or the user's strongest remaining model, only when useful. |

Begin with one implementer and one reviewer. Use at most two simultaneous implementation workers when their write paths and contracts are truly independent. More workers are not inherently higher quality. Shared-shell changes happen sequentially under one owner.

A single available agent can work sequentially. For review, use a new session with the criterion and raw evidence where possible. If the same context self-reviews, label the lack of independence. Do not invent another agent's verdict.

## Session loop

1. Read current `AGENTS.md`, skill, `state/progress.md`, and the assigned backlog item. Check actual HEAD and dirty paths. Initial audit claims must be rechecked after source changes.
2. Coordinator claims one eligible ticket: dependencies meet its `dependency_gate` (`implemented` permits code-complete dependencies; `accepted` requires their required gates to pass). This lets pilot source work proceed while device evidence is pending, without treating it as approved. Assign writer, paths, and exact pass conditions before edits.
3. Establish a baseline scenario. Record seed/fixture when available, viewport, game state, and source fingerprint. Existing browser policy blocks remain blocks; do not route around them.
4. Implement the smallest coherent improvement. Keep a changed-behaviour note. Avoid mixing balance, artwork, controls, and persistence in one undifferentiated rewrite.
5. Run focused checks, then the required regression checkpoint. Capture matching visual/motion evidence through permitted tools. Mark unavailable modalities honestly.
6. Fresh reviewer receives the ticket, frozen criteria, raw before/after evidence, and changed source. Ask for the most consequential reproducible defects and a verdict for each gate. Do not lead with the implementer's praise or desired verdict.
7. Repair demonstrated defects. After two cycles with the same unresolved failure, change approach: reduce scope, isolate the cause, or present two bounded alternatives with evidence. Do not continue an endless “make it more premium” loop.
8. Coordinator integrates, reruns checks on the integrated revision, updates status and evidence links, and chooses the next eligible ticket. An accepted individual patch is not proof the combination works.

## Ownership and integration

- Coordinator owns `dist/app.js`, `dist/gestures.js`, `dist/style.css`, `dist/index.html`, `dist/registry.js`, shared helpers, audio engine/controls, and shared tests unless explicitly reassigned as one exclusive ticket.
- Each worker owns its game module and a named new/focused test file. A request to change a shared file is an integration note, not permission to edit it concurrently.
- Coordinator alone updates `refinement/state/backlog.json` and `progress.md`. Workers return handoffs in their assigned evidence directory. This avoids status races.
- Use isolated branches/worktrees when available; otherwise use a single working tree with one writer at a time. Never assume subagents have isolated filesystems.
- Before integrating, inspect diffs and preserve unrelated user changes. Do not discard or reset another worker's work. Make focused local commits when the active task authorizes them; no automatic push/deploy is implied.
- Keep shared API changes backward compatible until migration is complete. Record the old and new contract and which games were migrated.

## State, evidence, and resumption

Backlog statuses: `queued`, `in_progress`, `implemented`, `accepted`, `blocked`, `deferred`. Use `implemented` when code exists but required evidence/review is pending. Use `accepted` only after the ticket's stated gates pass. A code-only infrastructure ticket does not magically approve visual consumers.

Gate values: `unverified`, `pass`, `fail`, `blocked`, `not_applicable`. `not_applicable` needs a reason. Each gate stores a reviewer, source revision/fingerprint, and evidence path. Never change a failing item to not-applicable simply to close it.

At context limits, leave:

- current ticket and revision;
- exact files changed, whether changes are committed, and whether the tree is runnable;
- checks already completed, with output paths;
- concrete remaining defect or uncertainty;
- one exact next action;
- any shared-file ownership reservation.

Use [the handoff template](../../templates/handoff.md). Resume from this record rather than reconstructing the conversation. Do not turn every session into another planning exercise.

## Build an evidence-based eye for quality

Before each pilot's first implementation, inspect one or two comparable examples from official gameplay material or legitimate playable references if browser access allows it. Choose the comparison by mechanic. Record only transferable observations: object scale, UI hierarchy, response timing, how failure is shown, and retry steps. Identify source/timecode; do not claim an example was inspected when only its title was read.

Then compare the actual Sidequest candidate on fixed scenarios. Ask the reviewer:

1. What is the player's primary visual target, and what competes with it?
2. What is the first input that could feel ignored, late, or ambiguous?
3. Which visible change makes the outcome easier to understand?
4. What does the candidate do worse than the baseline?
5. Which single revision would most improve this ticket's objective?

A reference-informed critique is more useful than asking ten agents for taste scores. Preserve the selected art direction across workers. Assets, if needed, get an explicit brief for purpose, dimensions, material, lighting, silhouette, background/alpha, and file budget; inspect them in the actual scene before acceptance. Generated artwork alone does not prove visual quality.

## Escalation without scarce-model dependency

The coordinator first narrows the failure and requests a targeted second review. Escalate only a specific decision that changes architecture, input feel, or art direction materially. Prepare baseline/candidate images or clips, exact reproduction, two alternatives, test results, and one question in ≤500 words. The expert should decide, not rediscover the repo.

If no scarce model is available, choose the smallest reversible option consistent with the standard, document the uncertainty, and use fresh review plus user/device evidence. Missing real-phone evidence cannot be resolved by another model agreeing.

## Programme boundaries

Continue routine local work under the active user's authorization. Ask only when a required external action, missing resource, or genuinely consequential choice cannot be resolved within scope. No need for approval of every gap, easing curve, or file split. The current kit prepares implementation; it does not itself authorize deployments, purchases, public asset uploads, accounts, or new game/3D scope.

After pilot acceptance, migrate in small game-family batches. Release only after integrated code, visual, device, and required player gates are complete. Preserve Site identity and follow the existing authorized publishing workflow.

## Why this structure

Separating focused work from coordination and being cautious with simultaneous writers is consistent with [OpenAI's subagent guidance](https://learn.chatgpt.com/docs/agent-configuration/subagents). Explicit evaluation criteria support an implement/review loop; see [Anthropic's evaluator-optimizer discussion](https://www.anthropic.com/engineering/building-effective-agents). Incremental tasks, durable progress, and real end-to-end checks address known long-session failure modes in [Anthropic's long-running-agent guidance](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents). Sidequest-specific ownership, thresholds, and tickets are recommendations in this kit, not claims those sources tested this game.
