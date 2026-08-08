# technical-spec.md — Technical Specification

> **Purpose (Ch. 4 §4.4):** Defines architecture, data, APIs, security, and errors.
> **When you use it:** Before task planning and coding.
> **Sources:** Ch. 7 (10-section template), Ch. 8 (architecture), Ch. 9 (data/API/integration),
> Ch. 21 (security), Ch. 22 (reliability), Ch. 27 §27.6 (frontend components),
> Appendices C, D, E.

A PRD says *what product you want*. This says *how the system should be structured so that
product can be built safely and consistently*.

**Version:** TECH v1.0 · **Owner:** Developer · **Date:** 2026-08-08

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
| Purpose | A single-user web application that keeps a home cook's recipes in one place, lets them plan a week of meals, and generates one shopping list from that week. |
| Primary users | One home cook (owner) per account — B2C, no sharing (`REQ-R-001`). |
| Core capabilities | Save a recipe with ingredient lines; search recipes; plan a week; generate one shopping list; tick off list items. |
| System boundary | This system includes **recipe storage, weekly planning, single-list generation, the private account, and private recipe photos**. This system does **not** include **sharing, collaboration, nutrition, pricing, or importing recipes from other services** — the full out-of-scope list was deferred at express depth (`Q-004`). |
| External dependencies | None in version one (`Q-007` answered: none). |
| Assumptions | One user with a small library; a single low-cost runtime; the deployment target is not yet chosen (`Q-017`); the authentication model is not yet chosen (`Q-009`). |

> A good system overview prevents a common AI coding problem: the assistant builds more
> than you asked for because the system boundary was unclear.

---

## 2. Architecture Overview

| Item | Decision |
|---|---|
| Architecture style | **Modular monolith** — proposed as an inference in Round 4 and confirmed in Round 5; recorded as an ADR in [`decisions.md`](../05-architecture/decisions.md). |
| Main components | Browser UI · API layer · domain modules (Recipes, Planning, ShoppingList — **core**; Account/Auth — generic) · data layer (relational store) · private file storage for photos. |
| Responsibility of each component | UI shows screens and captures actions; the API validates and checks ownership; domain modules hold the rules (BR-001–BR-004); the data layer persists, scoped by `account_id`; file storage holds private photos. |
| Data flow | User action → API validates and checks the signed-in account → domain module applies rules → data layer persists → response. List generation reads one week's planned meals, gathers the ingredient lines of every meal, and returns one list (BR-001). |
| State ownership | All persistent state lives in the relational database, scoped by `account_id`; photos live in private file storage; requests hold no in-process state (stateless). |
| Trade-offs | A modular monolith gives clear module boundaries (`REQ-NF-005`) without deployment complexity — the right fit for one developer and one user, and it keeps the core list logic isolated so it stays testable and portable to Postgres later. |

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
| API Layer | Routes, request validation, ownership checks, response formatting. | Hide domain logic (list generation, ownership rules) in route handlers. |
| ShoppingList / Recipes / Planning modules | Business rules and core decisions (BR-001–BR-004). | Depend on screen layout, or reach another account's data. |
| Data Layer | Database access, `account_id`-scoped queries, persistence. | Decide user-facing business behavior. |

> **Architecture rule:** a boundary is useful only when you can tell whether a piece of
> code belongs inside or outside it.

### Text architecture diagram (Ch. 8 §8.5)

Use large labels, simple boxes, clear arrows, and short names.

