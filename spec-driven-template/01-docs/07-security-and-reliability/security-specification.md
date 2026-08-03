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
| Account access | *How does a user sign in?* |
| Session lifetime | *How long should access last? When does it expire?* |
| Password handling | *Plain-text passwords must never be stored or logged.* |
| Account recovery | *Reset links must expire and must not reveal whether an account exists.* |
| Logout | *How does access end?* |
| Multi-factor (if any) | |

| ID | Authentication requirement | Acceptance criteria |
|---|---|---|
| SEC-A-001 | | |
| SEC-A-002 | | |

---

## 2. Authorization / RBAC (*what are you allowed to do?*)

A user may be authenticated and still not allowed to perform an action.

### Role permission matrix

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Create project | Yes | Yes | No | No |
| Create task | Yes | Yes | Yes | No |
| Edit any task | Yes | Yes | No | No |
| Edit own task | Yes | Yes | Yes | No |
| Invite users | Yes | Yes | No | No |
| View billing | Yes | No | No | No |
| Export data | | | | |
| Manage access | | | | |

*Replace with your project's real actions and roles.*

> A role table gives the agent a precise boundary. It does not need to guess whether a
> Member can invite users — the table already says no.

**Defensive authorization pattern (Ch. 21 §21.3)**
```python
ALLOWED_TO_CREATE_TASK = {"owner", "admin", "member"}

def can_create_task(user, project):
    if user is None:
        return False
    if user.project_id != project.id:
        return False
    return user.role in ALLOWED_TO_CREATE_TASK
```

| ID | Authorization requirement | Acceptance criteria |
|---|---|---|
| SEC-Z-001 | | |

---

## 3. Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

| Input | Validation rule | Error behavior |
|---|---|---|
| | Required; 3–120 characters; trimmed before saving. | Clear message naming the field. |
| | Optional; when provided must be a valid future date. | Validation error without saving. |
| | Required; must belong to a resource the user can access. | Safe not-found or access-denied response. |

---

## 4. Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | Do not collect personal data not needed for the feature. |
| Storage | How should data be stored? | Sensitive account data must use approved storage mechanisms. |
| Transport | How does data move? | Private user data only through protected channels. |
| Logging | What must **not** be logged? | Never log passwords, tokens, reset links, or full secret values. |
| Retention | How long is data kept? | Follow the retention rule in the product specification. |

---

## 5. Secrets management

Secrets are values that allow access to protected systems: API keys, database passwords,
signing keys, private tokens.

- Never hardcode a secret into source code, templates, screenshots, logs, or examples.
- Use placeholders in documentation → [`../.env.example`](../../.)
- Document where each real value is configured → [`../ops/environment-config.md`](../../07-ops/01-deployment/environment-config.md)

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| `JWT_SIGNING_KEY` | environment variable | source, logs, error messages, client responses | `config.jwt_signing_key` |
| | | | |

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

**Worked example (Ch. 21 §21.9)**
```
Feature: Invite team member to project
Requirement ID: SEC-INVITE-001
Only authenticated project Owners and Admins can invite a new team member.

Acceptance criteria:
1. A signed-out user cannot send an invitation.
2. A Viewer cannot send an invitation.
3. A Member cannot send an invitation.
4. An Owner or Admin can invite a user with a valid email address.
5. The system does not expose invitation tokens in logs or error messages.
6. Unauthorized requests return a safe access-denied response.
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

---

## Prompts

**Derive authentication rules (Ch. 21 §21.2)**
```
Using the product requirements below, identify every place where the system must verify
user identity. Convert each identity requirement into a clear authentication rule,
acceptance criterion, and test idea. Do not invent extra features.
```

**Find the secrets (Ch. 21 §21.6)**
```
Review this specification and identify every value that should be treated as a secret.
For each one, state where it should be configured, where it must not appear, and how the
code should refer to it without exposing it.
```

**Tests before implementation (Ch. 21 §21.9)**
```
Using the security specification above, create only the tests for [feature].
Do not implement the feature yet. Include tests for authentication, authorization,
validation, duplicates, and safe error responses.
```

---

# WORKED EXAMPLE — ProjectBoard

## Authentication

| ID | Requirement | Acceptance criteria |
|---|---|---|
| SEC-A-001 | A user must sign in with a verified email and password before accessing any project data. | Signed-out request to a project route returns 401 and the login prompt. |
| SEC-A-002 | A session expires after 30 minutes of inactivity. | A request with a 31-minute-idle token returns 401; the user is redirected to login. |
| SEC-A-003 | Plain-text passwords are never stored or logged. | Storage holds only `password_hash`; no log line contains a password field. |
| SEC-A-004 | Password reset links expire after 60 minutes and never reveal whether an account exists. | Unknown email returns the same message as a known email. |

## Authorization — RBAC matrix

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Create project | Yes | Yes | No | No |
| Delete project | Yes | No | No | No |
| Create task | Yes | Yes | Yes | No |
| Edit any task | Yes | Yes | No | No |
| Edit own task | Yes | Yes | Yes | No |
| Update task status | Yes | Yes | Yes (own) | No |
| Invite users | Yes | Yes | No | No |
| Export CSV | Yes | Yes | No | No |

## Input validation

| Input | Validation rule | Error behavior |
|---|---|---|
| Task title | Required; 3–120 characters; trimmed before saving. | 400 — "Task title must be between 3 and 120 characters." |
| Due date | Optional; if present must not be earlier than today (BR-003). | 400 — task is not saved. |
| Project ID | Required; must belong to a project the user can access. | 404 safe message — does not confirm the project exists. |
| Assignee ID | Optional; must be a member of the task's project. | 400 — "Assignee must be a member of this project." |
| Role | Must be one of owner, admin, member, viewer. | 400 — unknown role rejected. |

## Secrets

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| `JWT_SIGNING_KEY` | environment variable | source, logs, error messages, client responses | `config.jwt_signing_key` |
| `DATABASE_URL` | environment variable | source, logs, screenshots | `config.database_url` |

## Feature security specification — invite a team member

```
Feature:        Invite team member to project
Requirement ID: SEC-INVITE-001

Authentication:  The inviter must be signed in.
Authorization:   Only project Owners and Admins can invite.
Role assignment: The inviter selects one approved role: Admin, Member, or Viewer.
Validation:      Email required, valid format, and not already a member of the project.
Data protection: Invitation tokens must not appear in logs or user-facing errors.
Secure errors:   Unauthorized users receive a generic access-denied response.
Testing:         allowed inviter, Viewer, Member, invalid email, duplicate invite, safe error

Acceptance criteria:
1. A signed-out user cannot send an invitation.
2. A Viewer cannot send an invitation.
3. A Member cannot send an invitation.
4. An Owner or Admin can invite a user with a valid email address.
5. The system does not expose invitation tokens in logs or error messages.
6. Unauthorized requests return a safe access-denied response.
```

## Secure errors as shipped

| Problem | ProjectBoard response |
|---|---|
| Wrong password | "The email or password is incorrect." (identical for unknown email) |
| Viewer tries to create a task | 403 — "You do not have permission to perform this action." |
| Database unavailable | 500 — "Something went wrong. Please try again later." + internal log `DB_UNAVAILABLE` with request_id |
