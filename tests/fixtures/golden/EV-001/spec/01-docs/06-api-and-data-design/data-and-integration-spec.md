# Data, API, and Integration Specification

> Source: Ch. 9 §9.7–9.9 — "Technical Specification Template: Data, API, and Integration".
> Use this when a feature crosses the boundary into an external service.

**Feature name:** Shopping-list generation, and the recipe and plan data it reads
**Requirement:** REQ-F-005

**This document is the crossing-the-boundary view.** The entity model and the endpoint
contracts are defined once, in [`database-design.md`](database-design.md) and
[`api-specification.md`](api-specification.md), and summarised here rather than repeated —
two copies of a schema disagree within a week and both look authoritative.

---

## 1. Entities

- **Recipe** — a saved dish. Key fields: `account_id`, `title`. Has many ingredient lines.
- **IngredientLine** — the thing, how much, in what unit. Belongs to one recipe.
- **WeeklyPlan** — seven consecutive days. Has many planned meals.
- **PlannedMeal** — one recipe on one day, `day_offset` 0 to 6.
- **ShoppingList / ShoppingListItem** — the consolidated snapshot of a plan, and its lines.
- **Account** — the one cook; every row above resolves to exactly one.

Full definitions → [`database-design.md` §1](database-design.md).

## 2. Database rules

- Primary keys: every table has a single-column identifier.
- Foreign keys: ingredient lines → recipes; planned meals → plans and recipes; shopping list
  items → shopping lists.
- Unique constraints: `(shopping_list_id, ingredient_name, unit)` — this one is BR-001 made
  structural, not a tidiness rule.
- Required indexes: `recipes.account_id`; `ingredient_lines.ingredient_name` for REQ-F-002.
- Deletion behavior: ingredient lines cascade with their recipe; a recipe on a plan cannot be
  deleted at all (BR-004); shopping list items cascade with their list.

## 3. API endpoints

- Method and path: `POST /api/v1/plans/{plan_id}/shopping-list`
- Purpose: consolidate the plan's week into one list.
- Permission: authenticated cook, and the plan must be theirs — otherwise 404, never 403.
- Request body: none; the plan is the input and the path identifies it.
- Success response: `201 Created` with the list and its items.
- Error responses: 400 empty plan · 401 not authenticated · 404 not this account's plan · 500.

Full index and contracts → [`api-specification.md`](api-specification.md).

## 4. Validation rules

- Required fields: recipe title; ingredient name; plan start date; `day_offset`.
- Allowed values: `day_offset` 0 to 6 (BR-003).
- Relationship checks: a recipe placed on a plan must belong to the plan's account.
- Permission checks: every read and write is scoped by account **in the query**, not after it.

## 5. Integration rules

An integration connects your system to something outside it: payments, email, calendars,
identity providers, storage, analytics, AI model APIs. Outside services fail, change,
rate-limit, and return the unexpected — specify that **before** implementation.

**No external service is specified here, and that is not the same as none being needed.**

External dependencies are Round 6's question. Two are already visible as *possible*, and both
are held open rather than assumed:

| Candidate | Why it might exist | What is blocking it |
|---|---|---|
| Identity provider | Sign-in is a generic subdomain, and generic says buy. | `CON-006` — whether a paid service is allowed. The subdomain map holds the same row open. |
| Object storage | Only if recipes can be captured as photos. | [TODO: is capturing a recipe manual entry, a link, a photo, or more than one of these?] |

**Neither is written into the table below**, because a provider named before it is chosen
becomes the choice. The rows stay empty of *providers* while the rules that will apply to any
provider are stated, because those do not depend on which one it turns out to be.

| Item | Definition |
|---|---|
| Provider | [TODO: which external services will this system depend on?] |
| Purpose | [TODO: which external services will this system depend on?] |
| Data sent | [TODO: which external services will this system depend on?] |
| Data received | [TODO: which external services will this system depend on?] |
| Data stored | [TODO: which external services will this system depend on?] |
| Timeout | Every outbound call has one. A call with no timeout is a hang, and a hang is an outage with better manners. |
| Retry rule | Bounded, and only for transient network and 5xx errors. Never for a rejection — retrying a refusal is a way to be rate-limited for being wrong repeatedly. |
| Idempotency | Required before any retry is added. An operation retried without it produces duplicates, and a duplicated sign-up or a duplicated upload is a support ticket nobody can explain. |
| Failure behavior | The cook sees a plain message and keeps whatever they typed. Their recipes and plans are local data and stay readable when anything external is down. |
| Security rule | Secrets come from the environment, never the repository and never the frontend. Tokens are never stored in plain text. |
| Rate limits | [TODO: which external services will this system depend on?] |

> **Security reminder (Ch. 9 §9.7):** never design an integration that exposes secrets to
> the frontend or stores tokens in plain text.

**The six rules written above hold for every provider**, so writing them costs nothing and
leaving them blank would have implied they were also waiting on Round 6. They are not.

## 6. Versioning rules

- Current version: v1
- Breaking-change policy: [TODO: which quality attributes matter most, and what measurable limit does each have?]
- Compatibility notes: one client, shipped with the API. A breaking change costs a coordinated
  deploy rather than a migration window — a fact about today's shape, not a policy.

---

## Integration checklist

- [ ] Provider, purpose, and data flow are documented in both directions.
- [x] Timeout is set — the system never waits forever.
- [x] Retries are bounded and only applied to safe (idempotent) operations.
- [x] Failure behavior is defined, including what the user sees.
- [x] Secrets are configured through the environment, never hardcoded.
- [ ] Failure paths have tests (`../tests/edge-cases-and-failures.md`).
- [ ] Monitoring covers this integration (`../ops/monitoring-plan.md`).

Four of the seven are ticked without a provider being named, because they are rules about how
this system treats *any* outside service. The three unticked ones need a provider, a test
suite, and a monitoring plan — Round 6, Round 7, and Round 8 respectively.

---

**Next:** [`../03-product-spec/product-spec.md`](../03-product-spec/product-spec.md)

> Blueprint: blueprints/01-docs/06-api-and-data-design/data-and-integration-spec.md
