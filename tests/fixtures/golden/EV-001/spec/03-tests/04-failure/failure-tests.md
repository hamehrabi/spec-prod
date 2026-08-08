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
| FTEST-001 | REQ-NF-003 | Database write failure (recipe save) | Simulated write timeout on save | Retry-safe error; no false success; input preserved | RECIPE_SAVE_FAILED | Planned |
| FTEST-002 | REQ-NF-003 | Read failure during list generation | Simulated read failure while generating | Retry-safe error; no partial list shown | LIST_GENERATION_FAILED | Planned |
| FTEST-003 | REQ-F-001 | Missing required field | Save a recipe with no title | 400 + field-named message; nothing saved | RECIPE_VALIDATION_FAILED | Planned |
| FTEST-004 | SEC-A-001 | Not authenticated | A data action with no session | 401 + sign-in prompt; no data changed | AUTH_REQUIRED | Planned |
| FTEST-005 | BR-003 | Invalid reference | Plan a meal pointing at a missing or non-owned recipe | Safe rejection; nothing planned | PLAN_INVALID_RECIPE | Planned |
| FTEST-006 | BR-004 | Business-rule violation | Delete a recipe referenced by a plan | 409; nothing deleted | RECIPE_DELETE_BLOCKED | Planned |

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
| Save fails | Return a retry-safe error; keep the cook's input. | A simulated save failure shows no success and preserves input (FTEST-001). |
| Generation fails | Show no partial list; return a retry-safe error. | A simulated read failure yields no partial list (FTEST-002). |
| Not signed in | Ask the user to sign in. | A protected action while signed out returns 401 (FTEST-004). |
| Referenced recipe deleted | Block the deletion; keep the plan intact. | Deleting a referenced recipe returns 409, nothing deleted (FTEST-006). |

---

## Error-handling behavior to assert (Ch. 7 §7.10)

| Error situation | Expected behavior |
|---|---|
| Missing required field | Reject, explain the missing field, keep the user input on screen. |
| Not signed in | Return 401 and ask the user to sign in. |
| No permission | Return a safe not-found and do not reveal the resource. |
| Resource not found | Return 404 with a safe message. |
| Business-rule violation | Return a clear conflict and change nothing. |
| Unexpected server error | Return a general error message and log the details internally. |

---

## Regression failures

Every fixed bug adds a case here that **fails before** the fix and **passes after**
(Ch. 19 §19.6).

| Test ID | Bug ID | Failure it prevents | Added on |
|---|---|---|---|

No regressions have been recorded yet — the first fixed bug adds the first row here.

---

## Rules

- A failure test asserts the **safe** outcome, not just "an error happened."
- Assert what must **not** be in the response: stack traces, internal paths, tokens,
  whether an account exists.
- Assert system state: a failed request must leave no partial write.
- Never delete or weaken a failure test to make code pass.

---

## Written out

```
Test ID:            FTEST-001
Requirement:        REQ-NF-003
Failure condition:  The database write fails or times out while saving a recipe
Preconditions:      Signed-in cook; a valid recipe with a title and ingredient lines
Trigger / input:    Database connection forced to time out during the save

Expected user-facing result: "We could not save your recipe right now. Please try again."
Expected status code:        500
Expected system state:       NO recipe row and NO ingredient-line rows written
Expected log event:          RECIPE_SAVE_FAILED with account_id and a safe error code
Expected recovery path:      The cook can resubmit; the form still holds their typed values

Must NOT happen:
  - No "Recipe saved" message
  - No stack trace, connection string, or SQL in the response
  - No orphaned recipe or ingredient-line row

Status: Planned
```

---

> Blueprint: blueprints/03-tests/04-failure/failure-tests.md
