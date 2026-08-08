# Integration Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.3, Ch. 18 §18.6.
> Integration tests check whether **separate parts of the system work together** — when a
> requirement depends on more than one component: an API endpoint, a database table, and
> an authentication rule.

Saving a recipe is not just a database operation. The API must accept the request, validate
the fields, check the account, save the recipe and its lines, and return the correct response.
That is integration behavior.

---

| Test ID | Requirement | Integration point | Scenario | Expected result | Side effect to verify | Status |
|---|---|---|---|---|---|---|
| ITEST-001 | REQ-F-001 | API + database | Save a recipe with a title and ingredient lines | 201 + recipe object | Recipe and line rows written, scoped to the account | Planned |
| ITEST-002 | REQ-F-002 | Auth + API + database | Search recipes as a signed-in cook | 200 + only own matches | No other account's rows returned | Planned |
| ITEST-003 | REQ-F-003 | API + database | Plan a meal referencing another account's recipe | 404 / safe reject | No planned-meal row written | Planned |
| ITEST-004 | REQ-F-004 | API + database | Generate the list for a planned week | 200 + one list | List items equal every planned meal's ingredient lines | Planned |
| ITEST-005 | REQ-F-006 | API + database | Check a shopping-list item | 200 | The item's checked flag persists | Planned |
| ITEST-006 | BR-004 | Service + database | Delete a recipe referenced by a plan | 409 conflict | Recipe and plan still present | Planned |

---

## Integration points to cover (Ch. 17 §17.3)

| Integration point | What you should verify |
|---|---|
| API + database | A valid request creates the right record and returns the correct response. |
| Authentication + API | Only an authenticated cook can perform the action. |
| Authorization + API | Only the owning account can reach the resource. |
| Validation + response handling | Invalid input returns a clear error **without creating bad data**. |
| Service + external dependency | Not applicable in version one — no external services (`Q-007`). |
| Job + queue | Not applicable in version one — no background jobs. |

---

## API contract tests (Ch. 18 §18.6)

A strong API test does not only ask whether the endpoint responds. It checks the method,
URL, request body, status code, response body, validation rules, **and side effects**.

| Test name | Request input | Expected status | Expected response body | Side effect to verify |
|---|---|---|---|---|
| Valid recipe is saved | `{title, ingredient lines}` | 201 | Recipe object with an id | Recipe and line rows created |
| Missing title is rejected | `{ingredient lines only}` | 400 | "A recipe title is required" | No recipe row created |
| Empty ingredient list is rejected | `{title only}` | 400 | "A recipe needs at least one ingredient" | No recipe row created |
| Unauthenticated request is rejected | `{valid body, no session}` | 401 | Sign-in required | No recipe row created |
| Another account's recipe is not returned | `GET` another account's recipe id | 404 | Safe not-found | No data returned |

**What one row becomes (Ch. 18 §18.6).** Specify each row as three assertions and nothing
else: the status code, the field of the response body that carries the answer, and the side
effect that must **not** have happened. "Missing title is rejected" is therefore *400, the
error names the title field, and no recipe row exists afterwards* — three statements a test
can be written from without a decision being made in the test file. The side-effect assertion
is the one that catches a handler which returns the right status after it has already written.

Executable tests live in [`../05-executable/executable-tests.md`](../05-executable/executable-tests.md) (`integration/`).

---

> Blueprint: blueprints/03-tests/02-functional/integration-tests.md
