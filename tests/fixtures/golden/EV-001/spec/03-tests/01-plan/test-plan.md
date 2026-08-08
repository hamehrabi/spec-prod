# Test Plan

> Source: Ch. 4 §4.6, Ch. 17.
> **Beginner rule:** do not ask an AI agent to build a feature until you can write at
> least three checks for it — one normal case, one edge case, one failure case.

**Feature / release:** Pantry v1.0 — recipes, weekly planning, one shopping list
**Requirements covered:** REQ-F-001…006, REQ-NF-001…003, BR-001…004, SEC-A-001, SEC-Z-001, SEC-Z-002
**Version:** TEST v1.0

---

## Why tests come first (Ch. 17 §17.1)

| Without test planning | With test planning |
|---|---|
| The agent decides what "done" means. | You define what "done" means before implementation. |
| Bugs are found late, often during manual review. | Expected behavior is checked early and repeatedly. |
| The code may satisfy the prompt but not the requirement. | The code must satisfy visible acceptance criteria. |
| You approve features based on appearance. | You approve features based on **evidence**. |

---

## Test strategy by level

| Level | What it checks | Where it lives | File |
|---|---|---|---|
| Unit | A small piece of logic behaves correctly. | `../05-executable/unit/` | [unit-tests.md](../02-functional/unit-tests.md) |
| Integration | Two or more parts work together. | `../05-executable/integration/` | [integration-tests.md](../02-functional/integration-tests.md) |
| End-to-end | A complete user flow works. | `../05-executable/end-to-end/` | [end-to-end-tests.md](../02-functional/end-to-end-tests.md) |
| Acceptance | The requirement works from the user/business view. | — | [acceptance-tests.md](../02-functional/acceptance-tests.md) |
| Security | Rules cannot be bypassed. | `../05-executable/integration/` | [security-tests.md](../03-non-functional/security-tests.md) |
| Performance | The system responds under expected load. | — | [performance-tests.md](../03-non-functional/performance-tests.md) |
| Failure / edge | Errors are handled safely. | — | [edge-cases-and-failures.md](../04-failure/edge-cases-and-failures.md) |
| Regression | A fixed bug does not return. | matching level | tracked in `../../05-review/04-debugging/debugging-specification.md` |

---

## Coverage matrix

| Requirement | Acceptance test | Unit | Integration | E2E | Security | Performance | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-001 | ATEST-001 | UTEST-001 | ITEST-001 | ETEST-002 | — | — | FTEST-001, FTEST-003 |
| REQ-F-002 | ATEST-005 | UTEST-002 | ITEST-002 | — | — | PTEST-002 | — |
| REQ-F-003 | ATEST-006 | UTEST-005 | ITEST-003 | ETEST-001 | — | — | FTEST-005 |
| REQ-F-004 | ATEST-002, ATEST-003 | UTEST-003, UTEST-004 | ITEST-004 | ETEST-001 | STEST-001 | PTEST-001 | FTEST-002 |
| REQ-F-005 | ATEST-007 | — | — | ETEST-002 | STEST-002, STEST-003, STEST-005 | — | FTEST-004 |
| REQ-F-006 | ATEST-008 | — | ITEST-005 | ETEST-001 | — | — | — |
| REQ-NF-001 | — | — | — | — | — | PTEST-001 | — |
| REQ-NF-002 | ATEST-004 | — | — | — | STEST-001, STEST-004 | — | — |
| REQ-NF-003 | — | — | — | — | — | — | FTEST-001, FTEST-002 |
| BR-001 | ATEST-002 | UTEST-003 | ITEST-004 | — | — | — | — |
| BR-003 | — | UTEST-005 | ITEST-003 | — | — | — | FTEST-005 |
| BR-004 | — | — | ITEST-006 | — | — | — | FTEST-006 |

---

## Test thoroughness

At express depth the thoroughness question was not asked (`Q-014`); this plan is the
**driver-led baseline** — acceptance, unit, integration, end-to-end, security deny tests, and
failure tests tied to the reliability spec and the three drivers (`driving-characteristics.md`).
Whether to go further — full negative RBAC beyond the single role, or performance testing
beyond the `Q-010` target — stays open as `Q-014` with the Developer as owner.

---

## Quality gate before implementation (Ch. 16 §16.6)

> Before you implement a task, confirm the test plan answers this question:
> **How will I know this task works without trusting the AI agent blindly?**

- [x] Every Must requirement has at least one acceptance test.
- [x] Every business rule has a test.
- [x] Every role/permission boundary has a negative test.
- [x] Every validation rule has an invalid-input test.
- [x] Every failure state in the reliability spec has a test.
- [x] Every API contract has a request/response shape test.
- [x] Tests are written from **requirements**, not from existing code.

---

## Practical rules

- **End-to-end scope (Ch. 17 §17.4):** if a user would complain loudly when a flow breaks,
  that flow deserves an end-to-end test plan. The core plan → list → tick flow earns one.
- **Security bias (Ch. 17 §17.5):** an agent may implement the happy path and forget the
  denial path. For every feature ask: who is allowed, who is not allowed, what input must
  be rejected, what must never be exposed?
- **Quality rule (Ch. 3 §3.6):** if you cannot describe how to test a requirement, you do
  not understand the requirement well enough yet.

---

> Blueprint: blueprints/03-tests/01-plan/test-plan.md
