# Security Review Checklist

> Source: Appendix M + Ch. 21 §21.8.
> Use this **before accepting AI-generated code** that handles users, data, files, APIs,
> payments, or administrative actions — and again before deployment.

**Feature / module:**
**Reviewer:**
**Date:**
**Related requirements:** SEC-###

---

## Authentication

- [ ] Protected actions require authentication.
- [ ] Session or token handling is defined.
- [ ] Expired or invalid credentials are handled safely.
- [ ] Authentication errors do not reveal sensitive information.
- [ ] Password reset flows expire and do not confirm whether an account exists.
- [ ] Logout ends the session server-side, not only client-side.

## Authorization and access control

- [ ] Each protected action checks the user's role or ownership.
- [ ] Users cannot access another user's data by changing IDs.
- [ ] Admin actions are separated from normal user actions.
- [ ] **Default access is deny unless explicitly allowed.**
- [ ] Authorization is enforced on the **server**, not just hidden in the UI.
- [ ] Tenant/project isolation is applied to every query.

## Validation, data, and secrets

- [ ] All user input is validated at the boundary.
- [ ] Backend validation exists even where the frontend already validates.
- [ ] Sensitive fields are protected in storage and logs.
- [ ] Secrets are not hardcoded or printed.
- [ ] No secrets appear in source, examples, screenshots, or error messages.
- [ ] Errors are safe for users and useful for internal logs.
- [ ] Security tests cover **abuse cases**, not only happy paths.

## Spec-level checks (Ch. 21 §21.8)

- [ ] Every protected feature has an authentication requirement.
- [ ] Every sensitive action has an authorization rule.
- [ ] Role permissions are documented in a table.
- [ ] User input rules are specific and testable.
- [ ] Sensitive data is not logged or returned unnecessarily.
- [ ] Security requirements are linked to tests.
- [ ] The AI agent has clear instructions not to add unapproved access paths.

---

## Findings

| # | Severity | Area | Risk | Evidence | Recommended fix | Status |
|---|---|---|---|---|---|---|
| 1 | Critical / High / Medium / Low | | | | | Open |

**Severity guide (Ch. 24 §24.4)**

| Condition | Severity | Response |
|---|---|---|
| Unauthorized user reaches a restricted endpoint. | **Critical** | Review authorization rule and security logs immediately. |
| A valid user cannot authenticate. | **High** | Investigate immediately; protect account access. |
| Sensitive value appears in a log. | **High** | Purge, rotate the secret, fix the log call. |
| External API call fails repeatedly. | Medium | Apply fallback or degrade gracefully. |

---

## Decision

- [ ] **Pass** — no security blockers.
- [ ] **Pass with follow-up** — issues logged, none blocking.
- [ ] **Block release** — must be fixed before merge/deploy.

---

## Prompt — security review (Ch. 20 §20.4)

```
Inspect this module for authentication, authorization, validation, secrets exposure, and
unsafe error handling. Do not rewrite the code yet. Return a table of risks, severity, and
suggested fixes.
```

## Prompt — feature security review (Appendix J)

```
Review this feature for authentication, authorization, input validation, data protection,
secrets exposure, and secure error handling.
```

---

# WORKED EXAMPLE — ProjectBoard v1.0 pre-release

**Feature / module:** Auth + task API · **Reviewer:** Tech lead · **Date:** 2026-04-01
**Related requirements:** SEC-A-001…004, SEC-Z-001…002, SEC-INVITE-001

## Authentication

- [x] Protected actions require authentication.
- [x] Session or token handling is defined (SEC-A-002, 30 min idle).
- [x] Expired or invalid credentials are handled safely (FTEST-007).
- [x] Authentication errors do not reveal sensitive information (STEST-006).
- [x] Password reset links expire and do not confirm whether an account exists.
- [x] Logout ends the session server-side.

## Authorization and access control

- [x] Each protected action checks the user's role or ownership.
- [x] Users cannot access another user's data by changing IDs (STEST-001, STEST-007).
- [x] Admin actions are separated from normal user actions.
- [x] Default access is deny unless explicitly allowed.
- [ ] **Authorization is enforced on the server, not just hidden in the UI.** ← **FAILED**
- [x] Tenant/project isolation is applied to every query.

## Validation, data, and secrets

- [x] All user input is validated at the boundary.
- [x] Backend validation exists even where the frontend validates.
- [x] Sensitive fields protected in storage and logs.
- [x] Secrets are not hardcoded or printed.
- [x] No secrets in source, examples, screenshots, or error messages.
- [x] Errors are safe for users and useful in logs.
- [x] Security tests cover abuse cases, not only happy paths.

## Findings

| # | Severity | Area | Risk | Evidence | Recommended fix | Status |
|---|---|---|---|---|---|---|
| 1 | **Critical** | Authorization | A Viewer can change any task's status via the API. | `PATCH /api/v1/tasks/task_501` as a Viewer returns **200**; row updated. | Add the role check to `update_task_status()`; add STEST-002 as a regression test. | Fixed 2026-04-01 |
| 2 | High | Information leakage | 404 body for another user's task said "Task not found in project PROJ-42", confirming the project exists. | Manual probe with a guessed ID. | Return a generic 404 with no identifiers. | Fixed (BUG-001) |
| 3 | Medium | Logging | Invite emails were written to the info log in full. | `grep` of the log sample. | Log `user_id` only, never the address. | Fixed |
| 4 | Low | Secrets | `.env` was not in `.gitignore` in the first commit. | Git history. | Added; key rotated as a precaution. | Fixed |

## Decision

- [x] **Block release** — finding 1 must be fixed before deploy.

Re-review 2026-04-01 17:20 → finding 1 fixed and covered by STEST-002 → **Pass**.

> **The lesson:** the UI hid the edit button for Viewers, so every manual test passed and
> the feature looked correct for three weeks. Hiding a control is not authorization.
