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
| ETEST-001 | REQ-### | Login | A valid user can sign in and reach the dashboard. | | Planned |
| ETEST-002 | | Create project | A user can create a project and see it in the project list. | | |
| ETEST-003 | | Create task | A user can add a task to a project and see it immediately. | | |
| ETEST-004 | | Permission boundary | A user cannot open another user's private project. | | |

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

## UI test inputs (Ch. 18 §18.7)

Describe the **screen**, the **user action**, and the **visible result**. This prevents the
agent from writing tests that depend on imaginary buttons, labels, or flows.

| UI test input | Example |
|---|---|
| Screen | Login page |
| User action | Enter valid email and password, then click Sign in. |
| Expected visible result | Dashboard opens and the user name is visible. |
| Failure path | Enter wrong password. |
| Expected error result | Error message appears; password field is cleared; user stays on the login page. |

---

## Production smoke test (Ch. 28 §28.12)

The same flows, run against the deployed system after release.

1. Sign in as a test user.
2. Create the primary entity.
3. Add a child record.
4. Perform the core action.
5. Trigger the main failure path and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

→ [`../ops/production-readiness-checklist.md`](../../07-ops/01-deployment/production-readiness-checklist.md)

Executable tests live in [`../tests/end-to-end/`](../05-executable/end-to-end).

---

# WORKED EXAMPLE — ProjectBoard

| Test ID | Requirement | User flow | Goal | Expected result | Status |
|---|---|---|---|---|---|
| ETEST-001 | REQ-AUTH-001 | Login | A valid user signs in and reaches the project list | Project list visible; user name in the header | Passing |
| ETEST-002 | REQ-F-003 | Create project | A user creates a project and sees it listed | Project appears immediately | Passing |
| ETEST-003 | REQ-F-001 | Create task | A user adds a task and sees it in the list | Task appears at the top with status `todo` | Passing |
| ETEST-004 | REQ-R-002 | Permission boundary | A user cannot open another user's project by URL | Redirected; safe message; no data leaked | Passing |
| ETEST-005 | REQ-NF-003 | Error recovery | The form keeps typed values after a server error | Title and description still on screen | Passing |

## Written out

```
Test ID:      ETEST-003
Requirement:  REQ-F-001
Flow name:    Create a task

Preconditions: signed in as a Member of project "Client Onboarding"; project has 0 tasks

Steps:
1. Open the project "Client Onboarding".
2. Click "Add task".
3. Enter title "Prepare launch checklist", assignee "Ada", due date = tomorrow.
4. Click Save.

Expected visible result:
  - Form closes
  - The task appears at the top of the list with a "todo" badge
  - The empty-state message is gone

Failure path tested:
  Repeat steps 2-4 with an empty title.

Expected error result:
  - Inline message under the title field
  - The description and due date the user typed are STILL on screen
  - No new row appears in the list

Evidence to capture: screenshot of the list, 201 response, database row count 0 -> 1
Status: Passing
```

## Production smoke test — run after every deploy

1. Sign in as the smoke-test user. ✅
2. Create project "Smoke YYYY-MM-DD". ✅
3. Add a task to it. ✅
4. Move the task to `done`. ✅
5. Submit a task with an empty title → confirm the safe message. ✅
6. Confirm `TASK_CREATED` and `AUTH_LOGIN_SUCCESS` appear in the logs with a request ID. ✅
7. Confirm the error dashboard shows no new critical errors in the release window. ✅

> Which flows earned an E2E test: **login, create project, create task, permission
> boundary.** A user would complain loudly if any of these broke. Title length validation
> did not earn one — that is a unit test.
