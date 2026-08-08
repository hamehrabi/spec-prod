# Task Index

> Source: Ch. 4 §4.9 (Step 5) — "Create `task-index.md` so every future task has a record."
> Keeping tasks as separate files creates a useful history of what the project attempted.
> It makes review easier and prevents the same unclear request from being repeated.

---

| Task ID | Title | Requirement | Priority | Depends on | Status | Owner (human / agent) | Test IDs |
|---|---|---|---|---|---|---|---|
| TASK-001 | Project skeleton and account sign-in | REQ-F-005 | P0 | — | Not started | AI agent | ATEST-007, STEST-002 |
| TASK-002 | Save a recipe with its ingredient lines | REQ-F-001 | P0 | TASK-001 | Not started | AI agent | ATEST-001, ITEST-001, FTEST-001 |
| TASK-003 | Search saved recipes | REQ-F-002 | P1 | TASK-002 | Not started | AI agent | ATEST-005, ITEST-002 |
| TASK-004 | Plan which meals to cook in a week | REQ-F-003 | P1 | TASK-002 | Not started | AI agent | ATEST-006, ITEST-003, FTEST-006 |
| TASK-005 | Generate one shopping list from a week | REQ-F-004 | P1 | TASK-004 | Not started | AI agent | ATEST-002, UTEST-003, STEST-001 |
| TASK-006 | Tick off shopping-list items | REQ-F-006 | P2 | TASK-005 | Not started | AI agent | ATEST-008, ITEST-005 |

**Status values:** Not started · In progress · Blocked · In review · Done · Rejected

**Priority (Ch. 14 §14.5):**

| Priority | Meaning | Example |
|---|---|---|
| P0 | Must exist before related work can begin. | Account model, private data scoping. |
| P1 | Required for the feature to be usable. | Save recipe, plan a week, generate the list. |
| P2 | Useful improvement after core behavior works. | Ticking list items off. |
| P3 | Future or polish item. | Animation, theme variation, optional shortcut. |

> When using an AI agent, start with P0 and P1. Do not give it P2 or P3 work until the
> foundation is implemented, tested, and reviewed.

---

## Dependency map

Draw the build order. If a task cannot be *tested correctly* without an earlier task,
there is a dependency (Ch. 14 §14.4). Each task is a thin vertical slice — one feature end to
end — because a slice is reviewable by using it.

```
TASK-001 (skeleton + account sign-in)
    └── TASK-002 (save a recipe)
            ├── TASK-003 (search recipes)
            └── TASK-004 (plan a week + delete guard)
                    └── TASK-005 (generate one list — core)
                            └── TASK-006 (tick items off)
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
