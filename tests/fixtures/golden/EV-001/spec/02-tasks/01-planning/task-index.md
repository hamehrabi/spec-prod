# Task Index

> Source: Ch. 4 §4.9 (Step 5) — "Create `task-index.md` so every future task has a record."
> Keeping tasks as separate files creates a useful history of what the project attempted.
> It makes review easier and prevents the same unclear request from being repeated.

---

| Task ID | Title | Requirement | Priority | Depends on | Status | Owner (human / agent) | Test IDs |
|---|---|---|---|---|---|---|---|
| TASK-001 | Create project structure and config loading | — | P0 | — | Not started | agent | — |
| TASK-002 | Implement account record and sign-in | SEC-A-001 | P0 | TASK-001 | **Blocked** | agent | ITEST-002, FTEST-003 |
| TASK-003 | Create Recipe + IngredientLine tables | REQ-F-001 | P0 | TASK-001 | Not started | agent | — |
| TASK-004 | Implement save-recipe endpoint | REQ-F-001 | P1 | TASK-002, TASK-003 | Not started | agent | ITEST-001, ITEST-005 |
| TASK-005 | Build save/edit recipe screen | REQ-F-001 | P1 | TASK-004 | Not started | agent | ETEST-002 |
| TASK-006 | Recipe-slice tests | REQ-F-001 | P1 | TASK-004, TASK-005 | Not started | agent | ATEST-001, UTEST-001, UTEST-002, FTEST-001, FTEST-002, FTEST-008 |
| TASK-007 | Create WeeklyPlan + PlannedMeal tables | REQ-F-002 | P0 | TASK-003 | Not started | agent | — |
| TASK-008 | Implement plan endpoints (BR-002 enforced) | REQ-F-002 | P1 | TASK-002, TASK-007 | Not started | agent | ITEST-003 |
| TASK-009 | Build week view screen | REQ-F-002 | P1 | TASK-008 | Not started | agent | — |
| TASK-010 | Plan-slice tests | REQ-F-002 | P1 | TASK-008, TASK-009 | Not started | agent | ATEST-002, STEST-006 |
| TASK-011 | Create ShoppingList + ShoppingListItem tables | REQ-F-003 | P1 | TASK-007 | Not started | agent | — |
| TASK-012 | Implement list-generation domain service (core) | REQ-F-003 | P1 | TASK-011 | **Blocked** | agent | UTEST-003 |
| TASK-013 | Implement generate endpoint + list screen | REQ-F-003 | P1 | TASK-012 | Not started | agent | ITEST-004 |
| TASK-014 | List-slice tests (full pyramid — core) | REQ-F-003 | P1 | TASK-013 | Not started | agent | ATEST-003, ATEST-005, UTEST-005, FTEST-005, FTEST-006, PTEST-001, ETEST-003 |
| TASK-015 | Implement recipe search — endpoint + screen | REQ-F-004 | P1 | TASK-004 | Not started | agent | ITEST-006 |
| TASK-016 | Search-slice tests | REQ-F-004 | P1 | TASK-015 | Not started | agent | ATEST-004, PTEST-002 |
| TASK-017 | Dish-photo upload, storage, and viewing | SEC-Z-002 | P2 | TASK-004 | **Blocked** | agent | FTEST-007, STEST-003 |

**Status values:** Not started · In progress · Blocked · In review · Done · Rejected

**TASK-002 blocked by:** Q-009 — which authentication model? Sign-in cannot be built until
the model is chosen.
**TASK-012 blocked by:** Q-011 — whether two planned recipes sharing an ingredient combine
into one list line. It is the core capability's central rule.
**TASK-017 blocked by:** Q-023 — the photo storage rules (where, size, types, scanning,
retention, attachment).

**Priority (Ch. 14 §14.5):**

| Priority | Meaning | Example |
|---|---|---|
| P0 | Must exist before related work can begin. | Project structure, account model, entity tables. |
| P1 | Required for the feature to be usable. | Endpoints, screens, slice tests. |
| P2 | Useful improvement after core behavior works. | Dish photos. |
| P3 | Future or polish item. | None yet. |

> When using an AI agent, start with P0 and P1. Do not give it P2 or P3 work until the
> foundation is implemented, tested, and reviewed.

---

## Dependency map

Draw the build order. If a task cannot be *tested correctly* without an earlier task,
there is a dependency (Ch. 14 §14.4).

```
TASK-001 (structure + config)
    ├── TASK-002 (accounts + sign-in)        [BLOCKED on Q-009]
    └── TASK-003 (recipe tables)
            ├── TASK-004 (save endpoint)     [needs 002 + 003]
            │       ├── TASK-005 (recipe screen)
            │       │       └── TASK-006 (recipe tests)   [needs 004 + 005]
            │       ├── TASK-015 (search)
            │       │       └── TASK-016 (search tests)
            │       └── TASK-017 (photos)    [BLOCKED on Q-023]
            └── TASK-007 (plan tables)
                    ├── TASK-008 (plan endpoints)         [needs 002 + 007]
                    │       ├── TASK-009 (week view)
                    │       └── TASK-010 (plan tests)     [needs 008 + 009]
                    └── TASK-011 (list tables)
                            └── TASK-012 (generation service)  [BLOCKED on Q-011]
                                    └── TASK-013 (endpoint + screen)
                                            └── TASK-014 (list tests)
```

---

## Task breakdown checklist (Ch. 14)

- [x] Each task has one clear outcome.
- [x] Each task points back to a requirement, specification, or design decision.
- [x] Each task has done criteria that can be checked.
- [x] Dependencies are listed before implementation begins.
- [x] P0 and P1 tasks are completed before optional improvements.
- [x] Each task says what is out of scope.
- [x] No task gives the agent permission to rewrite unrelated code.
- [x] Tests are planned before or alongside implementation.

> Blueprint: blueprints/02-tasks/01-planning/task-index.md
