# Copy-ready prompts

These prompts assume the agent can access the Sidequest repository containing `refinement/`. Open that repository before using them. They request work only when you actually submit them. You do not need to paste the whole kit into every conversation.

## Coordinator launch

```text
Act as the implementation coordinator for Sidequest's refinement programme. I want you to carry out the programme defined in refinement/START_HERE.md, using the available coding models and tools. Read the applicable AGENTS.md, refinement/sidequest-refinement/SKILL.md, refinement/state/progress.md, and the relevant backlog items before work.

Preserve the instant-play feed, current games, centralized audio, and existing Site identity. Establish three flagship games—Stack, 2048, and Pocket Golf—before propagating their proven improvements through the catalogue. Work locally; do not publish, buy assets, create accounts, or undertake a full-3D rewrite under this prompt.

Verify the current revision and existing work. Use refinement/tools/checkpoint.py for code evidence. Continue from the recorded next action, rather than restarting the audit or asking me to select routine design details. Source-audit findings are dated and must be checked against the actual checkout.

Use bounded subagents if available: one implementer per exclusive write scope and a fresh reviewer. Never let multiple workers edit the shared shell, helpers, audio engine, or state files simultaneously. If delegation is unavailable, perform the roles sequentially and disclose the review limitation. Use my high-volume model for routine work; no task may require Astra access.

For each ticket: establish the baseline; implement; run meaningful checks; inspect permitted browser evidence; obtain a fresh review; repair concrete defects; integrate; update backlog and progress with evidence. Mark missing visual, device, or player evidence unverified or blocked, never passed. Browser-policy failures must not be bypassed. Continue useful independent source work while such checks are blocked, but do not call the pilots accepted or propagate speculative visuals as a proven standard.

Use the quality standard's observable criteria. Do not substitute extra gradients, effects, larger scope, or an arbitrary quality score for demonstrated improvement. Stop revising a ticket once its gates pass unless new evidence identifies a problem. If the same issue survives two review cycles, narrow the problem and change approach.

Persist through the authorized programme while meaningful work remains. At any session limit, leave a runnable state where possible and record the exact next action in refinement/state/progress.md. Report what changed, what evidence exists, and what is still blocked. Do not claim a deployed result.
```

## Implementer assignment

Coordinator: replace the bracketed fields with concrete values before sending.

```text
Implement Sidequest ticket [ticket ID and title]. Base revision: [revision]. Exclusive write paths: [paths]. Read the applicable AGENTS.md, refinement/sidequest-refinement/SKILL.md, the ticket in refinement/state/backlog.json, and [relevant brief]. Read shared dependencies as needed, but do not edit outside your assigned paths.

Player problem: [one concrete problem]. Required outcome: [observable before/after]. Preserve: [rules/input/audio/compatibility constraints]. Required checks: [scenarios and gates]. Evidence directory: [path].

Make the smallest coherent change that meets this brief. Separate simulation from presentation; preserve input, pause, restart, cancellation, resize, and game-switch behavior. Request a shared-contract change through your handoff if needed. Do not silently weaken acceptance criteria, broaden the ticket, or change difficulty to make effects look better.

Verify your work and return refinement/templates/handoff.md's fields with actual evidence paths. Browser screenshots and device measurements must come from permitted real observations. Missing modalities stay unverified. Do not update global backlog/progress, publish, or edit another worker's files.
```

## Independent review

```text
Review Sidequest ticket [ID] independently. Read the applicable instructions, its frozen acceptance criteria, and refinement/sidequest-refinement/references/quality-standard.md. Base: [revision/fingerprint]. Candidate: [revision/fingerprint]. Raw before/after evidence: [paths]. Changed files: [paths].

Do not edit the implementation. Inspect the evidence before reading the implementer's self-assessment. Reproduce relevant interactions through permitted tools where available. Focus on the stated player problem, regressions, and whether the proof supports the claimed outcome.

Use refinement/templates/review.md. For every defect provide reproduction, expected/actual behavior, severity, and evidence. Limit the primary repair list to the three highest-impact actionable issues; keep additional findings in a separate short list. Do not invent mandatory defects or reject a coherent design merely because another style is possible.

Give separate code, visual, device, and player verdicts. A screenshot cannot prove touch feel or frame pacing. A canvas test double cannot prove layout. Missing evidence is unverified or blocked, not pass. Distinguish failed requirements from optional ideas. Accept when the ticket's criteria are met; do not demand an unrelated rewrite.
```

## Focused repair

```text
Repair the demonstrated failures for Sidequest ticket [ID] from [review path]. Own only [paths]. Address [specific finding IDs], preserve already-passed criteria, and avoid unrelated restyling. Reproduce each finding first when tools permit, patch it, and rerun the affected checks plus the required integrated checkpoint. Return a concise mapping from finding to fix and evidence. If a finding cannot be reproduced, report exactly what you checked rather than claiming it fixed.
```

## Continue in a fresh session

```text
Continue the Sidequest refinement programme from refinement/state/progress.md and refinement/state/backlog.json. Read the applicable AGENTS.md and refinement/sidequest-refinement/SKILL.md. Verify current revision, dirty files, ownership, and recorded evidence before proceeding. Resume the exact next action; do not redo completed work unless the source or evidence changed. Keep unavailable browser/device/player gates honest, continue independent work, and leave another precise handoff if this session ends.
```

## Optional scarce-expert review

```text
Resolve one bounded Sidequest decision. Objective: [one sentence]. Baseline and candidate evidence: [paths]. Current source/fingerprint: [value]. Reproduction: [short steps]. Constraints: [list]. We tried [approach] and observed [measured failure]. Option A: [tradeoff]. Option B: [tradeoff]. Tests/evidence: [short results].

Question: [the exact decision]. Prefer a concrete recommendation with a short rationale and an observable acceptance test. Do not re-audit the entire repository, expand scope, or prescribe a model migration. If the evidence cannot establish the answer, identify the smallest missing observation.
```
