# TASK-007: Resume — derive stage by inspection

**Task ID:** TASK-007 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-028 · REQ-NF-003 · **ADR-004** · [`reliability-specification.md`](../../01-docs/07-security-and-reliability/reliability-specification.md) §3

## Business reason

Reliability is a driving characteristic and its measure is **8/8**. An intake that must be
finished in one sitting will be abandoned mid-way, which is RSK-1 — the primary risk.

## Goal

Re-running the command on an existing workspace reports which stages are complete and
continues from the first incomplete one, **with no state file anywhere**.

## Inputs

- [`ADR-004`](../../01-docs/05-architecture/architecture-decisions/ADR-004-fixed-spec-folder-no-state-file.md)
- [`database-design.md`](../../01-docs/06-api-and-data-design/database-design.md) §0, §7
- [`frontend-component-spec.md`](../../01-docs/04-technical-spec/frontend-component-spec.md) — `ResumeReport`

## Expected files or components

```
instructions/resume.md        <- stage derivation, the report, the redo rule
instructions/intake.md        <- gains: check for an existing workspace before Round 1
```

## Expected output

- Stage completeness **derived** from which artifacts exist — never from a stored flag.
- A report distinguishing **complete**, **partial**, and **absent**.
- A partial stage is redone **from its start**; files are replaced whole, never appended to.
- An empty workspace reports *"No workspace found — starting a new intake at Round 1"* — a
  normal outcome, not an error.

## Step-by-step instructions

1. Define, per stage, the artifacts that constitute completeness.
2. Write the derivation: read the folder, decide the stage. **No marker file, no manifest.**
3. Write the report, including the empty case stated positively.
4. Specify the redo rule: whole-file replacement, never append.
5. Handle the hand-edited case: report what cannot be reconciled and **ask**.
6. Write all eight interrupt/resume tests and see each fail without this task.

## Dependencies

TASK-006.

## Constraints / Boundaries

- **No state, progress, session, cache, or answer file** — anywhere, for any reason (ADR-004).
- Never overwrite a developer's hand-edits silently.
- Never re-ask a completed round.
- Do not cache the derivation between runs. Re-reading ~90 local files is cheap; a cache is
  a state file wearing a hat (`runtime-and-scale.md` §2).

## Do not change

- Anything in `spec/`.
- The developer's hand-edits to any generated file.
- `boundary.md` or `fill.md`.

## Acceptance check / Done criteria

- [ ] For **every** stage 1–8: interrupt mid-stage, re-run, resume there, complete. **8/8.**
- [ ] No state file created or read at any point in any run.
- [ ] A completed round is never re-asked.
- [ ] The empty case reads as normal, not as an error.
- [ ] Interruption during the entry-point write completes it **without re-running the interview**.
- [ ] Re-running on a complete workspace changes nothing.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-032 | Workspace complete through Round 4 | Reports 1–4 done, asks Round 5 |
| UTEST-021 | A stage with 7 of 11 files | Incomplete; redone from its start |
| **ETEST-009 ×8** | Interrupt at each stage | Resumes there and completes — **FF-003** |
| FTEST-001 | Session ends mid-stage | Prior stages intact; no append |
| FTEST-011 | Interrupt at the entry-point write | Entry point completed; no re-interview |
| FTEST-016 | Re-run on a complete workspace | Idempotent; nothing changes |

## Review checklist

- [ ] Matches REQ-F-028, REQ-NF-003, ADR-004.
- [ ] **No state file** — verified by a full file listing, not by reading the instructions.
- [ ] All eight resume cases pass.
- [ ] The report distinguishes complete / partial / absent in words.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Rounds 2–8 (later tasks). Resume is built against Round 1 and must generalise.
- Reconciling a badly hand-edited workspace automatically — it **asks**.
- Validation (TASK-012).

## Stop condition

**Stop and ask if:**
- Stage derivation seems to need a marker file, a manifest, or a hidden field. **ADR-004
  forbids it.** If derivation is genuinely impossible without one, that is an ADR-level
  decision requiring supersession — not a small exception.
- A hand-edited workspace cannot be distinguished from a partially-written one. That is a
  real limit (`database-design.md` §0 names it); the correct behaviour is to ask, not to guess.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
