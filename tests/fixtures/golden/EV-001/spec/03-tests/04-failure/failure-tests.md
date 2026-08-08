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
| FTEST-001 | REQ-F-001 | Missing required field | Save a recipe with no title | 400 naming the title field; nothing saved. | RECIPE_VALIDATION_FAILED | Planned |
| FTEST-002 | REQ-F-001 | Missing required content | Save a recipe with zero ingredient lines | 400 naming the lines requirement; nothing saved. | RECIPE_VALIDATION_FAILED | Planned |
| FTEST-003 | SEC-A-001 | Not authenticated | Any data request with no session | 401 + sign-in prompt; nothing written. | AUTH_REQUIRED | Planned |
| FTEST-004 | SEC-Z-001 | Not authorized | A guessed ID from another account | Safe 404; existence not confirmed; no data leaked. | NOT_FOUND | Planned |
| FTEST-005 | REQ-NF-003 | Database write failure | Simulated failure mid-generation | Transaction rolls back; no partial list; plan unchanged; no false success. | LIST_GENERATION_FAILED | Planned |
| FTEST-006 | REQ-F-003 | Duplicate submission | Generate requested twice for the same plan | [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013] — whether regeneration replaces or joins is part of Q-013. | — | Blocked |
| FTEST-007 | SEC-Z-002 | Invalid upload | A non-image file sent as a dish photo | Rejected without saving; no orphan file, no orphan row. | PHOTO_UPLOAD_FAILED | Planned |
| FTEST-008 | REQ-NF-003 | Database write failure | Simulated failure during recipe save | Retry-safe error; typed values kept; no row written; no false success. | RECIPE_SAVE_FAILED | Planned |

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

## Written out

```
Test ID:            FTEST-005
Requirement:        REQ-NF-003
Failure condition:  Database write fails or times out during shopping-list generation
Preconditions:      Signed-in account holder; a weekly plan with planned meals
Trigger / input:    The write is forced to fail mid-generation

Expected user-facing result: the safe message ([TODO: when something is slow or fails,
                             what should the user see? — Q-022])
Expected status code:        retry-safe 500
Expected system state:       NO list row and NO item rows written; the plan unchanged
Expected log event:          LIST_GENERATION_FAILED with request_id, account_id, plan_id,
                             safe reason
Expected recovery path:      The user regenerates; nothing needs cleaning up first

Must NOT happen:
  - No "list generated" message
  - No stack trace, path, or SQL in the response
  - No partial list or orphaned items

Status: Planned
```

---

## Error state → recovery path (Ch. 22 §22.3)

Every error state needs a recovery path, a user message, a log event, and a test.

| Error state | Recovery path | What to test |
|---|---|---|
| Invalid recipe input | Reject with field-level feedback; keep typed values. | Empty title returns a validation error; nothing saved. |
| Generation fails mid-write | Roll back; no partial list; plan unchanged. | A simulated failure leaves zero orphan rows. |
| Database timeout | Stop the request, log the timeout, ask the user to try again. | A simulated timeout never shows success. |
| Expired session | Redirect to sign-in, preserving the safe destination — mechanics follow Q-009. | A protected route redirects instead of crashing. |

---

## Error-handling behavior to assert (Ch. 7 §7.10)

| Error situation | Expected behavior |
|---|---|
| Missing required field | Reject, explain the missing field, keep the user input on screen. |
| Not signed in | Return 401 and ask the user to sign in. |
| No permission | Return the safe 404 — existence is never confirmed across accounts (SEC-Z-001). |
| Resource not found | Return 404 with a safe message. |
| External service failure | Not applicable — no external services in version one (Round 6). |
| Unexpected server error | Return a general error message and log the details internally. |

---

## Testing error handling with AI help (Ch. 18 §18.5)

AI-generated error tests are often too simple. Ask for **exact** expected messages, status
codes, and recovery behavior.

| Error type | Example scenario | Expected behavior |
|---|---|---|
| Missing required input | Recipe title empty on save. | Validation error explains that the title is required. |
| Invalid input format | A non-image file uploaded as a photo. | Rejected by content inspection; nothing stored. |
| Unauthorized access | A guessed cross-account ID. | Safe 404; private data hidden. |
| Storage failure | The database write fails. | No false success; typed values kept; failure logged. |

---

## Regression failures

Every fixed bug adds a case here that **fails before** the fix and **passes after**
(Ch. 19 §19.6).

| Test ID | Bug ID | Failure it prevents | Added on |
|---|---|---|---|

---

## Rules

- A failure test asserts the **safe** outcome, not just "an error happened."
- Assert what must **not** be in the response: stack traces, internal paths, tokens,
  whether an account exists.
- Assert system state: a failed request must leave no partial write.
- Never delete or weaken a failure test to make code pass.

> Blueprint: blueprints/03-tests/04-failure/failure-tests.md
