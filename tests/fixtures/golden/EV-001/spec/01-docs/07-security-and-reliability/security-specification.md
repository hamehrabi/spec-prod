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
| Account access | [TODO: how does a user sign in? — auth model — Q-006] |
| Session lifetime | [TODO: how long does access last, and when does it expire? — Q-006] |
| Password handling | If passwords are used, plain-text passwords must never be stored or logged — store only a hash. |
| Account recovery | Reset links must expire and must not reveal whether an account exists. |
| Logout | Ends the session. |
| Multi-factor (if any) | Not in version one. |

| ID | Authentication requirement | Acceptance criteria |
|---|---|---|
| SEC-A-001 | A user must be signed in before accessing any recipe, plan, list, or photo. | A signed-out request to any protected route returns 401 and the sign-in prompt. |
| SEC-A-002 | Plain-text passwords are never stored or logged. | Storage holds only `password_hash`; no log line contains a password field. |

---

## 2. Authorization / RBAC (*what are you allowed to do?*)

A user may be authenticated and still not allowed to perform an action. Pantry is
single-user — one role, the account owner.

### Role permission matrix

| Action | Account owner |
|---|---|
| Save / search recipes | Yes |
| Plan a week | Yes |
| Generate / view a shopping list | Yes |
| Upload / view a dish photo | Yes — own only |
| Access another account's data | No — always denied |

> A role table gives the agent a precise boundary. It does not need to guess whether a
> Member can invite users — the table already says no.

**Defensive authorization pattern (Ch. 21 §21.3)** — per protected action, in order: deny when
there is no signed-in user; deny when the resource belongs to another account (return the safe
404); allow only the account owner. Each rule is one deny test before any code exists.

| ID | Authorization requirement | Acceptance criteria |
|---|---|---|
| SEC-Z-001 | Every read and write is scoped to the signed-in account. | A request for another account's recipe/plan/list/photo returns the safe 404 and writes nothing. |

---

## 3. Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

| Input | Validation rule | Error behavior |
|---|---|---|
| Recipe title | Required; 1–200 characters; trimmed before saving. | Clear message naming the field. |
| Ingredient lines | At least one required; each has text. | Validation error without saving. |
| Week start | Required; must be a valid date. | Validation error without saving. |

---

## 4. Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | Collect only the account email and the cook's own recipes, plans, lists, and dish photos. |
| Storage | How should data be stored? | Passwords hashed; dish photos in private storage, never a public bucket. |
| Transport | How does data move? | Private user data only through protected channels. |
| Logging | What must **not** be logged? | Never log passwords, tokens, reset links, or full secret values. [TODO: the project-specific list of what must never leak or be logged — Q-014] |
| Retention | How long is data kept? | Follow the retention rule in `../06-api-and-data-design/database-design.md` §7. |

---

## 5. Secrets management

Secrets are values that allow access to protected systems: API keys, database passwords,
signing keys, private tokens.

- Never hardcode a secret into source code, templates, screenshots, logs, or examples.
- Use placeholders in documentation → [`../.env.example`](../../.)
- Document where each real value is configured → [`../ops/environment-config.md`](../../07-ops/01-deployment/environment-config.md)

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| [TODO: which secrets are needed depends on the auth model — Q-006] | environment variable | source, logs, error messages, client responses | `config.*` |
| `DATABASE_URL` (when on Postgres) | environment variable | source, logs, screenshots | `config.database_url` |

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

Copy per sensitive feature.

```
Feature:        [name]
Requirement ID: SEC-###

Authentication:  [who must be signed in]
Authorization:   [which roles may perform this]
Role assignment: [what roles can be granted, by whom]
Validation:      [required fields, formats, duplicate rules]
Data protection: [what must not be exposed or logged]
Secure errors:   [what unauthorized users receive]
Testing:         [allowed actor, disallowed actor, invalid input, duplicate, safe error]

Acceptance criteria:
1.
2.
3.
```

A filled version of this block is in the worked example at the end of this file.

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

Full review pass → [`../review/security-review.md`](../../05-review/02-checklists/security-review.md)

---

> Blueprint: blueprints/01-docs/07-security-and-reliability/security-specification.md
