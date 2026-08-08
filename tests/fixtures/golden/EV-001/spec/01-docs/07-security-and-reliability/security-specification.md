# Security Specification

> Source: Ch. 21 — Security-First Spec-Driven Engineering.
> **Beginner rule:** do not write "make it secure" as a requirement. Write the exact
> security behavior you expect. A clear rule can be reviewed, tested, and implemented.
> A vague security wish cannot.

**You decide the security policy in the specification. The agent does not.**

---

## 1. Authentication (*who are you?*)

| Area | Requirement |
|---|---|
| Account access | A home cook signs in to their own private account before any recipe, plan, list, or photo is read or written. The exact model (built-in sessions vs. an adopted provider) is deferred at express depth (`Q-009`). |
| Session lifetime | Access lasts for a signed-in session and ends on logout or expiry; the concrete lifetime is set with the auth model (`Q-009`). |
| Password handling | Plain-text passwords must never be stored or logged; storage holds only a hash. |
| Account recovery | Reset links must expire and must not reveal whether an account exists. |
| Logout | Ends the session and the account's access. |
| Multi-factor (if any) | None in version one. |

| ID | Authentication requirement | Acceptance criteria |
|---|---|---|
| SEC-A-001 | A home cook must be signed in before any recipe, plan, list, or photo is read or written. | A signed-out request to any data route returns 401 and the sign-in prompt (`REQ-F-005`, `REQ-NF-002`). |
| SEC-A-002 | Plain-text passwords are never stored or logged; only a hash is stored. | Storage holds only the password hash; no log line contains a password field. |
| SEC-A-003 | Password reset links expire and never reveal whether an account exists. | An unknown email returns the same message as a known email; an expired link is rejected. |
| SEC-A-004 | Signing out, or session expiry, ends the session and its access. | After logout, a request to a protected route returns 401; the lifetime is set with `Q-009`. |

> The concrete authentication mechanism is deferred (`Q-009`); these controls hold whichever
> model is chosen, and the session lifetime in SEC-A-004 is set when it is.

---

## 2. Authorization / RBAC (*what are you allowed to do?*)

Version one has **one role and no sharing** (`REQ-R-001`), so the matrix is one column.

### Role permission matrix

| Action | Home cook (owner) |
|---|---|
| Save / edit / delete own recipe | Yes (own data only) |
| Search own recipes | Yes |
| Plan a week / edit the plan | Yes (own data only) |
| Generate a shopping list from a week | Yes (own data only) |
| Tick off list items | Yes |
| Upload / view own recipe photo | Yes (own data only) |
| Reach another account's data | No — there is no other account, and nothing is shared |

> A role table gives the agent a precise boundary. It does not need to guess whether one
> account can read another's recipes — the table already says no.

**Defensive authorization pattern (Ch. 21 §21.3)** — specify the *order* of the checks, not
the code that runs them. For every protected action, in this order: deny when there is no
signed-in account; deny when the resource belongs to another account; allow only when the
signed-in account owns it. Each rule is one deny test before any code exists.

| Order | Check | Denied when | Test |
|---|---|---|---|
| 1 | Signed in | No session | A signed-out request returns 401 (SEC-A-001). |
| 2 | Owns the resource | The recipe, week, list, or photo belongs to another account | A request for another account's data returns a safe not-found (SEC-Z-001). |
| 3 | Allowed action | Single role — every owner action is allowed on their own data | The owner can perform the action on their own data. |

| ID | Authorization requirement | Acceptance criteria |
|---|---|---|
| SEC-Z-001 | Every read and write is scoped to the signed-in account; a request for another account's recipe, plan, list, or photo is denied with a safe not-found (BR-002, `REQ-NF-002`, `REQ-R-001`). | A request for a week the account does not own returns a safe not-found, not a detailed reason; the deny tests in Round 7 cite SEC-Z-001. |
| SEC-Z-002 | A recipe photo is private to the owning account and served only to that account (`Q-008`, `REQ-NF-007`). | An unauthenticated or other-account request for a photo is denied; a photo reference cannot be resolved into another account's file. |

