# Acceptance Tests

> Source: Ch. 4 §4.6, Ch. 3 §3.6.
> Checks whether requirements work **from the user or business view**.

Written in Given–When–Then, derived directly from the acceptance criteria in
[`../docs/requirements.md`](../../01-docs/02-requirements/requirements.md).

---

| Test ID | Requirement | AC | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| ATEST-001 | REQ-F-001 | AC-001 | | | Planned |
| ATEST-002 | | | | | |

---

## Format

```
ATEST-001
Requirement: REQ-F-001
Acceptance criterion: AC-001

Given  [starting condition]
When   [user action or system event]
Then   [expected result]

Evidence to capture:
Status: Planned / Written / Passing / Failing / Blocked
```

---

## Examples (Ch. 5 §5.7)

| Requirement | Acceptance criteria |
|---|---|
| A team member must be able to create a task. | **Given** a signed-in team member, **when** they submit a valid task form, **then** the task is saved and shown in the task list. |
| A viewer must not edit tasks. | **Given** a signed-in viewer, **when** they open a task, **then** edit controls are hidden or disabled. |
| Task creation must handle errors. | **Given** a network failure, **when** the user submits the form, **then** the system shows an error and keeps the typed values. |

---

## Rule

Every **Must** requirement needs at least one acceptance test. An acceptance test that
cannot fail is not a test — state the exact observable result, not "it works."

---

# WORKED EXAMPLE — ProjectBoard

| Test ID | Requirement | AC | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| ATEST-001 | REQ-AUTH-001 | AC-001 | Registered user signs in with valid credentials | Session created; user reaches the project list | Passing |
| ATEST-002 | REQ-F-001 | AC-002 | Team member submits a valid task form | Task saved and shown in the list | Passing |
| ATEST-003 | REQ-F-005 | AC-004 | Member marks their own task Done | Status changes to `done`; dashboard count updates | Passing |
| ATEST-004 | REQ-F-006 | AC-005 | Member opens a project | Only that project's tasks are listed | Passing |
| ATEST-005 | BR-003 | AC-006 | Member sets a due date in the past at creation | Validation error; task not saved; typed values kept | Passing |
| ATEST-006 | REQ-R-002 | AC-007 | Viewer opens a task | Edit controls hidden **and** server rejects an edit attempt | Failing — see BUG-003 |

## Written out

```
ATEST-002
Requirement: REQ-F-001
Acceptance criterion: AC-002

Given  a signed-in team member viewing a project they belong to
When   they submit the task form with title "Prepare launch checklist" and a due date
Then   the task is saved with status "todo"
And    the task appears at the top of that project's task list
And    no other project's task list changes

Evidence to capture: 201 response body, task row in the database, screenshot of the list
Status: Passing
```

```
ATEST-005
Requirement: BR-003
Acceptance criterion: AC-006

Given  a signed-in team member creating a task
When   they submit a due date earlier than today
Then   the system returns a validation error naming the due-date field
And    no task row is created
And    the title and description the user typed are still on screen

Evidence to capture: 400 response body, empty result from the tasks table
Status: Passing
```

## Why ATEST-006 is failing

The Viewer's edit button is hidden in the UI, so the test looked like it passed manually.
The automated version also calls `PATCH /api/v1/tasks/{id}` directly and gets **200**.
Hiding a control is not authorization — the server must reject it too. Logged as BUG-003.
