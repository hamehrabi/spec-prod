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
| UTEST-001 | REQ-F-002 / BR-002 | Recipe needs a title and ≥1 ingredient line | title + 1 line accepted | title + many lines accepted | title with 0 lines rejected | Planned |
| UTEST-002 | REQ-F-002 | Recipe title length/trim | "Soup" accepted | 200 chars accepted | "" rejected; 201 chars rejected | Planned |
| UTEST-003 | REQ-F-005 / BR-001 | Combine ingredients across meals | two distinct ingredients → two lines | same ingredient in two meals → per Q-009 rule | plan with 0 meals → empty list, not an error | Blocked (Q-009) |

---

## Examples (Ch. 17 §17.2)

| Requirement detail | Unit test idea |
|---|---|
| A recipe title cannot be empty. | Pass an empty title and confirm validation fails. |
| A recipe must have at least one ingredient. | Pass zero lines and confirm rejection. |
| A shopping list covers every planned ingredient. | Pass a plan and confirm every ingredient appears. |
| A plan with no meals produces an empty list. | Pass an empty plan and confirm an empty (not errored) list. |

---

## What belongs here

- Validation functions
- Business-rule predicates (`recipe_is_valid`, `owns_resource`)
- Value formatting and parsing
- The ingredient-combination helper
- Filter/search-term parsing

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

Executable tests live in [`../tests/unit/`](../05-executable/unit).

---

> Blueprint: blueprints/03-tests/02-functional/unit-tests.md