```
[ Browser / Home cook ]
        |
        v
[ API Layer ]  --- validates request, checks the signed-in account owns the data
        |
        v
[ Domain Modules ]  --- Recipes · Planning · ShoppingList (core: week -> one list)
        |
        v
[ Data Layer ] ---> [ Relational DB ]   (SQLite now, Postgres-ready; every row scoped by account_id)
        |
        +--------> [ Private file storage ]  (recipe photos, private to one account)
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
| The UI never enforces access — it may hide a control, but every read and write is authorised on the server. | §7.2 authorization is server-side; a hidden button is not a security boundary. |
| Core screens (plan a week, generate the list) are the shortest path in the UI, because speed of the core task is the interface priority. | §8 performance target is on the list-generation flow (`Q-010`). |

---

## 4. Backend Requirements

| Area | Decision |
|---|---|
| Business logic | Enforce BR-001–BR-004 server-side; a shopping list is generated from exactly one weekly plan and includes the ingredients of every planned meal. |
| Authorization | Every read and write is scoped by `account_id`; one owner role (`REQ-R-001`); deny when there is no signed-in account. |
| Validation | Reject a recipe with no title; a planned meal must reference a saved recipe owned by the same account (BR-003); refuse to delete a recipe still referenced by a plan (BR-004). |
| Service layer | List generation lives in a ShoppingList service, kept separate from recipe storage and account/auth (`REQ-NF-005`, FF-001). |
| Background jobs | None in version one — list generation is synchronous and fast for one library. Revisit if generation becomes slow (`Q-010`). |
| Integrations | None (`Q-007`). |

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
| Relational store: SQLite while this is one person's, with nothing SQLite-only in the schema, so it can become Postgres unchanged (recorded in `decisions.md`). | §12 deployment carries a reversible migration plan (Round 8); no store-specific feature may enter the code. |

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
| Every request is synchronous request/response; the API promises read-after-write consistency within one account's data. | §4 needs no background jobs or queues in version one. |

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
| Account access | A home cook signs in to their own private account; the exact model (built-in sessions vs. an adopted provider) is deferred at express depth (`Q-009`). |
| Session lifetime | Access lasts for a signed-in session and ends on logout or expiry — the concrete lifetime is set with the auth model (`Q-009`). |
| Password handling | Plain-text passwords must never be stored or logged. |
| Account recovery | Reset links must expire and must not reveal whether an account exists. |
| Logout | Ends the session and the account's access. |
| Multi-factor (if any) | None in version one. |

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

Version one has one role and no sharing (`REQ-R-001`), so the matrix is one column.

| Action | Home cook (owner) |
|---|---|
| Save / edit / delete own recipe | Yes (own data only) |
| Search own recipes | Yes |
| Plan a week / edit the plan | Yes (own data only) |
| Generate a shopping list from a week | Yes (own data only) |
| Tick off list items | Yes |
| Reach another account's data | No — there is no other account, and nothing is shared |

> A role table gives the agent a precise boundary. It does not need to guess whether a
> Member can invite users — the table already says no.

**Defensive authorization pattern (Ch. 21 §21.3)** — specify the *order* of the checks, not
the code that runs them. State, per protected action: deny when there is no signed-in user;
deny when the resource belongs to another account; allow only when the signed-in account owns
it. Written that way the rule is testable before any code exists — one test per denial, one
for the allow.

### 7.3 Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

| Input | Validation rule | Error behavior |
|---|---|---|
| Recipe title | Required; 1–120 characters; trimmed before saving. | Clear message naming the field; typed values kept. |
| Ingredient line | Required text on each line; a recipe needs at least one. | Validation error without saving. |
| Planned meal → recipe | Required; must reference a saved recipe owned by the same account (BR-003). | Safe not-found or access-denied response. |

### 7.4 Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | Do not collect personal data not needed for the feature. |
| Storage | How should data be stored? | Sensitive account data must use approved storage mechanisms. |
| Transport | How does data move? | Private user data only through protected channels. |
| Logging | What must **not** be logged? | Never log passwords, tokens, reset links, or full secret values; recipe/plan data and photos are private (`REQ-NF-007`) — the exact leak list is `Q-012`. |
| Retention | How long is data kept? | Follow the retention rule in `database-design.md` §7. |

### 7.5 Secrets management

- Never hardcode a secret into source code, templates, screenshots, logs, or examples.
- Use placeholders in documentation → [`../.env.example`](../../.)
- Document where each real value is configured → [`../ops/deployment-checklist.md`](../../07-ops/01-deployment/deployment-checklist.md)

| Secret | Where configured | Must never appear in | Code reference |
|---|---|---|---|
| Session/auth signing value (once the auth model is chosen, `Q-009`) | environment variable | source, logs, error messages, client responses | `config.auth_signing_key` |
| Database location/credential (once the store is deployed) | environment variable | source, logs, client responses | `config.database_url` |

### 7.6 Secure error handling

| Problem | Unsafe response | Safer response |
|---|---|---|
| Login failed | Detailed account or password reason. | "The email or password is incorrect." |
| Access denied | Internal permission rule details. | "You do not have permission to perform this action." |
| Server failure | Stack trace or database error. | "Something went wrong. Please try again later." |
| Validation failure | Raw parser or framework error. | "The submitted value does not match the required format." |

### 7.7 Per-feature security specification

```
Feature:        Generate the week's shopping list
Requirement ID: defined in security-specification.md (Round 6) — cited here, not minted

