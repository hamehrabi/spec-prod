# Edge Cases and Failure Conditions

> Source: Ch. 17 §17.7, Ch. 4 §4.6 (`failure-tests.md`), Ch. 30 §30.2.
> An **edge case** is an unusual but possible situation. A **failure condition** is a
> situation where the system cannot complete the request safely. Both must be planned
> before implementation — they are easy for AI agents to miss.

**Method:** start with the normal case, then ask what could be *empty, too long,
duplicated, expired, unavailable, unauthorized, or invalid*.

---

## Case table

| Case ID | Requirement ID | Case type | Input / condition | Risk covered | Status |
|---|---|---|---|---|---|
| FTEST-001 | REQ-F-001 | Failure | Recipe title missing or blank | Bad data enters the library | Planned |
| FTEST-002 | REQ-F-001 | Failure | Recipe with zero ingredient lines | An empty recipe silently thins the week's list | Planned |
| UTEST-002 | REQ-F-001 | Boundary | Exactly one ingredient line | Off-by-one at the minimum | Planned |
| FTEST-003 | SEC-A-001 | Security | Any write attempted signed out | Unauthenticated writes | Planned |
| FTEST-004 | SEC-Z-001 | Security | A guessed ID from another account | Cross-account reads; existence leaks | Planned |
| ATEST-005 | REQ-F-003 | Edge | Two planned recipes share an ingredient | The core rule is undecided — Q-011 | Blocked |
| FTEST-005 | REQ-NF-003 | Failure | Database write fails mid-generation | A partial list survives the failure | Planned |
| FTEST-006 | REQ-F-003 | Edge | Generate requested twice for the same plan | Duplicate or conflicting lists — regeneration semantics are part of Q-013 | Blocked |
| FTEST-007 | SEC-Z-002 | Failure | Photo upload that is not an accepted image | A non-image stored and served as a photo | Planned |
| FTEST-008 | REQ-NF-003 | Failure | Database write fails during recipe save | False success; typed work lost | Planned |
| [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013] | REQ-F-003 | Edge | A plan is deleted while its list exists | Orphaned or vanished lists — undecided | Blocked |

> **"Case ID" CITES the test that covers the case — it does not mint a new identifier.**
> A case found here becomes a test somewhere: a failure case is an `FTEST-###` in
> [`failure-tests.md`](failure-tests.md), a boundary case is a `UTEST-###` in
> [`unit-tests.md`](../02-functional/unit-tests.md). Write that id here once it exists. Until it
> does, leave the sanctioned marker naming the question — the same `[TODO: ...]` form every
> other unknown uses.
>
> **And do not restate the test's expected result here.** A run that cites correctly can still
> copy the outcome into this table in its own words, and then two files describe the same
> assertion differently — "400; no row written" here against "400 + field-named message;
> nothing saved" there. Nothing is contradictory on the day it is written and nothing keeps
> them equal afterwards. **This table records what was DISCOVERED — the input or condition, the
> case type, the risk it covers — and points at the test for what the system must do.**

**Case types:** Normal · Edge · Failure · Security · Boundary

---

## The seven questions (Ch. 17 §17.7)

| Question to ask | Pantry case |
|---|---|
| What if the value is empty? | A recipe title is blank; a recipe has no lines. |
| What if the value is too long? | No length limits are stated — a limit would need a requirement first. |
| What if the value is duplicated? | The same generate request arrives twice (FTEST-006, part of Q-013). |
| What if the value is expired? | A session expires mid-plan — mechanics follow the Q-009 model. |
| What if the user is not allowed? | Another account's ID is guessed (FTEST-004). |
| What if the dependency fails? | The database write fails (FTEST-005, FTEST-008). There is no external service to fail (Round 6). |
| What if the action is repeated? | Regeneration of an existing list — undecided, Q-013. |

---

## Failure sources checklist (Ch. 22 §22.2)

- [x] User input — missing, invalid, unexpected
- [x] Database — write failure, timeout, constraint violation
- [x] Network — request timeout (the 10 s cap in reliability §4)
- [x] External service — none exist in version one (Round 6); dormant
- [x] Background job — none exist in version one; dormant
- [ ] Concurrency — one user on one account; two open tabs remain possible. Covered by the version fields in reliability §A2; no dedicated case yet.
- [x] Authorization — single role; cross-account denial covered

Each failure state must have a **recovery path, user message, log event, and test case** →
[`../docs/reliability-specification.md`](../../01-docs/07-security-and-reliability/reliability-specification.md)

> Blueprint: blueprints/03-tests/04-failure/edge-cases-and-failures.md
