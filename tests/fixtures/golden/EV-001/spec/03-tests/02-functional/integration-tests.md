# Integration Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.3, Ch. 18 §18.6.
> Integration tests check whether **separate parts of the system work together** — when a
> requirement depends on more than one component: an API endpoint, a database table, and
> an authentication rule.

Saving a recipe is not just a database operation. The API must accept the request,
validate the fields, check the account, save the recipe and its lines, and return the
correct response. That is integration behavior.

---

| Test ID | Requirement | Integration point | Scenario | Expected result | Side effect to verify | Status |
|---|---|---|---|---|---|---|
| ITEST-001 | REQ-F-001 | API + database | Valid recipe payload with two ingredient lines | 201 + saved recipe | Recipe row and both line rows exist, written in one transaction | Planned |
| ITEST-002 | SEC-A-001 | Auth + API | Any data route requested with no session | 401 + sign-in prompt | No data returned; nothing written | Planned |
| ITEST-003 | REQ-F-002, BR-002 | API + database | Add a planned meal referencing the caller's own recipe; then one referencing another account's recipe | First: 201, meal row created. Second: safe rejection | No planned-meal row referencing a cross-account recipe | Planned |
| ITEST-004 | REQ-F-003, BR-001 | Service + database | Generate the list for a plan with meals | 201 + one list | One list row; an item row for every ingredient line of the week; all in one transaction | Planned |
| ITEST-005 | REQ-F-001 | Validation + response | Recipe payload with no ingredient lines | 400 naming the problem | No recipe row and no line rows written | Planned |
| ITEST-006 | REQ-F-004, REQ-R-001 | API + database | Search with a word from a saved recipe title | 200 + matching recipes | Only the calling account's rows are searched | Planned |

---

## Integration points to cover (Ch. 17 §17.3)

| Integration point | What you should verify |
|---|---|
| API + database | A valid request creates the right record and returns the correct response. |
| Authentication + API | Only an authenticated user can perform the action. |
| Authorization + API | Only a permitted role can perform the action. |
| Validation + response handling | Invalid input returns a clear error **without creating bad data**. |
| Service + external dependency | Not applicable in version one — Pantry has no external services (Round 6). |
| Job + queue | Not applicable in version one — there are no background jobs (technical-spec §9.5). |

---

## API contract tests (Ch. 18 §18.6)

A strong API test does not only ask whether the endpoint responds. It checks the method,
URL, request body, status code, response body, validation rules, **and side effects**.

| Test name | Request input | Expected status | Expected response body | Side effect to verify |
|---|---|---|---|---|
| Valid recipe is saved | `{title, ingredient lines}` | 201 | The saved recipe with its lines | Recipe + line rows exist |
| Missing title is rejected | `{ingredient lines only}` | 400 | Error naming the title field | No rows written |
| No ingredient lines is rejected | `{title only}` | 400 | Error naming the lines requirement | No rows written |
| Signed-out save is rejected | valid payload, no session | 401 | Sign-in prompt | No rows written |
| Cross-account recipe in a plan is rejected | `{recipe_id from another account}` | safe 404 | Safe not-found; existence not confirmed | No planned-meal row written |

**What one row becomes (Ch. 18 §18.6).** Specify each row as three assertions and nothing
else: the status code, the field of the response body that carries the answer, and the side
effect that must **not** have happened. "Missing title is rejected" is therefore *400, the
error names the title field, and no recipe row exists afterwards* — three statements a
test can be written from without a decision being made in the test file. The side-effect
assertion is the one that catches a handler which returns the right status after it has
already written.

Executable tests live in [`../tests/integration/`](../05-executable/integration).

> Blueprint: blueprints/03-tests/02-functional/integration-tests.md
