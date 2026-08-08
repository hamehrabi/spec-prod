# Test Specification

> Source: Ch. 17 §17.8 + Appendix G.
> Explains **how a requirement will be verified**, clearly enough that you, another
> developer, or an AI agent can later create the actual tests from it.

---

## Per-test fields (Appendix G)

| Field | What to write |
|---|---|
| Test ID | Unique identifier such as `TEST-001`. |
| Related requirement | Requirement ID this test verifies. |
| Test level | Unit, integration, end-to-end, security, performance, or regression. |
| Scenario | Plain-language behavior being tested. |
| Preconditions | Setup required before the test runs. |
| Input data | Valid, invalid, boundary, or malicious inputs. |
| Expected result | Observable outcome. |
| Failure meaning | What it means if this test fails. |
| Automation status | Manual, planned, automated, or blocked. |
| Owner | Person or role responsible for maintaining the test. |

## Test case template (Ch. 27 §27.8)

```
Test ID:
Requirement covered:
Test level:
Role:
Preconditions:
Input or user action:
Expected result:
Permission expectation:
Error or empty-state expectation:
Evidence to capture:
Failure meaning:
Automation status:   Manual / Planned / Automated / Blocked
Owner:
Status:              Not run / Pass / Fail / Needs review
```

---

## Test specification matrix

**This matrix is an INDEX, not a second copy of the tests.** One row per test, naming where it
is specified and what it covers — the scenario, the expected result and the preconditions live
in the file that owns the test.

| Test ID | Requirement ID | Level | Specified in | Risk covered | Status |
|---|---|---|---|---|---|
| ATEST-001 | REQ-F-001 | Acceptance | `../02-functional/acceptance-tests.md` | A recipe cannot be saved | Planned |
| ATEST-002 | REQ-F-004 | Acceptance | `../02-functional/acceptance-tests.md` | The core promise fails | Planned |
| ATEST-003 | REQ-F-004 | Acceptance | `../02-functional/acceptance-tests.md` | Empty week errors instead of empty list | Planned |
| ATEST-004 | REQ-NF-002 | Acceptance | `../02-functional/acceptance-tests.md` | Cross-account data exposure | Planned |
| ATEST-005 | REQ-F-002 | Acceptance | `../02-functional/acceptance-tests.md` | Recipes cannot be found | Planned |
| ATEST-006 | REQ-F-003 | Acceptance | `../02-functional/acceptance-tests.md` | A week cannot be planned | Planned |
| ATEST-007 | REQ-F-005 | Acceptance | `../02-functional/acceptance-tests.md` | Data is not private to one account | Planned |
| ATEST-008 | REQ-F-006 | Acceptance | `../02-functional/acceptance-tests.md` | List is not usable in the shop | Planned |
| UTEST-001 | REQ-F-001 | Unit | `../02-functional/unit-tests.md` | Bad recipe titles enter the store | Planned |
| UTEST-002 | REQ-F-002 | Unit | `../02-functional/unit-tests.md` | Search misses or leaks matches | Planned |
| UTEST-003 | REQ-F-004 | Unit | `../02-functional/unit-tests.md` | The core list logic is wrong | Planned |
| UTEST-004 | REQ-F-004 | Unit | `../02-functional/unit-tests.md` | Empty week not handled | Planned |
| UTEST-005 | BR-003 | Unit | `../02-functional/unit-tests.md` | A meal references a non-owned recipe | Planned |
| ITEST-001 | REQ-F-001 | Integration | `../02-functional/integration-tests.md` | Recipe not persisted/scoped | Planned |
| ITEST-002 | REQ-F-002 | Integration | `../02-functional/integration-tests.md` | Search crosses accounts | Planned |
| ITEST-003 | REQ-F-003 | Integration | `../02-functional/integration-tests.md` | Plan references cross-account recipe | Planned |
| ITEST-004 | REQ-F-004 | Integration | `../02-functional/integration-tests.md` | Generated list is wrong via the API | Planned |
| ITEST-005 | REQ-F-006 | Integration | `../02-functional/integration-tests.md` | Checked state not persisted | Planned |
| ITEST-006 | BR-004 | Integration | `../02-functional/integration-tests.md` | Deletion breaks a planned week | Planned |
| STEST-001 | SEC-Z-001 | Security | `../03-non-functional/security-tests.md` | Cross-account data access | Planned |
| STEST-002 | SEC-A-001 | Security | `../03-non-functional/security-tests.md` | Unauthenticated access | Planned |
| STEST-003 | SEC-A-002 | Security | `../03-non-functional/security-tests.md` | Passwords stored/logged in the clear | Planned |
| STEST-004 | SEC-Z-002 | Security | `../03-non-functional/security-tests.md` | A private photo leaks to another account | Planned |
| STEST-005 | SEC-A-003 | Security | `../03-non-functional/security-tests.md` | Account enumeration via reset | Planned |
| PTEST-001 | REQ-NF-001 | Performance | `../03-non-functional/performance-tests.md` | Core list generation is slow | Planned |
| PTEST-002 | REQ-F-002 | Performance | `../03-non-functional/performance-tests.md` | Search is slow | Planned |
| ETEST-001 | REQ-F-004 | End-to-end | `../02-functional/end-to-end-tests.md` | The core plan→list→tick flow breaks | Planned |
| ETEST-002 | REQ-F-005 | End-to-end | `../02-functional/end-to-end-tests.md` | Sign-in-to-save flow breaks | Planned |
| FTEST-001 | REQ-NF-003 | Failure | `../04-failure/failure-tests.md` | False success on a save failure | Planned |
| FTEST-002 | REQ-NF-003 | Failure | `../04-failure/failure-tests.md` | Partial list on a generation failure | Planned |
| FTEST-003 | REQ-F-001 | Failure | `../04-failure/failure-tests.md` | Bad data enters the store | Planned |
| FTEST-004 | SEC-A-001 | Failure | `../04-failure/failure-tests.md` | Action allowed while signed out | Planned |
| FTEST-005 | BR-003 | Failure | `../04-failure/failure-tests.md` | Plan references a missing recipe | Planned |
| FTEST-006 | BR-004 | Failure | `../04-failure/failure-tests.md` | A referenced recipe is deleted | Planned |

