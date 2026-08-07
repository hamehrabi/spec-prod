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
| FTEST-001 | REQ-NF-003 | Generation failure | Simulated failure during list build | Safe error; plan preserved; no partial write | `LIST_GENERATION_FAILED` | Planned |
| FTEST-002 | REQ-F-002 / BR-002 | Missing required field | Recipe with no title or no ingredient line | 400 + field-named message; nothing saved | `RECIPE_VALIDATION_FAILED` | Planned |
| FTEST-003 | REQ-NF-003 | Database write failure | Simulated write timeout during save | Retry-safe 500; no false success; no partial write | `DB_TIMEOUT` | Planned |
| FTEST-004 | REQ-NF-002 | Not authorized | Request another account's data | 404 safe message; no data leaked | `AUTHZ_DENIED` | Planned |
| FTEST-005 | SEC-A-001 | Not authenticated | Request with no session | 401 + sign-in prompt | `AUTH_REQUIRED` | Planned |

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
| Generation failure | Show a safe error; preserve the plan. | A simulated failure keeps the plan and shows no stack trace. |
| Invalid recipe input | Reject and show clear field-level feedback. | Empty title returns a validation error. |
| Database timeout | Stop the request, log the timeout, ask the user to retry. | A simulated timeout shows no success and writes nothing. |
| Expired session | Redirect to sign-in and preserve the next safe destination. | A protected route redirects instead of crashing. |

---

## Error-handling behavior to assert (Ch. 7 §7.10)

| Error situation | Expected behavior |
|---|---|
| Missing required field | Reject, explain the missing field, keep the user input on screen. |
| Not signed in | Return 401 and ask the user to sign in. |
| No permission | Return 404/403 and reveal nothing about another account's data. |
| Resource not found | Return 404 with a safe message. |
| External service failure | n/a in v1 — no external service. |
| Unexpected server error | Return a general error message and log the details internally. |

---

## Testing error handling with AI help (Ch. 18 §18.5)

AI-generated error tests are often too simple. Ask for **exact** expected messages, status
codes, and recovery behavior.

| Error type | Example scenario | Expected behavior |
|---|---|---|
| Missing required input | Recipe title empty. | Validation error explains that a title is required. |
| Invalid input format | Ingredient line malformed. | Validation error explains the problem. |
| Unauthorized access | Request another account's recipe. | Safe 404; private data hidden. |
| Temporary service issue | Database briefly unavailable. | Retry-safe error **without corrupting data**. |

---

## Regression failures

Every fixed bug adds a case here that **fails before** the fix and **passes after**
(Ch. 19 §19.6).

| Test ID | Bug ID | Failure it prevents | Added on |
|---|---|---|---|

No regression failures recorded yet — the build has not started.

---

## Rules

- A failure test asserts the **safe** outcome, not just "an error happened."
- Assert what must **not** be in the response: stack traces, internal paths, tokens,
  whether another account exists.
- Assert system state: a failed request must leave no partial write.
- Never delete or weaken a failure test to make code pass.

---

> Blueprint: blueprints/03-tests/04-failure/failure-tests.md
