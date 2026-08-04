# API Specification

> Source: Ch. 7 §7.7, Ch. 9 §9.4–9.8, Appendix D.
> An API contract stops the agent from inventing endpoint names, request formats,
> response formats, or ownership behavior while coding.

**Base path:** `/api/v1`
**Auth model:**
**Version:** API v1.0

---

## Endpoint index

| Method | Path | Purpose | Requirement | Permission |
|---|---|---|---|---|
| POST | `/api/v1/…` | | REQ-F-001 | |
| GET | `/api/v1/…` | | | |
| PATCH | `/api/v1/…` | | | |
| DELETE | `/api/v1/…` | | | |

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
**Breaking-change policy:**
**Compatibility notes:**

| Change type | Usually safe? | Example |
|---|---|---|
| Add optional field | Usually safe | Add `priority` to a task response. |
| Add new endpoint | Usually safe | Add `GET /api/v1/tasks/{id}/history`. |
| Rename field | **Breaking** | Change `due_date` to `deadline`. |
| Remove field | **Breaking** | Remove `assignee_id` from task response. |
| Change data type | **Breaking** | Return `due_date` as an object instead of a string. |

---

## Prompts

**Implement from a contract (Ch. 13 §13.5)**
```
Implement the API endpoint using this contract only:

Endpoint:          [PASTE ENDPOINT AND METHOD]
Request contract:  [PASTE REQUEST BODY]
Response contract: [PASTE RESPONSE BODY]
Validation rules:  [PASTE VALIDATION RULES]
Error behavior:    [PASTE ERROR RESPONSES]

Important boundaries:
- Do not change the contract.
- Do not rename fields.
- Do not add extra response fields.
- If something is unclear, list the question before writing code.

Return: endpoint logic, validation logic, example success response, example error response.
```

**Review validation coverage (Prompt box 9.2)**
```
Review the API endpoint below. List all validation rules that should exist before data is
saved. Group them into required fields, allowed values, relationship rules, permission
rules, and error responses. Do not write code yet.
```

**Check compatibility risk (Prompt box 9.3)**
```
Review this API change and tell me whether it is backward compatible. Identify any
frontend, test, documentation, or integration updates that may be needed. If it is a
breaking change, suggest a safer versioning strategy.
```

---

# WORKED EXAMPLE (Ch. 9 §9.5)

**Request**
```
POST /api/v1/projects/{project_id}/tasks
Content-Type: application/json

{
  "title": "Prepare launch checklist",
  "description": "Confirm release tasks before deployment.",
  "assignee_id": "user_102",
  "due_date": "2026-07-15"
}
```

**Success response**
```
201 Created

{
  "id": "task_501",
  "project_id": "project_200",
  "title": "Prepare launch checklist",
  "status": "todo",
  "assignee_id": "user_102",
  "due_date": "2026-07-15",
  "created_at": "2026-06-26T10:15:00Z"
}
```

**Error response**
```
400 Bad Request

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The task title is required.",
    "field": "title"
  }
}
```
