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
| ATEST-001 | REQ-F-001 | Acceptance | `../02-functional/acceptance-tests.md` | Recipes cannot be captured | Planned |
| ATEST-002 | REQ-F-002 | Acceptance | `../02-functional/acceptance-tests.md` | A week cannot be planned | Planned |
| ATEST-003 | REQ-F-003 | Acceptance | `../02-functional/acceptance-tests.md` | The core promise fails | Planned |
| ATEST-004 | REQ-F-004 | Acceptance | `../02-functional/acceptance-tests.md` | Saved recipes cannot be found | Planned |
| ATEST-005 | REQ-F-003 | Acceptance | `../02-functional/acceptance-tests.md` | Shared-ingredient rule undefined | Blocked |
| UTEST-001 | REQ-F-001 | Unit | `../02-functional/unit-tests.md` | Empty titles enter the library | Planned |
| UTEST-002 | REQ-F-001 | Unit | `../02-functional/unit-tests.md` | A recipe with no lines produces empty lists | Planned |
| UTEST-003 | REQ-F-003 | Unit | `../02-functional/unit-tests.md` | The combining rule is guessed by the agent | Blocked |
| UTEST-004 | REQ-F-004 | Unit | `../02-functional/unit-tests.md` | Search matching drifts from the spec | Planned |
| UTEST-005 | REQ-F-003 | Unit | `../02-functional/unit-tests.md` | List order depends on insertion accidents | Planned |
| ITEST-001 | REQ-F-001 | Integration | `../02-functional/integration-tests.md` | Recipe and lines disagree | Planned |
| ITEST-002 | SEC-A-001 | Integration | `../02-functional/integration-tests.md` | Data reachable signed out | Planned |
| ITEST-003 | REQ-F-002, BR-002 | Integration | `../02-functional/integration-tests.md` | Cross-account recipe references | Planned |
| ITEST-004 | REQ-F-003, BR-001 | Integration | `../02-functional/integration-tests.md` | A list that misses ingredient lines | Planned |
| ITEST-005 | REQ-F-001 | Integration | `../02-functional/integration-tests.md` | Invalid input creates bad data | Planned |
| ITEST-006 | REQ-F-004, REQ-R-001 | Integration | `../02-functional/integration-tests.md` | Search leaks across accounts | Planned |
| ETEST-001 | SEC-A-001 | End-to-end | `../02-functional/end-to-end-tests.md` | The product cannot be entered | Planned |
| ETEST-002 | REQ-F-001 | End-to-end | `../02-functional/end-to-end-tests.md` | The save flow breaks in the browser | Planned |
| ETEST-003 | REQ-F-002, REQ-F-003 | End-to-end | `../02-functional/end-to-end-tests.md` | The core flow breaks end to end | Planned |
| ETEST-004 | REQ-NF-003 | End-to-end | `../02-functional/end-to-end-tests.md` | Typed work lost on failure | Planned |
| STEST-001 | SEC-Z-001 | Security | `../03-non-functional/security-tests.md` | Cross-account reads | Planned |
| STEST-002 | SEC-A-001 | Security | `../03-non-functional/security-tests.md` | Unauthenticated access | Planned |
| STEST-003 | SEC-Z-002 | Security | `../03-non-functional/security-tests.md` | Another account's photos readable | Planned |
| STEST-004 | REQ-NF-003 | Security | `../03-non-functional/security-tests.md` | Internals leak in errors | Planned |
| STEST-005 | REQ-F-001 | Security | `../03-non-functional/security-tests.md` | Unexpected fields change protected state | Planned |
| STEST-006 | BR-002 | Security | `../03-non-functional/security-tests.md` | Planning another account's recipe | Planned |
| PTEST-001 | REQ-NF-001 | Performance | `../03-non-functional/performance-tests.md` | Generation slower than the promise | Planned |
| PTEST-002 | REQ-NF-001 | Performance | `../03-non-functional/performance-tests.md` | Search slower than the promise | Planned |
| FTEST-001 | REQ-F-001 | Failure | `../04-failure/failure-tests.md` | Bad data enters on missing title | Planned |
| FTEST-002 | REQ-F-001 | Failure | `../04-failure/failure-tests.md` | A recipe with no lines saved | Planned |
| FTEST-003 | SEC-A-001 | Failure | `../04-failure/failure-tests.md` | Signed-out writes | Planned |
| FTEST-004 | SEC-Z-001 | Failure | `../04-failure/failure-tests.md` | 404 confirming existence | Planned |
| FTEST-005 | REQ-NF-003 | Failure | `../04-failure/failure-tests.md` | Partial list after failed generation | Planned |
| FTEST-006 | REQ-F-003 | Failure | `../04-failure/failure-tests.md` | Duplicate generation semantics | Blocked |
| FTEST-007 | SEC-Z-002 | Failure | `../04-failure/failure-tests.md` | Non-image stored as a photo | Planned |
| FTEST-008 | REQ-NF-003 | Failure | `../04-failure/failure-tests.md` | False success on failed save | Planned |

> **Two ID columns, on purpose.** `Test ID` and `Requirement ID` name the two things this row
> MAPS BETWEEN, and that is what makes it a mapping table rather than a definition of either.
> The validation reads a table with two `ID` headers as citations — so keep both words, and do
> not shorten `Requirement ID` to `Req`. It was `Req` once, and every row in this matrix was
> then reported as a second definition of the test it indexes: seventeen duplicates from one
> file, on every workspace this kit produced.
>
> **The Test ID column CITES; it does not mint.** A test is defined once, in the file for its
> level — `unit-tests.md`, `integration-tests.md`, `acceptance-tests.md`, `security-tests.md`,
> `failure-tests.md`. Write that id here once it exists. Until it does, leave the sanctioned
> marker naming the question — the same `[TODO: ...]` form every other unknown uses.
>
> This matrix used to carry `Scenario`, `Preconditions`, `Input` and `Expected result` columns —
> the whole test, restated. A run filled both, in different words, and the two agreed on the day
> they were written with nothing keeping them equal afterwards. **An index that repeats what it
> indexes is a second source of truth wearing a table header.**

**Status values:** Planned · Written · Passing · Failing · Blocked

---

## Test levels (Appendix G)

| Test type | Question it answers | Example |
|---|---|---|
| Unit | Does one small function behave correctly? | Title validation rejects an empty recipe title. |
| Integration | Do connected parts work together? | The API saves a recipe and its lines in one transaction. |
| End-to-end | Can a user complete the workflow? | Sign in, plan a week, generate the shopping list. |
| Security | Can rules be bypassed? | An account holder cannot read another account's recipes. |
| Performance | Does the system respond under expected load? | The list generates within the REQ-NF-001 target. |

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

> Blueprint: blueprints/03-tests/01-plan/test-specification.md
