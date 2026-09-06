# Sidequest refinement kit

Prepared 6 September 2026. Start here; this kit is the durable handoff for future agents.

## The decision

Keep the instant-play mobile arcade. Refine 2D and selective 2.5D until three representative games establish a demonstrably better standard: Stack, 2048, and Pocket Golf. Then carry proven improvements through all 34 registered games. Full 3D is a later, optional experiment; it is not the current programme's dependency.

The goal is deliberate composition, satisfying action, fair controls, recognisable art direction, and reliable performance. A larger catalogue, an engine migration, more gradients, or a model calling its output “premium” does not establish quality.

## Use this with your abundant model access

Open the Sidequest repository in your coding agent. Paste the **Coordinator launch** prompt in [PROMPTS.md](PROMPTS.md). The same Sonnet-class model can implement, coordinate, and review in separate contexts. Native subagents are optional: separate sessions work, and a single session can perform the roles sequentially with weaker review independence explicitly recorded.

There is no requirement to return to Astra. If scarce access remains, spend it on a short evidence-backed design or architecture decision after the implementers have prepared real alternatives. Do not spend it on repetitive edits, test repair, or rediscovering the repository. The repository's `AGENTS.md` now routes refinement work to this kit; tools that do not automatically read it can use the launch prompt directly.

## What to read

| Artifact | Purpose |
| --- | --- |
| [Portable skill](sidequest-refinement/SKILL.md) | Entry point and operating constraints; read directly in any agent. It is packaged here, not installed globally. |
| [Quality standard](sidequest-refinement/references/quality-standard.md) | Visual, motion, input, audio, performance, and release requirements. |
| [Source audit](sidequest-refinement/references/source-audit.md) | Confirmed implementation facts, their implications, and unresolved checks. |
| [Pilot briefs](sidequest-refinement/references/pilot-briefs.md) | Concrete first implementations and acceptance scenarios. |
| [Agent workflow](sidequest-refinement/references/agent-workflow.md) | Task sizing, ownership, fresh-context reviews, escalation, and continuation. |
| [QA protocol](sidequest-refinement/references/qa-protocol.md) | Browser/device matrix, evidence requirements, and reproducible play scenarios. |
| [Catalogue plan](sidequest-refinement/references/catalogue.csv) | Every registered game, its first review focus, and evidence status. |
| [Backlog](state/backlog.json) | Ordered work, dependencies, acceptance criteria, and honest status fields. |
| [Progress](state/progress.md) | Where the next agent resumes. |
| [Prompts](PROMPTS.md) | Coordinator, implementer, reviewer, repair, and escalation prompts. |
| [Checkpoint tool](tools/checkpoint.py) | Offline syntax/tests/inventory/fingerprints with preserved logs. |

## Current evidence, not a release certificate

- Local source baseline: `6777c90a8e860f3882106620cf5cde141658b107`.
- GitHub reuse note: this baseline includes a previously unpushed music-volume change. The kit is published separately from that change, so the baseline revision may not exist in a fresh GitHub clone. Run a new checkpoint on your actual checkout; treat the included logs and fingerprints as historical local evidence.
- Registry: 34 playable entries. The games directory has 38 JavaScript files, including helpers and the expansion registry.
- Existing automated suite passed all 55 tests during preparation. See [baseline summary](evidence/baseline/summary.json) and its logs for the recorded rerun.
- Both in-app browser and Chrome automation were blocked by an unavailable admin-enforced policy check. No live screenshots, touch measurements, listening review, frame-rate measurements, or current production/source parity claim were obtained.
- This kit changes no shipped game files and deploys nothing.

For browser work, restore the approved browser-control connection/policy through the user's normal computer-use setup. Do not try alternate automation mechanisms to evade the policy. An agent can continue source work while that is blocked, but visual/device gates remain unverified.

## Run a checkpoint

From the repository root:

```bash
python3 refinement/tools/checkpoint.py --output refinement/evidence/checkpoint-001
```

Choose a new directory each time; the tool refuses to overwrite earlier evidence. It needs Python 3, Node, and Git, has no third-party dependencies, and performs no network access, publication, or Git mutation. Its passing result is a code baseline, not a claim of game quality.

## First three useful sessions

1. Coordinator verifies the baseline, assigns the shared input/lifecycle ticket, and establishes browser evidence if available. Source-only work may proceed under the blocked-browser rules.
2. Coordinator establishes one layout system and the minimum motion/lifecycle support needed for the pilots. Avoid building a general-purpose game engine.
3. Implementers refine the pilots; fresh reviewers assess fixed scenarios and real captures. Begin catalogue propagation only after the pilot review gate passes.

Before any future publication, use the repository's hosting workflow, establish the intended source revision, preserve the existing Site identity, and verify deployment success. This document does not itself authorize publication.
