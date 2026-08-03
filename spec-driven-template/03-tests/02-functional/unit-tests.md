# Unit Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.2.
> Unit tests check **small pieces of logic** that can be tested without running the entire
> application: calculations, validators, permission checks, formatting rules, helpers.

A good unit test plan names the **rule**, the **input**, the **expected output**, and the
**reason the rule matters**. You do not need final test code here — only behavior clear
enough that code can later be generated against it.

---

| Test ID | Requirement | Rule under test | Normal case | Edge case | Failure case | Status |
|---|---|---|---|---|---|---|
| UTEST-001 | REQ-### | | | | | Planned |
| UTEST-002 | | | | | | |

---

## Examples (Ch. 17 §17.2)

| Requirement detail | Unit test idea |
|---|---|
| A password must contain at least eight characters. | Pass short passwords and confirm they are rejected. |
| A project title cannot be empty. | Pass an empty title and confirm validation fails. |
| A task status must be `todo`, `in_progress`, or `done`. | Pass an unsupported status and confirm it is rejected. |
| A due-date validator rejects dates in the past. | Pass yesterday's date and confirm rejection. |

---

## What belongs here

- Validation functions
- Business-rule predicates (`can_create_task`, `is_project_member`)
- Value formatting and parsing
- Metric/aggregation helpers
- Filter parsing
- Status transition rules

## What does **not** belong here

- Database round-trips → [`integration-tests.md`](integration-tests.md)
- Full user journeys → [`end-to-end-tests.md`](end-to-end-tests.md)
- Response contract shape → [`integration-tests.md`](integration-tests.md)

---

## Template

```
UNIT TEST PLAN: [rule name]
Requirement ID: REQ-###
Rule: [the rule in one sentence]

Normal case:  [input] -> [expected]
Edge case:    [input] -> [expected]
Failure case: [input] -> [expected, with a clear error]

Why this rule matters:
```

Executable tests live in [`../tests/unit/`](../05-executable/unit).

---

# WORKED EXAMPLE — ProjectBoard

| Test ID | Requirement | Rule under test | Normal case | Edge case | Failure case | Status |
|---|---|---|---|---|---|---|
| UTEST-002 | REQ-AUTH-001 | Email format validation | `ada@example.com` accepted | `a@b.co` accepted | `ada@` rejected | Passing |
| UTEST-004 | REQ-F-001 | Title required | "Write spec" accepted | `"  x  "` → trimmed, then rejected as too short | `""` rejected | Passing |
| UTEST-005 | REQ-F-001 | Title length 3–120 | 50 chars accepted | exactly 120 accepted | 121 rejected | Passing |
| UTEST-006 | REQ-F-005 | Status enum (ADR-002) | `todo` accepted | `DONE` rejected (case-sensitive by spec) | `archived` rejected | Passing |
| UTEST-007 | BR-003 | Due date not in the past | tomorrow accepted | today accepted | yesterday rejected | Passing |
| UTEST-008 | SEC-Z-001 | `can_create_task()` role check | member → True | admin → True | viewer → False | Passing |

## Written out

```
UNIT TEST PLAN: Task status validation
Test ID: UTEST-006
Requirement ID: REQ-F-005 (ADR-002)
Rule: A task status must be one of todo, in_progress, or done.

Normal case:  status = "todo"       -> accepted
Edge case:    status = "DONE"       -> rejected (spec does not allow normalization)
Failure case: status = "archived"   -> rejected with a clear validation error

Why this rule matters:
  The dashboard counts group by status. A free-text status silently breaks every count
  and cannot be fixed without a data migration.
```

```
UNIT TEST PLAN: Task title
Test ID: UTEST-004 / UTEST-005
Requirement ID: REQ-F-001
Rule: Title is required, trimmed before saving, and must be 3-120 characters.

Normal case:  "Prepare launch checklist"    -> accepted
Edge case:    "   ab   "                    -> trims to "ab" -> rejected (too short)
Edge case:    120-character string          -> accepted
Failure case: ""                            -> rejected: "Task title must be between 3
                                               and 120 characters."

Why this rule matters:
  The trim-then-measure order was ambiguous in the spec and the agent guessed. Writing it
  as an edge case forced the decision into the requirement instead of into the code.
```

## What belongs here vs. elsewhere

| This is a unit test | This is NOT a unit test |
|---|---|
| `can_create_task(user, project)` returns False for a Viewer. | The `POST /tasks` endpoint returns 403 for a Viewer → integration. |
| Title validator rejects 121 characters. | The form keeps typed values after a 400 → end-to-end. |
| Due-date comparator rejects yesterday. | The task row is absent after a rejected create → integration. |