---

## 3. Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

| Input | Validation rule | Error behavior |
|---|---|---|
| Recipe title | Required; 1–120 characters; trimmed before saving. | Clear message naming the field; typed values kept. |
| Ingredient line | Required text on each line; a recipe needs at least one. | Validation error without saving. |
| Planned meal → recipe | Required; must reference a saved recipe owned by the same account (BR-003). | Safe not-found or access-denied response. |
| Recipe photo (upload) | Optional; must be an image within the configured size limit; stored privately. | Reject oversize or non-image files with a clear message. |

---

## 4. Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | Collect only what a recipe, plan, or list needs; no personal data beyond the one account. |
| Storage | How should data be stored? | Account credentials via approved storage (a hash, never plain text); photos in private file storage scoped by account. |
| Transport | How does data move? | Private user data only through protected channels. |
| Logging | What must **not** be logged? | Never log passwords, tokens, reset links, full secret values, recipe or plan content, or photos (`REQ-NF-007`); the full leak list is `Q-012`. |
| Retention | How long is data kept? | Follow the retention rule in [`../06-api-and-data-design/database-design.md`](../06-api-and-data-design/database-design.md) §7. |

---

## 5. Secrets management

Secrets are values that allow access to protected systems: signing keys, database
credentials, private tokens.

- Never hardcode a secret into source code, templates, screenshots, logs, or examples.
- Use placeholders in documentation → [`../../.env.example`](../../.env.example)
- Document where each real value is configured → [`../../07-ops/01-deployment/environment-config.md`](../../07-ops/01-deployment/environment-config.md)

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| Session / auth signing value (once the model is chosen, `Q-009`) | environment variable | source, logs, error messages, client responses | `config.auth_signing_key` |
| Database location / credential (once deployed, `Q-017`) | environment variable | source, logs, client responses | `config.database_url` |

---

## 6. Secure error handling

Error handling has two responsibilities: help the user recover, and protect the system
from exposing internal details.

| Problem | Unsafe response | Safer response |
|---|---|---|
| Login failed | Detailed account or password reason. | "The email or password is incorrect." |
| Access denied | Internal permission rule details. | "You do not have permission to perform this action." |
| Server failure | Stack trace or database error. | "Something went wrong. Please try again later." |
| Validation failure | Raw parser or framework error. | "The submitted value does not match the required format." |

---

## 7. Feature security specification

Filled here for the core feature; copy the block per additional sensitive feature.

```
Feature:        Generate the week's shopping list
Requirement ID: SEC-Z-001 (defined in §2 above)

Authentication:  the home cook must be signed in (SEC-A-001)
Authorization:   the week and its recipes must belong to the signed-in account (SEC-Z-001)
Role assignment: single role; no roles to grant (REQ-R-001)
Validation:      the week must exist and be owned by the account
Data protection: the list and its recipes are never exposed to another account (BR-002)
Secure errors:   an unowned or missing week returns a safe not-found, not a detailed reason
Testing:         owner can generate; a request for another account's week is denied; an empty
                 week yields an empty list with a message, not an error (AC-003)

Acceptance criteria:
1. A signed-out request cannot generate a list.
2. A request for a week the account does not own returns a safe not-found.
3. An empty week yields an empty list with a clear message, not an error.
```

---

## Security review checklist (Ch. 21 §21.8)

- [ ] Every protected feature has an authentication requirement.
- [ ] Every sensitive action has an authorization rule.
- [ ] Role permissions are documented in a table.
- [ ] User input rules are specific and testable.
- [ ] Backend validation is required, not only frontend validation.
- [ ] Sensitive data is not logged or returned unnecessarily.
- [ ] Secrets are not stored in source code or examples.
- [ ] Error messages are safe for users and useful enough for recovery.
- [ ] Security requirements are linked to tests.
- [ ] The AI agent has clear instructions not to add unapproved access paths.

Full review pass → [`../../05-review/02-checklists/security-review.md`](../../05-review/02-checklists/security-review.md)

---

> Blueprint: blueprints/01-docs/07-security-and-reliability/security-specification.md
