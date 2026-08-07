# Task Index

> Source: Ch. 4 §4.9 (Step 5) — "Create `task-index.md` so every future task has a record."
> Keeping tasks as separate files creates a useful history of what the project attempted.
> It makes review easier and prevents the same unclear request from being repeated.

---

| Task ID | Title | Requirement | Priority | Depends on | Status | Owner (human / agent) | Test IDs |
|---|---|---|---|---|---|---|---|
| TASK-001 | Project structure and config loading | — | P0 | — | Not started | agent | — |
| TASK-002 | Account model and sign-in | REQ-F-001 | P0 | TASK-001 | **Blocked** | agent | STEST-001 |
| TASK-003 | Recipe + ingredient-line data model | REQ-F-002 | P0 | TASK-001 | Not started | agent | UTEST-001 |
| TASK-004 | Save-recipe API and validation | REQ-F-002 | P1 | TASK-003 | Not started | agent | ITEST-001, UTEST-002 |
| TASK-005 | Recipe form and list UI | REQ-F-002 | P1 | TASK-004 | Not started | agent | E2E-001 |
| TASK-006 | Recipe search | REQ-F-003 | P1 | TASK-004 | Not started | agent | ITEST-002 |
| TASK-007 | Weekly plan: create and add planned meals | REQ-F-004 | P1 | TASK-003 | Not started | agent | ITEST-003 |
| TASK-008 | Generate one shopping list from a plan (core) | REQ-F-005 | P1 | TASK-007 | **Blocked** | agent | ATEST-001, UTEST-003, FTEST-001 |
| TASK-009 | View and check off shopping-list items | REQ-F-005 | P2 | TASK-008 | Not started | agent | E2E-002 |
| TASK-010 | Dish-photo upload (private) | REQ-F-002 | P2 | TASK-005 | Not started | agent | STEST-002 |

**Status values:** Not started · In progress · Blocked · In review · Done · Rejected

**Priority (Ch. 14 §14.5):**

| Priority | Meaning | Example |
|---|---|---|
| P0 | Must exist before related work can begin. | Account model, recipe model, project structure. |
| P1 | Required for the feature to be usable. | Save-recipe API, list generation, search. |
| P2 | Useful improvement after core behavior works. | Check-off items, photo upload. |
| P3 | Future or polish item. | — none yet. |

> When using an AI agent, start with P0 and P1. Do not give it P2 or P3 work until the
> foundation is implemented, tested, and reviewed.

**TASK-002 blocked by:** Q-006 — the authentication model is not decided, so sign-in cannot be
built.

**TASK-008 blocked by:** Q-009 — whether identical ingredients across meals are merged (and how
units combine) is undecided, and it changes the core generation logic.

---

## Dependency map

Draw the build order. If a task cannot be *tested correctly* without an earlier task,
there is a dependency (Ch. 14 §14.4).

```
TASK-001 (structure + config)
    ├── TASK-002 (account + sign-in)        [BLOCKED on Q-006]
    └── TASK-003 (recipe model)
            ├── TASK-004 (save-recipe API)
            │       ├── TASK-005 (recipe UI)
            │       │       └── TASK-010 (photo upload)
            │       └── TASK-006 (search)
            └── TASK-007 (weekly plan)
                    └── TASK-008 (generate list)   [BLOCKED on Q-009]
                            └── TASK-009 (view / check off)
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

> Blueprint: blueprints/02-tasks/01-planning/task-index.md
