# Database Design

> Source: Ch. 7 §7.6, Ch. 9 §9.2–9.3, Appendix E.
> **Beginner rule:** a schema should make invalid data *harder to store*. Do not rely
> only on code to protect important rules.

---

## 1. Entity model (meaning before storage)

Identify what the system must remember, before you design tables.

| Entity | Purpose | Key fields | Relationships | Rule that must always be true |
|---|---|---|---|---|
| Account | The single home cook's account. | id, email, password_hash, created_at | Owns all recipes, weekly plans, and lists. | Email is unique; all data belongs to one account. |
| Recipe | A saved recipe. | id, account_id, title, notes, created_at | Belongs to one account; has many ingredient lines; referenced by planned meals. | Belongs to exactly one account. |
| IngredientLine | One ingredient of a recipe. | id, recipe_id, name, quantity, unit, position | Belongs to one recipe. | Belongs to exactly one recipe. |
| WeeklyPlan | A week of chosen meals. | id, account_id, week_start_date, created_at | Belongs to one account; has many planned meals; has one shopping list. | One plan per account per week. |
| PlannedMeal | A saved recipe chosen for a day of the week. | id, weekly_plan_id, recipe_id, day_of_week | Belongs to one weekly plan; references one recipe. | Its recipe belongs to the same account as its plan. |
| ShoppingList | The one list generated from a weekly plan. | id, weekly_plan_id, generated_at | Belongs to exactly one weekly plan (one-to-one). | Exactly one shopping list per weekly plan. |
| ShoppingListItem | One line on the shopping list. | id, shopping_list_id, ingredient_name, quantity, unit, checked | Belongs to one shopping list. | Every item traces to the plan's planned meals. |

| Question | Your answer |
|---|---|
| What objects must the system remember? | Account, Recipe, IngredientLine, WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem. |
| What details describe each object? | See the key fields above and the schema in §3. |
| How do objects relate? | Account owns recipes and weekly plans; a plan has planned meals (each a recipe) and one shopping list of items. |
| What rule must always be true? | A shopping list belongs to exactly one weekly plan and gathers that week's meals' ingredients (the core rule). |

---

## 2. Entity definition template (Appendix E)

Copy per table.

```
Table: [name]
Purpose: [what real-world object or concept it stores]

Fields:
- id:          UUID, required, primary key
- owner_id:    UUID, required, foreign key -> users.id
- title:       string, required, max 120 chars
- description: text, optional
- status:      enum(todo, doing, done), required, default 'todo'
- due_date:    date, optional
- created_at:  timestamp, required
- updated_at:  timestamp, required

Primary key:      id
Relationships:    [one-to-one / one-to-many / many-to-many links]
Indexes:          owner_id, status, due_date
Constraints:      [uniqueness, foreign keys, required fields, allowed values]
Sensitive data:   [personal, confidential, or security-sensitive fields]
Migration notes:  [how schema changes will be applied safely]
Retention rules:  [how long data is kept and when it is deleted]
```

---

## 3. Schema

```
accounts
- id: string, primary key
- email: string, required, unique
- password_hash: string, required
- created_at: datetime, required

recipes
- id: string, primary key
- account_id: string, required, foreign key -> accounts.id
- title: string, required, max 200
- notes: text, optional
- created_at: datetime, required
- updated_at: datetime, required

ingredient_lines
- id: string, primary key
- recipe_id: string, required, foreign key -> recipes.id   -- on delete cascade
- name: string, required
- quantity: decimal, optional
- unit: string, optional
- position: integer, required   -- order within the recipe

weekly_plans
- id: string, primary key
- account_id: string, required, foreign key -> accounts.id
- week_start_date: date, required
- created_at: datetime, required
- unique (account_id, week_start_date)   -- one plan per account per week

planned_meals
- id: string, primary key
- weekly_plan_id: string, required, foreign key -> weekly_plans.id   -- on delete cascade
- recipe_id: string, required, foreign key -> recipes.id            -- on delete restrict (BR-004)
- day_of_week: string, required   -- which day/slot in the week
- created_at: datetime, required

shopping_lists
- id: string, primary key
- weekly_plan_id: string, required, unique, foreign key -> weekly_plans.id   -- one list per plan (core rule)
- generated_at: datetime, required

shopping_list_items
- id: string, primary key
- shopping_list_id: string, required, foreign key -> shopping_lists.id   -- on delete cascade
- ingredient_name: string, required
- quantity: decimal, optional
- unit: string, optional
- checked: boolean, required, default false
```

