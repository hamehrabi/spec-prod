# technical-spec.md — Technical Specification

> **Purpose (Ch. 4 §4.4):** Defines architecture, data, APIs, security, and errors.
> **When you use it:** Before task planning and coding.
> **Sources:** Ch. 7 (10-section template), Ch. 8 (architecture), Ch. 9 (data/API/integration),
> Ch. 21 (security), Ch. 22 (reliability), Ch. 27 §27.6 (frontend components),
> Appendices C, D, E.

A PRD says *what product you want*. This says *how the system should be structured so that
product can be built safely and consistently*.

**Version:** TECH v1.0 · **Owner:** · **Date:**

---

## Contents

1. [System Overview](#1-system-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Requirements](#3-frontend-requirements)
4. [Backend Requirements](#4-backend-requirements)
5. [Database Requirements](#5-database-requirements)
6. [API Requirements](#6-api-requirements)
7. [Security Requirements](#7-security-requirements)
8. [Performance Requirements](#8-performance-requirements)
9. [Error Handling & Reliability Requirements](#9-error-handling--reliability-requirements)
10. [Integration & Versioning Requirements](#10-integration--versioning-requirements)
11. [Testing Approach](#11-testing-approach)
12. [Deployment Approach](#12-deployment-approach)
13. [Open Decisions](#13-open-decisions)
14. [Guardrail Checklist & Prompts](#14-guardrail-checklist)

---

## 1. System Overview

| Field | Value |
|---|---|
| System name | |
| Purpose | *One or two sentences describing what the system does technically.* |
| Primary users | |
| Core capabilities | |
| System boundary | This system includes **[included areas]**. This system does **not** include **[excluded areas]**. |
| External dependencies | *Services, APIs, file systems, email providers, payment systems, AI models.* |
| Assumptions | *Conditions you are accepting for this version.* |

> A good system overview prevents a common AI coding problem: the assistant builds more
> than you asked for because the system boundary was unclear.

---

## 2. Architecture Overview

| Item | Decision |
|---|---|
| Architecture style | Monolith / **Modular monolith** / Client-server / Service-based / Event-driven |
| Main components | Frontend, backend, database, worker, external service, AI layer |
| Responsibility of each component | |
| Data flow | *How data moves from user action to response.* |
| State ownership | *Where important state is stored and updated.* |
| Trade-offs | *Why this design is acceptable for the current version.* |

### Choosing the style (Ch. 8 §8.3, §8.7)

| Style | Best use | Strength | Cost | Beginner warning |
|---|---|---|---|---|
| Monolith | Small tools, MVPs, internal apps. | Fast to build and easy to run. | Can become messy without internal structure. | Do not allow all logic to mix in one file or layer. |
| **Modular monolith** | Growing SaaS apps, dashboards, business systems. | Balanced structure, simple deployment. | Requires discipline around modules. | You must define modules and respect their boundaries. |
| Microservices | Large systems with independent teams and scaling needs. | Independent scaling and ownership. | More infrastructure and coordination. | Do not choose it only because it sounds advanced. |

**Decision questions (Ch. 8 §8.2)**

| Question | What you are checking |
|---|---|
| How large is the first version? | A small product usually needs a simple structure first. |
| How many people will work on it? | More developers may need clearer module boundaries. |
| Will features change often? | Frequent changes require separation between areas. |
| How much deployment complexity can you manage? | Microservices create operational responsibilities. |
| What must be protected? | Security-sensitive features need strong boundaries. |

> **Practical guidance (Ch. 8 §8.7):** for most beginner-to-intermediate projects, start
> with a **modular monolith** — structure without premature deployment complexity.

### Component boundaries (Ch. 8 §8.4)

Three questions per component: *What does it own? What does it need from others? What is it
forbidden to do?*

| Component | Owns | Must **not** do |
|---|---|---|
| User Interface | Screens, forms, display states, user actions. | Contain database queries or hidden business rules. |
| API Layer | Routes, request validation, response formatting. | Hide complex domain logic in route handlers. |
| Domain Module | Business rules and core decisions. | Depend directly on screen layout. |
| Data Layer | Database access, queries, persistence. | Decide user-facing business behavior. |

> **Architecture rule:** a boundary is useful only when you can tell whether a piece of
> code belongs inside or outside it.

### Text architecture diagram (Ch. 8 §8.5)

Use large labels, simple boxes, clear arrows, and short names.

```
[ Browser / Client ]
        |
        v
[ API Layer ]  --- validates request, checks auth
        |
        v
[ Domain / Service Modules ]  --- business rules
        |
        v
[ Data Layer ] ---> [ Database ]
        |
        +--------> [ External Services ]
        +--------> [ Background Jobs / Queue ]
```

| Diagram element | Use it to show |
|---|---|
| Box | A component, module, service, database, or external system. |
| Arrow | A dependency or communication path. |
| Boundary line | Where one responsibility area ends and another begins. |
| Short label | The purpose of the component, not every implementation detail. |

### Architecture decisions

Record every significant choice as an ADR → [`decisions.md`](../05-architecture/decisions.md)

---

## 3. Frontend Requirements

| Area | Specification |
|---|---|
| Screens / pages | Dashboard, login, settings, list view, detail view, form page. |
| Components | Navigation, table, card, modal, form, search bar, filter, status badge. |
| Form fields | Required, optional, input type, placeholder, validation rule. |
| UI states | Loading, empty, error, success, disabled, permission-denied. |
| User actions | Create, edit, delete, save, cancel, search, filter, export, retry. |
| Accessibility basics | Readable labels, keyboard-friendly navigation, clear error messages. |

**Screen example (Ch. 7 §7.4)**
```
Screen: Create Task
Purpose: Allow a signed-in team member to create a new task.
Fields:
  - Title: required, text, maximum 120 characters
  - Description: optional, text area
  - Due date: optional, date input
  - Assignee: required, selected from workspace members
States:
  - Loading: show saving indicator
  - Success: return to task list and show the new task
  - Error: explain what failed and keep the user input on screen
```

### Component specification (Ch. 27 §27.6)

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| | | | loading, success, empty, error, unauthorized | |

**Per-component template**
```
Component name:
Purpose:
Supports requirement: REQ-###

Props / inputs:
  - name: type — required/optional — meaning

Internal state:

States to handle:
  - Loading:            [what the user sees]
  - Success:            [what the user sees]
  - Empty:              [why it is empty and how data appears]
  - Error:              [safe message + recovery action]
  - Disabled:           [when and why]
  - Permission denied:  [what is hidden vs. what is explained]

User actions:
Validation shown inline:
Accessibility notes:
Out of scope for this component:
```

**Example component set (Ch. 27 §27.6)**

| Component | Purpose | States | Rules |
|---|---|---|---|
| `DashboardShell` | Page frame: navigation, title, tenant selector. | loading, ready, unauthorized | Do not show content until tenant access is confirmed. |
| `FilterBar` | Date, feature, plan, role filters. | ready, validating | Changing filters refreshes all dependent views. |
| `KpiCardGrid` | Shows summary metrics. | loading, success, empty, error | Cards must explain what each metric means. |
| `TrendChart` | Time-series metrics. | loading, success, empty, error | Empty charts must not appear as zero performance. |
| `ReportTable` | Lists saved reports. | loading, success, empty, error | Only show reports visible to the current role. |
| `ExportPanel` | Queues and tracks exports. | idle, queued, ready, failed | Export button only appears for permitted roles. |

### The five states rule

Every data-bound component must handle all five. Missing states are where shallow
AI-generated UIs fail.

| State | Requirement |
|---|---|
| Loading | Show progress; never a blank frame. |
| Success | Render the data. |
| **Empty** | Explain *why* it is empty and how data appears. Never render empty as a zero value. |
| **Error** | Safe message + retry option. Never a stack trace. |
| **Permission denied** | Hide or disable; do not reveal protected resource details. |

> **Security rule (Ch. 27 §27.7):** hiding a button in the frontend is helpful for the user
> interface, but it is **not security by itself**. Enforce permissions on the server.

---

## 4. Backend Requirements

| Area | Decision |
|---|---|
| Business logic | |
| Authorization | |
| Validation | |
| Service layer | |
| Background jobs | |
| Integrations | |

**Examples (Ch. 7 §7.5)**

| Backend area | Example decision |
|---|---|
| Business logic | A task cannot be marked complete if it has no title. |
| Authorization | Only workspace members can view tasks in that workspace. |
| Validation | The backend rejects invalid due dates and missing required fields. |
| Service layer | Task creation is handled by a task service, not scattered across routes. |
| Background jobs | Daily reminder jobs run separately from normal requests. |
| Integrations | Email notification service is called only after task creation succeeds. |

> **Backend discipline:** the backend must never simply accept what the frontend sends. It
> enforces the rules. Write backend rules in plain language first — each rule later becomes
> a task, a test, and then code.

---

## 5. Database Requirements

**The database design is not written here.** It is written once, in
[`../06-api-and-data-design/database-design.md`](../06-api-and-data-design/database-design.md),
a round earlier — entity model, schema, ownership and isolation rules, sensitive fields,
retention, migration, and file storage.

This section used to carry all eight of those subsections, with the same titles in the same
order as that document. Two copies of a schema is the drift this whole kit exists to prevent:
they disagree within a week, both look authoritative, and nothing tells the reader which one
the code was built from (BUG-019).

| What you need | Where it is |
|---|---|
| Entity model, and the rule that must always be true of each | `database-design.md` §1 |
| Schema, keys, constraints, indexes | `database-design.md` §3 |
| Ownership and isolation — which query is scoped by what | `database-design.md` §5 |
| Sensitive fields, storage and logging rules | `database-design.md` §6 |
| Retention and deletion | `database-design.md` §7 |
| Migration reversibility | `database-design.md` §8 |

**What belongs here instead:** anything about the database that only makes sense next to the
rest of the technical specification — a store chosen because of an architecture decision, a
constraint the schema imposes on deployment, a performance limit that comes from the data
shape rather than from the data model.

| Cross-cutting database decision | Consequence elsewhere in this document |
|---|---|
| | |

Leave this table empty if there are none. An empty table with a heading is a statement; a
copied schema is a second source of truth.

---

## 6. API Requirements

**The API contract is not written here.** It is written once, in
[`../06-api-and-data-design/api-specification.md`](../06-api-and-data-design/api-specification.md),
a round earlier — endpoint index, per-endpoint contracts, status code principles, contract
rules, validation rules, and versioning.

Same reason as §5. This section used to repeat the endpoint index and the endpoint template
verbatim, so a developer filled the same table twice, three rounds apart, and the build agent
had two of them to choose between.

| What you need | Where it is |
|---|---|
| Every endpoint, its requirement, and its permission | `api-specification.md` — endpoint index |
| The full contract for one endpoint | `api-specification.md` — endpoint template |
| Which status code means what, and what it must not reveal | `api-specification.md` — status code principles |
| Validation rules | `api-specification.md` — validation rules |
| Breaking-change policy | `api-specification.md` — versioning and compatibility |

**What belongs here instead:** the API decisions that are architectural rather than
contractual — where the boundary sits, what is synchronous and what is not, what the API
promises about consistency.

| Cross-cutting API decision | Consequence elsewhere in this document |
|---|---|
| | |

---


## 7. Security Requirements

> **Beginner rule (Ch. 21):** do not write "make it secure." Write the exact security
> behavior you expect. A clear rule can be reviewed, tested, and implemented. A vague
> security wish cannot.
>
> **You decide the security policy in the specification. The agent does not.**

### 7.1 Authentication (*who are you?*)

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

### 7.2 Authorization / RBAC (*what are you allowed to do?*)

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

### 7.3 Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

| Input | Validation rule | Error behavior |
|---|---|---|
| | Required; 3–120 characters; trimmed before saving. | Clear message naming the field. |
| | Optional; when provided must be a valid future date. | Validation error without saving. |
| | Required; must belong to a resource the user can access. | Safe not-found or access-denied response. |

### 7.4 Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | Do not collect personal data not needed for the feature. |
| Storage | How should data be stored? | Sensitive account data must use approved storage mechanisms. |
| Transport | How does data move? | Private user data only through protected channels. |
| Logging | What must **not** be logged? | Never log passwords, tokens, reset links, or full secret values. |
| Retention | How long is data kept? | Follow the retention rule in the product specification. |

### 7.5 Secrets management

- Never hardcode a secret into source code, templates, screenshots, logs, or examples.
- Use placeholders in documentation → [`../.env.example`](../../.)
- Document where each real value is configured → [`../ops/deployment-checklist.md`](../../07-ops/01-deployment/deployment-checklist.md)

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| `JWT_SIGNING_KEY` | environment variable | source, logs, error messages, client responses | `config.jwt_signing_key` |
| | | | |

### 7.6 Secure error handling

| Problem | Unsafe response | Safer response |
|---|---|---|
| Login failed | Detailed account or password reason. | "The email or password is incorrect." |
| Access denied | Internal permission rule details. | "You do not have permission to perform this action." |
| Server failure | Stack trace or database error. | "Something went wrong. Please try again later." |
| Validation failure | Raw parser or framework error. | "The submitted value does not match the required format." |

### 7.7 Per-feature security specification

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

### 7.8 Security review checklist (Ch. 21 §21.8)

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

Full review pass → [`../review/review-log.md`](../../05-review/01-logs/review-log.md#security-review-checklist-appendix-m)

---

## 8. Performance Requirements

Measurable only. Avoid "the app should be fast."

| Workflow | Metric | Target | Expected data size |
|---|---|---|---|
| | Response time | Under _ seconds | up to _ records |
| | Average response | Under _ ms | |

| Weak statement | Stronger requirement |
|---|---|
| "The dashboard should load fast." | "The task dashboard should load within 2 seconds for a workspace with up to 1,000 tasks." |
| "Search should be quick." | "Task search should return results within 1 second for common filters." |
| "The app should support many users." | "The first version should support 50 active users in one workspace without visible slowdown." |

> **Performance tip:** set realistic targets for the version you are building now.
> Overengineering performance too early makes the system harder to finish.

**Performance risks to check in review (Ch. 20 §20.5)**

| Risk | What to check |
|---|---|
| Repeated queries | Does the code query the database inside a loop? |
| Overfetching | Does it load fields or records that are not needed? |
| Slow external calls | Does one request depend on many network calls? |
| Missing limits | Can a user request unlimited records? |
| Blocking work | Should heavy work move to a background job? |

---

## 9. Error Handling & Reliability Requirements

> Reliable software is not software that never fails. It fails in **controlled,
> understandable, and recoverable** ways.
>
> **Spec rule (Ch. 22):** write reliability as a specific rule: *"If X fails, the system
> must do Y, record Z, and show message M."*

### 9.1 Error handling table (Ch. 7 §7.10)

| Error situation | Expected behavior |
|---|---|
| Missing required field | Reject, explain the missing field, keep user input on screen. |
| Not signed in | Return 401 and ask the user to sign in. |
| No permission | Return 403 and explain the user cannot access the resource. |
| Resource not found | Return 404 with a safe message. |
| External service failure | Retry if safe, otherwise show a temporary failure message. |
| Unexpected server error | Return a general error message and log details internally. |

### 9.2 Failure sources (Ch. 22 §22.2)

| Failure source | Question to ask | Example recovery rule |
|---|---|---|
| User input | Missing, invalid, or unexpected data? | Reject with field-level validation messages. |
| Database | Write fails or takes too long? | Do not show success. Return a retry-safe error and log the failure. |
| Network | Request times out? | Apply a timeout rule and let the user retry safely. |
| External service | Third-party API unavailable? | Queue the action for later or mark it pending. |
| Background job | Job fails after the user left the page? | Store job status, retry if safe, expose the final result. |

### 9.3 Failure states

```
- Failure state: [name]
  - Trigger:        [what causes it]
  - Recovery path:  [what the system does next]
  - User message:   [plain language, safe, with a next action]
  - Log event:      [EVENT_NAME with safe context fields]
  - Test case:      TEST-###
```

| Error state | Recovery path | What to test |
|---|---|---|
| Invalid login input | Reject and show clear field-level feedback. | Empty password returns a validation error. |
| Wrong credentials | Safe message without revealing which field was wrong. | Incorrect email or password produces the same message. |
| Database timeout | Stop the request, log the timeout, ask the user to try again. | A simulated timeout does not show successful login. |
| Expired session | Redirect to login and preserve the next safe destination. | A protected route redirects instead of crashing. |

### 9.4 Timeout and retry rules (Ch. 22 §22.5)

| Decision | Rule |
|---|---|
| Timeout | Set a maximum wait so the system never hangs forever. |
| Retry count | Limit retries. Do not retry endlessly. |
| Retry delay | Wait briefly before retrying instead of hammering the service. |
| Idempotency | Only retry operations that will not create duplicate harmful effects. |
| Stop condition | Define when the system gives up and reports a controlled failure. |

| Operation | Safe to retry? | Max retries | Delay | On give-up |
|---|---|---|---|---|
| | Yes / No | | | |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures, and
> hammered dependencies.

### 9.5 Background jobs and queues (Ch. 22 §22.6)

| Requirement | Definition |
|---|---|
| Job name | *What work the job performs.* |
| Trigger | *What event creates the job.* |
| Input data | *The minimum safe data the job needs.* |
| Retry rule | *When and how the job retries.* |
| Failure state | *What status is stored if the job cannot complete.* |
| User visibility | *Whether the user sees pending, failed, or completed status.* |

### 9.6 Logging requirements (Ch. 22 §22.4)

| Log requirement | Good practice |
|---|---|
| Event name | Clear names such as `AUTH_LOGIN_FAILED`, `JOB_RETRY_SCHEDULED`. |
| Severity | Use `info`, `warning`, `error`, `critical` consistently. |
| Request / correlation ID | Attach a request ID so related events can be traced. |
| Safe context | User ID, role, action — never secrets or raw credentials. |
| Failure reason | Error type or safe error code, not a sensitive dump. |
| Outcome | Whether the system recovered, retried, queued, or stopped safely. |

**Must never be logged:** passwords · tokens · reset links · full secret values · raw
payment data.

**Structured log example**
```json
{
  "level": "error",
  "event": "report_export_failed",
  "request_id": "REQ-20491",
  "user_id": "USER-118",
  "project_id": "PROJ-42",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "recovery_action": "user_can_retry"
}
```

### 9.7 User-facing error messages (Ch. 22 §22.7)

| Weak message | Better message | Why it is better |
|---|---|---|
| `DatabaseError: connection refused` | "We could not save your changes right now. Please try again." | Understandable; reveals no internals. |
| `Invalid request` | "Please enter a project name before saving." | Tells the user exactly what to fix. |
| `Unauthorized` | "You do not have permission to edit this project." | Explains without exposing security details. |
| `Job failed` | "Your report could not be generated. You can try again or contact support." | Gives a next action. |

### 9.8 Reliability definition of done (Ch. 22 §22.8)

- [ ] All expected failure states are handled.
- [ ] Logs are safe and useful.
- [ ] User-facing errors are clear.
- [ ] Tests cover normal behavior **and** failure behavior.

---

## 10. Integration & Versioning Requirements

**The integration rules are not written here.** They are written once, in
[`../06-api-and-data-design/data-and-integration-spec.md`](../06-api-and-data-design/data-and-integration-spec.md)
§5 and §6 — provider, data in and out, timeout, retry rule, idempotency, failure behaviour,
secrets, rate limits, and the breaking-change policy.

The third instance of the same duplication as §5 and §6 (BUG-019). The integration table here
carried the identical eleven rows, so an outbound call could have one timeout in this document
and a different one three files away.

| What you need | Where it is |
|---|---|
| Provider, purpose, data sent and received, what is stored | `data-and-integration-spec.md` §5 |
| Timeout, retry rule, idempotency, failure behaviour | `data-and-integration-spec.md` §5 |
| Secrets handling and known rate limits | `data-and-integration-spec.md` §5 |
| Current version, breaking-change policy, compatibility notes | `data-and-integration-spec.md` §6 |

**What belongs here instead:** what an outside dependency does to *this* system's shape — a
service whose failure takes a whole capability with it, a call on a path the user waits on, a
provider whose rate limit becomes a design constraint rather than a configuration value.

| Dependency | What its failure costs, and what that forces here |
|---|---|
| | |

---


## 11. Testing Approach

| Level | Strategy |
|---|---|
| Unit | |
| Integration | |
| End-to-end | |
| Security | |
| Performance | |
| Regression | |

→ [`../tests/test-plan.md`](../../03-tests/01-plan/test-plan.md)

---

## 12. Deployment Approach

| Area | Summary |
|---|---|
| Environments | local / test / production |
| Configuration | |
| Migrations | |
| Rollback | |
| Monitoring | |

→ [`../ops/deployment-checklist.md`](../../07-ops/01-deployment/deployment-checklist.md) ·
[`../ops/maintenance-notes.md`](../../07-ops/03-maintenance/maintenance-notes.md)

---

## 13. Open Decisions

*Unresolved choices that must **not** be guessed by the AI agent.*

→ [`intent.md` §5](../01-intent/intent.md#5-open-questions)

| ID | Decision needed | Owner | Must be resolved before |
|---|---|---|---|
| | | | |

---

## 14. Guardrail Checklist

**Before generating code, verify (Appendix C):**

- [ ] Requirements are mapped to modules.
- [ ] Data models are named.
- [ ] API contracts are defined.
- [ ] Error states are documented.
- [ ] Tests exist before implementation.
- [ ] Security rules are explicit.
- [ ] Open questions are not treated as assumptions.

**Chapter checklist (Ch. 7)**

- [ ] You can explain the difference between a PRD and a Technical Specification.
- [ ] You can write a simple system overview with boundaries and assumptions.
- [ ] You can describe the architecture at the component level without overcomplicating it.
- [ ] You can define frontend, backend, database, and API requirements clearly.
- [ ] You can document security, performance, and error-handling expectations before coding.

**Architecture checklist (Ch. 8)**

- [ ] Have you chosen an architecture style based on real project needs?
- [ ] Have you defined the main components of the system?
- [ ] Have you described what each component owns?
- [ ] Have you identified what each component must not do?
- [ ] Have you compared architecture trade-offs before deciding?
- [ ] Have you written at least one ADR for the main architecture decision?
- [ ] Have you created rules that an AI assistant can follow during implementation?

**Data & API checklist (Ch. 9)**

- [ ] Core entities the system must remember are identified.
- [ ] Relationships between entities are clear.
- [ ] Database fields, keys, constraints, and indexes are planned.
- [ ] Endpoint specs are written before implementation.
- [ ] Request and response contracts are defined.
- [ ] Validation rules are written before code is generated.
- [ ] External integration behavior and failure handling are documented.
- [ ] Versioning is considered before changing API contracts.

---

## Prompts

**Draft a technical spec from a PRD (Ch. 7)**
```
You are helping me create a Technical Specification.

Use this PRD: [paste PRD]

Create a concise Technical Specification with these sections:
1. System Overview   2. Architecture Overview   3. Frontend Requirements
4. Backend Requirements   5. Database Requirements   6. API Requirements
7. Security Requirements  8. Performance Requirements
9. Error Handling Requirements   10. Open Questions

Rules:
- Do not write implementation code yet.
- Do not add features outside the PRD.
- Use beginner-friendly language.
- Make each decision clear enough to become tasks and tests later.
```

**Explore architecture options (Prompt box 8.1)**
```
Given this project summary, compare three architecture options: monolith, modular
monolith, and microservices. For each option, explain the benefits, risks, complexity
level, and when I should avoid it. Do not choose for me until you have compared the
trade-offs.
```

**Use AI as an architecture reviewer (Prompt box 8.2)**
```
Review the architecture below. Identify missing components, unclear boundaries, security
risks, performance risks, and places where business logic may become scattered. Explain
your reasoning in beginner-friendly language. Do not rewrite the architecture until you
have listed the issues.
```

**Identify entities (Prompt box 9.1)**
```
Using the requirements below, list the main entities this system must store. For each
entity, identify important fields, relationships, and business rules. Do not create
database tables yet. Focus only on meaning and relationships.
```

**Review validation coverage (Prompt box 9.2)**
```
Review the API endpoint below. List all validation rules that should exist before data is
saved. Group them into required fields, allowed values, relationship rules, permission
rules, and error responses. Do not write code yet.
```

**Check compatibility risk (Prompt box 9.3)**
```
Review this API change and tell me whether it is backward compatible. Identify any
frontend, test, documentation, or integration updates that may be needed. If it is a
breaking change, suggest a safer versioning strategy.
```

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

**Ask for logging rules (Ch. 22 §22.4)**
```
Using the reliability requirements below, propose safe logging rules for this feature.
Include event names, severity levels, useful context fields, and fields that must never
be logged. Do not write implementation code yet.
```

**Generate frontend components from the spec (Ch. 27 §27.6)**
```
Use the dashboard requirements, API specification, and RBAC rules below.
Create a frontend component plan before writing code.
For each component, include props, state, loading behavior, empty state, error state, and
accessibility notes.
Do not invent new metrics, roles, or endpoints.
```

---

**Next:** [`traceability.md`](../08-traceability/traceability.md) · [`decisions.md`](../05-architecture/decisions.md) ·
[`../tasks/task-index.md`](../../02-tasks/01-planning/task-index.md)

---

# WORKED EXAMPLE — API request and response (Ch. 9 §9.5)

**Request**
```
POST /api/v1/projects/{project_id}/tasks
Content-Type: application/json

{
  "title": "Prepare launch checklist",
  "description": "Confirm release tasks before deployment.",
  "assignee_id": "user_102",
  "due_date": "2026-07-15"
}
```

**Success response**
```
201 Created

{
  "id": "task_501",
  "project_id": "project_200",
  "title": "Prepare launch checklist",
  "status": "todo",
  "assignee_id": "user_102",
  "due_date": "2026-07-15",
  "created_at": "2026-06-26T10:15:00Z"
}
```

**Error response**
```
400 Bad Request

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The task title is required.",
    "field": "title"
  }
}
```
