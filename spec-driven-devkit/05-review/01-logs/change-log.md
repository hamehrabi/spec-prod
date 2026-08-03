# Change Log

> Source: Ch. 29, Ch. 30.
> Dated entries recording what changed and why. **Including what was rejected** — a change
> log that only records accepted changes cannot answer *why does the product not do X?*, and
> that is the question people actually ask.

---

## Entries

| Date | Change | Type | Reason | Artifacts | Decided by |
|---|---|---|---|---|---|
| 2026-08-03 | Specification workspace created — 8 intake rounds | Added | New project | ~95 files across `01-docs/` … `07-ops/` | Kit author |
| 2026-08-03 | ADR-001…005 accepted | Added | Five consequential architecture choices | `architecture-decisions/` | Kit author |
| 2026-08-03 | **Express mode accepted — as a parameter, not a second flow** | Added | Requested at Round 4; reshaped so it does not spend the Simplicity driver | REQ-F-033/034, DD-006, TASK-015 | Kit author |
| 2026-08-03 | **Security removed from the three driving characteristics** | Changed | Cannot be under-served without first breaking a hard constraint. It stays CON-005, BR-008, four requirements and twelve denial tests | `driving-characteristics.md`, DD-008 | Kit author |
| 2026-08-03 | **Telemetry rejected** | **Rejected** | CON-007. The privacy promise is part of the product | SC-006; **Q-002 opened as a consequence** | Kit author |
| 2026-08-03 | **Hosted / team component rejected for v1** | **Rejected** | CON-003 makes it impossible, not merely unwanted. Inferred, then confirmed | SC-005 | Kit author |
| 2026-08-03 | **Support for other AI assistants deferred** | **Deferred** | Doubles the surface before the first host is proven. Swap cost later measured at 2 modules of 5, none of it content | SC-002 | Kit author |
| 2026-08-03 | **Non-interactive intake deferred** | **Deferred** | The interview is the core subdomain; a config file removes the part carrying the value | SC-003 | Kit author |
| 2026-08-03 | **Automatic spec-drift detection deferred** | **Deferred** | Requires understanding an arbitrary codebase — materially harder than generating specs | SC-004 | Kit author |
| 2026-08-03 | **Standalone validation command deferred** | **Deferred** | Would have to handle workspaces it did not generate. Q-001 closed as intake-only for v1 | SC-007, DD-010 | Kit author |
| 2026-08-03 | RSK-3 given a detector: scheduled CI install test | Added | The risk carried a `[TODO: no detector]` through four files | `cicd-pipeline.md`, RISK-004 → Mitigated | Kit author |
| 2026-08-03 | **Stage acceptance gate added** — each round is presented and must be accepted before the next | Added | *"Ensure the user read it before moving to the next stage."* RSK-2 previously had **no detector inside a run** | REQ-F-038/039/041, **ADR-006**, `StageReview`, TASK-020, 13 tests (SC-009) | Kit author |
| 2026-08-03 | **`.accepted.json` rejected** as the acceptance record | **Rejected** | ADR-004 forbids state files, and a convenience is not a good enough reason to reopen the single-source-of-truth guarantee. Acceptance is a dated row in a generated artifact instead | **ADR-006** | Kit author |
| 2026-08-03 | **Blueprint coverage check added** — every template filled or recorded as skipped | Added | A question exposed that **nothing verified every blueprint was used**. FF-007 checked that generated files match blueprints; a blueprint never reached produced no file and no complaint | REQ-F-040/043, FF-015/FF-018, check 13, TASK-022 (SC-010) | Kit author |
| 2026-08-03 | **Blueprint integrity manifest added** — the library ships verifiably unmodified and drives progress | Added | *"Keep the blueprint entirely safe in the plugin and move based on that."* An altered blueprint produces a plausible, subtly wrong specification — the worst failure this product has | REQ-F-042, FF-017, check 15, TASK-021 (SC-011) | Kit author |

---

## Why the rejected rows are here

Four of the eleven entries above are **Rejected** or **Deferred**, and they are the ones this
file exists for.

Six months from now the question will not be *"why does the kit generate a subdomain map?"* —
that is visible in the output. It will be **"why doesn't it work with Cursor?"** or **"why
can't we see how many people finish the intake?"**. Without these rows, the answer is
somebody's memory, and the decision gets re-litigated from scratch — or quietly reversed by
someone who never knew it was a decision.

**The entry that will be re-litigated first is telemetry.** It is small, useful, and the
argument for it ("just opt-in, just a counter") is genuinely reasonable. The row records that
it was considered, that it costs SM-2, and that the answer was still no.

---

## Entry rules

| Rule | Why |
|---|---|
| Every entry names the **artifacts** it touched | An entry with no artifacts is a conversation, not a change |
| Every entry names a **decider** | An unowned change cannot be questioned later |
| **Rejected and deferred changes are recorded** | They are why the product does not do something |
| A change that supersedes an ADR **says which one** | Otherwise a reversal looks like a normal change |
| Product changes here; process activity in `maintenance-log.md`; reviews in `review-log.md` | Three different questions, three different logs |

> Blueprint: ../../../spec-driven-template/05-review/01-logs/change-log.md
