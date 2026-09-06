---
name: sidequest-refinement
description: Refine the existing Sidequest mobile arcade through bounded game changes, shared presentation contracts, and evidence-backed quality reviews. Use for Sidequest polish implementation or review; not for adding unrelated games or deploying without authorization.
---

# Sidequest refinement

Preserve the instant-play feed and game identities. Use this skill from the checked-out repository; the surrounding `refinement/` kit is portable and can be read directly by agents that do not support skills.

Read the applicable repository `AGENTS.md` first, then [quality-standard.md](references/quality-standard.md), `../state/progress.md`, and the assigned item in `../state/backlog.json`. Read only the references needed for the current task:

- [source-audit.md](references/source-audit.md): initial evidence and risks; verify against the current revision before editing.
- [agent-workflow.md](references/agent-workflow.md): coordinator, ownership, review, and continuation rules.
- [pilot-briefs.md](references/pilot-briefs.md): Stack, 2048, and Golf acceptance scenarios.
- [qa-protocol.md](references/qa-protocol.md): required browser and device evidence.
- [catalogue.csv](references/catalogue.csv): later game-family work; focus entries are hypotheses unless marked source-confirmed.

## Work contract

1. Establish current revision, dirty files, task scope, and assigned write paths. Preserve unrelated work. The initial audit is not guaranteed to describe a newer checkout or deployment.
2. Make one coherent player-visible improvement per ticket or deliberately bounded slice. Keep rules unchanged unless the ticket explicitly addresses rules or fairness. Do not replace the framework as a shortcut to visual polish.
3. Shared audio, timing, gesture ownership, and safe areas remain centrally coordinated. Never create per-game audio contexts, independent animation loops, or global input listeners. Any shared API change must be integrated by its assigned owner with backward-compatible defaults.
4. Separate authoritative simulation state from presentation. Animate what happened without letting effects alter collision timing, score, random draws, or input acceptance. Support pause, cancel, restart, resize, game-switch, and reduced motion.
5. Validate the changed behavior, existing regression suite, and applicable visual/play scenarios. Provide evidence tied to the source fingerprint. No browser access means `unverified`, not visual success.
6. Return the handoff format in `../templates/handoff.md`; reviewers use `../templates/review.md`. Update only your assigned state/evidence files unless acting as coordinator.

## Evidence gates

Code-pass, visual-pass, device-pass, and player-acceptance are separate states. No numerical taste score can override a broken input, hidden failure cause, unreadable label, missing evidence, or regression. Do not weaken acceptance criteria to close a ticket; the coordinator may revise a demonstrably wrong criterion with recorded reasoning and review.

Browser-policy failures are environmental blocks. Do not bypass them. Continue independent source work, record the pending check, and withhold visual/release certification.

Use the user's available models. Do not assume model names, subscriptions, limits, native subagents, or browser tools are available. Separate fresh sessions can implement the same workflow. Scarce-model review is optional, never a dependency for routine continuation.
