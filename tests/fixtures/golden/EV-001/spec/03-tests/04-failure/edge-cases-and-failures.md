# Edge Cases and Failure Conditions

> Source: Ch. 17 §17.7, Ch. 4 §4.6 (`failure-tests.md`), Ch. 30 §30.2.
> An **edge case** is an unusual but possible situation. A **failure condition** is a
> situation where the system cannot complete the request safely. Both must be planned
> before implementation — they are easy for AI agents to miss.

**Method:** start with the normal case, then ask what could be *empty, too long,
duplicated, expired, unavailable, unauthorized, or invalid*.

---

## Case table

| Case ID | Requirement | Case type | Input / condition | Expected result | Risk covered | Status |
|---|---|---|---|---|---|---|
| FTEST-001 | REQ-NF-003 | Failure | Shopping-list generation fails | Safe error; plan preserved; no partial write | Data loss / crash | Planned |
| FTEST-002 | REQ-F-002 / BR-002 | Failure | Recipe with no title or no ingredient line | 400; nothing saved | Bad data enters the database | Planned |
| FTEST-003 | REQ-NF-003 | Failure | Database write timeout during save | Retry-safe error; no partial write | Silent success / partial write | Planned |
| E-EMPTY | REQ-F-005 | Edge | Generate from a plan with no meals | Empty list, not an error | Confusing empty state | Planned |

**Case types:** Normal · Edge · Failure · Security · Boundary

---

## The seven questions (Ch. 17 §17.7)

| Question to ask | Pantry example |
|---|---|
| What if the value is empty? | A recipe title is blank. |
| What if the value is too long? | A recipe title has 500 characters. |
| What if the value is duplicated? | The cook clicks Generate twice. |
| What if the value is expired? | A session expires mid-form. |
| What if the user is not allowed? | A request targets another account's data. |
| What if the dependency fails? | n/a in v1 — no external dependency. |
| What if the action is repeated? | The same save request arrives twice. |

---

## Failure sources checklist (Ch. 22 §22.2)

- [ ] User input — missing, invalid, unexpected
- [ ] Database — write failure, timeout, constraint violation
- [ ] Network — request timeout, connection reset
- [ ] External service — n/a in v1 (Q-007)
- [ ] Background job — photo cleanup fails after the user has left
- [ ] Concurrency — two edits to the same recipe (single user, low risk)
- [ ] Authorization — a request for another account's data

Each failure state must have a **recovery path, user message, log event, and test case** →
[`../docs/reliability-specification.md`](../../01-docs/07-security-and-reliability/reliability-specification.md)

---

> Blueprint: blueprints/03-tests/04-failure/edge-cases-and-failures.md
