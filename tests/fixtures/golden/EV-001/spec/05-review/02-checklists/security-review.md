# Security Review Checklist

> Source: Appendix M + Ch. 21 §21.8.
> Use this **before accepting AI-generated code** that handles users, data, files, APIs,
> payments, or administrative actions — and again before deployment.

> Copy this file to `security-review-<feature>.md` and fill it in, once per review. **The
> header fields below stay blank in this copy** — a review that has not happened has no
> reviewer and no date, and writing a plausible one is worse than leaving it empty.

**Feature / module:**
**Reviewer:**
**Date:**
**Related requirements:** SEC-A-001…004, SEC-Z-001…002

---

## Authentication

- [ ] Protected actions require authentication (SEC-A-001).
- [ ] Session or token handling is defined (SEC-A-004 — session ends).
- [ ] Expired or invalid credentials are handled safely.
- [ ] Authentication errors do not reveal sensitive information.
- [ ] Password reset flows expire and do not confirm whether an account exists (SEC-A-003).
- [ ] Logout ends the session server-side, not only client-side (SEC-A-004).

## Authorization and access control

- [ ] Each protected action checks the user's role or ownership (SEC-Z-001).
- [ ] Users cannot access another user's data by changing IDs — cross-account access returns a safe not-found (SEC-Z-001).
- [ ] Admin actions are separated from normal user actions (single owner role, REQ-R-001).
- [ ] **Default access is deny unless explicitly allowed.**
- [ ] Authorization is enforced on the **server**, not just hidden in the UI.
- [ ] Account isolation is applied to every query; private recipe photos are access-controlled (SEC-Z-002).

## Validation, data, and secrets

- [ ] All user input is validated at the boundary.
- [ ] Backend validation exists even where the frontend already validates.
- [ ] Sensitive fields are protected in storage and logs.
- [ ] Secrets are not hardcoded or printed.
- [ ] No secrets appear in source, examples, screenshots, or error messages.
- [ ] Passwords are hashed and never logged (SEC-A-002).
- [ ] Errors are safe for users and useful for internal logs.
- [ ] Security tests cover **abuse cases**, not only happy paths (STEST-001…005 deny tests).

## Spec-level checks (Ch. 21 §21.8)

- [ ] Every protected feature has an authentication requirement (SEC-A-001).
- [ ] Every sensitive action has an authorization rule (SEC-Z-001).
- [ ] Role permissions are documented in a table (single owner role, REQ-R-001).
- [ ] User input rules are specific and testable.
- [ ] Sensitive data is not logged or returned unnecessarily (SEC-A-002, SEC-Z-002).
- [ ] Security requirements are linked to tests (STEST-001…005).
- [ ] The AI agent has clear instructions not to add unapproved access paths.

---

## Findings

| # | Severity | Area | Risk | Evidence | Recommended fix | Status |
|---|---|---|---|---|---|---|

No entries yet — the first finding of a review adds the first row.

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

> Blueprint: blueprints/05-review/02-checklists/security-review.md
