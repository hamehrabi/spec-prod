# API Specification

> Source: Ch. 7 §7.7, Ch. 9 §9.4–9.8, Appendix D.
> An API contract stops the agent from inventing endpoint names, request formats,
> response formats, or ownership behavior while coding.

**Base path:** `/api/v1`
**Auth model:** [TODO: which authentication model? — Q-009]
**Version:** API v1.0

---

## Endpoint index

| Method | Path | Purpose | Requirement | Permission |
|---|---|---|---|---|
| POST | `/api/v1/recipes` | Save a recipe with its ingredient lines. | REQ-F-001 | Account holder |
| GET | `/api/v1/recipes?query={text}` | Search saved recipes. | REQ-F-004 | Account holder — own recipes only |
| POST | `/api/v1/weekly-plans` | Start a weekly plan. | REQ-F-002 | Account holder |
| GET | `/api/v1/weekly-plans/{plan_id}` | View a weekly plan with its meals. | REQ-F-002 | Account holder — owner of the plan |
| POST | `/api/v1/weekly-plans/{plan_id}/meals` | Add a planned meal to the week. | REQ-F-002 | Account holder — owner of the plan |
| POST | `/api/v1/weekly-plans/{plan_id}/shopping-list` | Generate the week's shopping list. | REQ-F-003 | Account holder — owner of the plan |
| GET | `/api/v1/shopping-lists/{list_id}` | View a shopping list. | REQ-F-003 | Account holder — owner of the list |

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

The core endpoint's contract, filled:

```
Endpoint name:        Generate Shopping List
Method and path:      POST /api/v1/weekly-plans/{plan_id}/shopping-list
Purpose:              Turn one weekly plan into one shopping list — the capability
                      Pantry competes on.
Requirement:          REQ-F-003
Authentication:       Required — model open ([TODO: which authentication model? — Q-009])
Authorization rules:  Only the account holder who owns the weekly plan (REQ-R-001).

Request body:
{ }  (no fields — the plan is identified by the path)

Success response:     201 Created
{
  "id": "string",
  "weekly_plan_id": "string",
  "items": [
    { "name": "string", "quantity": "string or null", "position": "integer" }
  ]
}

Error responses:
  401 — not authenticated
  403 — authenticated but not the owner of this plan
  404 — weekly plan not found
  500 — unexpected server failure

Business rules:       BR-001 — the list covers every ingredient line of the week's
                      planned meals. Whether duplicate ingredients combine into one
                      line is open ([TODO: when two planned recipes share an
                      ingredient, does the shopping list combine them into one line,
                      or list them separately? — Q-011]).
Side effects:         The shopping list and its items are written. No emails, no jobs.
Tests required:       Defined at the test stage (03-tests/) against AC-003 and AC-005.
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
| Permission check | Every endpoint checks user access before returning data. |
| Validation timing | Validation happens **before** saving data. |
| Audit trail | Important create and status-change events are recorded. |

---

## Validation rules (Ch. 9 §9.6)

| Rule type | Example |
|---|---|
| Required field | A task title is required. |
| Length rule | A task title must be 3–120 characters. |
| Allowed value | Status must be `todo`, `doing`, `blocked`, or `done`. |
| Relationship rule | The assignee must belong to the project. |
| Permission rule | Only members with write access can create tasks. |
| Date rule | Due date cannot be before the project start date. |

---

## Versioning and compatibility (Ch. 9 §9.8)

**Current version:** v1
**Breaking-change policy:** The Pantry UI is this API's only consumer in version one; a
breaking change ships together with the UI change that uses it.
**Compatibility notes:** None yet — v1 is the first version.

| Change type | Usually safe? | Example |
|---|---|---|
| Add optional field | Usually safe | Add `priority` to a task response. |
| Add new endpoint | Usually safe | Add `GET /api/v1/tasks/{id}/history`. |
| Rename field | **Breaking** | Change `due_date` to `deadline`. |
| Remove field | **Breaking** | Remove `assignee_id` from task response. |
| Change data type | **Breaking** | Return `due_date` as an object instead of a string. |

> Blueprint: blueprints/01-docs/06-api-and-data-design/api-specification.md
