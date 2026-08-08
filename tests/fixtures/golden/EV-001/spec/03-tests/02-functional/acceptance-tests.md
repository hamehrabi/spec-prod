# Acceptance Tests

> Source: Ch. 4 §4.6, Ch. 3 §3.6.
> Checks whether requirements work **from the user or business view**.

Written in Given–When–Then, derived directly from the acceptance criteria in
[`../../01-docs/02-requirements/requirements.md`](../../01-docs/02-requirements/requirements.md).

---

| Test ID | Requirement | AC | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| ATEST-001 | REQ-F-001 | AC-001 | Cook submits a recipe with a title and ingredient lines | Saved and shown in the recipe list | Planned |
| ATEST-002 | REQ-F-004 | AC-002 | Cook generates the list from a week with planned meals | One list contains every planned meal's ingredients | Planned |
| ATEST-003 | REQ-F-004 | AC-003 | Cook generates the list from a week with no meals | Empty list with a clear message, not an error | Planned |
| ATEST-004 | REQ-NF-002 | AC-004 | Cook views any recipe, plan, or list | Only their own account's data is shown | Planned |
| ATEST-005 | REQ-F-002 | — | Cook searches for a saved recipe | The matching recipe is returned | Planned |
| ATEST-006 | REQ-F-003 | — | Cook plans meals on the days of a week | The weekly plan saves with its planned meals | Planned |
| ATEST-007 | REQ-F-005 | — | Signed-out cook opens a data route | Redirected to sign in; the account's data stays private | Planned |
| ATEST-008 | REQ-F-006 | — | Cook ticks an item off the shopping list | Item shows as picked up; remaining items are visible | Planned |

---

## Format

```
ATEST-001
Requirement: REQ-F-001
Acceptance criterion: AC-001

Given  [starting condition]
When   [user action or system event]
Then   [expected result]

Evidence to capture:
Status: Planned / Written / Passing / Failing / Blocked
```

---

## Written out

```
ATEST-002
Requirement: REQ-F-004
Acceptance criterion: AC-002

Given  a signed-in cook whose week has three planned meals
When   they generate the shopping list from that week
Then   one shopping list is returned
And    it contains the ingredient lines of every planned meal
And    no other week's meals appear on it

Evidence to capture: 200 response body, the shopping-list rows in the database
Status: Planned
```

---

## Rule

Every **Must** requirement needs at least one acceptance test. An acceptance test that
cannot fail is not a test — state the exact observable result, not "it works."

---

> Blueprint: blueprints/03-tests/02-functional/acceptance-tests.md
