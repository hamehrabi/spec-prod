# Data, API, and Integration Specification

> Source: Ch. 9 §9.7–9.9 — "Technical Specification Template: Data, API, and Integration".
> Use this when a feature crosses the boundary into an external service.

**Feature name:** Version one — data and integrations (Pantry)
**Requirement:** REQ-F-001 – REQ-F-006

---

## 1. Entities

- **Account, Recipe, IngredientLine, WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem** — the full model, key fields, and relationships are defined once in [`database-design.md`](database-design.md) §1.
  - Key fields: see `database-design.md` §1 and §3.
  - Relationships: Account owns recipes and weekly plans; a plan has planned meals and one shopping list of items.

## 2. Database rules

- Primary keys: every table has an `id` primary key (see `database-design.md` §3).
- Foreign keys: the ownership chain to `accounts.id`; `shopping_lists.weekly_plan_id` unique.
- Unique constraints: `accounts.email`; `weekly_plans (account_id, week_start_date)`; `shopping_lists.weekly_plan_id`.
- Required indexes: `recipes.account_id`, `weekly_plans.account_id`, `planned_meals.weekly_plan_id`.
- Deletion behavior: cascade within a plan; recipe delete blocked while referenced (BR-004). See `database-design.md` §7.

## 3. API endpoints

- Defined once in [`api-specification.md`](api-specification.md). No endpoint is repeated here.

## 4. Validation rules

- Defined with the endpoints in [`api-specification.md`](api-specification.md) (required fields, allowed values, relationship and permission checks).

## 5. Integration rules

An integration connects your system to something outside it: payments, email, calendars,
identity providers, storage, analytics, AI model APIs. Outside services fail, change,
rate-limit, and return the unexpected — specify that **before** implementation.

**None.** Version one depends on no external service (`Q-007`, answered in Round 6), so there are
no external integration blocks, and no provider timeout, retry, or rate-limit rules are needed.
If an external service is ever added, complete the integration table (provider, data in/out,
timeout, retry, idempotency, failure behaviour, secrets, rate limits) before implementation.

> **Security reminder (Ch. 9 §9.7):** never design an integration that exposes secrets to
> the frontend or stores tokens in plain text.

## 6. Versioning rules

- Current version: API v1 (see [`api-specification.md`](api-specification.md)).
- Breaking-change policy: additive within v1; renames/removals/type changes ship as v2.
- Compatibility notes: the only client is Pantry's own web UI.

---

## Integration checklist

- [ ] Provider, purpose, and data flow are documented in both directions.
- [ ] Timeout is set — the system never waits forever.
- [ ] Retries are bounded and only applied to safe (idempotent) operations.
- [ ] Failure behavior is defined, including what the user sees.
- [ ] Secrets are configured through the environment, never hardcoded.
- [ ] Failure paths have tests (`../tests/edge-cases-and-failures.md`).
- [ ] Monitoring covers this integration (`../ops/monitoring-plan.md`).

---

> Blueprint: blueprints/01-docs/06-api-and-data-design/data-and-integration-spec.md
