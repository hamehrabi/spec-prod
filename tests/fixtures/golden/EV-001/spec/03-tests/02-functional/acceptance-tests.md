# Acceptance Tests

> Source: Ch. 4 §4.6, Ch. 3 §3.6.
> Checks whether requirements work **from the user or business view**.

Written in Given–When–Then, derived directly from the acceptance criteria in
[`../docs/requirements.md`](../../01-docs/02-requirements/requirements.md).

---

| Test ID | Requirement | AC | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| ATEST-001 | REQ-F-001 | AC-001 | Signed-in account holder saves a recipe with a title and one ingredient line | Recipe appears in their saved recipes | Planned |
| ATEST-002 | REQ-F-002 | AC-002 | Account holder adds a saved recipe to a weekly plan | The plan shows that meal for the week | Planned |
| ATEST-003 | REQ-F-003 | AC-003 | Account holder generates the shopping list from a plan with meals | Exactly one list, containing an item for every ingredient line of every planned meal | Planned |
| ATEST-004 | REQ-F-004 | AC-004 | Account holder searches with a word from a recipe's title | Matching recipes are listed | Planned |
| ATEST-005 | REQ-F-003 | AC-005 | Two planned recipes share an ingredient; the list is generated | [TODO: when two planned recipes share an ingredient, does the shopping list combine them into one line, or list them separately? — Q-011] | Blocked |

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
ATEST-003
Requirement: REQ-F-003
Acceptance criterion: AC-003

Given  a signed-in account holder with a weekly plan containing planned meals
When   they generate the plan's shopping list
Then   exactly one shopping list is produced
And    it contains an item for every ingredient line of every planned meal in that week
And    no other account's data appears in it

Evidence to capture: the generated list, the plan's ingredient lines, a row count
                     showing one list for the plan
Status: Planned
```

```
ATEST-005
Requirement: REQ-F-003
Acceptance criterion: AC-005

Given  a weekly plan containing two recipes that share an ingredient
When   the shopping list is generated
Then   [TODO: when two planned recipes share an ingredient, does the shopping list
       combine them into one line, or list them separately? — Q-011]

Evidence to capture: the generated list lines for the shared ingredient
Status: Blocked — the expected result cannot be stated until Q-011 is answered.
```

---

## Rule

Every **Must** requirement needs at least one acceptance test. An acceptance test that
cannot fail is not a test — state the exact observable result, not "it works."

> Blueprint: blueprints/03-tests/02-functional/acceptance-tests.md
