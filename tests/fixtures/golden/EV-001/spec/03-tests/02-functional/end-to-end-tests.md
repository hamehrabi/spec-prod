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
| ETEST-001 | SEC-A-001 | Sign in | The account holder signs in and reaches their recipes. | Recipe list visible; sign-in mechanics follow the Q-009 model. | Planned |
| ETEST-002 | REQ-F-001 | Save a recipe | A recipe with ingredient lines can be saved from the browser. | Recipe appears in the library immediately. | Planned |
| ETEST-003 | REQ-F-002, REQ-F-003 | Plan the week and generate the list — **the core flow** | A planned week turns into one shopping list. | One list, covering every planned meal's ingredient lines, on screen within the REQ-NF-001 target. | Planned |
| ETEST-004 | REQ-NF-003 | Error recovery | A failed save keeps the typed values on screen. | Safe error shown; typed values still present; nothing saved. | Planned |

---

## Flow test template

```
Test ID:
Requirement:
Flow name:

Preconditions:      [signed-in role, seeded data]

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

## Written out

```
Test ID:      ETEST-003
Requirement:  REQ-F-002, REQ-F-003
Flow name:    Plan the week, generate the shopping list

Preconditions: signed in as the account holder; at least two recipes saved

Steps:
1. Open the weekly plan.
2. Add two saved recipes to the week.
3. Generate the shopping list.

Expected visible result:
  - One shopping list opens
  - Every ingredient line of both recipes appears as a list item
  - The list is on screen within the REQ-NF-001 target (2 s for up to 21 meals)

Failure path tested:
  Generate while the write is forced to fail.

Expected error result:
  - The safe error message ([TODO: when something is slow or fails, what should the
    user see? — Q-022])
  - The plan is unchanged; no partial list exists

Evidence to capture: the list screen, the plan's ingredient lines, list row count
Status: Planned
```

---

## UI test inputs (Ch. 18 §18.7)

Describe the **screen**, the **user action**, and the **visible result**. This prevents the
agent from writing tests that depend on imaginary buttons, labels, or flows.

| UI test input | Example |
|---|---|
| Screen | Weekly plan |
| User action | Add a saved recipe to the week, then generate the list. |
| Expected visible result | The shopping list opens with the week's items. |
| Failure path | Generate while the database write fails. |
| Expected error result | Safe message; plan unchanged; no partial list. |

---

## Production smoke test (Ch. 28 §28.12)

The same flows, run against the deployed system after release.

1. Sign in as a test user.
2. Save a test recipe.
3. Add it to a weekly plan.
4. Generate the shopping list.
5. Trigger the main failure path and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

→ [`../ops/production-readiness-checklist.md`](../../07-ops/01-deployment/production-readiness-checklist.md)

Executable tests live in [`../tests/end-to-end/`](../05-executable/end-to-end).

> Blueprint: blueprints/03-tests/02-functional/end-to-end-tests.md
