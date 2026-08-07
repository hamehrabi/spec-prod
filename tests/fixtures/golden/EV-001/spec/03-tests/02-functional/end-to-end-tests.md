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
| E2E-001 | REQ-F-002 | Save a recipe | A cook can save a recipe and see it listed. | Recipe appears in the list immediately. | Planned |
| E2E-002 | REQ-F-005 | Plan → generate list | A cook plans a week and generates one shopping list. | List shows every planned ingredient. | Planned |
| E2E-003 | REQ-NF-003 | Error recovery | The plan is preserved after a generation failure. | The plan is still there; a clear error is shown. | Planned |

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
| User action | Add two recipes as planned meals, then click Generate shopping list. |
| Expected visible result | The shopping list opens with every planned ingredient. |
| Failure path | Generate from a plan with no meals. |
| Expected error result | A clear "add a meal first" message; the plan is unchanged. |

---

## Production smoke test (Ch. 28 §28.12)

The same flows, run against the deployed system after release.

1. Sign in as a test cook.
2. Save a recipe with ingredients.
3. Create a weekly plan and add the recipe.
4. Generate the shopping list.
5. Trigger the main failure path and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

→ [`../ops/production-readiness-checklist.md`](../../07-ops/01-deployment/production-readiness-checklist.md)

Executable tests live in [`../tests/end-to-end/`](../05-executable/end-to-end).

---

> Blueprint: blueprints/03-tests/02-functional/end-to-end-tests.md
