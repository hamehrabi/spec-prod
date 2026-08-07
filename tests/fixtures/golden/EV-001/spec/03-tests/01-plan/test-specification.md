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

| Test ID | Req | Level | Scenario | Preconditions | Input | Expected result | Risk covered | Status |
|---|---|---|---|---|---|---|---|---|
| ATEST-001 | REQ-F-005 | Acceptance | Generate a list from a plan | A plan with planned meals | Click generate | List has every planned ingredient | Missing item at the shop | Planned |
| UTEST-003 | REQ-F-005 | Unit | Combine ingredients across meals | Two meals share an ingredient | Two ingredient lists | Combined per the Q-009 rule | Wrong core output | Blocked (Q-009) |
| ITEST-001 | REQ-F-002 | Integration | Save a recipe via the API | Signed-in cook | Valid recipe body | 201; recipe row scoped to the account | Bad/unscoped data | Planned |
| STEST-001 | REQ-NF-002 | Security | Cross-account access | Two accounts | Request account B's recipe as A | Safe 404; nothing returned | Data leak between accounts | Planned |
| FTEST-001 | REQ-NF-003 | Failure | Generation fails | A valid plan | Simulated failure | Safe error; plan preserved | Data loss / crash | Planned |

**Status values:** Planned · Written · Passing · Failing · Blocked

---

## Test levels (Appendix G)

| Test type | Question it answers | Example |
|---|---|---|
| Unit | Does one small function behave correctly? | Recipe validator rejects an empty title. |
| Integration | Do connected parts work together? | The API saves a recipe and stores it scoped to the account. |
| End-to-end | Can a user complete the workflow? | Cook plans a week and generates a list. |
| Security | Can rules be bypassed? | A cook cannot read another account's recipe. |
| Performance | Does the system respond under expected load? | List generation feels immediate. |

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
