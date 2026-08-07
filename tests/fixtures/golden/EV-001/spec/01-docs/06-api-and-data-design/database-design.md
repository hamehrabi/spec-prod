# Database Design

> Source: Ch. 7 §7.6, Ch. 9 §9.2–9.3, Appendix E.
> **Beginner rule:** a schema should make invalid data *harder to store*. Do not rely
> only on code to protect important rules.

---

## 1. Entity model (meaning before storage)

Identify what the system must remember, before you design tables.

| Entity | Purpose | Key fields | Relationships | Rule that must always be true |
|---|---|---|---|---|
| Account | The single cook using the app. | id, email, password_hash, created_at | Owns everything below. | Email is unique. |
| Recipe | A saved recipe. | id, account_id, title, created_at | Belongs to one account; has many ingredient lines. | Has a title and at least one ingredient line (BR-002). |
| IngredientLine | One ingredient of a recipe. | id, recipe_id, text, quantity, unit | Belongs to one recipe. | Belongs to exactly one recipe. |
| WeeklyPlan | A week's set of chosen meals. | id, account_id, week_start, created_at | Belongs to one account; has many planned meals. | Belongs to exactly one account. |
| PlannedMeal | One recipe chosen into a weekly plan. | id, weekly_plan_id, recipe_id, day | Links a plan to a recipe. | References a recipe the same account owns. |
| ShoppingList | One list generated from a weekly plan. | id, account_id, weekly_plan_id, created_at | Belongs to one account; generated from one plan; has many items. | Generated from exactly one weekly plan (BR-001). |
| ShoppingListItem | One line of a shopping list. | id, shopping_list_id, text, quantity, unit, checked | Belongs to one shopping list. | Belongs to exactly one shopping list. |

| Question | Your answer |
|---|---|
| What objects must the system remember? | Account, Recipe, IngredientLine, WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem. |
| What details describe each object? | See key fields above. |
| How do objects relate? | Account owns recipes and weekly plans; a plan has planned meals (recipes); a shopping list is generated from one plan and has items. |
| What rule must always be true? | Every row belongs to exactly one account and is private to it (BR-003). |

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
- created_at: datetime, required

ingredient_lines
- id: string, primary key
- recipe_id: string, required, foreign key -> recipes.id
- text: string, required          -- the ingredient as written, e.g. "2 onions"
- quantity: decimal, optional
- unit: string, optional          -- e.g. g, ml, tbsp, whole

weekly_plans
- id: string, primary key
- account_id: string, required, foreign key -> accounts.id
- week_start: date, required
- created_at: datetime, required

planned_meals
- id: string, primary key
- weekly_plan_id: string, required, foreign key -> weekly_plans.id
- recipe_id: string, required, foreign key -> recipes.id
- day: string, optional           -- which day of the week

shopping_lists
- id: string, primary key
- account_id: string, required, foreign key -> accounts.id
- weekly_plan_id: string, required, foreign key -> weekly_plans.id
- created_at: datetime, required

shopping_list_items
- id: string, primary key
- shopping_list_id: string, required, foreign key -> shopping_lists.id
- text: string, required
- quantity: decimal, optional
- unit: string, optional
- checked: boolean, required, default false
```

> Types are kept generic on purpose so the same schema holds whether the store is SQLite or
> Postgres (see `05-architecture/decisions.md`).

---

## 4. Schema concepts (Ch. 9 §9.3)

| Item | Meaning | Example |
|---|---|---|
| Primary key | Unique identifier for one row. | `accounts.id` |
| Foreign key | Field pointing to another table. | `recipes.account_id` |
| Unique constraint | Prevents duplicates. | `accounts.email` must be unique |
| Index | Makes common lookups faster. | index `recipes` by `account_id` |
| Status field | Controlled value showing state. | `shopping_list_items.checked` |

---

## 5. Ownership and isolation rules

Every query must be scoped correctly. State the rule explicitly so the agent cannot
"forget" it.

| Entity | Scoping rule |
|---|---|
| Account | The root; a cook only ever accesses their own account. |
| Recipe, WeeklyPlan, ShoppingList | Every read/write scoped by `account_id`. |
| IngredientLine, PlannedMeal, ShoppingListItem | Scoped through their parent to the same `account_id`. |

> Cross-account / multi-tenant isolation beyond single-user: [TODO: does data need to be
> isolated between customers? — Q-005]

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
| Recipe, WeeklyPlan, ShoppingList and their children | Until the cook deletes them | Hard delete; children deleted with their parent. |
| Account | Until the cook closes the account | Hard delete; all owned data removed with it. |

---

## 8. Migration plan

→ [`../ops/database-migration-plan.md`](../../07-ops/01-deployment/database-migration-plan.md)

| Migration question | Answer |
|---|---|
| Is the migration reversible? | Provide an up and a down migration for every change. |
| Will existing data break? | Backfill missing values before making a field required. |
| Can code and database deploy safely? | Deploy the schema change before code that depends on it. |
| Is downtime required? | Not at single-user scale; use a staged migration if that changes. |

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

> **Resolved (Round 6, Q-008): yes** — the cook can upload photos of finished dishes, private
> to their own account.

| Item | Decision |
|---|---|
| What is stored | Photos of finished dishes, uploaded by the cook. |
| Where | Private storage — a local `uploads/` directory now, a private object-store bucket later. |
| **Max size** per file | A per-photo size cap is required (suggested ~10 MB); the exact limit is configuration. |
| Allowed types | Image types only (JPEG, PNG, WebP) — an allow-list. |
| Type verified by | Content inspection, not the file extension. |
| Naming | A generated ID; the original filename is kept only as a display field. |
| Access control | Served only to the owning account — a signed, expiring URL or an authorizing proxy endpoint; never a public URL. |
| Public or private | Private to one account. |
| Malware scanning | Not required in v1 (single user uploading their own photos); revisit if sharing is added. |
| Retention / cleanup | Deleted with the recipe or account; an orphan-cleanup job removes files with no owning row. |
| Backed up | → [`../../07-ops/01-deployment/backup-and-recovery.md`](../../07-ops/01-deployment/backup-and-recovery.md) |

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

> Blueprint: blueprints/01-docs/06-api-and-data-design/database-design.md
