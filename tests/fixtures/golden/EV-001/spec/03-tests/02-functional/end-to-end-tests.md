# End-to-End Test Plan

> Source: Front Matter workspace (`03-tests/end-to-end/`), Ch. 17 §17.4, Ch. 18 §18.7.
> E2E tests prove the system works **from the user's point of view**, not only from the
> code's point of view.

> **Practical rule (Ch. 17 §17.4):** if a user would complain loudly when a flow breaks,
> that flow deserves an end-to-end test plan.

Keep E2E tests focused. Do not try to cover every tiny rule with them — use them for the
flows that decide whether the product is usable.

---

| Test ID | Requirement | User flow | Goal | Expected result | Status |
|---|---|---|---|---|---|
| ETEST-001 | REQ-F-004 | Plan → generate list → tick off | The core flow works end to end | One list of every planned meal's ingredients; items tick off and persist | Planned |
| ETEST-002 | REQ-F-005 | Sign in → save a recipe | A cook signs in and saves a recipe they can see | The recipe appears in their private list | Planned |

---

## Flow test template

```
Test ID:
Requirement:
Flow name:

Preconditions:      [signed-in cook, seeded data]

Steps:
1.
2.
3.

Expected visible result:
Failure path tested:
Expected error result:
Evidence to capture:   [screenshot, log line, database state]
Status:
```

---

## UI test inputs (Ch. 18 §18.7)

Describe the **screen**, the **user action**, and the **visible result**. This prevents the
agent from writing tests that depend on imaginary buttons, labels, or flows.

| UI test input | Example |
|---|---|
| Screen | Weekly plan page |
| User action | Choose saved recipes for the days of the week, then click Generate list. |
| Expected visible result | One shopping list opens with every planned meal's ingredients. |
| Failure path | Generate a list from a week with no planned meals. |
| Expected error result | An empty list with a clear message appears; no error page. |

---

## Production smoke test (Ch. 28 §28.12)

The same flows, run against the deployed system after release.

1. Sign in as a test cook.
2. Save a recipe with ingredient lines.
3. Plan that recipe on a day of the week.
4. Generate the shopping list and confirm it lists the recipe's ingredients.
5. Generate from an empty week and confirm the safe empty-list message.
6. Confirm logs and events exist (`LIST_GENERATED`) with a request id.
7. Confirm monitoring shows no critical errors.

→ [`../../07-ops/01-deployment/production-readiness-checklist.md`](../../07-ops/01-deployment/production-readiness-checklist.md)

Executable tests live in [`../05-executable/executable-tests.md`](../05-executable/executable-tests.md) (`end-to-end/`).

---

## Written out

```
Test ID:      ETEST-001
Requirement:  REQ-F-004
Flow name:    Plan a week, generate one list, tick items off

Preconditions: signed-in cook with two saved recipes; an empty week

Steps:
1. Open the weekly plan and add both recipes on two days.
2. Click "Generate shopping list".
3. Tick off two items on the generated list.

Expected visible result:
  - One shopping list appears containing both recipes' ingredient lines
  - The two ticked items show as picked up; the rest remain

Failure path tested:
  Generate the list again from a different, empty week.

Expected error result:
  - An empty list with a clear message, not an error page

Evidence to capture: screenshot of the list, 200 response, shopping-list rows in the database
Status: Planned
```

---

> Blueprint: blueprints/03-tests/02-functional/end-to-end-tests.md
