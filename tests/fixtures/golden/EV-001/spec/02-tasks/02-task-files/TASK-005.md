# TASK-005: Generate one shopping list from a week (core)

> Source: Ch. 4 §4.5 + Ch. 14 + Ch. 16 §16.5. One task = one outcome.

---

**Task ID:** TASK-005
**Task title:** Generate one shopping list from a week's plan
**Priority:** P1
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

`REQ-F-004` (generate one shopping list from a week); BR-001 (one list from exactly one week,
covering every planned meal); `REQ-NF-001` (prompt), `REQ-NF-002` (own data only). **This is
the core capability the product competes on.**

## Business reason

Turning a week of chosen meals into one shopping list is the whole reason Pantry exists — the
single-trip promise that removes the second shop and the forgotten item.

## Goal

Let a signed-in cook generate one shopping list that gathers the ingredient lines of every
meal planned in a week. One outcome: a single shopping list for the week.

## Inputs

- [`requirements.md`](../../01-docs/02-requirements/requirements.md) REQ-F-004, AC-002, AC-003
- [`database-design.md`](../../01-docs/06-api-and-data-design/database-design.md) (ShoppingList, ShoppingListItem)
- [`security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md) §7

## Expected files or components

The ShoppingList service (kept separate from storage and auth, `REQ-NF-005`, FF-001), its API
endpoint, and the ShoppingList / ShoppingListItem tables.

## Expected output

From a week's plan the cook generates one shopping list containing the ingredients of every
planned meal; an empty week yields an empty list with a clear message, not an error.

## Step-by-step instructions

1. Implement the ShoppingList service: read one week's planned meals and gather every meal's
   ingredient lines into one list (BR-001).
2. Keep the service free of UI and store specifics so it stays testable and portable (FF-001).
3. Add the generate-list endpoint, scoped to the signed-in account (BR-002); deny another
   account's week with a safe not-found (SEC-Z-001).
4. Return an empty list with a message when the week has no planned meals (AC-003).

## Dependencies

TASK-004.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features (no pricing, no store aisles, no quantity maths beyond the
  ingredient lines as written).
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- The core list logic must not import UI or store-specific code (FF-001).

## Do not change

The Planning module's rules (TASK-004) or the Account/Auth module.

## Acceptance check / Done criteria

Generating from a planned week returns one list of every meal's ingredients; an empty week
returns an empty list with a message; another account's week is denied.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-002 | Generate from a week with planned meals | One list of every planned meal's ingredients |
| ATEST-003 | Generate from a week with no meals | Empty list with a clear message, not an error |
| ATEST-004 | View any list | Only the signed-in account's data is shown |
| UTEST-003 | List-generation logic | Gathers every planned meal's ingredient lines into one list |
| UTEST-004 | Generate from an empty week | Empty list returned |
| ITEST-004 | Generate via the API | One list returned for the week |
| STEST-001 | Request another account's week | Safe not-found; no data returned |
| PTEST-001 | Generate for one cook's library | Returns promptly (target set with `Q-010`) |
| FTEST-002 | Simulated read failure during generation | Retry-safe error; no partial list |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Ticking items off the list (TASK-006); pricing and quantities beyond the ingredient lines.

## Stop condition

Stop and ask if ingredient lines from different recipes must be merged or de-duplicated —
version one lists them as written unless the spec says otherwise.

---

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
