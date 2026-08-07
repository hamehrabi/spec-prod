# Acceptance Tests

> Source: Ch. 4 §4.6, Ch. 3 §3.6.
> Checks whether requirements work **from the user or business view**.

Written in Given–When–Then, derived directly from the acceptance criteria in
[`../docs/requirements.md`](../../01-docs/02-requirements/requirements.md).

---

| Test ID | Requirement | AC | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| ATEST-001 | REQ-F-005 | AC-001 | Generate a list from a plan with planned meals | List contains an item for every ingredient of every planned meal | Planned |
| ATEST-002 | REQ-F-002 | AC-003 | Save a recipe with a title and ingredient lines | Recipe saved and findable by search | Planned |
| ATEST-003 | REQ-NF-002 | AC-004 | Account A requests account B's data | Access denied (safe 404); nothing returned | Planned |
| ATEST-004 | REQ-F-005 | AC-002 | Generation fails, then the cook retries | Clear error shown; weekly plan preserved | Planned |

---

## Format

```
ATEST-001
Requirement: REQ-F-005
Acceptance criterion: AC-001

Given  a weekly plan with planned meals
When   the cook generates a shopping list
Then   the list contains an item for every ingredient of every planned meal
And    no other account's data is touched

Evidence to capture: 200 response body, shopping_list_items count vs planned ingredients
Status: Planned
```

---

## Examples (Ch. 5 §5.7)

| Requirement | Acceptance criteria |
|---|---|
| A cook must be able to save a recipe. | **Given** a signed-in cook, **when** they submit a valid recipe form, **then** the recipe is saved and shown in their recipe list. |
| A cook's data is private. | **Given** a signed-in cook, **when** they request another account's recipe, **then** access is denied. |
| Generation must handle errors. | **Given** a failure, **when** the cook retries, **then** the system shows an error and preserves the weekly plan. |

---

## Rule

Every **Must** requirement needs at least one acceptance test. An acceptance test that
cannot fail is not a test — state the exact observable result, not "it works."

---

> Blueprint: blueprints/03-tests/02-functional/acceptance-tests.md
