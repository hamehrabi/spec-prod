# TASK-000: [short task name]

> Source: Ch. 4 §4.5 (`TASK-001.md` starter) + Ch. 14 (agent-friendly task template) +
> Ch. 16 §16.5 (engineering task template).
> Copy to `TASK-###-short-name.md`. One task = one outcome.

---

**Task ID:** TASK-000
**Task title:**
**Priority:** P0 / P1 / P2 / P3
**Status:** Not started / In progress / Blocked / In review / Done
**Assigned to:** human / AI agent

---

## Source requirement or spec section

*REQ-###, spec section, ADR, or design decision this task supports.*

## Business reason

*Why this work is needed.*

## Goal

*What this task should accomplish — one outcome only.*

## Inputs

- [spec section]
- [API contract]
- [test note]

## Expected files or components

*Where the change should happen, when known.*

## Expected output

*What should exist after the task is complete.*

## Step-by-step instructions

1.
2.
3.

## Dependencies

*Tasks that must be complete first.*

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features.
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
-

## Do not change

*Files, behavior, data, roles, or APIs that are off-limits for this task.*

## Acceptance check / Done criteria

*How you will verify the task is complete.*

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| TEST-### | | |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

-

## Stop condition

*Conditions under which the agent must stop and ask instead of proceeding.*

---

# WORKED EXAMPLE (Ch. 1 §1.8)

```
Task ID: TASK-001
Related requirement: REQ-001
Goal: Implement task creation for signed-in users.

Scope:
- Create task with title, optional description, and optional due date.
- Save the task under the current user's account.
- Return validation error when title is missing.

Out of scope:
- Team tasks
- Notifications
- File attachments

Tests required:
- Valid task is created successfully.
- Missing title returns validation error.
- User cannot create a task for another account.

Review checklist:
- Code matches REQ-001.
- No unrelated feature was added.
- Tests pass.
- Error messages are clear.
```

## Context pack for this task (Ch. 25 §25.9)

```
Task ID: A-005
Goal: Implement task creation and listing.
Requirements: REQ-004 and REQ-006

Database rules:
- tasks.project_id must reference projects.id
- task.title is required
- status defaults to Todo
- status values: Todo, In Progress, Done

API endpoints:
- POST /projects/{project_id}/tasks
- GET  /projects/{project_id}/tasks

Tests to satisfy:
- T-006 empty title is rejected
- user cannot create or list tasks for another user's project

Stop condition:
- Do not modify authentication or project creation unless a failing test proves it is
  necessary.
```
