# TASK-006: Round 1 end to end — ask, write three files, summarise

**Task ID:** TASK-006 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-005, REQ-F-006, REQ-F-007, REQ-F-008, REQ-F-015 · BR-005 · REQ-NF-001

## Business reason

**The first slice with real user value.** A developer answers four questions plus one free-text
question and receives three filled specification files. Everything before this was foundation;
this is the first point at which the product does what it exists to do.

## Goal

Round 1 works end to end: preamble → four questions → one free-text question → three files
written via the fill procedure → one summary line.

## Inputs

- [`MASTER-PROMPT.md`](../../../spec-driven-template/MASTER-PROMPT.md) — Round 1's questions
- [`frontend-component-spec.md`](../../01-docs/04-technical-spec/frontend-component-spec.md) — `QuestionRound`, `FreeTextPrompt`, `RoundSummary`
- `instructions/fill.md` (TASK-005) · `instructions/boundary.md` (TASK-004)

## Expected files or components

```
instructions/questions.md     <- NEW module: Round 1's questions only (ADR-001)
instructions/intake.md        <- gains round sequencing and the write-then-summarise rule
```

Produces, in the developer's repository:
```
spec/01-docs/01-intent/project-brief.md
spec/01-docs/01-intent/intent.md
spec/README.md
```

## Expected output

- Four questions, at most, in one round. Recommended option **first**, marked in words, each
  with a one-line reason.
- One free-text question: who is affected, what difficulty, what cost, what should improve —
  explicitly **not** features.
- Three files written through `fill.md`, each passing the boundary check.
- One line: `Round 1 — wrote 3 files`.

## Step-by-step instructions

1. Create `instructions/questions.md` holding **only** Round 1's questions. No orchestration,
   no blueprint content (ADR-001, FF-002).
2. Add round sequencing to `intake.md`: ask → write → summarise.
3. Wire each write through `boundary.md`, then `fill.md`.
4. Ensure files are written **before** any later round could be asked (REQ-NF-001).
5. Emit the summary line, naming the count.
6. If a write is declined, record it as skipped and **continue** (REQ-R-004).

## Dependencies

TASK-004, TASK-005.

## Constraints / Boundaries

- At most four questions. Not five, not "four plus a quick follow-up".
- The recommendation is marked **in words**, not implied by ordering (REQ-NF-006).
- A typed answer is used **verbatim**; never snapped to a similar option.
- Write after the round, never at the end of the run (BR-005).
- Only Round 1. Rounds 2–8 are later tasks.

## Do not change

- Anything in `spec/`.
- `boundary.md` or `fill.md`. This task **uses** them. If one seems wrong, that is a change to
  TASK-004 or TASK-005, with its own review.
- Any blueprint (read-only).

## Acceptance check / Done criteria

- [ ] Four questions maximum; recommended first, marked, with reasons.
- [ ] Free-text question asked and its answer used verbatim.
- [ ] Three files exist under `spec/`, structurally matching their blueprints.
- [ ] Files exist **before** the run could proceed to a later round.
- [ ] `Round 1 — wrote 3 files` printed.
- [ ] Declining one write leaves the run resumable, not failed.
- [ ] Nothing written outside `spec/`.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-005 | Inspect the round | At most four questions |
| ATEST-006 | Inspect each question | Recommended first, marked, one-line reason |
| ATEST-007 | Answer with unlisted text | Used verbatim; no substitution |
| ATEST-008 | Complete Round 1 | A free-text question was asked, for the problem not features |
| ATEST-016 | Interrupt after Round 1 | The three files exist and are readable |
| UTEST-002…005 | Round shape rules | Each rule holds in isolation |
| ETEST-008 | Write-after-round | Round 1's files precede any later round |
| PTEST-001 | Progress visibility | No stretch longer than one round with no output |

## Review checklist

- [ ] Matches REQ-F-005…008, REQ-F-015.
- [ ] No unrelated feature added — **no Round 2**, no inference, no validation.
- [ ] Tests pass.
- [ ] Questions read as decisions, with reasons a developer can disagree with.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.
- [ ] **FF-002 passes**: `questions.md` changed, zero blueprint files changed.

## Out of scope

- Rounds 2–8 (TASK-008, TASK-009, TASK-010)
- Inference and contradiction detection (TASK-011) — Round 1 asks all four regardless
- Resume (TASK-007)
- Validation, entry point, closing report (TASK-012, TASK-013, TASK-014)
- Express depth (TASK-015)

## Stop condition

**Stop and ask if:**
- Round 1 seems to need five questions. The limit is a requirement; the question set is what
  changes, not the limit.
- A question's answer seems derivable from another. **That is TASK-011's job** — implementing
  inference here would put orchestration into the question module and break ADR-001.
- Three files cannot be filled from Round 1's answers alone. That means the round is
  under-asking, and the **question set** needs revisiting — not the fill procedure.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
