# TASK-006: Tick off shopping-list items

> Source: Ch. 4 §4.5 + Ch. 14 + Ch. 16 §16.5. One task = one outcome.

---

**Task ID:** TASK-006
**Task title:** Tick off shopping-list items while shopping
**Priority:** P2
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

`REQ-F-006` (tick off items as you shop, so you can see what is still needed). Priority Should.

## Business reason

While shopping, the cook needs to see what is still needed — ticking items off is what makes
the generated list usable in the shop rather than only on screen.

## Goal

Let a signed-in cook mark shopping-list items as picked up and see what remains. One outcome:
a checkable shopping list.

## Inputs

- [`requirements.md`](../../01-docs/02-requirements/requirements.md) REQ-F-006
- [`database-design.md`](../../01-docs/06-api-and-data-design/database-design.md) (ShoppingListItem)

## Expected files or components

The check/uncheck behaviour on ShoppingListItem and its API endpoint.

## Expected output

A cook ticks items off their list and the checked state persists; the list shows what is
still needed.

## Step-by-step instructions

1. Add a checked flag to ShoppingListItem (store-neutral, ADR-002).
2. Add an endpoint to check/uncheck an item, scoped to the signed-in account (BR-002).
3. Show remaining vs. checked items on the list.

## Dependencies

TASK-005.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features (no cross-device sync beyond persistence).
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- Only the owning account may change an item's state.

## Do not change

The list-generation logic (TASK-005).

## Acceptance check / Done criteria

A cook checks and unchecks items; the state persists; only their own list is affected.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-008 | Tick off a list item | The item shows as picked up; remaining items are visible |
| ITEST-005 | Check an item via the API | The checked state persists, scoped to the account |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Any list feature beyond checking items off (no sharing, no notes).

## Stop condition

Stop and ask if checked state must survive regenerating the list for the same week.

---

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
