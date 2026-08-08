# technical-spec.md — Technical Specification

> **Purpose (Ch. 4 §4.4):** Defines architecture, data, APIs, security, and errors.
> **When you use it:** Before task planning and coding.
> **Sources:** Ch. 7 (10-section template), Ch. 8 (architecture), Ch. 9 (data/API/integration),
> Ch. 21 (security), Ch. 22 (reliability), Ch. 27 §27.6 (frontend components),
> Appendices C, D, E.

A PRD says *what product you want*. This says *how the system should be structured so that
product can be built safely and consistently*.

**Version:** TECH v1.0 · **Owner:** Developer (product owner) · **Date:** 2026-08-08

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
| System name | Pantry |
| Purpose | A web application in which one account holder saves recipes with their ingredient lines, plans a week of meals, and generates one shopping list from that week. |
| Primary users | The account holder — a home cook. One role, no sharing. |
| Core capabilities | Save a recipe with its ingredients · plan a week · generate one shopping list from that week · search saved recipes. |
| System boundary | This system includes **recipe capture, weekly planning, shopping-list generation, recipe search, and accounts/sign-in**. This system does **not** include **[TODO: which capabilities are explicitly out of scope for version one? — Q-004]**. |
| External dependencies | None in version one (Round 6). |
| Assumptions | Single user per account, no sharing (Round 3). A web UI is the only client of the API. |

> A good system overview prevents a common AI coding problem: the assistant builds more
> than you asked for because the system boundary was unclear.

---

## 2. Architecture Overview

| Item | Decision |
|---|---|
| Architecture style | **Modular monolith** (ADR-001). |
| Main components | Frontend, API layer, domain modules — accounts, recipes, planning, shopping-list generation (core) — and the data layer (ADR-001). |
| Responsibility of each component | See the component boundaries table below (ADR-001). |
| Data flow | User action → API layer (validates, checks auth) → domain module (business rules, including BR-001 generation) → data layer → response. |
| State ownership | All durable state lives in the data store; nothing important lives only in the browser. Session state depends on Q-009. |
| Trade-offs | One deployment and module discipline instead of distributed complexity — acceptable for a one-person version one (ADR-001). |

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

**The interface specification is not written here.** It is written once, in
[`frontend-component-spec.md`](frontend-component-spec.md) — the component table, the
per-component template, the five states every data-bound component must handle, and the
frontend requirement areas (screens, form fields, UI states, user actions, accessibility).

The same rule as §5, §6 and §10 below. One empty component table filled twice, in the same
round, from two templates that have already drifted apart, leaves the build agent two of them
to choose between and nothing saying which one the screen was built from.

| What you need | Where it is |
|---|---|
| Every component, its purpose, the data it needs, its states and its rules | `frontend-component-spec.md` — component table |
| The full specification of one component | `frontend-component-spec.md` — per-component template |
| Loading, success, empty, error, permission-denied | `frontend-component-spec.md` — the five states |
| Screens, form fields, UI states, user actions, accessibility basics | `frontend-component-spec.md` — frontend requirement areas |

**What belongs here instead:** the interface decisions that are architectural rather than
visual — what renders on the server and what renders in the browser, where client state lives
and who owns it, what the interface is allowed to assume about the API.

| Cross-cutting interface decision | Consequence elsewhere in this document |
|---|---|

Leave this table empty if there are none.

> **Security rule (Ch. 27 §27.7):** hiding a button in the frontend is helpful for the user
> interface, but it is **not security by itself**. Enforce permissions on the server.

---

## 4. Backend Requirements

