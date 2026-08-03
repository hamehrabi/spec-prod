# TASK-022: Blueprint coverage — every template used or recorded as skipped

**Task ID:** TASK-022 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-040 (coverage) · REQ-F-043 (stage outputs derived from the library) · FF-015 · FF-018 ·
`technical-spec.md` §11 check 13

## Business reason

**This task exists because of a gap nothing else caught.** FF-007 verifies that a generated
file matches its blueprint — but a blueprint the intake never reached produced no file, no
mismatch, and no complaint. A workspace could be internally consistent, pass every check, and
still be missing an entire specification document.

The gap only became visible when someone asked *"will it use all the templates?"*.

## Goal

Every blueprint in the library either produces a generated file or appears in a recorded skip
list with a reason — and the list of what a stage must produce is **derived from the library**,
not hardcoded in the instructions.

## Inputs

- `blueprints/MANIFEST.md` (TASK-021) — the authoritative list
- `instructions/validation.md` (TASK-012)
- [`fitness-functions.md`](../../01-docs/04-technical-spec/fitness-functions.md) — FF-015, FF-018

## Expected files or components

```
instructions/coverage.md      <- NEW: derive required outputs from the manifest; record skips
instructions/validation.md    <- gains check 13
instructions/intake.md        <- REMOVE any hardcoded file list; derive from the manifest
```

Produces, in the generated workspace: a **skipped-blueprint record** — `[TODO: which existing
generated file holds it? `spec-change-log.md` is the likely home, alongside the acceptance
rows from ADR-006. Decide in this task; do not create a new file without a reason.]`

## Expected output

- The required outputs of every stage are **derived from `MANIFEST.md`**.
- Adding a blueprint + manifest entry makes it required, with **zero** changes to the instruction set (FF-018).
- Every blueprint ends a run in exactly one of two states: **filled**, or **skipped with a reason**.
- **Silently unused = 0.** Check 13 fails otherwise.

Legitimate skips, each needing a stated reason:

| Blueprint | Skipped when |
|---|---|
| `frontend-component-spec.md` | The product has no interface at all — and *"it is API-only"* is the reason, written down |
| `ai-boundary-spec.md`, `ai-evals.md` | The product neither calls nor is driven by a model |
| `data-and-integration-spec.md` | No external dependency whatsoever |
| `appendix-index.md` | **Never generated** — template scaffolding, a permanent manifest exclusion |

## Step-by-step instructions

1. Create `instructions/coverage.md`: derive required outputs from the manifest; define what a recorded skip must contain.
2. **Remove any hardcoded file list from `intake.md`.** The manifest is the source (REQ-F-043).
3. Add check 13 to `validation.md`, reporting each unused blueprint **by path**.
4. Decide where the skip record lives — reuse an existing artifact if one fits; do not add a file for its own sake.
5. Require every skip to carry a reason. **A skip with no reason is a silent skip wearing a label.**
6. Prove FF-018: add a blueprint, change nothing else, watch it become required.

## Dependencies

TASK-012, TASK-021.

## Constraints / Boundaries

- **Never allow a skip without a reason.**
- Never hardcode a file list anywhere — that reintroduces the coupling REQ-NF-005 forbids.
- Never auto-skip a blueprint because the intake did not get to it. Not reaching a blueprint
  is a **coverage failure**, not a skip.
- Do not create a new generated file if an existing one can hold the record.

## Do not change

- Anything in `spec/`.
- `MANIFEST.md` or any blueprint (TASK-021 owns integrity).
- The twelve existing checks — this adds check 13.

## Acceptance check / Done criteria

- [ ] Required outputs are derived from the manifest, not from a hardcoded list
- [ ] Adding a blueprint + manifest entry makes it required with **0** instruction-set changes
- [ ] Every blueprint ends a run filled or skipped-with-a-reason
- [ ] Check 13 fails, naming the path, when one is silently unused
- [ ] Every legitimate skip in the table above carries a reason
- [ ] `appendix-index.md` is a permanent manifest exclusion, never a per-run skip

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-044 | Complete an intake, check every blueprint | Filled or recorded-skipped; silently unused = 0 |
| ATEST-047 | Add a blueprint, change nothing else | Becomes required; 0 instruction-set changes |
| UTEST-031 | Blueprint added / conditionally skippable | Required / recorded skip, never silence |
| TEST-019 | Manifest ↔ generated workspace | Every entry accounted for |
| FTEST-021 | A blueprint no round reaches | Check 13 **fails**, naming it |
| ETEST-015 | Full run | Coverage and integrity both hold |

## Review checklist

- [ ] Matches REQ-F-040, REQ-F-043, FF-015, FF-018
- [ ] No unrelated feature added
- [ ] Check 13 seen to fail on a deliberately uncovered blueprint
- [ ] No hardcoded file list survives anywhere
- [ ] Only approved files changed
- [ ] Traceability matrix updated

## Out of scope

- Checking that a filled blueprint is filled *well* — that is FF-005 and the human eval scorers.
- Integrity (TASK-021).
- Adding or removing blueprints from the library.

## Stop condition

**Stop and ask if:**
- A blueprint has no round that could reasonably produce it. **That is a real finding**: either
  the round map has a hole, or the blueprint should not ship. Do not paper over it with a
  blanket skip reason.
- The skip record has no natural home in an existing artifact. Adding a file is acceptable
  **with a reason**; adding one by default is how a workspace accumulates files nobody reads.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
