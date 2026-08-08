# Unit Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.2.
> Unit tests check **small pieces of logic** that can be tested without running the entire
> application: calculations, validators, permission checks, formatting rules, helpers.

A good unit test plan names the **rule**, the **input**, the **expected output**, and the
**reason the rule matters**. You do not need final test code here — only behavior clear
enough that code can later be generated against it.

---

| Test ID | Requirement | Rule under test | Normal case | Edge case | Failure case | Status |
|---|---|---|---|---|---|---|
| UTEST-001 | REQ-F-001 | Recipe title required, trimmed, 1–120 chars | "Sunday roast" accepted | 120 chars accepted | `""` rejected with a clear message | Planned |
| UTEST-002 | REQ-F-002 | Search matches within the cook's own library | "chicken" matches a chicken recipe | partial word matches | no match returns an empty result, not an error | Planned |
| UTEST-003 | REQ-F-004 | List generation gathers every planned meal's ingredient lines (BR-001) | 3 meals → all their lines in one list | a recipe used on two days contributes its lines each time | a planned meal whose recipe has no lines adds nothing and does not crash | Planned |
| UTEST-004 | REQ-F-004 | Empty week yields an empty list | week with 0 meals → empty list | all meals removed → empty list | generation on an empty week must not raise an error | Planned |
| UTEST-005 | BR-003 | Planned meal must reference an owned saved recipe | reference to an owned recipe accepted | a recipe just deleted → reference rejected | reference to a missing or non-owned recipe rejected | Planned |

---

## What belongs here

- Validation functions
- Business-rule predicates (`owns_resource`, `meal_references_owned_recipe`)
- Value formatting and parsing
- Metric/aggregation helpers (the list-gathering logic)
- Filter parsing
- Status transition rules

## What does **not** belong here

- Database round-trips → [`integration-tests.md`](integration-tests.md)
- Full user journeys → [`end-to-end-tests.md`](end-to-end-tests.md)
- Response contract shape → [`integration-tests.md`](integration-tests.md)

---

## Template

```
UNIT TEST PLAN: [rule name]
Requirement ID: REQ-###
Rule: [the rule in one sentence]

Normal case:  [input] -> [expected]
Edge case:    [input] -> [expected]
Failure case: [input] -> [expected, with a clear error]

Why this rule matters:
```

Executable tests live in [`../05-executable/executable-tests.md`](../05-executable/executable-tests.md) (`unit/`).

---

## Written out

```
UNIT TEST PLAN: Shopping-list generation
Test ID: UTEST-003
Requirement ID: REQ-F-004 (BR-001)
Rule: A shopping list gathers the ingredient lines of every meal planned in one week.

Normal case:  a week with 3 planned meals -> a list of all three recipes' ingredient lines
Edge case:    the same recipe planned on two days -> its lines appear for each planned meal
Failure case: a planned meal whose recipe has no lines -> contributes nothing; no crash

Why this rule matters:
  This is the core capability Pantry competes on. If the gather logic drops a meal or a line,
  the cook forgets an item at the shop — the exact problem the product exists to remove.
```

---

> Blueprint: blueprints/03-tests/02-functional/unit-tests.md
