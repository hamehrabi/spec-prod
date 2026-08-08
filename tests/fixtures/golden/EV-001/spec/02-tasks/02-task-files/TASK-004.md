# TASK-004: Plan which meals to cook in a week

> Source: Ch. 4 §4.5 + Ch. 14 + Ch. 16 §16.5. One task = one outcome.

---

**Task ID:** TASK-004
**Task title:** Plan which meals to cook in a week
**Priority:** P1
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

`REQ-F-003` (plan a week); BR-003 (a planned meal must reference an owned recipe);
BR-004 (a recipe cannot be deleted while a plan references it).

## Business reason

Deciding the week in one place is the step that turns a scattered library into a shoppable
plan — the input the core list generation reads.

## Goal

Let a signed-in cook build a weekly plan by choosing saved recipes for the days of a week.
One outcome: a saved weekly plan of planned meals.

## Inputs

- [`requirements.md`](../../01-docs/02-requirements/requirements.md) REQ-F-003
- [`database-design.md`](../../01-docs/06-api-and-data-design/database-design.md) (WeeklyPlan, PlannedMeal)

## Expected files or components

The Planning domain module, its API endpoints, and the WeeklyPlan / PlannedMeal tables; the
recipe-delete guard.

## Expected output

A cook creates a weekly plan and adds planned meals that each reference one of their saved
recipes; deleting a recipe still referenced by a plan is refused.

## Step-by-step instructions

1. Add the WeeklyPlan and PlannedMeal entities (store-neutral, ADR-002), scoped by `account_id`.
2. A planned meal must reference a saved recipe owned by the same account (BR-003).
3. Block deletion of a recipe while a weekly plan references it (BR-004).
4. Add the plan create/edit endpoints, scoped to the signed-in account.

## Dependencies

TASK-002.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features (no servings maths, no auto-planning).
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- A planned meal may reference only a recipe owned by the same account.

## Do not change

The list-generation logic (TASK-005) or recipe search (TASK-003).

## Acceptance check / Done criteria

A cook plans meals on the days of a week; a planned meal referencing a non-owned or missing
recipe is rejected; a recipe used by a plan cannot be deleted.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-006 | Plan meals on the days of a week | The weekly plan saves and shows the planned meals |
| UTEST-005 | Planned-meal reference rule | A meal must reference an owned saved recipe |
| ITEST-003 | Plan referencing another account's recipe | Rejected with a safe response |
| ITEST-006 | Delete a recipe referenced by a plan | Blocked; nothing deleted |
| FTEST-005 | Planned meal points at a missing/non-owned recipe | Safe rejection; nothing planned |
| FTEST-006 | Delete a recipe used by a plan | Blocked (409); the recipe and plan remain |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Generating the shopping list (TASK-005) and ticking items off (TASK-006).

## Stop condition

Stop and ask if a week needs a shape other than days-of-one-week (e.g. multiple weeks).

---

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
