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

| Test ID | Req | Level | Specified in | Risk covered | Status |
|---|---|---|---|---|---|
| | REQ-F-001 | Integration | `../02-functional/integration-tests.md` | | Planned |
| | | Unit | `../02-functional/unit-tests.md` | | |
| | | Security | `../03-non-functional/security-tests.md` | | |

> **The Test ID column CITES; it does not mint.** A test is defined once, in the file for its
> level — `unit-tests.md`, `integration-tests.md`, `acceptance-tests.md`, `security-tests.md`,
> `failure-tests.md`. Write that id here once it exists, and `[TODO: which test covers this?]`
> until it does.
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
| Unit | Does one small function behave correctly? | Title validation rejects an empty task title. |
| Integration | Do connected parts work together? | API creates a task and stores it in the database. |
| End-to-end | Can a user complete the workflow? | User signs in, creates a task, marks it done. |
| Security | Can rules be bypassed? | User cannot access another user's task. |
| Performance | Does the system respond under expected load? | Task list loads within the target response time. |

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

## Prompts

**Generate tests from acceptance criteria (Ch. 18 §18.1)**
```
You are helping me generate tests from a software requirement. Do not invent behavior
outside the specification.

Requirement ID: [REQ-ID]
Requirement: [paste the requirement]

Acceptance Criteria:
[paste acceptance criteria]

Test Level: [unit / API / integration / UI]

Output Format:
- Test name
- Scenario
- Input
- Expected result
- Notes about edge cases

Generate only tests that directly prove the acceptance criteria.
```

**Improve shallow tests (Ch. 18 §18.3)**
```
Review the following test cases against the requirement and acceptance criteria.

Requirement: [paste requirement]
Acceptance Criteria: [paste criteria]
Current Tests: [paste tests]

Identify:
1. Tests that are too shallow
2. Missing success cases
3. Missing failure cases
4. Weak assertions
5. Any behavior that is not supported by the spec

Then rewrite the tests so each one proves a specific acceptance criterion.
```

**Acceptance criteria → test table (Ch. 13 §13.6)**
```
Create tests from the acceptance criteria below.
Do not test behavior that is not listed.

Feature: [FEATURE NAME]
Acceptance criteria: [PASTE]
Edge cases: [PASTE]
Error cases: [PASTE]

Return a table with:
- Test ID
- Scenario
- Input
- Expected result
- Requirement ID covered

Then provide the test code or test pseudocode.
```

---

# WORKED EXAMPLE — unit test plan (Ch. 17 §17.2)

```
UNIT TEST PLAN: Task status validation
Requirement ID: REQ-TASK-04
Rule: A task status must be one of todo, in_progress, or done.

Normal case:  status = "todo"     -> accepted.
Edge case:    status = "DONE"     -> rejected, or normalized only if the spec allows it.
Failure case: status = "archived" -> rejected with a clear validation error.
```

## Login test set (Ch. 17)

| Scenario | Test type | Expected result |
|---|---|---|
| Valid user logs in | Integration | User receives a session and is redirected to the dashboard. |
| Wrong password submitted | Integration / security | Login rejected with a safe error message. |
| Empty email submitted | Unit / validation | Request rejected before checking credentials. |
| Unregistered email submitted | Security | Login rejected **without revealing whether the email exists**. |
| Dashboard opened without login | End-to-end / security | User is redirected to the login page. |
