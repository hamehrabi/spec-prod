# API Specification

> Source: Ch. 7 §7.7, Ch. 9 §9.4–9.8, Appendix D.
> An API contract stops the agent from inventing endpoint names, request formats,
> response formats, or ownership behavior while coding.

**Base path:** `/api/v1`
**Auth model:** [TODO: which authentication model? — deferred at express depth, decided in Round 5 (`Q-009`). Every endpoint below except sign-in requires the signed-in account.]
**Version:** API v1.0

---

## Endpoint index

| Method | Path | Purpose | Requirement | Permission |
|---|---|---|---|---|
| POST | `/api/v1/session` | Sign in to the cook's own account. | REQ-F-005 | Public (creates a session) |
| POST | `/api/v1/recipes` | Save a recipe with its ingredient lines. | REQ-F-001 | Owner |
| GET | `/api/v1/recipes?q=` | List and search the cook's saved recipes. | REQ-F-002 | Owner |
| GET | `/api/v1/recipes/{id}` | Read one recipe. | REQ-F-001 | Owner |
| PATCH | `/api/v1/recipes/{id}` | Edit a recipe. | REQ-F-001 | Owner |
| DELETE | `/api/v1/recipes/{id}` | Delete a recipe (blocked while a plan uses it, BR-004). | REQ-F-001 | Owner |
| POST | `/api/v1/weekly-plans` | Start a plan for a week. | REQ-F-003 | Owner |
| POST | `/api/v1/weekly-plans/{id}/meals` | Add a planned meal (a recipe on a day). | REQ-F-003 | Owner |
| POST | `/api/v1/weekly-plans/{id}/shopping-list` | Generate one shopping list from the week (core). | REQ-F-004 | Owner |
| GET | `/api/v1/weekly-plans/{id}/shopping-list` | Read the generated shopping list. | REQ-F-004 | Owner |
| PATCH | `/api/v1/shopping-list-items/{id}` | Tick an item off while shopping. | REQ-F-006 | Owner |

---

## Endpoint template (Appendix D)

Copy this block for **every** endpoint before implementation begins.

```
Endpoint name:        [e.g. Create Task]
Method and path:      POST /api/v1/projects/{project_id}/tasks
Purpose:              [what it does and why it exists]
Requirement:          REQ-F-###
Authentication:       [login / token / none]
Authorization rules:  [who can access, under what conditions]

Request body:
{
  "field": "type — required/optional — validation rule"
}

Success response:     201 Created
{
  "field": "type"
}

Error responses:
  400 — validation error
  401 — not authenticated
  403 — authenticated but not allowed
  404 — resource not found
  409 — conflict / duplicate
  500 — unexpected server failure

Business rules:       [rules enforced beyond basic validation]
Side effects:         [database writes, emails, jobs, audit events]
Tests required:       TEST-### (unit, integration, edge cases)
```

---

## Status code response principles (Appendix D)

| Status | Use | Response principle |
|---|---|---|
| 200 / 201 | Successful read or creation. | Return only the fields the user is allowed to see. |
| 400 | Invalid request data. | Explain the invalid field without exposing internals. |
| 401 | User is not authenticated. | Ask the user to sign in again. |
| 403 | Authenticated but not allowed. | Do not reveal protected resource details. |
| 404 | Resource not found. | Avoid confirming whether another user's resource exists. |
| 500 | Unexpected server failure. | Safe generic message; log the internal reason. |

---

## Contract rules (Ch. 9 §9.9)

| Rule | Specification |
|---|---|
| Response consistency | Every success response returns a predictable object shape. |
| Error consistency | Every error uses `code`, `message`, and optional `field`. |
| Permission check | Every endpoint checks the signed-in account owns the data before returning it. |
| Validation timing | Validation happens **before** saving data. |
| Audit trail | Important create and generate events are recorded. |

---

## Validation rules (Ch. 9 §9.6)

| Rule type | Example |
|---|---|
| Required field | A recipe title is required. |
| Length rule | A recipe title must be 1–200 characters. |
| Allowed value | A shopping-list item's `checked` must be true or false. |
| Relationship rule | A planned meal's recipe must belong to the same account. |
| Permission rule | Only the owning account may read or write its recipes and plans. |
| Date rule | A weekly plan's `week_start_date` is a valid date; one plan per week per account. |

---

## Versioning and compatibility (Ch. 9 §9.8)

**Current version:** v1
**Breaking-change policy:** Within v1, only additive changes (new optional fields, new endpoints). Any rename, removal, or type change ships as v2.
**Compatibility notes:** The only client is Pantry's own web UI, so the contract and the UI move together.

| Change type | Usually safe? | Example |
|---|---|---|
| Add optional field | Usually safe | Add `notes` to a recipe response. |
| Add new endpoint | Usually safe | Add `GET /api/v1/recipes/{id}/history`. |
| Rename field | **Breaking** | Change `week_start_date` to `starts_on`. |
| Remove field | **Breaking** | Remove `checked` from a shopping-list item. |
| Change data type | **Breaking** | Return `quantity` as an object instead of a number. |

---

> Blueprint: blueprints/01-docs/06-api-and-data-design/api-specification.md
