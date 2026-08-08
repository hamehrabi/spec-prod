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
| UTEST-001 | REQ-F-001 | Recipe title required, trimmed before saving | "Lentil soup" accepted | `"  x  "` trimmed, then judged | `""` rejected | Planned |
| UTEST-002 | REQ-F-001 | A recipe needs at least one ingredient line | 2 lines accepted | exactly 1 line accepted | 0 lines rejected | Planned |
| UTEST-003 | REQ-F-003, BR-001 | Shared-ingredient combining rule | [TODO: when two planned recipes share an ingredient, does the shopping list combine them into one line, or list them separately? — Q-011] | [TODO: same question — Q-011] | [TODO: same question — Q-011] | Blocked |
| UTEST-004 | REQ-F-004 | Search matches a word from the recipe title (AC-004) | "soup" matches "Lentil soup" | case difference still matches | a word in no title matches nothing | Planned |
| UTEST-005 | REQ-F-003 | List items ordered by stable `position` | items keep their generated order | equal positions impossible by constraint | missing position rejected | Planned |

---

## Examples (Ch. 17 §17.2)

| Requirement detail | Unit test idea |
|---|---|
| A recipe title cannot be empty. | Pass an empty title and confirm validation fails. |
| A recipe needs at least one ingredient line. | Pass an empty line list and confirm rejection. |
| An ingredient line needs a name. | Pass a line with no name and confirm rejection. |
| List items carry a stable position. | Confirm order survives a re-read. |

---

## What belongs here

- Validation functions
- Business-rule predicates (the BR-001 coverage rule, the BR-002 same-account check)
- Value formatting and parsing
- Metric/aggregation helpers
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

## Written out

```
UNIT TEST PLAN: Recipe needs at least one ingredient line
Test ID: UTEST-002
Requirement ID: REQ-F-001
Rule: A recipe cannot be saved with zero ingredient lines.

Normal case:  two lines             -> accepted
Edge case:    exactly one line      -> accepted
Failure case: zero lines            -> rejected with a message naming the requirement

Why this rule matters:
  A recipe with no lines contributes nothing to a shopping list, and the core promise
  (BR-001) is that the list covers every line of the week. Empty recipes would make a
  "complete" list that misses meals — the exact forgotten-item problem Pantry exists
  to solve.
```

Executable tests live in [`../tests/unit/`](../05-executable/unit).

> Blueprint: blueprints/03-tests/02-functional/unit-tests.md