> The schema uses portable types only (string, text, date, datetime, decimal, boolean,
> integer) so it stands on an embedded relational store now and moves to a server relational
> store later without a shape change (data-store choice: `technical-spec`, Round 5).

> ### The core subdomain's rule belongs HERE, not only in prose
>
> [`subdomain-map.md`](../01-intent/subdomain-map.md) names exactly one **core** subdomain — the
> one thing the product competes on. Whatever makes that thing correct is the rule most worth
> enforcing in the store, and the one a reader is most likely to assume is already handled.
>
> **The core rule — one shopping list per week, gathering that week's meals — is enforced in
> the schema, not only in prose:**
>
> - `shopping_lists.weekly_plan_id` is **unique** and a foreign key → a plan has at most one
>   list, and a list cannot exist without a plan (BR-001). Refusal: a second `INSERT` for the
>   same plan fails the unique constraint.
> - `planned_meals.recipe_id` foreign key with **on delete restrict** → a recipe cannot be
>   deleted while a plan references it (BR-004). Refusal: the `DELETE` fails.
> - `weekly_plans (account_id, week_start_date)` is **unique** → one plan per account per week.
> - Every table chains to `accounts.id`, so ownership (BR-002) is a foreign-key fact, not a
>   convention.
>
> The one rule that a constraint cannot fully express — that every `shopping_list_item`
> reflects the plan's planned meals — is enforced in the list-generation service and proven by
> the acceptance test for REQ-F-004 (AC-002/AC-003).

---

## 4. Schema concepts (Ch. 9 §9.3)

| Item | Meaning | Example |
|---|---|---|
| Primary key | Unique identifier for one row. | `accounts.id` |
| Foreign key | Field pointing to another table. | `recipes.account_id` |
| Unique constraint | Prevents duplicates. | `shopping_lists.weekly_plan_id` must be unique |
| Index | Makes common lookups faster. | index `recipes` by `account_id` |
| Status field | Controlled value showing state. | `shopping_list_items.checked` true/false |

---

## 5. Ownership and isolation rules

Every query must be scoped correctly. State the rule explicitly so the agent cannot
"forget" it.

| Entity | Scoping rule |
|---|---|
| Recipe, WeeklyPlan | All reads/writes are scoped by `account_id`. |
| IngredientLine | Scoped through `recipe_id` → `recipes.account_id`. |
| PlannedMeal | Scoped through `weekly_plan_id` → `weekly_plans.account_id`; the referenced recipe must share that account. |
| ShoppingList, ShoppingListItem | Scoped through `weekly_plan_id` → the owning account. |

> Baseline scoping is by `account_id`; a cook must never reach another account's data by
> guessing an ID. The formal cross-account **isolation guarantee level** (e.g. whether row
> scoping is enough or stronger tenant separation is required) was not asked at express depth —
> [TODO: does data need to be isolated between accounts, and to what guarantee? (`Q-006`)].

---

## 6. Sensitive data

| Field | Sensitivity | Storage rule | Logging rule |
|---|---|---|---|
| `accounts.password_hash` | Credential | Hashed only — never plain text. | Never logged. |
| `accounts.email` | Personal data | Stored; unique index. | Logged only as `account_id`, never the address. |

---

## 7. Retention and deletion

