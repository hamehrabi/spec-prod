# Task Index

> Source: Ch. 4 §4.9 (Step 5) — "Create `task-index.md` so every future task has a record."
> Keeping tasks as separate files creates a useful history of what the project attempted.
> It makes review easier and prevents the same unclear request from being repeated.

---

| Task ID | Title | Requirement | Priority | Depends on | Status | Owner (human / agent) | Test IDs |
|---|---|---|---|---|---|---|---|
| TASK-001 | | REQ-F-001 | P0 | — | Not started | | TEST-001 |
| TASK-002 | | | P0 | TASK-001 | | | |
| TASK-003 | | | P1 | | | | |

**Status values:** Not started · In progress · Blocked · In review · Done · Rejected

**Priority (Ch. 14 §14.5):**

| Priority | Meaning | Example |
|---|---|---|
| P0 | Must exist before related work can begin. | User model, database table, API contract. |
| P1 | Required for the feature to be usable. | Login endpoint, form validation, error behavior. |
| P2 | Useful improvement after core behavior works. | Remember-me option, better loading state. |
| P3 | Future or polish item. | Animation, theme variation, optional shortcut. |

> When using an AI agent, start with P0 and P1. Do not give it P2 or P3 work until the
> foundation is implemented, tested, and reviewed.

---

## Dependency map

Draw the build order. If a task cannot be *tested correctly* without an earlier task,
there is a dependency (Ch. 14 §14.4).

```
TASK-001 (data model)
    ├── TASK-002 (validation rules)
    └── TASK-003 (API contract)
              └── TASK-004 (endpoint)      [needs 002 + 003]
                       └── TASK-006 (tests)
        TASK-005 (form behavior)           [needs 003]
```

---

## Task breakdown checklist (Ch. 14)

- [ ] Each task has one clear outcome.
- [ ] Each task points back to a requirement, specification, or design decision.
- [ ] Each task has done criteria that can be checked.
- [ ] Dependencies are listed before implementation begins.
- [ ] P0 and P1 tasks are completed before optional improvements.
- [ ] Each task says what is out of scope.
- [ ] No task gives the agent permission to rewrite unrelated code.
- [ ] Tests are planned before or alongside implementation.

---

# WORKED EXAMPLE — ProjectBoard

| Task ID | Title | Requirement | Priority | Depends on | Status | Owner | Test IDs |
|---|---|---|---|---|---|---|---|
| TASK-001 | Create project structure and config loading | — | P0 | — | Done | human | — |
| TASK-002 | Define user credential fields | REQ-AUTH-001 | P0 | TASK-001 | Done | agent | UTEST-001 |
| TASK-003 | Write password validation rules | REQ-AUTH-001 | P0 | TASK-002 | Done | agent | UTEST-002 |
| TASK-004 | Create login API contract | REQ-AUTH-001 | P0 | TASK-002 | Done | human | — |
| TASK-005 | Implement login endpoint | REQ-AUTH-001 | P1 | TASK-003, TASK-004 | In review | agent | TEST-AUTH-001…003 |
| TASK-006 | Implement task creation | REQ-F-001 | P1 | TASK-001 | In progress | agent | TEST-006, FTEST-001 |
| TASK-007 | Implement task listing with pagination | REQ-F-006 | P1 | TASK-006 | Not started | agent | TEST-008, PTEST-003 |
| TASK-008 | Implement task status update | REQ-F-005 | P1 | TASK-006 | Not started | agent | TEST-007 |
| TASK-009 | Block project delete while open tasks exist | BR-004 | P1 | TASK-006 | Not started | agent | FTEST-006 |
| TASK-010 | Add overdue filter to task list | REQ-F-008 | P2 | TASK-007 | **Blocked** | — | — |
| TASK-011 | Add index on tasks(project_id, status) | REQ-NF-001 | P2 | TASK-007 | Not started | human | PTEST-003 |
| TASK-012 | Add task labels | — | P3 | — | Not started | — | — |

**TASK-010 blocked by:** Q-003 — can a Viewer see tasks assigned to other members? The
filter query cannot be written until the visibility rule is decided.

**TASK-012 has no requirement** — it came from a hallway conversation. It stays P3 and
unassigned until it passes through `03-control/scope-change-log.md`.

## Dependency map

```
TASK-001 (structure + config)
    ├── TASK-002 (credential fields)
    │       ├── TASK-003 (password rules)
    │       └── TASK-004 (login contract)
    │               └── TASK-005 (login endpoint)      [needs 003 + 004]
    └── TASK-006 (task creation)
            ├── TASK-007 (list + pagination)
            │       ├── TASK-010 (overdue filter)      [BLOCKED on Q-003]
            │       └── TASK-011 (index)
            ├── TASK-008 (status update)
            └── TASK-009 (delete guard)
```

## Priority applied

| Priority | Tasks | Why |
|---|---|---|
| P0 | 001–004 | Nothing else can be built or tested until the model and contract exist. |
| P1 | 005–009 | Required for the first usable version. |
| P2 | 010–011 | Improvements once core behavior works. |
| P3 | 012 | Not needed for v1; no requirement yet. |

> The agent was given **only P0 and P1** work. P2 and P3 were withheld until the
> foundation was implemented, tested, and reviewed.
