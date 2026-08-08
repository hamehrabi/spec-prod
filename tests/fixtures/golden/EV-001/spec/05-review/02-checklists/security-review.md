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
**Related requirements:**

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

For Pantry the recurring review targets are SEC-A-001 (sign-in before any data),
SEC-Z-001 (account scoping on every query), and SEC-Z-002 (owner-only photos) — plus
SEC-A-002 once Q-009 chooses the authentication model.

---

## Findings

| # | Severity | Area | Risk | Evidence | Recommended fix | Status |
|---|---|---|---|---|---|---|

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
