# failure-tests.md — Failure Test Cases

> **Purpose (Ch. 4 §4.6):** Checks invalid inputs, permissions, missing data, and error
> paths.
> **Sources:** Ch. 4 §4.6, Ch. 17 §17.7, Ch. 22.

Planning worksheet for discovering these cases →
[`edge-cases-and-failures.md`](edge-cases-and-failures.md).
This file holds the resulting **test cases**.

> **Beginner rule (Ch. 17 §17.1):** do not ask an AI agent to build a feature until you
> can write at least three checks for it — one normal case, one **edge case**, and one
> **failure case**.

---

## Failure test cases

| Test ID | Requirement | Failure condition | Input / trigger | Expected result | Log event expected | Status |
|---|---|---|---|---|---|---|
| FTEST-001 | REQ-### | Missing required field | | 400 + field-named message; nothing saved. | | Planned |
| FTEST-002 | | Invalid format | | 400 + format explanation; nothing saved. | | |
| FTEST-003 | | Not authenticated | | 401 + sign-in prompt. | | |
| FTEST-004 | | Not authorized | | 403 + safe message; no data leaked. | | |
| FTEST-005 | | Resource not found | | 404 + safe message. | | |
| FTEST-006 | | Duplicate submission | | No duplicate record created. | | |
| FTEST-007 | | Expired token / session | | Redirect or 401; no crash. | | |
| FTEST-008 | | Database write failure | | No false success; retry-safe error; failure logged. | | |
| FTEST-009 | | External service timeout | | Timeout honored; user sees the specified safe message. | | |
| FTEST-010 | | Retries exhausted | | Controlled failure state stored; user can retry. | | |
| FTEST-011 | | Background job fails | | Status recorded; user sees pending/failed. | | |
| FTEST-012 | | Unexpected server error | | Generic message to user; details logged internally. | | |

---

## Case template

```
Test ID:
Requirement:
Failure condition:
Preconditions:
Trigger / input:

Expected user-facing result:
Expected status code:
Expected system state:      [what must NOT have been written]
Expected log event:         [EVENT_NAME + safe context fields]
Expected recovery path:

Must NOT happen:
  - No stack trace, path, token, or private data in the response.
  - No partial write left behind.
  - No silent success.

Status: Planned / Written / Passing / Failing / Blocked
```

---

## Error state → recovery path (Ch. 22 §22.3)

Every error state needs a recovery path, a user message, a log event, and a test.

| Error state | Recovery path | What to test |
|---|---|---|
| Invalid login input | Reject and show clear field-level feedback. | Empty password returns a validation error. |
| Wrong credentials | Safe message without revealing which field was wrong. | Incorrect email or password produces the **same** message. |
| Database timeout | Stop the request, log the timeout, ask the user to try again. | A simulated timeout does not show successful login. |
| Expired session | Redirect to login and preserve the next safe destination. | A protected route redirects instead of crashing. |

---

## Error-handling behavior to assert (Ch. 7 §7.10)

| Error situation | Expected behavior |
|---|---|
| Missing required field | Reject, explain the missing field, keep the user input on screen. |
| Not signed in | Return 401 and ask the user to sign in. |
| No permission | Return 403 and explain the user cannot access the resource. |
| Resource not found | Return 404 with a safe message. |
| External service failure | Retry if safe, otherwise show a temporary failure message. |
| Unexpected server error | Return a general error message and log the details internally. |

---

## Testing error handling with AI help (Ch. 18 §18.5)

AI-generated error tests are often too simple. Ask for **exact** expected messages, status
codes, and recovery behavior.

| Error type | Example scenario | Expected behavior |
|---|---|---|
| Missing required input | Email field empty during login. | Validation error explains that email is required. |
| Invalid input format | Email does not contain a valid format. | Validation error explains the format problem. |
| Wrong credentials | Password does not match account. | Authentication fails **without creating a session**. |
| Unauthorized access | User tries to access a private resource. | Access error; private data hidden. |
| Temporary service issue | External service unavailable. | System retries or reports failure **without corrupting data**. |

---

## Regression failures