> **Two ID columns, on purpose.** `Test ID` and `Requirement ID` name the two things this row
> MAPS BETWEEN, and that is what makes it a mapping table rather than a definition of either.
> Each test is **defined once**, in the file for its level; this matrix cites those definitions
> and never restates a scenario or expected result.

**Status values:** Planned · Written · Passing · Failing · Blocked

---

## Test levels (Appendix G)

| Test type | Question it answers | Example |
|---|---|---|
| Unit | Does one small function behave correctly? | List generation gathers a week's ingredient lines. |
| Integration | Do connected parts work together? | The API saves a recipe and stores it scoped to the account. |
| End-to-end | Can a user complete the workflow? | Cook signs in, plans a week, generates one list, ticks items off. |
| Security | Can rules be bypassed? | A cook cannot read another account's week. |
| Performance | Does the system respond under expected load? | List generation returns within the target time. |

---

## Reviewing AI-generated tests (Ch. 18 §18.2)

Never accept generated tests just because they look professional. A test can be
well-formatted and still be weak.

| Review area | Question to ask | How to fix weakness |
|---|---|---|
| Requirement link | Does this test prove a specific requirement or acceptance criterion? | Add the requirement ID beside the test. |
| Clear assertion | Does the test check a real expected result? | Replace vague checks with exact status codes, messages, values, or state changes. |
| Failure path | Does it cover what happens when something goes wrong? | Add invalid input, missing data, permission failure, timeout cases. |
| No invented behavior | Did the AI add behavior not in the spec? | Remove it — or update the spec first. |
| Stable data | Can the test run repeatedly with predictable results? | Use controlled test data and reset state when needed. |

**Shallow vs. useful:** a shallow test gives you confidence without proof. Ask *what exact
promise does this feature make, and how can a test prove that promise?*

---

> Blueprint: blueprints/03-tests/01-plan/test-specification.md