Authentication:  the home cook must be signed in
Authorization:   the week (and its recipes) must belong to the signed-in account
Role assignment: single role; no roles to grant (REQ-R-001)
Validation:      the week must exist and be owned by the account
Data protection: the list and its recipes are never exposed to another account (BR-002)
Secure errors:   an unowned or missing week returns a safe not-found, not a detailed reason
Testing:         owner can generate; a request for another account's week is denied; an
                 empty week yields an empty list with a message, not an error (AC-003)

Acceptance criteria:
1. A signed-out request cannot generate a list.
2. A request for a week the account does not own returns a safe not-found.
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

Full review pass → [`../review/security-review.md`](../../05-review/02-checklists/security-review.md)

---

## 8. Performance Requirements

Measurable only. Avoid "the app should be fast."

| Workflow | Metric | Target | Expected data size |
|---|---|---|---|
| Generate one shopping list from a week | Response time | Prompt for one cook's library — the concrete threshold is deferred (`Q-010`) and enforced as a fitness function once set (FF-001 register). | up to one cook's recipes |
| Search saved recipes | Response time | Returns promptly over one person's library. | one cook's recipes |

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
| No permission | Return 403 (or a safe not-found) and do not reveal the resource. |
| Resource not found | Return 404 with a safe message. |
| Save fails | Do not show success; return a retry-safe error and preserve input (`REQ-NF-003`). |
| Unexpected server error | Return a general error message and log details internally. |

### 9.2 Failure sources (Ch. 22 §22.2)

| Failure source | Question to ask | Example recovery rule |
|---|---|---|
| User input | Missing, invalid, or unexpected data? | Reject with field-level validation messages. |
| Database | Write fails or takes too long? | Do not show success. Return a retry-safe error and log the failure. |
| Network | Request times out? | Apply a timeout rule and let the user retry safely. |
| External service | Third-party API unavailable? | Not applicable in version one — no external services (`Q-007`). |
| Background job | Job fails after the user left the page? | Not applicable in version one — no background jobs. |

### 9.3 Failure states

```
- Failure state: RECIPE_SAVE_FAILED
  - Trigger:        The database write for a new or edited recipe fails.
  - Recovery path:  The action is not reported as saved; the form is returned with input intact.
  - User message:   "We could not save your recipe right now. Please try again."
  - Log event:      RECIPE_SAVE_FAILED with account id and a safe error code (no recipe content)
  - Test case:      see failure-tests.md (Round 7)
```

| Error state | Recovery path | What to test |
|---|---|---|
| Save fails | Return a retry-safe error; keep the cook's input. | A simulated save failure does not report success and preserves input. |
| Empty week | Show an empty list with a clear message. | Generating from a week with no meals yields an empty list, not an error (AC-003). |
| Not signed in | Ask the user to sign in. | A protected action while signed out returns 401. |
| Another account's data | Safe not-found. | A request for a week the account does not own is denied (BR-002). |

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
| Generate shopping list (read-only) | Yes | 1 | brief | Show a retry-safe error message |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures, and
> hammered dependencies.

