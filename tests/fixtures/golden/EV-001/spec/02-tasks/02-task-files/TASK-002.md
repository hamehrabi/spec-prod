# TASK-002: Save a recipe with its ingredient lines

> Source: Ch. 4 §4.5 + Ch. 14 + Ch. 16 §16.5. One task = one outcome.

---

**Task ID:** TASK-002
**Task title:** Save a recipe with its ingredient lines
**Priority:** P0
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

`REQ-F-001` (save a recipe with ingredient lines); BR-002 (data belongs to one account);
[`database-design.md`](../../01-docs/06-api-and-data-design/database-design.md) (Recipe, IngredientLine).

## Business reason

Recipes in one place is the foundation of the product — a week cannot be planned or shopped
from until recipes exist.

## Goal

Let a signed-in cook save a recipe with a title and one or more ingredient lines, stored
privately under their account. One outcome: a saved recipe.

## Inputs

- [`requirements.md`](../../01-docs/02-requirements/requirements.md) REQ-F-001, AC-001
- [`api-specification.md`](../../01-docs/06-api-and-data-design/api-specification.md) (recipe endpoints)
- [`security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md) §3

## Expected files or components

The Recipes domain module, its API endpoints, and the Recipe / IngredientLine tables.

## Expected output

A cook can create a recipe with a title and ingredient lines; it appears in their recipe
list; another account can never see it.

## Step-by-step instructions

1. Add the Recipe and IngredientLine entities (store-neutral, ADR-002), scoped by `account_id`.
2. Validate the title (required, 1–120, trimmed) and require at least one ingredient line.
3. Add the create/read recipe endpoints, scoped to the signed-in account (BR-002).
4. Return a retry-safe error on a save failure without reporting success (`REQ-NF-003`).

## Dependencies

TASK-001.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features (no sharing, no import, no nutrition).
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- Every query is scoped by `account_id`.

## Do not change

The Account/Auth module or its session behaviour.

## Acceptance check / Done criteria

A recipe with a title and ingredient lines saves and appears in the cook's list; a missing
title is rejected without saving; nothing is visible to another account.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-001 | Submit a recipe with a title and ingredient lines | Saved and shown in the recipe list |
| UTEST-001 | Recipe title validation | Empty/oversize titles rejected; valid titles accepted |
| ITEST-001 | Save via the API | Row persisted, scoped to the account |
| FTEST-001 | Simulated database write failure | Retry-safe error; no false success; input preserved |
| FTEST-003 | Submit a recipe with no title | 400, field-named message; nothing saved |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Search, planning, list generation, and photos — later tasks.

## Stop condition

Stop and ask if a recipe field beyond title and ingredient lines seems required.

---

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
