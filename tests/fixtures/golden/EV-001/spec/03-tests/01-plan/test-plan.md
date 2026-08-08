# Test Plan

> Source: Ch. 4 §4.6, Ch. 17.
> **Beginner rule:** do not ask an AI agent to build a feature until you can write at
> least three checks for it — one normal case, one edge case, one failure case.

**Feature / release:** Pantry version one — recipes, weekly plans, shopping-list generation, search
**Requirements covered:** REQ-F-001–004, REQ-NF-001–006, REQ-R-001, BR-001–003
**Version:** TEST v1.0

**Thoroughness:** [TODO: how thorough should the test plan be? — Q-024] — the levels below
follow the depth rule (full pyramid for the core capability, acceptance level for
supporting areas) until Q-024 sets the overall bar.

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
| Unit | A small piece of logic behaves correctly. | `../tests/unit/` | [unit-tests.md](../02-functional/unit-tests.md) |
| Integration | Two or more parts work together. | `../tests/integration/` | [integration-tests.md](../02-functional/integration-tests.md) |
| End-to-end | A complete user flow works. | `../tests/end-to-end/` | [end-to-end-tests.md](../02-functional/end-to-end-tests.md) |
| Acceptance | The requirement works from the user/business view. | — | [acceptance-tests.md](../02-functional/acceptance-tests.md) |
| Security | Rules cannot be bypassed. | `../tests/integration/` | [security-tests.md](../03-non-functional/security-tests.md) |
| Performance | The system responds under expected load. | — | [performance-tests.md](../03-non-functional/performance-tests.md) |
| Failure / edge | Errors are handled safely. | — | [edge-cases-and-failures.md](../04-failure/edge-cases-and-failures.md) |
| Regression | A fixed bug does not return. | matching level | tracked in `../review/debugging-specification.md` |

---

## Coverage matrix

| Requirement | Acceptance test | Unit | Integration | E2E | Security | Performance | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-001 | ATEST-001 | UTEST-001, UTEST-002 | ITEST-001, ITEST-005 | ETEST-002 | STEST-002 | — | FTEST-001, FTEST-002, FTEST-008 |
| REQ-F-002 | ATEST-002 | — | ITEST-003 | — | STEST-006 | — | — |
| REQ-F-003 | ATEST-003, ATEST-005 | UTEST-003, UTEST-005 | ITEST-004 | ETEST-003 | STEST-001 | PTEST-001 | FTEST-005, FTEST-006 |
| REQ-F-004 | ATEST-004 | UTEST-004 | ITEST-006 | — | — | PTEST-002 | — |
| REQ-NF-001 | — | — | — | — | — | PTEST-001, PTEST-002 | — |
| REQ-NF-003 | — | — | — | ETEST-004 | — | — | FTEST-005, FTEST-008 |
| REQ-R-001 / SEC-Z-001 | — | — | — | — | STEST-001 | — | FTEST-004 |
| SEC-A-001 | — | — | ITEST-002 | ETEST-001 | STEST-002 | — | FTEST-003 |
| SEC-Z-002 | — | — | — | — | STEST-003 | — | FTEST-007 |
| BR-001 | ATEST-003 | UTEST-003 | ITEST-004 | — | — | — | — |
| BR-002 | — | — | ITEST-003 | — | STEST-006 | — | — |
| BR-003 | — | — | — | — | STEST-001 | — | — |

The core capability — REQ-F-003, generate one shopping list — carries the **full pyramid**:
unit, integration, end-to-end, failure, and performance. Supporting capabilities carry
acceptance-level coverage plus their specific risks (the depth rule, Round 2 / Round 4).

---

## Quality gate before implementation (Ch. 16 §16.6)

> Before you implement a task, confirm the test plan answers this question:
> **How will I know this task works without trusting the AI agent blindly?**

- [x] Every Must requirement has at least one acceptance test.
- [x] Every business rule has a test.
- [x] Every role/permission boundary has a negative test.
- [x] Every validation rule has an invalid-input test.
- [x] Every failure state in the reliability spec has a test.
- [ ] Every API contract has a request/response shape test — sign-in contracts wait on Q-009.
- [x] Tests are written from **requirements**, not from existing code.

---

## Practical rules

- **End-to-end scope (Ch. 17 §17.4):** if a user would complain loudly when a flow breaks,
  that flow deserves an end-to-end test plan. Do not cover every tiny rule with E2E tests.
- **Security bias (Ch. 17 §17.5):** an agent may implement the happy path and forget the
  denial path. For every feature ask: who is allowed, who is not allowed, what input must
  be rejected, what must never be exposed?
- **Quality rule (Ch. 3 §3.6):** if you cannot describe how to test a requirement, you do
  not understand the requirement well enough yet.

> Blueprint: blueprints/03-tests/01-plan/test-plan.md
