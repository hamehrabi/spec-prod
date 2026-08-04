# API Specification

> Source: Ch. 7 §7.7, Ch. 9 §9.4–9.8, Appendix D.
> An API contract stops the agent from inventing endpoint names, request formats,
> response formats, or ownership behavior while coding.

**Base path:** `/api/v1`
**Auth model:** [TODO: which authentication model does this project use?]
**Version:** API v1.0

**The auth model is Round 5's question and this document does not need it yet.** Every
endpoint below requires an authenticated cook and is scoped to that cook's account — that much
follows from REQ-R-001 and REQ-R-003. *How* the cook proves who they are changes the header,
not the contract.

---

## Endpoint index

| Method | Path | Purpose | Requirement | Permission |
|---|---|---|---|---|
| POST | `/api/v1/recipes` | Save a recipe with its ingredient lines. | REQ-F-001 | Authenticated cook; the recipe is created against their account. |
| GET | `/api/v1/recipes` | List the cook's recipes; `?q=` searches title and ingredient name. | REQ-F-001, REQ-F-002 | Authenticated cook; returns only their own. |
| GET | `/api/v1/recipes/{recipe_id}` | Read one recipe with its ingredient lines. | REQ-F-001 | Authenticated cook, and only if the recipe is theirs. |
| POST | `/api/v1/plans` | Create a weekly plan from a start date. | REQ-F-003 | Authenticated cook. |
| GET | `/api/v1/plans/{plan_id}` | Read a plan and the meals placed on its days. | REQ-F-003 | Authenticated cook, and only if the plan is theirs. |
| PUT | `/api/v1/plans/{plan_id}/days/{day_offset}` | Place recipes on one day of a plan. | REQ-F-004 | Authenticated cook, and only if both plan and recipes are theirs. |
| POST | `/api/v1/plans/{plan_id}/shopping-list` | Generate a shopping list from the plan as it stands now. | REQ-F-005 | Authenticated cook, and only if the plan is theirs. |
| GET | `/api/v1/shopping-lists/{list_id}` | Read a generated shopping list. | REQ-F-005 | Authenticated cook, and only if the list is theirs. |

**There is no `PATCH` or `DELETE` on a recipe**, because REQ-F-006 is an open question. Adding
them now would answer it by building it.

**`POST` on the shopping list, not `GET`.** Generating one is an act with a result that is kept
(BR-005), not a view of the plan. A `GET` that quietly regenerated would be the rewriting-list
failure BR-005 exists to prevent.

---

## Endpoint template (Appendix D)

Copy this block for **every** endpoint before implementation begins.

```
Endpoint name:        Generate Shopping List
Method and path:      POST /api/v1/plans/{plan_id}/shopping-list
Purpose:              Consolidate the ingredients of every recipe placed on the plan's
                      seven days into one list the cook can shop from in a single trip.
Requirement:          REQ-F-005
Authentication:       Required — model to be decided in Round 5
Authorization rules:  The plan must belong to the signed-in account. If it does not, the
                      response is 404, never 403 — see the status principles below.

Request body:
{
  "": "none — the plan is the input, and it is already identified by the path"
}

Success response:     201 Created
{
  "id": "identifier",
  "plan_id": "identifier",
  "generated_at": "timestamp",
  "items": "array of { ingredient_name, quantity, unit }, one per ingredient-and-unit"
}

Error responses:
  400 — the plan has no meals on any day, so there is nothing to buy
  401 — not authenticated
  404 — no plan with that identifier belongs to this account
  500 — unexpected server failure

Business rules:       BR-001 — identical ingredient names combine within a unit, quantities
                      summed. BR-002 — the same ingredient in different units stays on
                      separate lines and is never converted. BR-005 — the list is a snapshot
                      and does not change when the plan changes afterwards.
Side effects:         Writes one shopping_lists row and its items. Nothing else. No email,
                      no job, no audit event — there is one user and nothing is shared.
Tests required:       Minted in Round 7, from AC-003 and AC-004
```

**This is the core endpoint**, which is why it is the one written out in full. The other seven
are ordinary reads and writes over rows the cook owns.

---

## Status code response principles (Appendix D)

| Status | Use | Response principle |
|---|---|---|
| 200 / 201 | Successful read or creation. | Return only the fields the user is allowed to see. |
| 400 | Invalid request data. | Explain the invalid field without exposing internals. |
| 401 | User is not authenticated. | Ask the user to sign in again. |
| 403 | Authenticated but not allowed. | Not used in this product — see below. |
| 404 | Resource not found. | Avoid confirming whether another user's resource exists. |
| 500 | Unexpected server failure. | Safe generic message; log the internal reason. |

**403 is deliberately unused.** With one role and no sharing there is no state in which a cook
is authenticated but merely *not allowed* — a record is either theirs or it is not theirs to
know about. Returning 403 for another account's recipe would confirm that the recipe exists,
which is the disclosure AC-005 tests for. Everything not theirs is 404.

---

## Contract rules (Ch. 9 §9.9)

| Rule | Specification |
|---|---|
| Response consistency | Every success response returns a predictable object shape. |
| Error consistency | Every error uses `code`, `message`, and optional `field`. |
| Permission check | Every endpoint scopes its query by the signed-in account before returning data. A check applied after the read has already loaded the row. |
| Validation timing | Validation happens **before** saving data. |
| Audit trail | None. There is one user, nothing is shared, and no action here is taken on anyone else's behalf — an audit log with one reader and one writer records nothing anybody will read. |

---

## Validation rules (Ch. 9 §9.6)

| Rule type | Example |
|---|---|
| Required field | A recipe title is required. |
| Length rule | A recipe title must be 1–200 characters; an ingredient name 1–100. |
| Allowed value | `day_offset` must be 0 to 6 (BR-003). |
| Relationship rule | Every recipe placed on a plan must belong to the same account as the plan. |
| Permission rule | Every read and write is scoped by account; a request for a record outside that scope is answered 404. |
| Paired-field rule | A quantity without a unit is rejected, and a unit without a quantity is rejected. A half-specified quantity cannot be summed and would be silently dropped from the shopping list. |

---

## Versioning and compatibility (Ch. 9 §9.8)

**Current version:** v1
**Breaking-change policy:** [TODO: which quality attributes matter most, and what measurable limit does each have?]
**Compatibility notes:** There is one client and it ships with the API, so a breaking change costs
a coordinated deploy rather than a migration window. That is a fact about today's shape, not a
policy — the policy is the open question above.

| Change type | Usually safe? | Example |
|---|---|---|
| Add optional field | Usually safe | Add `notes` to a recipe response. |
| Add new endpoint | Usually safe | Add `DELETE /api/v1/recipes/{id}` once REQ-F-006 is decided. |
| Rename field | **Breaking** | Change `ingredient_name` to `name`. |
| Remove field | **Breaking** | Remove `unit` from a shopping-list item. |
| Change data type | **Breaking** | Return `quantity` as an object instead of a number. |

---

**Next:** [`data-and-integration-spec.md`](data-and-integration-spec.md)

> Blueprint: blueprints/01-docs/06-api-and-data-design/api-specification.md
