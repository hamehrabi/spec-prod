# ADR-006: Stage acceptance is recorded in the workspace, not in a state file

**ADR ID:** ADR-006
**Status:** Accepted
**Date:** 2026-08-03
**Decision owner:** Kit author
**Review date:** After the first ten real intakes

---

## Context

REQ-F-038 introduces a **stage acceptance gate**: after each round's files are written, the
intake shows what was produced and asks the developer to accept before the next round begins.
The purpose is to make sure the developer actually reads the output rather than answering
eight rounds and receiving ninety files they have never looked at — a direct attack on RSK-2
(structurally complete, substantively hollow).

That creates a state question that did not exist before. **Whether a round has been accepted
is a fact that must survive an interrupted session**, because resume has to know whether to
re-present round 4 for acceptance or move on to round 5.

And it collides with **ADR-004**, which forbids a state, progress, session, or answer file
anywhere, for any reason. The obvious implementation — `spec/.accepted.json` — is exactly
what that ADR was written to prevent.

## Options considered

1. **A state file** (`.accepted.json`, or an entry in a progress file).
   *Benefit:* trivial. Read it, know what was accepted.
   *Cost:* **forbidden by ADR-004**, and forbidden for a good reason: it is a second source of
   truth that starts disagreeing with the specification the moment a developer hand-edits one.
   A workspace whose files say one thing and whose hidden state says another is the failure
   this product exists to prevent.

2. **Acceptance is transient — session-only.** Nothing is recorded; a resumed intake
   re-presents the most recent round for acceptance.
   *Benefit:* zero new machinery, and perfectly ADR-004 compliant.
   *Cost:* re-presents a round the developer already accepted, every time they resume. Mildly
   annoying, and — worse — **acceptance becomes unauditable**. There is no way to answer "did
   anyone ever read round 4?", which is the entire point of the feature.

3. **Acceptance is recorded as an artifact, in the generated workspace.** A dated row per
   stage in the generated `01-docs/09-change-control/spec-change-log.md`.
   *Benefit:* ADR-004 is satisfied **in spirit, not by a loophole** — the workspace is still
   the only state store, acceptance is derived by inspection like everything else, and a
   hand-editing developer sees and can change it. It is also **auditable**, which serves the
   Auditability driver: the record of who accepted what, and when, is exactly the kind of
   evidence this product sells.
   *Cost:* a generated file now has a section written by the *process* rather than by the
   developer's answers, which is a new kind of content. And a developer who deletes those rows
   makes the intake re-ask — recoverable, but surprising.

*Compared on:* which one keeps a single source of truth · which one can answer "was this
read?" six months later · which one a hand-editing developer can understand and correct.

## Decision

**Acceptance is recorded as a dated row per stage in the generated
`01-docs/09-change-control/spec-change-log.md`.** No new file, no hidden state, and the record
is a normal part of the workspace that a human can read and edit.

## Reason

Option 1 is closed by ADR-004 and would have to supersede it — for a convenience, which is
not a good enough reason to reopen the project's single-source-of-truth guarantee.

Option 2 was close, and it is what a smaller feature would have got. It lost on **auditability**:
the whole justification for the acceptance gate is knowing that the developer engaged with the
output, and a mechanism that leaves no trace cannot demonstrate that to anyone — including to
the developer themselves, six months later, wondering whether they ever actually read the
requirements they are now building from.

Option 3 costs one new section in a file that already exists to record artifact versions and
who changed them. Acceptance rows are a natural fit for that file, not a foreign body in it.

## Consequences

- **Positive:** ADR-004 holds unchanged. One source of truth. Acceptance is auditable and
  human-readable. Resume derives acceptance the same way it derives everything else — by
  reading the workspace.
- **Trade-off or limitation:** A generated file now contains content written by the *process*
  rather than derived from the developer's answers, which is a category that did not previously
  exist. And **a developer who deletes an acceptance row causes that stage to be re-presented** —
  correct behaviour, but surprising if they did not realise the rows meant something.
- **Second limitation:** acceptance rows record *that* a stage was accepted, not *that it was
  read*. Nothing can record the latter. The gate raises the cost of not reading; it does not
  make it impossible, and claiming otherwise would be dishonest.
- **Rule the AI assistant must follow during implementation:** Record stage acceptance as a
  dated row in the generated `spec-change-log.md`. **Never create an acceptance, progress, or
  approval file.** Determine which stages are accepted by reading those rows — never from a
  remembered session state.

## Compliance

| Enforced by | Where |
|---|---|
| **FF-016** — every completed stage in a golden workspace has a matching acceptance row; **zero** acceptance/progress/approval files exist anywhere | [`fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |
| **FF-010** — already asserts zero state files; extended to cover this new temptation by name | `fitness-functions.md` |

## Revisit when

- The acceptance rows prove unreadable or noisy in a real workspace — the record is meant to
  be useful evidence, not clutter in a file people stop opening.
- A developer needs to accept a stage **partially** — accept the requirements but not the data
  model, say. That is a different feature with a different shape, and this ADR does not cover it.
- Someone proposes recording *more* process state in artifacts. That is the slope this decision
  starts down: acceptance fits because the file already records artifact history. A general
  process-state section would not, and would be ADR-004's state file arriving one row at a time.

## Impact

| Dimension | Impact |
|---|---|
| Security | None. |
| Reliability | Slightly positive — resume gains a durable, inspectable signal it did not have. |
| Performance | None. Reading a few extra rows in a file already being read. |
| Cost | One section in one generated file, plus the gate's own interaction. |
| Maintainability | Positive: no new store, no new format, nothing to keep in sync. |

## Related

- Related requirements: REQ-F-038, REQ-F-039, REQ-F-028, REQ-NF-003
- Related technical spec sections: §2 State ownership, §11 checks 13–14; `database-design.md` §0
- Supersedes / superseded by: — **extends** ADR-004; does not supersede it

> Blueprint: ../../../../spec-driven-template/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
