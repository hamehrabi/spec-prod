# API Specification

> Source: Ch. 7 §7.7, Ch. 9 §9.4–9.8, Appendix D.
> An API contract stops the agent from inventing endpoint names, request formats,
> response formats, or ownership behavior while coding.

**Base path:** `/api/v1`
**Auth model:** [TODO: which authentication model? — Q-006]
**Version:** API v1.0

---

## Endpoint index

| Method | Path | Purpose | Requirement | Permission |
|---|---|---|---|---|
| POST | `/api/v1/recipes` | Save a recipe with ingredient lines | REQ-F-002 | Account owner |
| GET | `/api/v1/recipes?q=` | Search saved recipes | REQ-F-003 | Account owner |
| POST | `/api/v1/weekly-plans` | Create a weekly plan | REQ-F-004 | Account owner |
| POST | `/api/v1/weekly-plans/{id}/meals` | Add a planned meal to a plan | REQ-F-004 | Account owner |
| POST | `/api/v1/weekly-plans/{id}/shopping-list` | Generate one shopping list from the plan | REQ-F-005 | Account owner |
| GET | `/api/v1/shopping-lists/{id}` | View a shopping list | REQ-F-005 | Account owner |

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
| Permission check | Every endpoint checks that the resource belongs to the signed-in account before returning data. |
| Validation timing | Validation happens **before** saving data. |
| Audit trail | Important create and status-change events are recorded. |

---

## Validation rules (Ch. 9 §9.6)

| Rule type | Example |
|---|---|
| Required field | A recipe title is required. |
| Length rule | A recipe title must be 1–200 characters. |
| Allowed value | A shopping-list item's `checked` must be true or false. |
| Relationship rule | A planned meal must reference a recipe the same account owns. |
| Permission rule | Only the account owner can create recipes, plans, and lists. |
| Date rule | A weekly plan's `week_start` must be a valid date. |

---

## Versioning and compatibility (Ch. 9 §9.8)

**Current version:** v1
**Breaking-change policy:** Additive changes ship within v1; a rename or removal requires v2.
**Compatibility notes:** Single client (the Pantry web UI) consumes this API in v1.

| Change type | Usually safe? | Example |
|---|---|---|
| Add optional field | Usually safe | Add `day` to a planned-meal response. |
| Add new endpoint | Usually safe | Add `GET /api/v1/recipes/{id}/history`. |
| Rename field | **Breaking** | Change `week_start` to `start_date`. |
| Remove field | **Breaking** | Remove `checked` from a shopping-list item. |
| Change data type | **Breaking** | Return `quantity` as an object instead of a number. |

---

> Blueprint: blueprints/01-docs/06-api-and-data-design/api-specification.md
