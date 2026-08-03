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
unit/test_TEST-012_task_title_required.py
integration/test_TEST-021_viewer_cannot_export.py
end-to-end/test_TEST-030_create_task_flow.py
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

# WORKED EXAMPLE — ProjectBoard test tree

```
03-tests/05-executable/
  unit/
    test_UTEST-004_task_title_required.py
    test_UTEST-005_task_title_length.py
    test_UTEST-006_task_status_enum.py
    test_UTEST-007_due_date_not_past.py
    test_UTEST-008_can_create_task_roles.py
  integration/
    test_TEST-006_create_task_api.py
    test_TEST-007_update_status_api.py
    test_TEST-008_list_tasks_pagination.py
    test_TEST-009_delete_project_blocked.py
    test_STEST-002_viewer_cannot_patch_task.py
    test_STEST-007_project_isolation.py
    test_FTEST-008_db_timeout_no_partial_write.py
  end-to-end/
    test_ETEST-001_login_flow.py
    test_ETEST-003_create_task_flow.py
    test_ETEST-004_permission_boundary.py
    test_ETEST-005_form_keeps_values_on_error.py
```

## Plan → executable, traced

| Plan entry | Executable file | Requirement |
|---|---|---|
| `02-functional/unit-tests.md` → UTEST-005 | `unit/test_UTEST-005_task_title_length.py` | REQ-F-001 |
| `02-functional/integration-tests.md` → TEST-008 | `integration/test_TEST-008_list_tasks_pagination.py` | REQ-F-006 |
| `03-non-functional/security-tests.md` → STEST-002 | `integration/test_STEST-002_viewer_cannot_patch_task.py` | REQ-R-002 |
| `04-failure/failure-tests.md` → FTEST-008 | `integration/test_FTEST-008_db_timeout_no_partial_write.py` | REQ-NF-003 |
| `02-functional/end-to-end-tests.md` → ETEST-003 | `end-to-end/test_ETEST-003_create_task_flow.py` | REQ-F-001 |

## Run commands

```
Unit only:        pytest 03-tests/05-executable/unit -q
Integration:      pytest 03-tests/05-executable/integration -q
End-to-end:       pytest 03-tests/05-executable/end-to-end -q
Full gate:        pytest 03-tests/05-executable -q
One requirement:  pytest 03-tests/05-executable -k "UTEST-005 or TEST-006"
```

> Naming files after the **test ID and requirement** is what makes a CI failure readable:
> `test_STEST-002_viewer_cannot_patch_task` points straight at the RBAC table row that
> broke, not at an anonymous line number.
