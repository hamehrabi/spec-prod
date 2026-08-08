# Data, API, and Integration Specification

> Source: Ch. 9 §9.7–9.9 — "Technical Specification Template: Data, API, and Integration".
> Use this when a feature crosses the boundary into an external service.

**Feature name:** Generate one shopping list from a weekly plan (the core capability)
**Requirement:** REQ-F-003

---

## 1. Entities

- **ShoppingList** — one list generated from one weekly plan.
  - Key fields: id, weekly_plan_id, created_at
  - Relationships: belongs to one WeeklyPlan; has many ShoppingListItems.
- **ShoppingListItem** — one line to buy at the shop.
  - Key fields: id, shopping_list_id, name, quantity, position
  - Relationships: belongs to one ShoppingList; traces to the ingredient lines it covers.

Full entity model → [`database-design.md`](database-design.md) §1.

## 2. Database rules

- Primary keys: every table has `id`.
- Foreign keys: `shopping_lists.weekly_plan_id → weekly_plans.id`; `shopping_list_items.shopping_list_id → shopping_lists.id`.
- Unique constraints: `accounts.email` (→ [`database-design.md`](database-design.md) §3).
- Required indexes: → [`database-design.md`](database-design.md) §3.
- Deletion behavior: [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013]

## 3. API endpoints

- Method and path: `POST /api/v1/weekly-plans/{plan_id}/shopping-list` — full contract in [`api-specification.md`](api-specification.md).
- Purpose: turn the week's planned meals into one shopping list.
- Permission: the account holder who owns the plan (REQ-R-001).
- Request body: none — the plan is identified by the path.
- Success response: → [`api-specification.md`](api-specification.md).
- Error responses: → [`api-specification.md`](api-specification.md).

## 4. Validation rules

- Required fields: the weekly plan must exist and belong to the caller.
- Allowed values: none beyond the schema — the request carries no fields.
- Relationship checks: every planned meal references a recipe saved in the same account (BR-002).
- Permission checks: owner-only, before any data is read (REQ-R-001).

## 5. Integration rules

An integration connects your system to something outside it: payments, email, calendars,
identity providers, storage, analytics, AI model APIs. Outside services fail, change,
rate-limit, and return the unexpected — specify that **before** implementation.

| Item | Definition |
|---|---|
| Provider | None — no external services in version one (Round 6, Q-014). |
| Purpose | n/a — no integration exists. |
| Data sent | None — no data leaves the system. |
| Data received | None. |
| Data stored | None from any third party. |
| Timeout | n/a — there is no external call to time out. |
| Retry rule | n/a. |
| Idempotency | n/a. |
| Failure behavior | n/a — there is no external service to fail. |
| Security rule | No third-party secret exists to protect; nothing external receives user data. |
| Rate limits | None needed — no paid API is used (Round 6, Q-014). |

> **Security reminder (Ch. 9 §9.7):** never design an integration that exposes secrets to
> the frontend or stores tokens in plain text.

## 6. Versioning rules

- Current version: API v1.0 (→ [`api-specification.md`](api-specification.md))
- Breaking-change policy: → [`api-specification.md`](api-specification.md)
- Compatibility notes: → [`api-specification.md`](api-specification.md)

---

## Integration checklist

- [ ] Provider, purpose, and data flow are documented in both directions.
- [ ] Timeout is set — the system never waits forever.
- [ ] Retries are bounded and only applied to safe (idempotent) operations.
- [ ] Failure behavior is defined, including what the user sees.
- [ ] Secrets are configured through the environment, never hardcoded.
- [ ] Failure paths have tests (`../tests/edge-cases-and-failures.md`).
- [ ] Monitoring covers this integration (`../ops/monitoring-plan.md`).

> Blueprint: blueprints/01-docs/06-api-and-data-design/data-and-integration-spec.md
