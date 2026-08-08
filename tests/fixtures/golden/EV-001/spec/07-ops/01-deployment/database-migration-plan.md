# Database Migration Plan

> Source: Ch. 23 §23.6.
> **Deployment caution:** never treat database changes as ordinary code changes. A broken
> file can be fixed and redeployed. A careless database change can damage production data.

AI-generated code may create models or queries but forget the release path. Require
migration planning in the specification.

> **Two rules hold for every migration in Pantry (ADR-002):** every migration is
> **reversible** (an up and a down), and the schema must move **SQLite → Postgres
> unchanged** — no SQLite-only feature, type, or pragma. The store is SQLite now and
> Postgres-ready; nothing may depend on SQLite specifics.

---

## Migration entries

```
Migration ID:
Date:
Related requirement / task:  REQ-### / TASK-###

Change:                      [add table / add column / rename / add index / change type]
Reason:

Up migration:                [what it does]
Down migration:              [how to reverse it — or why it cannot be reversed]

Existing data impact:        [will old rows break? backfill needed?]
Backfill plan:
Deploy order:                [schema first, then code — or code first, then schema]
Downtime required:           Yes / No — [why]
Lock risk:                   [large table? staged migration needed?]
Verification query:          [how you confirm it worked]
Rollback procedure:
Tested on:                   [local / staging with production-like data]
```

| ID | Date | Change | Reversible? | Deploy order | Downtime | Status |
|---|---|---|---|---|---|---|
| MIG-001 | 2026-08-08 | Create initial schema: Account, Recipe, IngredientLine, WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem | Yes | schema→code | No | Planned |

> Later migrations are added here as tasks (TASK-001..006) produce schema change. Keep the
> ADR-002 rules — reversible, portable SQLite→Postgres — for each new row.

---

## The four questions (Ch. 23 §23.6)

| Migration question | Why it matters | Spec example |
|---|---|---|
| Is the migration reversible? | Rollback is harder if the schema cannot return to a previous state. | ADR-002 requires an **up** and **down** for every migration. |
| Will existing data break? | Old rows may not fit new rules. | Backfill missing values **before** making a field required. |
| Can code and database deploy safely? | A code change may expect a column that does not exist yet. | Deploy the schema change **before** the code that depends on it. |
| Is downtime required? | Some changes lock tables or interrupt users. | Single-user app; a short evening window is acceptable, but prefer no-downtime staged migrations for large tables (e.g. many Recipe/IngredientLine rows). |

---

## Safe pattern for adding a required column

1. Add the column as **nullable** with a default.
2. Backfill existing rows.
3. Deploy the code that writes the new value.
4. Only then add the `NOT NULL` constraint.

Each step is independently reversible. A single "add NOT NULL column" migration is not.

---

## Pre-migration checklist

- [ ] Migration tested on staging data that resembles production.
- [ ] Down migration exists **or** the irreversibility is documented and accepted (ADR-002 expects a down).
- [ ] Schema is portable — SQLite → Postgres unchanged, no SQLite-only feature (ADR-002).
- [ ] Backfill plan written for existing rows.
- [ ] Deploy order (schema vs. code) is explicit.
- [ ] Backup or restore point confirmed before running in production (see [`backup-and-recovery.md`](backup-and-recovery.md); the recipe library must never be lost).
- [ ] Verification query written before, not after.
- [ ] Rollback owner named (see [`rollback-plan.md`](rollback-plan.md)).
- [ ] Database design spec updated (`../docs/database-design.md`).

---

> Blueprint: blueprints/07-ops/01-deployment/database-migration-plan.md