### 9.5 Background jobs and queues (Ch. 22 §22.6)

None in version one — every action is synchronous. Revisit if list generation becomes slow
enough to move off the request path (`Q-010`).

### 9.6 Logging requirements (Ch. 22 §22.4)

| Log requirement | Good practice |
|---|---|
| Event name | Clear names such as `RECIPE_SAVE_FAILED`, `LIST_GENERATED`. |
| Severity | Use `info`, `warning`, `error`, `critical` consistently. |
| Request / correlation ID | Attach a request ID so related events can be traced. |
| Safe context | Account ID and action — never recipe content, photos, or credentials. |
| Failure reason | Error type or safe error code, not a sensitive dump. |
| Outcome | Whether the system recovered, retried, or stopped safely. |

**Must never be logged:** passwords · tokens · reset links · full secret values · recipe and
plan content · photos (`REQ-NF-007`; full list is `Q-012`).

**Structured log example**
```json
{
  "level": "error",
  "event": "recipe_save_failed",
  "request_id": "REQ-20491",
  "account_id": "ACC-118",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "recovery_action": "user_can_retry"
}
```

### 9.7 User-facing error messages (Ch. 22 §22.7)

| Weak message | Better message | Why it is better |
|---|---|---|
| `DatabaseError: connection refused` | "We could not save your changes right now. Please try again." | Understandable; reveals no internals. |
| `Invalid request` | "Please enter a recipe title before saving." | Tells the user exactly what to fix. |
| `Unauthorized` | "You do not have permission to view this." | Explains without exposing security details. |
| `Job failed` | "We could not generate your list. Please try again." | Gives a next action. |

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
| None in version one (`Q-007`). | No external failure can take a capability down; revisit this table if a dependency is added. |

---


## 11. Testing Approach

| Level | Strategy |
|---|---|
| Unit | The core list-generation logic (gathering a week's ingredient lines into one list) — the fullest coverage, since it is what Pantry competes on. |
| Integration | API + data layer with `account_id` scoping; a planned meal must reference an owned recipe. |
| End-to-end | Plan a week → generate one list → tick items off (the core flow). |
| Security | Ownership deny tests: no cross-account read or write (BR-002). |
| Performance | The list-generation flow, once the target is set (`Q-010`). |
| Regression | Every fixed failure keeps a test. |

→ [`../tests/test-plan.md`](../../03-tests/01-plan/test-plan.md)

---

## 12. Deployment Approach

| Area | Summary |
|---|---|
| Environments | local and production; whether a test environment sits between them is deferred (`Q-015`). |
| Configuration | By environment variable; no secret in source (see §7.5). |
| Migrations | Reversible; plan set in Round 8 — the schema must move from SQLite to Postgres unchanged. |
| Rollback | Plan set in Round 8; a rollback must not lose the recipe library. |
| Monitoring | Baseline structured logs + error alerts; the appetite is deferred (`Q-016`). |

The deployment target itself is not yet chosen (`Q-017`); plan for a container so the choice
stays open.

→ [`../ops/deployment-checklist.md`](../../07-ops/01-deployment/deployment-checklist.md) ·
[`../ops/maintenance-notes.md`](../../07-ops/03-maintenance/maintenance-notes.md)

---

## 13. Open Decisions

*Unresolved choices that must **not** be guessed by the AI agent.*

→ [`open-questions.md`](../01-intent/open-questions.md)

| ID | Decision needed | Owner | Must be resolved before |
|---|---|---|---|
| Q-009 | The authentication model (built-in sessions vs. an adopted provider). | Developer | Building sign-in |
| Q-010 | The concrete speed target for the core list-generation flow. | Developer | Setting the performance fitness function |
| Q-005 | Any hard constraints (budget, mandated technology, storage limits). | Developer | Locking the architecture |
| Q-017 | The deployment target. | Developer | Deployment |

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

---

> Blueprint: blueprints/01-docs/04-technical-spec/technical-spec.md
