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
| FTEST-003 | REQ-F-001 | Failure | Recipe title empty | Bad data enters the store | Planned |
| UTEST-001 | REQ-F-001 | Boundary | Title 120 vs 121 characters | Off-by-one at the length limit | Planned |
| UTEST-004 | REQ-F-004 | Edge | Week with no planned meals | Empty core output must not error | Planned |
| FTEST-005 | BR-003 | Failure | Planned meal references another account's recipe | Cross-account reference | Planned |
| FTEST-006 | BR-004 | Failure | Delete a recipe used by a plan | Silent breakage of a planned week | Planned |
| STEST-001 | SEC-Z-001 | Security | Request another account's week | Cross-account data exposure | Planned |
| FTEST-001 | REQ-NF-003 | Failure | Database write timeout on save | False success / partial write | Planned |

> **"Case ID" CITES the test that covers the case — it does not mint a new identifier.**
> A failure case is an `FTEST-###` in [`failure-tests.md`](failure-tests.md); a boundary case
> is a `UTEST-###` in [`../02-functional/unit-tests.md`](../02-functional/unit-tests.md). This
> table records what was **discovered** — the input or condition, the case type, the risk it
> covers — and points at the test for what the system must do.

**Case types:** Normal · Edge · Failure · Security · Boundary

---

## The seven questions (Ch. 17 §17.7)

| Question | Pantry case | Case type | Test that covers it |
|---|---|---|---|
| What if the value is empty? | Recipe title is `""` | Failure | FTEST-003 |
| What if the value is too long? | Title is 121 characters | Boundary | UTEST-001 |
| What if the value is duplicated? | The list is generated twice for one week | Edge | ITEST-004 |
| What if the value is expired? | A password reset link is used after expiry | Failure | STEST-005 |
| What if the user is not allowed? | A cook requests another account's week | Security | STEST-001 |
| What if the dependency fails? | The database write times out on save | Failure | FTEST-001 |
| What if the action is repeated? | The same recipe save is submitted twice | Edge | ITEST-001 |

---

## Failure sources checklist (Ch. 22 §22.2)

- [x] User input — missing title, oversize title, non-owned recipe reference
- [x] Database — write timeout on save; read failure on generation
- [ ] Network — request timeout; covered by the reliability timeout rule, no dedicated test yet
- [x] External service — none in version one (`Q-007`); nothing to fail
- [x] Background job — none in version one; nothing to fail
- [ ] Concurrency — one user; last-write-wins is acceptable, no dedicated test
- [x] Authorization — cross-account and unauthenticated access (STEST-001, STEST-002)

Each failure state must have a **recovery path, user message, log event, and test case** →
[`../../01-docs/07-security-and-reliability/reliability-specification.md`](../../01-docs/07-security-and-reliability/reliability-specification.md)

---

> Blueprint: blueprints/03-tests/04-failure/edge-cases-and-failures.md
