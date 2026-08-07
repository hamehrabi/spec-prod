# Integration Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.3, Ch. 18 §18.6.
> Integration tests check whether **separate parts of the system work together** — when a
> requirement depends on more than one component: an API endpoint, a database table, and
> an authentication rule.

Saving a recipe is not just a database operation. The API must accept the request,
validate the fields, check the account, save the recipe, and return the correct response.
That is integration behavior.

---

| Test ID | Requirement | Integration point | Scenario | Expected result | Side effect to verify | Status |
|---|---|---|---|---|---|---|
| ITEST-001 | REQ-F-002 | API + database | Save a valid recipe | 201 + recipe object | Recipe row scoped to the account | Planned |
| ITEST-002 | REQ-F-003 | API + database | Search saved recipes | 200 + matching recipes | Only this account's recipes returned | Planned |
| ITEST-003 | REQ-F-004 | API + database | Create a plan and add a meal | 201 + plan/meal | Planned meal references an owned recipe | Planned |

---

## Integration points to cover (Ch. 17 §17.3)

| Integration point | What you should verify |
|---|---|
| API + database | A valid request creates the right record and returns the correct response. |
| Authentication + API | Only an authenticated user can perform the action. |
| Authorization + API | Only the account owner can perform the action on their data. |
| Validation + response handling | Invalid input returns a clear error **without creating bad data**. |
| Service + external dependency | n/a in v1 — no external service (Q-007). |
| Job + queue | Only the optional photo-cleanup job; it runs, retries, and records status. |

---

## API contract tests (Ch. 18 §18.6)

A strong API test does not only ask whether the endpoint responds. It checks the method,
URL, request body, status code, response body, validation rules, **and side effects**.

| Test name | Request input | Expected status | Expected response body | Side effect to verify |
|---|---|---|---|---|
| Valid recipe is saved | `{title, ingredient lines}` | 201 | Recipe object with id | Recipe row created, scoped to the account |
| Missing title is rejected | `{ingredient lines only}` | 400 | Title-required error | No recipe row created |
| Recipe with no lines is rejected | `{title only}` | 400 | Ingredient-required error | No recipe row created |
| Other account's recipe requested | `GET /recipes/{id}` (other) | 404 | Safe not-found | No data returned |

Executable tests live in [`../tests/integration/`](../05-executable/integration).

---

> Blueprint: blueprints/03-tests/02-functional/integration-tests.md
