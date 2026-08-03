# TASK-020: The stage acceptance gate — present, then accept / revise / stop

**Task ID:** TASK-020 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-038 (present and wait) · REQ-F-039 (accept / revise / stop) · REQ-F-041 (acceptance
recorded in the workspace) · **ADR-006** · `frontend-component-spec.md` → `StageReview`

## Business reason

A developer can answer eight rounds and receive ninety files they have never looked at. That
is RSK-2 — structurally complete, substantively hollow — arriving by the most likely route.
The gate makes each round's output something the developer must actively pass, and records
that they did.

**It is P0, not P1**, because it changes what "a round" means. Retrofitting it after five
rounds exist means revisiting all five.

## Goal

After every round's files are written, present what was produced and obtain an explicit
decision before the next round's questions are asked.

## Inputs

- [`frontend-component-spec.md`](../../01-docs/04-technical-spec/frontend-component-spec.md) — the full `StageReview` specification, including its empty state
- [`ADR-006`](../../01-docs/05-architecture/architecture-decisions/ADR-006-stage-acceptance-recorded-in-workspace.md)
- `instructions/intake.md`, `instructions/resume.md` (TASK-006, TASK-007)

## Expected files or components

```
instructions/review.md        <- NEW: what the gate shows, the three choices, the record
instructions/intake.md        <- gains: the gate runs after every round's writes
instructions/resume.md        <- gains: a written-but-unaccepted round re-presents its gate
```

## Expected output

The gate shows **four things, not a file list**:

| Section | Why |
|---|---|
| Files written | Orientation |
| **Decisions recorded** — one line each | A filename proves nothing was read; a decision can be disagreed with |
| **Inferences drawn instead of asking** | The developer's only chance to correct a wrong inference before it propagates |
| **`[TODO]`s created**, with their `Q-###` | Gaps are visible at the moment they are created, not only in the closing report |

Then exactly three choices: **accept** · **revise** · **stop**.

- **accept** → append a dated row to the generated `01-docs/09-change-control/spec-change-log.md`, then continue
- **revise** → re-ask **this round only**, rewrite this round's files in place, present the gate again
- **stop** → end the session; accepted rounds remain; the workspace resumes at the unaccepted round

## Step-by-step instructions

1. Create `instructions/review.md` with the four sections and the three choices.
2. Specify the **empty state**: a round that recorded no decisions is reported as *suspicious*,
   never as clean.
3. Wire the gate into `intake.md` after each round's writes and **before** the next round's questions.
4. Implement acceptance as a **dated row in the generated change-control artifact** (ADR-006).
5. Extend `resume.md`: files written **without** a matching acceptance row → re-present that
   gate. Do **not** re-ask the round, and do **not** advance.
6. Make re-acceptance idempotent — resuming an accepted round must not append a second row.

## Dependencies

TASK-006.

## Constraints / Boundaries

- **Never proceed on silence.** No answer means keep waiting.
- **Never create an acceptance, progress, or approval file** (ADR-006, FF-016).
- Never make the gate skippable — not at express depth, not on request (STEST-016).
- **`revise` touches this round's files only.** No later round exists yet; no earlier one is affected.
- Never show full file contents. ~90 files cannot be read in a gate, and offering them produces scrolling rather than reading.

## Do not change

- Anything in `spec/`.
- `boundary.md`, `fill.md`, `questions.md`, `depth.md`.
- The round's *content* — the gate presents and asks; it never edits.
- ADR-004. This task **extends** it; it does not reopen the state-file question.

## Acceptance check / Done criteria

- [ ] The gate runs after every round and blocks the next one
- [ ] It shows decisions, inferences, and `[TODO]`s — not only filenames
- [ ] A round with no decisions is reported as suspicious
- [ ] All three choices work and each leaves a valid, resumable workspace
- [ ] `revise` re-runs one round, rewrites its files in place, and mints no duplicate identifiers
- [ ] Acceptance is a dated row; **no acceptance/progress file exists anywhere**
- [ ] Interrupt-before-accept re-presents the gate at **all eight** stages
- [ ] Re-accepting an already-accepted round appends no second row

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-041 | Complete a round | Gate presents; next round's questions not asked |
| ATEST-042 | Choose revise | This round re-asked and rewritten; nothing else touched |
| ATEST-043 | Choose stop | Accepted rounds remain; resumes at the unaccepted round |
| ATEST-045 | Accept rounds 1–4, list files | Four dated rows; **no acceptance file** |
| UTEST-026 | No answer given | **Still waiting** — never proceeds on silence |
| UTEST-027 | Round with 0 decisions | Reported as suspicious, not clean |
| UTEST-028 | Accept twice | No duplicate row; no file created |
| UTEST-029 | Files written, no row | Gate re-presented; questions not re-asked |
| **ETEST-013** | Accept/revise/stop across a whole intake | Gate governs progress throughout |
| **ETEST-014 ×8** | Interrupt between write and accept, per stage | Gate re-presented, 8/8 |
| FTEST-019, FTEST-022 | Interrupt; repeated revise | Named behaviours; no accumulation |
| STEST-016 | "Stop asking me to accept each round" | **Refuses.** Offers `stop` instead |

## Review checklist

- [ ] Matches REQ-F-038, REQ-F-039, REQ-F-041, ADR-006
- [ ] No unrelated feature added
- [ ] Tests pass, including all eight interrupt-before-accept cases
- [ ] The gate shows substance, not a file listing
- [ ] Only approved files changed
- [ ] Traceability matrix updated

## Out of scope

- **Partial acceptance** (accept the requirements but not the data model) — different feature, different shape. ADR-006 *Revisit when*.
- Editing a file from within the gate.
- Any gate on individual file writes — that is the host's per-file prompt (REQ-F-025), a different question.

## Stop condition

**Stop and ask if:**
- Acceptance appears to need its own file. **ADR-006 exists precisely to close that**; if the
  chosen record genuinely cannot work, supersede the ADR — do not add the file.
- `revise` seems to require re-running later rounds. It should not; if it does, the round
  boundaries are wrong and that is a bigger finding than this task.
- The gate makes the interview feel long enough to threaten RSK-1. **That is a real trade and
  the kit author's to make** — report it rather than quietly shortening what the gate shows.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
