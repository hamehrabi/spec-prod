# Database Migration Plan

> Source: Ch. 23 §23.6.
> **Deployment caution:** never treat database changes as ordinary code changes. A broken
> file can be fixed and redeployed. A careless database change can damage production data.

AI-generated code may create models or queries but forget the release path. Require
migration planning in the specification.

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
| MIG-001 | | | Yes / No | schema→code | No | Planned |

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

---

# WORKED EXAMPLE — ProjectBoard

| ID | Date | Change | Reversible? | Deploy order | Downtime | Status |
|---|---|---|---|---|---|---|
| MIG-001 | 2026-03-04 | Create `users`, `projects`, `tasks` | Yes | schema → code | No | Applied |
| MIG-002 | 2026-03-18 | Add `tasks.priority` | Yes | schema → code | No | Applied |
| MIG-003 | 2026-04-03 | Add index `tasks(project_id, status)` | Yes | schema → code | No | Applied |
| MIG-004 | 2026-04-04 | Create `export_jobs` table | Yes | schema → code | No | Applied |
| MIG-005 | *(planned)* | Make `tasks.assignee_id` NOT NULL | **Staged — see below** | 4 steps | No | Not started |

## MIG-002 — adding a column safely

```
Migration ID:               MIG-002
Date:                       2026-03-18
Related requirement / task: REQ-F-004 / TASK-010

Change:                     Add `priority` (enum low|medium|high) to tasks
Reason:                     Users need to distinguish urgent work

Up migration:               ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) NULL
Down migration:             ALTER TABLE tasks DROP COLUMN priority

Existing data impact:       None - added nullable, so all 1,240 existing rows stay valid
Backfill plan:              None required; NULL means "unset" in the UI
Deploy order:               Schema first, then the code that writes the field
Downtime required:          No
Lock risk:                  Low - nullable add, table under 10k rows
Verification query:         SELECT COUNT(*) FROM tasks WHERE priority IS NOT NULL;  -- 0
Rollback procedure:         Run down migration; the code tolerates a missing field
Tested on:                  Staging copy of production data (1,240 rows)
```

## MIG-005 — the one that must be staged

Making `assignee_id` required cannot be one migration. 312 existing tasks have no assignee.

| Step | Action | Reversible? |
|---|---|---|
| 1 | Ship UI + API change so new tasks always set an assignee | Yes — revert the code |
| 2 | Backfill the 312 unassigned tasks to the project owner | Yes — recorded in a backup table |
| 3 | Verify `SELECT COUNT(*) FROM tasks WHERE assignee_id IS NULL` returns 0 | n/a |
| 4 | Apply the `NOT NULL` constraint | Yes — drop the constraint |

A single "add NOT NULL" migration would have failed at step 4 **after** locking the table,
leaving the deploy half-applied.

## Pre-migration checklist — MIG-003

- [x] Tested on staging data resembling production
- [x] Down migration exists
- [x] Backfill plan written (none needed)
- [x] Deploy order explicit — schema before code
- [x] Backup / restore point confirmed
- [x] Verification query written **before** running
- [x] Rollback owner named
- [x] `database-design.md` updated with the new index

> **What the checklist caught:** MIG-003 was originally sequenced *after* the pagination
> code. The index exists to make that code fast — running it second meant the first
> production query would scan unindexed. Reordered to schema-first.
