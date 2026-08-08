# TASK-003: Search saved recipes

> Source: Ch. 4 §4.5 + Ch. 14 + Ch. 16 §16.5. One task = one outcome.

---

**Task ID:** TASK-003
**Task title:** Search saved recipes
**Priority:** P1
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

`REQ-F-002` (search saved recipes); BR-002 (data belongs to one account).

## Business reason

A library is only useful if the cook can find a recipe quickly when planning a week.

## Goal

Let a signed-in cook search their own saved recipes and get matching results promptly. One
outcome: a working search over the cook's own library.

## Inputs

- [`requirements.md`](../../01-docs/02-requirements/requirements.md) REQ-F-002
- [`api-specification.md`](../../01-docs/06-api-and-data-design/api-specification.md) (search endpoint)

## Expected files or components

The search behaviour in the Recipes module and its API endpoint.

## Expected output

A cook searches by title or ingredient text and sees only their own matching recipes.

## Step-by-step instructions

1. Add a search over the cook's own recipes (title and ingredient text), scoped by `account_id`.
2. Return matching recipes; return an empty result with a clear message when none match.
3. Keep the query simple and portable (ADR-002); no store-specific search feature.

## Dependencies

TASK-002.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features (no fuzzy ranking, no external search service).
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- Search is scoped to the signed-in account only.

## Do not change

The recipe create/read behaviour from TASK-002.

## Acceptance check / Done criteria

A search returns the cook's matching recipes and never another account's; no match shows an
empty result, not an error.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-005 | Search for a saved recipe | The matching recipe is returned |
| UTEST-002 | Search matching logic | Matches within the cook's library; no match returns empty |
| ITEST-002 | Search via the API for another account's recipe | Only the signed-in account's recipes are ever returned |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Planning, list generation, and photos — later tasks.

## Stop condition

Stop and ask if search must span fields beyond title and ingredient text.

---

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
