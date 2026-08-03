# TASK-014: Closing report and hand-off block

**Task ID:** TASK-014 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-030 (report honestly) · REQ-F-031 (hand-off instruction) · BR-009

## Business reason

Without this, the developer has ~90 files and no idea what to do next. **The assumptions
section is the only part they cannot reconstruct for themselves** — every other fact is in
the workspace; what the intake assumed rather than asked exists nowhere else.

## Goal

A closing report naming the file count, every remaining `[TODO]`, every blocking open
question, and every assumption made rather than asked — followed by the single instruction
that starts the build session.

## Inputs

- [`MASTER-PROMPT.md`](../../../spec-driven-template/MASTER-PROMPT.md) — "Report honestly" and "Hand off"
- [`frontend-component-spec.md`](../../01-docs/04-technical-spec/frontend-component-spec.md) — `ClosingReport`, `HandoffBlock`, and their empty states

## Expected files or components

```
instructions/report.md        <- NEW: the report shape and the hand-off block
instructions/intake.md        <- gains: report AFTER validation, never before
```

## Expected output

1. How many files and folders were created.
2. Which items are still `[TODO]` and why.
3. Every open question that must be answered before coding starts.
4. **Anything assumed rather than asked.**
5. That the entry-point file exists and is the single entry point for every future session.
6. The hand-off block, copy-pasteable, with **no placeholder left in it**, plus the three
   things only a human can do: wire the fitness functions into CI, buy the generic
   subdomains, and perform one restore before launch.

Empty states are stated **positively**: *"No open `[TODO]` markers."* · *"No assumptions were
made; every fact came from an answer."* A blank section reads as a missing section.

## Step-by-step instructions

1. Create `instructions/report.md` with the five sections and their empty states.
2. Gate it on validation: **if any check failed or did not run, the report says so and the
   hand-off block is not printed** (BR-009).
3. Collect `[TODO]`s from the files, and assumptions from the inference notices of TASK-011.
4. Compose the hand-off block, filling every placeholder from the actual workspace.
5. Include the three human-only actions, filled with **this** project's generic subdomains
   and core subdomain — not generic wording.

## Dependencies

TASK-013.

## Constraints / Boundaries

- Never print the hand-off block when validation did not fully pass.
- Never state a file count without having counted.
- Never leave a placeholder in the hand-off block — it is copy-pasted verbatim.
- Never omit the assumptions section, even when empty.
- Do not summarise the workspace. The report says **what is unresolved**, not what exists.

## Do not change

- Anything in `spec/`.
- The generated workspace — the report is read-only over it.
- Any earlier instruction module.

## Acceptance check / Done criteria

- [ ] All five sections present, each with a positively-stated empty case.
- [ ] File count is accurate.
- [ ] Every `[TODO]` in the workspace appears, with its reason.
- [ ] Every open question blocking coding appears.
- [ ] Every assumption appears — including inferences drawn in place of questions.
- [ ] The hand-off block has no placeholder and names the real first task.
- [ ] The three human-only actions name **this** project's subdomains.
- [ ] A failed or not-run check suppresses the hand-off block and is stated plainly.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-034 | Finish an intake | Count, `[TODO]`s, questions, assumptions all present |
| ATEST-035 | Finish an intake | Hand-off is copy-pasteable; no placeholder |
| ETEST-010 | Whole run | Report matches the workspace on disk |
| **ETEST-003** | Paste the hand-off into a fresh session | Agent restates the task, names its requirement, **waits** |
| — | A workspace with one failed check | No hand-off block; failure stated |

## Review checklist

- [ ] Matches REQ-F-030, REQ-F-031, BR-009.
- [ ] No unrelated feature added.
- [ ] Tests pass, especially ETEST-003.
- [ ] Empty sections read positively, never as silence.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Fixing anything the report names. It **reports**; the developer decides.
- Nagging about `[TODO]`s on later runs.
- Telemetry of any kind (CON-007) — the report is shown once, to one person, and not recorded.

## Stop condition

**Stop and ask if:**
- Assumptions cannot be collected reliably. The section is the report's whole reason for
  existing; an incomplete assumptions list is worse than an absent one, because it implies
  completeness.
- ETEST-003 fails — a fresh session given the hand-off does not restate and wait. **That is
  not a report defect.** It means the workspace does not govern, which is RSK-5, and it needs
  raising rather than patching by rewording the instruction.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
