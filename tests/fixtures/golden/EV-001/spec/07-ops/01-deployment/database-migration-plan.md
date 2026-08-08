# Database Migration Plan

> Source: Ch. 23 §23.6.
> **Deployment caution:** never treat database changes as ordinary code changes. A broken
> file can be fixed and redeployed. A careless database change can damage production data.

AI-generated code may create models or queries but forget the release path. Require
migration planning in the specification.

For Pantry every migration must also honour ADR-002: use only relational features SQLite
and Postgres share, so the same migration runs on both.

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
| MIG-001 | — | Create `accounts` (TASK-002 — schema fields wait on Q-009) | Yes | schema → code | No | Blocked on Q-009 |
| MIG-002 | — | Create `recipes` + `ingredient_lines` (TASK-003) | Yes | schema → code | No | Planned |
| MIG-003 | — | Create `weekly_plans` + `planned_meals` (TASK-007) | Yes | schema → code | No | Planned |
| MIG-004 | — | Create `shopping_lists` + `shopping_list_items` (TASK-011) | Yes | schema → code | No | Planned |
| MIG-005 | — | Create the photo table (TASK-017 — fields wait on Q-023) | Yes | schema → code | No | Blocked on Q-023 |

---

## The four questions (Ch. 23 §23.6)

| Migration question | Why it matters | Spec example |
|---|---|---|
| Is the migration reversible? | Rollback is harder if the schema cannot return to a previous state. | Provide an **up** and **down** migration. |
| Will existing data break? | Old rows may not fit new rules. | Backfill missing values **before** making a field required. |
| Can code and database deploy safely? | A code change may expect a column that does not exist yet. | Deploy the schema change **before** the code that depends on it. |
| Is downtime required? | Some changes lock tables or interrupt users. | Use a staged migration for large tables. |

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
- [ ] Down migration exists **or** the irreversibility is documented and accepted.
- [ ] Backfill plan written for existing rows.
- [ ] Deploy order (schema vs. code) is explicit.
- [ ] Backup or restore point confirmed before running in production.
- [ ] Verification query written before, not after.
- [ ] Rollback owner named (see [`rollback-plan.md`](rollback-plan.md)).
- [ ] Database design spec updated (`../docs/database-design.md`).

> Blueprint: blueprints/07-ops/01-deployment/database-migration-plan.md