Every fixed bug adds a case here that **fails before** the fix and **passes after**
(Ch. 19 §19.6).

| Test ID | Bug ID | Failure it prevents | Added on |
|---|---|---|---|
| FTEST-### | BUG-### | | |

---

## Rules

- A failure test asserts the **safe** outcome, not just "an error happened."
- Assert what must **not** be in the response: stack traces, internal paths, tokens,
  whether an account exists.
- Assert system state: a failed request must leave no partial write.
- Never delete or weaken a failure test to make code pass.

---

## Prompt — edge and failure test generation (Ch. 17 §17.7)

```
Using the requirement below, list the normal case, edge cases, and failure cases.
Do not write implementation code yet.

Requirement: [paste requirement]

Return the answer as a test planning table with: case type, input, expected result, and
risk covered.
```

---

# WORKED EXAMPLE — ProjectBoard

| Test ID | Requirement | Failure condition | Input / trigger | Expected result | Log event | Status |
|---|---|---|---|---|---|---|
| FTEST-001 | REQ-F-001 | Missing required field | POST task with no title | 400 "Task title must be between 3 and 120 characters"; **no row** | `TASK_VALIDATION_FAILED` | Passing |
| FTEST-002 | BR-003 | Invalid value | Due date = yesterday | 400 naming the due-date field; typed values kept | `TASK_VALIDATION_FAILED` | Passing |
| FTEST-003 | SEC-A-001 | Not authenticated | POST task with no session | 401 + sign-in prompt | `AUTH_REQUIRED` | Passing |
| FTEST-004 | REQ-R-002 | Not authorized | Viewer PATCHes a task | 403 safe message; task unchanged | `AUTHZ_DENIED` | **Failing — BUG-003** |
| FTEST-005 | REQ-F-006 | Resource not found | GET a task ID from another project | 404 safe message; existence not confirmed | `NOT_FOUND` | Passing |
| FTEST-006 | REQ-F-001 | Duplicate submission | Same create sent twice | One row only | `TASK_DUPLICATE_IGNORED` | Passing |
| FTEST-007 | SEC-A-002 | Expired session | Token 31 minutes idle | 401 + redirect; no crash | `SESSION_EXPIRED` | Passing |
| FTEST-008 | REQ-NF-003 | Database write failure | Simulated write timeout | Retry-safe 500; **no false success** | `DB_TIMEOUT` | Passing |
| FTEST-009 | REQ-F-009 | External service down | Email provider returns 503 | Task saved; email `pending_review`; user told | `EMAIL_SEND_FAILED` | Passing |
| FTEST-010 | REQ-F-007 | Retries exhausted | Export fails 3 times | Status `Failed`; user can retry | `EXPORT_GENERATION_FAILED` | Passing |
| FTEST-011 | BR-004 | Business rule violation | Delete project with open tasks | 409; nothing deleted | `PROJECT_DELETE_BLOCKED` | Passing |

## Written out

```
Test ID:            FTEST-008
Requirement:        REQ-NF-003
Failure condition:  Database write fails or times out during task creation
Preconditions:      Signed-in Member; valid task payload
Trigger / input:    Database connection forced to time out after 5 s

Expected user-facing result: "We could not save your changes right now. Please try again."
Expected status code:        500
Expected system state:       NO task row written; NO partial project update
Expected log event:          DB_TIMEOUT with request_id, user_id, project_id, duration_ms
Expected recovery path:      User can resubmit; the form still holds their typed values

Must NOT happen:
  - No "Task created" message
  - No stack trace, connection string, or SQL in the response
  - No orphaned row

Status: Passing
```

## Regression failures

| Test ID | Bug ID | Failure it prevents | Added on |
|---|---|---|---|
| FTEST-004 | BUG-003 | Viewer editing a task through the API while the UI hides the button | 2026-04-01 |
| FTEST-007 | BUG-002 | Expired token causing a 500 instead of a redirect | 2026-03-29 |
| FTEST-005 | BUG-001 | 404 body confirming that another user's task exists | 2026-03-25 |

> Each of these **failed before the fix and passed after**. That is the only evidence that
> a regression test is real.
