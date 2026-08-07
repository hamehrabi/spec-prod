# Data, API, and Integration Specification

> Source: Ch. 9 §9.7–9.9 — "Technical Specification Template: Data, API, and Integration".
> Use this when a feature crosses the boundary into an external service.

**Feature name:** Pantry — data and integration overview
**Requirement:** REQ-F-001 … REQ-F-005

---

## 1. Entities

- **Account** — the single cook.
  - Key fields: id, email, password_hash
  - Relationships: owns recipes, weekly plans, shopping lists
- **Recipe / IngredientLine** — a saved recipe and its ingredients.
- **WeeklyPlan / PlannedMeal** — a week's chosen meals.
- **ShoppingList / ShoppingListItem** — one list generated from a plan.

Full field detail: [`database-design.md`](database-design.md).

## 2. Database rules

- Primary keys: `id` on every table.
- Foreign keys: every child references its parent; all trace back to `accounts.id`.
- Unique constraints: `accounts.email`.
- Required indexes: `recipes.account_id`, `weekly_plans.account_id`, `shopping_lists.account_id`.
- Deletion behavior: hard delete; children removed with their parent.

## 3. API endpoints

Full contract: [`api-specification.md`](api-specification.md). All endpoints are scoped to
the signed-in account.

## 4. Validation rules

- Required fields: recipe title and at least one ingredient line (BR-002).
- Allowed values: `shopping_list_items.checked` is boolean.
- Relationship checks: a planned meal must reference a recipe the same account owns.
- Permission checks: only the account owner may read or write their data.

## 5. Integration rules

An integration connects your system to something outside it: payments, email, calendars,
identity providers, storage, analytics, AI model APIs. Outside services fail, change,
rate-limit, and return the unexpected — specify that **before** implementation.

> **Resolved (Round 6, Q-007): none in version one.** Pantry depends on no external services,
> so there are no integration blocks and no paid-API rate limit to manage.

| Item | Definition |
|---|---|
| Provider | None in version one. |
| Purpose | — |
| Data sent | — |
| Data received | — |
| Data stored | — |
| Timeout | — |
| Retry rule | — |
| Idempotency | — |
| Failure behavior | — |
| Security rule | Secrets, if any, come from the environment — never hardcoded, never sent to the frontend. |
| Rate limits | None — no external or paid API. |

> **Security reminder (Ch. 9 §9.7):** never design an integration that exposes secrets to
> the frontend or stores tokens in plain text.

## 6. Versioning rules

- Current version: v1
- Breaking-change policy: additive within v1; renames or removals require v2.
- Compatibility notes: consumed only by the Pantry web UI.

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
