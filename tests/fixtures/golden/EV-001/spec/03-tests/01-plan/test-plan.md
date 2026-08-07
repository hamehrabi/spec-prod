# Test Plan

> Source: Ch. 4 §4.6, Ch. 17.
> **Beginner rule:** do not ask an AI agent to build a feature until you can write at
> least three checks for it — one normal case, one edge case, one failure case.

**Feature / release:** Pantry v1.0 — recipes, weekly plan, shopping-list generation
**Requirements covered:** REQ-F-001…REQ-F-005, REQ-NF-002, REQ-NF-003, BR-001, BR-002, BR-003
**Version:** TEST v1.0

> [TODO: how thorough should the test plan be — standard, minimal, or thorough? — Q-016]
> Version one plans **standard** coverage (acceptance, unit, integration, failure, key
> security), pending that decision. Reliability is a driving characteristic, so failure
> paths are covered regardless.

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
| REQ-F-001 | — | — | — | — | STEST-002 | — | — |
| REQ-F-002 | ATEST-002 | UTEST-001, UTEST-002 | ITEST-001 | E2E-001 | STEST-001 | — | FTEST-002 |
| REQ-F-003 | — | — | ITEST-002 | — | — | — | — |
| REQ-F-004 | — | — | ITEST-003 | — | — | — | — |
| REQ-F-005 | ATEST-001 | UTEST-003 | — | E2E-002 | — | PTEST-001 | FTEST-001, FTEST-003 |
| REQ-NF-002 | ATEST-003 | — | — | — | STEST-001 | — | — |
| BR-001 | ATEST-001 | UTEST-003 | — | — | — | — | — |
| BR-002 | — | UTEST-001 | — | — | — | — | FTEST-002 |
| BR-003 | ATEST-003 | — | — | — | STEST-001 | — | — |

---

## Quality gate before implementation (Ch. 16 §16.6)

> Before you implement a task, confirm the test plan answers this question:
> **How will I know this task works without trusting the AI agent blindly?**

- [ ] Every Must requirement has at least one acceptance test.
- [ ] Every business rule has a test.
- [ ] Every role/permission boundary has a negative test.
- [ ] Every validation rule has an invalid-input test.
- [ ] Every failure state in the reliability spec has a test.
- [ ] Every API contract has a request/response shape test.
- [ ] Tests are written from **requirements**, not from existing code.

---

## Practical rules

- **End-to-end scope (Ch. 17 §17.4):** if a user would complain loudly when a flow breaks,
  that flow deserves an end-to-end test plan. Do not cover every tiny rule with E2E tests.
- **Security bias (Ch. 17 §17.5):** an agent may implement the happy path and forget the
  denial path. For every feature ask: who is allowed, who is not allowed, what input must
  be rejected, what must never be exposed?
- **Quality rule (Ch. 3 §3.6):** if you cannot describe how to test a requirement, you do
  not understand the requirement well enough yet.

---

> Blueprint: blueprints/03-tests/01-plan/test-plan.md
