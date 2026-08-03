# Test Plan

> Source: Ch. 4 §4.6, Ch. 17.
> **Beginner rule:** do not ask an AI agent to build a feature until you can write at
> least three checks for it — one normal case, one edge case, one failure case.

**Feature / release:**
**Requirements covered:**
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
| REQ-F-001 | TEST-001 | TEST-002 | TEST-003 | — | TEST-004 | — | TEST-005 |
| REQ-F-002 | | | | | | | |

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

## Prompts

**Create a test checklist from requirements (Prompt box 4.2)**
```
Use the requirements below to create a beginner-friendly test checklist.

Requirements: [paste requirements]

Return acceptance tests, unit test ideas, integration test ideas, and failure tests.
Each test must say what action is performed and what result is expected.
```

**Turn a requirement into a test spec (Ch. 17)**
```
You are helping me plan tests before code generation.

Requirement ID: REQ-###
Requirement: [paste requirement]

Create a test specification table with:
- normal case
- edge cases
- failure cases
- security cases
- expected result for each case

Do not write implementation code yet.
```

---

# WORKED EXAMPLE — ProjectBoard

**Feature / release:** ProjectBoard v1.0 — auth + tasks
**Requirements covered:** REQ-AUTH-001, REQ-F-001, REQ-F-005, REQ-F-006, REQ-NF-001, BR-003, BR-004

## Coverage matrix

| Requirement | Acceptance | Unit | Integration | E2E | Security | Performance | Failure |
|---|---|---|---|---|---|---|---|
| REQ-AUTH-001 | ATEST-001 | UTEST-002 | TEST-AUTH-002 | ETEST-001 | STEST-006 | — | FTEST-003 |
| REQ-F-001 | ATEST-002 | UTEST-004, UTEST-005 | TEST-006 | ETEST-003 | STEST-002 | — | FTEST-001 |
| REQ-F-005 | ATEST-003 | UTEST-006 | TEST-007 | — | STEST-002 | — | FTEST-002 |
| REQ-F-006 | ATEST-004 | — | TEST-008 | — | STEST-001, STEST-007 | PTEST-003 | — |
| REQ-NF-001 | — | — | — | — | — | PTEST-003 | — |
| BR-003 | ATEST-005 | UTEST-007 | — | — | — | — | FTEST-002 |
| BR-004 | — | — | TEST-009 | — | — | — | FTEST-006 |

## Quality gate — checked before implementation

- [x] Every Must requirement has at least one acceptance test.
- [x] Every business rule (BR-003, BR-004) has a test.
- [x] Every role boundary has a negative test (STEST-002 covers Viewer).
- [x] Every validation rule has an invalid-input test.
- [x] Every failure state in the reliability spec has a test.
- [x] Every API contract has a request/response shape test.
- [x] Tests were written from **acceptance criteria**, not from existing code.

## The three checks written before TASK-006 was assigned

Per Ch. 17: one normal, one edge, one failure.

| Type | Check |
|---|---|
| Normal | Valid title + valid project → 201, task saved with status `todo`. |
| Edge | Title of exactly 120 characters → accepted. Title of 121 → rejected. |
| Failure | Title missing → 400, clear message, **nothing written to the database**. |

> Only after these three existed was the task handed to the agent. That is what made the
> output reviewable rather than merely plausible.