| Data | Retention period | Deletion behavior (hard / soft / archive) |
|---|---|---|
| Recipe (and its ingredient lines) | Until the cook deletes it | Hard delete of the recipe cascades its ingredient lines; blocked while a plan references it (BR-004) |
| WeeklyPlan (with planned meals and shopping list) | Until the cook deletes it | Hard delete cascades its planned meals, shopping list, and items |
| Account | Until account closure | Hard delete cascades all of the account's data |

---

## 8. Migration plan

→ [`../ops/database-migration-plan.md`](../../07-ops/01-deployment/database-migration-plan.md)

| Migration question | Answer |
|---|---|
| Is the migration reversible? | Each migration ships an up and a down step. |
| Will existing data break? | Add columns as nullable and backfill before making them required. |
| Can code and database deploy safely? | Deploy the schema change before code that depends on it. |
| Is downtime required? | No — the tables are small (one user's library); nullable adds do not lock meaningfully. |

> **Deployment caution (Ch. 23):** never treat database changes as ordinary code changes.
> A broken file can be redeployed. A careless database change can damage production data.

---

## Checklist (Ch. 9)

- [ ] Core entities the system must remember are identified.
- [ ] Relationships between entities are clear.
- [ ] Fields, keys, constraints, and indexes are planned.
- [ ] Ownership/tenant scoping is stated for every entity.
- [ ] Sensitive fields are identified with storage and logging rules.
- [ ] Deletion and retention behavior is documented.
- [ ] Migration reversibility is considered.

---

# ADDENDUM — File and Object Storage

> Added to close the storage half of the "database and storage" layer.
> **Skip this section if the system stores no files.** If it does, files are data you are
> responsible for — but almost none of the rules above apply to them.

## Why files need their own rules

| Database rows | Files / objects |
|---|---|
| Transactional | **Not transactional** — the row and the file can disagree |
| Small, bounded | Unbounded until you bound them |
| Backed up together | Backed up **separately**, or not at all |
| Access via query | Access via **URL** — which leaks if unsigned |
| Deleting is a DELETE | Deleting leaves an orphan unless something cleans up |

## Specification

Version one stores files: **photos of finished dishes, private to the one account** (`Q-008`,
answered in Round 6). A photo is referenced from its recipe by a generated object key/path (a
`photo_key` written with the recipe row); the file itself is not a database row.

| Item | Decision |
|---|---|
| What is stored | One optional photo per recipe — a photo of the finished dish. |
| Where | Private object store or a private disk path; never a public bucket. |
| **Max size** per file | Bounded (e.g. a few MB per photo); reject larger uploads. |
| Allowed types | An allow-list of common image types only. |
| Type verified by | Content inspection, not the file extension. |
| Naming | A generated ID/key; never the user-supplied filename (kept only as a display label). |
| Access control | Private to the owning account — served through an endpoint that checks the account, or a signed, expiring URL; never a public URL. |
| Public or private | **Private** to the one account. |
| Malware scanning | Optional at this scale; revisit if photos are ever shared. |
| Retention / cleanup | A photo is deleted with its recipe; an orphaned file is removed by a cleanup step. |
| Backed up | → [`../../07-ops/01-deployment/backup-and-recovery.md`](../../07-ops/01-deployment/backup-and-recovery.md) (Round 8). |

**Write order:** write the file first, then set the recipe's `photo_key`. If the process dies
between the two, the file is a recoverable orphan the cleanup step removes — safer than a recipe
that points at a photo that was never written.

## Rules

- **Never trust the filename.** Store under a generated ID; keep the original name as a
  display field only.
- **Never serve private files from a public URL.** Use signed, expiring URLs, or proxy
  the download through an endpoint that checks authorization — the same rule as any
  other resource.
- **The row and the file are two writes with no transaction between them.** Decide the
  order: write the file first, then the row (leaves recoverable orphans), or row first
  then file (leaves broken references). **File-first is usually safer** — an orphan is
  garbage; a broken reference is a user-visible error.
- **Bound the total, not just each file.** Per-user and per-tenant quotas.
- Orphan cleanup is a **scheduled job**, not a hope.

---

> Blueprint: blueprints/01-docs/06-api-and-data-design/database-design.md
