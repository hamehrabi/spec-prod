# 03-tests/ — Executable Tests

> Source: Front Matter workspace (`03-tests/unit`, `03-tests/integration`, `03-tests/end-to-end`) +
> Ch. 12 §12.4.

This folder holds the **runnable** tests. The written plans and specifications they come
from live in [`../tests/`](../01-plan/test-plan.md).

```
03-tests/
  unit/           # small behavior tests
  integration/    # API, database, and workflow tests
  end-to-end/     # complete user flows
```

---

## Plan → executable mapping

| Plan document | Executable location |
|---|---|
| [`../tests/unit-tests.md`](../02-functional/unit-tests.md) | `unit/` |
| [`../tests/integration-tests.md`](../02-functional/integration-tests.md) | `integration/` |
| [`../tests/end-to-end-tests.md`](../02-functional/end-to-end-tests.md) | `end-to-end/` |
| [`../tests/security-tests.md`](../03-non-functional/security-tests.md) | `integration/` (negative cases) |
| [`../tests/edge-cases-and-failures.md`](../04-failure/edge-cases-and-failures.md) | matching level |
| [`../tests/acceptance-tests.md`](../02-functional/acceptance-tests.md) | `end-to-end/` or `integration/` |

---

## Naming convention

Include the test ID and the requirement so a failure points straight at the spec:

```
unit/test_UTEST-001_recipe_requires_title_and_line.py
integration/test_ITEST-001_save_recipe_scoped.py
end-to-end/test_E2E-002_plan_to_shopping_list.py
```

---

## Rules

- **Tests come from acceptance criteria**, not from the code that was just written
  (Ch. 17 §17.1). Testing after code means you may accidentally test what the code already
  does instead of what the requirement promised.
- Every behavior change adds or updates a test (Ch. 11 §11.5).
- Security-sensitive paths need **negative** tests (Appendix P).
- Never delete or weaken a test to make code pass (Appendix H).
- Every fixed bug gets a regression test that **fails before** the fix and **passes after**
  (Ch. 19 §19.6).
- A test that asserts "something happened" instead of "the right thing happened" is a
  shallow test — strengthen the assertion (Ch. 18 §18.3).

---

> Blueprint: blueprints/03-tests/05-executable/executable-tests.md