| Area | Decision |
|---|---|
| Business logic | BR-001 (one list covers the week's ingredient lines), BR-002 (a planned meal references a same-account recipe), BR-003 (one owner, no sharing) are enforced in domain modules, never only in the UI. |
| Authorization | Every query is scoped to the calling account (REQ-R-001). Deny-by-default: no signed-in user, no data. |
| Validation | The backend validates every request at the API boundary; the frontend's validation is a courtesy copy. |
| Service layer | Shopping-list generation — the core — lives in its own domain service, not in a route handler. |
| Background jobs | None identified for version one; generation is synchronous. Revisit if imports, reminders, or photo processing arrive. |
| Integrations | None in version one (Round 6); the integration table in `data-and-integration-spec.md` §5 records the decision. |

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

Do not restate any of it below, and do not summarise it here either — a summary of a schema is
still a second copy. Two copies of a schema is the drift this whole kit exists to prevent:
they disagree within a week, both look authoritative, and nothing tells the reader which one
the code was built from.

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
| Relational store: SQLite while it is one person's, schema kept Postgres-compatible (ADR-002). | The store is a single file — deployment (§12) and backup treat it as one unit; no store-specific SQL anywhere. |

Leave this table empty if there are none. An empty table with a heading is a statement; a
copied schema is a second source of truth.

---

## 6. API Requirements

**The API contract is not written here.** It is written once, in
[`../06-api-and-data-design/api-specification.md`](../06-api-and-data-design/api-specification.md),
a round earlier — endpoint index, per-endpoint contracts, status code principles, contract
rules, validation rules, and versioning.

Same reason as §5. Repeating the endpoint index or the endpoint template here means filling
the same table twice, rounds apart, and leaving the build agent two of them to choose between.

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
| Everything is synchronous in version one. | §9.5 has no background jobs; the UI never shows a "pending" state for core actions. |

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
| Account access | [TODO: which authentication model? — Q-009] |
| Session lifetime | [TODO: which authentication model? — Q-009] |
| Password handling | Plain-text passwords must never be stored or logged — applies if password authentication is chosen (Q-009). |
| Account recovery | [TODO: which authentication model? — Q-009] |
| Logout | [TODO: which authentication model? — Q-009] |
| Multi-factor (if any) | [TODO: which authentication model? — Q-009] |

> **`SEC-` identifiers are DEFINED in
> [`security-specification.md`](../07-security-and-reliability/security-specification.md), and
> only there.** This section decides the authentication *model*; the numbered controls that
> enforce it have one home, and this is not it.
>
> This blueprint used to mint `SEC-A-001` in a table of its own — the same row
> `security-specification.md` opens with — so **every workspace this kit produced defined that
> identifier twice**, and the day one copy was edited the two disagreed about what the control
> was. Cite the id here; do not restate the row.

### 7.2 Authorization / RBAC (*what are you allowed to do?*)

Pantry has **one role** — the account holder — so the matrix is one column, and the real
rule is the scoping row at the bottom.

| Action | Account holder |
|---|---|
| Save a recipe | Yes |
| Plan a week | Yes |
| Generate a shopping list | Yes |
| Search recipes | Yes |
| Reach another account's recipes, plans, or lists | **No — under any route, ever** (REQ-R-001) |

> A role table gives the agent a precise boundary. It does not need to guess whether a
> Member can invite users — the table already says no.

**Defensive authorization pattern (Ch. 21 §21.3)** — specify the *order* of the checks, not
the code that runs them. State, per protected action: deny when there is no signed-in user;
deny when the resource belongs to a tenant the user is not in; allow only when the user's role
is on an explicit allow-list. Written that way the rule is testable before any code exists —
one test per denial, one for the allow. The worked example at the end of this file shows the
same three checks as a filled specification.

### 7.3 Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

| Input | Validation rule | Error behavior |
|---|---|---|
| Recipe title | Required; trimmed before saving. | Clear message naming the field; typed values kept. |
| Ingredient line name | Required per line; a recipe needs at least one line. | Validation error without saving. |
| Plan and list identifiers | Required; must belong to a resource the caller owns. | Safe not-found or access-denied response. |

### 7.4 Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | Do not collect personal data not needed for the feature. |
| Storage | How should data be stored? | Sensitive account data must use approved storage mechanisms. |
| Transport | How does data move? | Private user data only through protected channels. |
| Logging | What must **not** be logged? | [TODO: what must never leak or be logged? — Q-012] |
| Retention | How long is data kept? | [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013] |

### 7.5 Secrets management

- Never hardcode a secret into source code, templates, screenshots, logs, or examples.
- Use placeholders in documentation → [`../.env.example`](../../.)
- Document where each real value is configured → [`../ops/deployment-checklist.md`](../../07-ops/01-deployment/deployment-checklist.md)

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| [TODO: which authentication model? — Q-009] | environment variable | source, logs, error messages, client responses | — |

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

A filled version of this block is in the worked example at the end of this file.

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

Full review pass → [`../review/security-review.md`](../../05-review/02-checklists/security-review.md)

---

## 8. Performance Requirements

Measurable only. Avoid "the app should be fast."

| Workflow | Metric | Target | Expected data size |
|---|---|---|---|
| Generate the shopping list (REQ-NF-001) | Response time | Under 2 seconds | a weekly plan of up to 21 planned meals |
| Search recipes (REQ-NF-001) | Response time | Under 1 second | a library of up to 500 recipes |

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
| Recipe save fails | Reject, keep every typed value, show a clear message (REQ-NF-003). | A simulated write failure never shows a saved recipe. |
| Shopping-list generation fails | The plan is unchanged; the failure is stated plainly; no partial list is shown. | A simulated failure mid-generation leaves no orphan list. |
| Not signed in | Redirect to sign-in, preserving the safe destination. | A protected route redirects instead of crashing. |
| Another account's resource requested | Safe not-found response; nothing about the resource is revealed. | A guessed ID from another account returns the safe 404. |

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
| Save recipe | No automatic retry — the user retries; typed input is preserved. | 0 | — | Clear error, input kept. |
| Generate shopping list | Yes — regenerating replaces nothing until it succeeds. | User-initiated only | — | Clear error, plan unchanged. |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures, and
> hammered dependencies.

### 9.5 Background jobs and queues (Ch. 22 §22.6)

| Requirement | Definition |
|---|---|
| Job name | None in version one — every operation completes in the request. |
| Trigger | n/a |
| Input data | n/a |
| Retry rule | n/a |
| Failure state | n/a |
| User visibility | n/a — revisit this table if imports, reminders, or photo processing arrive. |

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

The same rule as §5 and §6. An integration table restated here would let one outbound call
carry one timeout in this document and a different one three files away.

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
| None — no external services in version one (Round 6) | No external failure can take a capability with it; this row fills the day a dependency arrives. |

---


## 11. Testing Approach

| Level | Strategy |
|---|---|
| Unit | The core — shopping-list generation (BR-001) — gets unit-heavy coverage per the subdomain map. |
| Integration | API to data store for each capability; ownership scoping verified on every read path. |
| End-to-end | The core journey: save recipes → plan the week → generate the list. |
| Security | Deny tests for REQ-R-001 — another account's data is unreachable by any route. |
| Performance | Against the §8 targets, once wired (FF-004). |
| Regression | The full suite runs on every change. |

→ [`../tests/test-plan.md`](../../03-tests/01-plan/test-plan.md)

---

## 12. Deployment Approach

| Area | Summary |
|---|---|
| Environments | [TODO: which environments will exist? — Q-019] |
| Configuration | Environment variables only; no secrets in source (`.env.example` documents the names). |
| Migrations | → [`database-design.md`](../06-api-and-data-design/database-design.md) §8 |
| Rollback | [TODO: where will this run? — Q-018] |
| Monitoring | [TODO: what is your monitoring appetite? — Q-020] |

→ [`../ops/deployment-checklist.md`](../../07-ops/01-deployment/deployment-checklist.md) ·
[`../ops/maintenance-notes.md`](../../07-ops/03-maintenance/maintenance-notes.md)

---

## 13. Open Decisions

*Unresolved choices that must **not** be guessed by the AI agent.*

→ [`open-questions.md`](../01-intent/open-questions.md)

> **`Q-` rows are DEFINED in `open-questions.md`, and only there.** This table CITES the
> questions that block parts of this specification — the id and the section it blocks, never
> the question restated with its own owner and status. A second home for a question row is a
> second thing to keep correct, and the day the register closes one, a copy here would still
> say open.

| Question ID | Spec section IDs it blocks |
|---|---|
| Q-004 | §1 system boundary |
| Q-005 | §1 assumptions, §12 |
| Q-008 | §7.2 |
| Q-009 | §7.1, §7.5 |
| Q-011 | §4 business logic, §8 |
| Q-012 | §7.4, §9.6 |
| Q-013 | §7.4 |
| Q-014 | §1, §4, §10 |
| Q-018 | §12 |
| Q-019 | §12 |
| Q-020 | §12 |

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

**Next:** [`traceability.md`](../08-traceability/traceability.md) · [`decisions.md`](../05-architecture/decisions.md) ·
[`../tasks/task-index.md`](../../02-tasks/01-planning/task-index.md)

> Blueprint: blueprints/01-docs/04-technical-spec/technical-spec.md
