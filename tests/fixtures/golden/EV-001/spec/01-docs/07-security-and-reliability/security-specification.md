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
| Account access | [TODO: which authentication model? — Q-009] |
| Session lifetime | [TODO: which authentication model? — Q-009] |
| Password handling | Plain-text passwords must never be stored or logged — applies if password authentication is chosen (Q-009). |
| Account recovery | [TODO: which authentication model? — Q-009] |
| Logout | [TODO: which authentication model? — Q-009] |
| Multi-factor (if any) | [TODO: which authentication model? — Q-009] |

| ID | Authentication requirement | Acceptance criteria |
|---|---|---|
| SEC-A-001 | The account holder must be signed in before any recipe, plan, list, or photo is readable or writable. | A signed-out request to any data route returns 401 and the sign-in prompt. |
| SEC-A-002 | [TODO: which authentication model? — Q-009] — session expiry and sign-out behaviour follow the chosen model. | To be written with the answer to Q-009. |

---

## 2. Authorization / RBAC (*what are you allowed to do?*)

A user may be authenticated and still not allowed to perform an action.

### Role permission matrix

Pantry has **one role** — the account holder — so the matrix is one column, and the real
rule is owner-only scoping.

| Action | Account holder |
|---|---|
| Save, edit, and search their own recipes | Yes |
| Plan their week | Yes |
| Generate and view their shopping lists | Yes |
| Upload and view their own dish photos | Yes |
| Reach any other account's recipes, plans, lists, or photos | **No — under any route, ever** |

> A role table gives the agent a precise boundary. It does not need to guess whether a
> Member can invite users — the table already says no.

**Defensive authorization pattern (Ch. 21 §21.3)** — specify the *order* of the checks, not
the code that runs them. For every protected action, write three rules in this order: deny
when there is no signed-in user; deny when the resource belongs to a tenant the user is not
in; allow only when the user's role appears on an explicit allow-list. Each rule is one deny
test before any code exists, and the allow-list is a decision you make here rather than one
the agent infers. For Pantry: deny with no session; deny when the resource's account is not
the caller's; allow the owner — the allow-list is one role long.

| ID | Authorization requirement | Acceptance criteria |
|---|---|---|
| SEC-Z-001 | Every read and write is scoped to the calling account; another account's resource is answered with the safe not-found. | A guessed ID from another account returns 404 without confirming the resource exists; no data crosses accounts in any response. |
| SEC-Z-002 | A dish photo is readable only by the account that owns it; photo URLs are never public and never guessable into another account's photo. | A signed-out photo request returns 401; another account's photo request returns the safe 404. |

---

## 3. Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

| Input | Validation rule | Error behavior |
|---|---|---|
| Recipe title | Required; trimmed before saving. | Clear message naming the field. |
| Ingredient line name | Required per line; a recipe needs at least one line. | Validation error without saving. |
| Plan, list, and photo identifiers | Required; must belong to a resource the caller owns. | Safe not-found or access-denied response. |
| Photo upload | Images only, verified by content inspection — [TODO: what are the photo storage rules — where stored, maximum size, allowed image types, malware scanning, retention, and which entity a photo attaches to? — Q-023] | Rejected without saving; the reason named safely. |

---

## 4. Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | Do not collect personal data not needed for the feature. |
| Storage | How should data be stored? | Sensitive account data must use approved storage mechanisms. |
| Transport | How does data move? | Private user data only through protected channels. |
| Logging | What must **not** be logged? | [TODO: what must never leak or be logged? — Q-012] |
| Retention | How long is data kept? | [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013] |

---

## 5. Secrets management

Secrets are values that allow access to protected systems: API keys, database passwords,
signing keys, private tokens.

- Never hardcode a secret into source code, templates, screenshots, logs, or examples.
- Use placeholders in documentation → [`../.env.example`](../../.)
- Document where each real value is configured → [`../ops/environment-config.md`](../../07-ops/01-deployment/environment-config.md)

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| [TODO: which authentication model? — Q-009] — the model decides which signing or session secret exists | environment variable | source, logs, error messages, client responses | — |

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

The sensitive feature this round decided, filled:

```
Feature:        Private dish photos
Requirement ID: SEC-Z-002

Authentication:  The account holder must be signed in.
Authorization:   Owner only — photos are private to one account (Round 6).
Role assignment: n/a — a single role exists.
Validation:      Images only, verified by content inspection; size and type
                 allow-list open (Q-023).
Data protection: Photo content and storage paths never appear in logs; URLs are
                 never public.
Secure errors:   Signed-out requests get 401; another account's photo gets the
                 safe 404.
Testing:         owner can view; other account denied; signed-out denied;
                 non-image upload rejected.

Acceptance criteria:
1. A signed-out user cannot retrieve any photo.
2. An account holder cannot retrieve another account's photo by any route.
3. A non-image upload is rejected without being stored.
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

Full review pass → [`../review/security-review.md`](../../05-review/02-checklists/security-review.md)

> Blueprint: blueprints/01-docs/07-security-and-reliability/security-specification.md
