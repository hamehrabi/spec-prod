# Security Test Plan

> Source: Ch. 17 §17.5, Ch. 21, Ch. 27 §27.8.
> Security tests are **especially important** with AI-generated software, because an agent
> may implement the happy path and forget the denial path.

For every important feature ask:
1. Who is **allowed** to do this?
2. Who is **not allowed** to do this?
3. What input must be **rejected**?
4. What information must **never** be exposed?

---

| Test ID | Requirement | Risk | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| STEST-001 | SEC-### | Unauthorized access | A user requests another user's resource by changing the ID. | Access denied; no data returned. | Planned |
| STEST-002 | | Weak authorization | A normal user attempts an admin-only action. | Rejected with a safe message. | |
| STEST-003 | | Broken validation | Request contains unexpected fields or dangerous input. | Rejected before storage. | |
| STEST-004 | | Information leakage | Trigger a server error. | No stack trace, path, token, or private data in the response. | |
| STEST-005 | | Unauthenticated access | Open a protected route without signing in. | Redirect or 401. | |
| STEST-006 | | Account enumeration | Log in with an unregistered email. | Same generic message as a wrong password. | |
| STEST-007 | | Tenant/project isolation | User in tenant A requests tenant B data. | No cross-tenant content returned. | |

---

## Security risk → test question (Ch. 17 §17.5)

| Security risk | Test planning question |
|---|---|
| Unauthorized access | What happens when a user tries to access data they do not own? |
| Broken validation | What happens when the request contains unexpected fields or dangerous input? |
| Information leakage | Does an error message reveal private data or system details? |
| Weak authorization | Can a normal user perform an admin-only action? |

---

## Per-role negative matrix

For each protected action, add one test per role that **must not** be able to perform it.

| Action | Owner | Admin | Member | Viewer | Signed out |
|---|---|---|---|---|---|
| | allow | allow | **deny → STEST-###** | **deny → STEST-###** | **deny → STEST-###** |

> **Default access is deny unless explicitly allowed** (Appendix M).

---

## Rules

- Security tests must include **negative cases**, not only happy paths.
- Every rule in [`../docs/security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md)
  needs at least one test.
- Hiding a control in the UI is not a passing security test — assert the **server**
  rejects the request.

Full review pass → [`../review/security-review.md`](../../05-review/02-checklists/security-review.md)

---

# WORKED EXAMPLE — ProjectBoard

| Test ID | Requirement | Risk | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| STEST-001 | SEC-Z-001 | Unauthorized access | Member requests a task ID from a project they do not belong to | 404 safe message; no task data returned | Passing |
| STEST-002 | REQ-R-002 | Weak authorization | Viewer calls `PATCH /api/v1/tasks/{id}` directly | 403; task unchanged | **Failing — BUG-003** |
| STEST-003 | SEC-V-001 | Broken validation | Request body contains `{"role": "owner"}` alongside task fields | Extra field ignored; role unchanged | Passing |
| STEST-004 | SEC-E-001 | Information leakage | Force a database error | Generic 500; no stack trace, path, or SQL in the response | Passing |
| STEST-005 | SEC-A-001 | Unauthenticated access | Open `/projects` with no session | 401 / redirect to login | Passing |
| STEST-006 | SEC-A-004 | Account enumeration | Log in with an unregistered email | **Identical** message and timing to a wrong password | Passing |
| STEST-007 | SEC-Z-002 | Project isolation | User A lists tasks with User B's `project_id` | Empty or 404; never B's rows | Passing |
| STEST-008 | SEC-INVITE-001 | Privilege escalation | Member calls the invite endpoint | 403; no invitation created; no token in logs | Passing |

## Per-role negative matrix — `PATCH /api/v1/tasks/{id}`

| Actor | Expected | Test |
|---|---|---|
| Owner | allow | TEST-007 |
| Admin | allow | TEST-007 |
| Member (own task) | allow | TEST-007 |
| Member (another member's task) | **deny 403** | STEST-009 |
| Viewer | **deny 403** | STEST-002 |
| Signed out | **deny 401** | STEST-005 |

## BUG-003 — the test that mattered

```
Scenario:  Viewer sends PATCH /api/v1/tasks/task_501 with {"status": "done"}
Expected:  403, task unchanged
Actual:    200, task status changed to "done"

Why it was missed:  The UI hides the edit control for Viewers, so every manual check
                    passed. The authorization rule existed in the RBAC table but was
                    never implemented in the service layer.
Root cause:         The endpoint checked project membership but not role.
Fix:                Add the role check to update_task_status(); add STEST-002 as a
                    regression test.
```

> **The lesson from Ch. 17 §17.5:** an agent will implement the happy path and forget the
> denial path. Every allow rule in the RBAC table needs a matching **deny** test.
