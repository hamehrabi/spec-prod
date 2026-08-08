# Database Design

> Source: Ch. 7 §7.6, Ch. 9 §9.2–9.3, Appendix E.
> **Beginner rule:** a schema should make invalid data *harder to store*. Do not rely
> only on code to protect important rules.

---

## 1. Entity model (meaning before storage)

Identify what the system must remember, before you design tables.

| Entity | Purpose | Key fields | Relationships | Rule that must always be true |
|---|---|---|---|---|
| Account | The home cook using Pantry. | id, email, created_at | Owns all other entities. | Email is unique. |
| Recipe | One saved recipe. | id, account_id, title, notes | Belongs to one account; has many ingredient lines. | A recipe belongs to exactly one account (BR-003). |
| IngredientLine | One ingredient of a recipe. | id, recipe_id, name, quantity, unit, position | Belongs to one recipe. | An ingredient line cannot exist without its recipe. |
| WeeklyPlan | The meals chosen for one week. | id, account_id, week_start_date | Belongs to one account; has many planned meals. | A weekly plan belongs to exactly one account. |
| PlannedMeal | One recipe chosen for the week. | id, weekly_plan_id, recipe_id | Belongs to one weekly plan; references one recipe. | The referenced recipe is saved in the same account (BR-002). |
| ShoppingList | One list generated from one week. | id, weekly_plan_id, created_at | Belongs to one weekly plan; has many items. | Generated from exactly one weekly plan (BR-001). |
| ShoppingListItem | One line to buy. | id, shopping_list_id, name, quantity | Belongs to one shopping list; traces to ingredient lines. | Every ingredient line of the week's planned meals is represented (BR-001). Whether duplicates combine is open ([TODO: when two planned recipes share an ingredient, does the shopping list combine them into one line, or list them separately? — Q-011]). |

| Question | Your answer |
|---|---|
| What objects must the system remember? | Account, Recipe, IngredientLine, WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem — the developer's own list. |
| What details describe each object? | See the key fields above and the schema in §3. |
| How do objects relate? | An account owns recipes and weekly plans; a recipe has ingredient lines; a weekly plan has planned meals that reference recipes; a shopping list belongs to one weekly plan and has items. |
| What rule must always be true? | One account owns everything it sees (BR-003); a shopping list covers every ingredient line of its week (BR-001). |

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
- email: string, required, unique          -- rule: email is unique
- created_at: datetime, required
- [TODO: which authentication model? — Q-009] -- credential fields depend on the answer

recipes
- id: string, primary key
- account_id: string, required, foreign key -> accounts.id   -- rule: BR-003, one owner
- title: string, required
- notes: text, optional
- created_at: datetime, required
- updated_at: datetime, required

ingredient_lines
- id: string, primary key
- recipe_id: string, required, foreign key -> recipes.id     -- rule: no line without its recipe
- name: string, required
- quantity: string, optional
- unit: string, optional
- position: integer, required

weekly_plans
- id: string, primary key
- account_id: string, required, foreign key -> accounts.id   -- rule: one owner
- week_start_date: date, required
- created_at: datetime, required

planned_meals
- id: string, primary key
- weekly_plan_id: string, required, foreign key -> weekly_plans.id
- recipe_id: string, required, foreign key -> recipes.id     -- rule: BR-002 (same-account
                                                             -- check is service-layer; see below)
- created_at: datetime, required

shopping_lists
- id: string, primary key
- weekly_plan_id: string, required, foreign key -> weekly_plans.id  -- rule: BR-001, exactly one plan
- created_at: datetime, required

shopping_list_items
- id: string, primary key
- shopping_list_id: string, required, foreign key -> shopping_lists.id
- name: string, required
- quantity: string, optional
- position: integer, required
-- item-to-ingredient-line tracing depends on Q-011: one line per ingredient line, or
-- one combined line per ingredient name
```

> ### The core subdomain's rule belongs HERE, not only in prose
>
> [`subdomain-map.md`](../01-intent/subdomain-map.md) names exactly one **core** subdomain — the
> one thing the product competes on. Whatever makes that thing correct is the rule most worth
> enforcing in the store, and the one a reader is most likely to assume is already handled.
>
> **Go through §1's "Rule that must always be true" column and, for each rule, write the
> constraint that enforces it above — naming the rule in a trailing comment.** A uniqueness
> constraint, a foreign key, a check constraint, a `not null`.
>
> The question to ask each rule is **"what would the store refuse?"** *A customer may hold only
> one active subscription* is a uniqueness constraint over the customer and that status. *A
> booking cannot end before it starts* is a check constraint. If the honest answer is "nothing
> would be refused", then the rule is not enforced, whatever the prose says.
>
> **If a rule cannot be expressed as a constraint, say where it IS enforced** — a service-layer
> check, a background job — and name the test that would fail if it stopped working. What is
> not allowed is a rule stated in §1 and enforced nowhere: a rule that lives only in a sentence
> is a rule the first refactor removes, and every functional test still passes without it.
>
> This section shipped with primary and foreign keys only, and every generated workspace
> inherited that shape — so a run could name what its product competes on and enforce it
> nowhere, with nothing to notice.

**Where each §1 rule is enforced:** email uniqueness, ownership, and the one-plan-per-list
rule are foreign keys, `not null`, and a unique index above. Two rules cannot be plain
constraints: BR-002's same-account check (a foreign key cannot compare two rows' owners)
is enforced in the service layer, and BR-001's every-line-is-represented rule is enforced
by the generation routine — each is proven by a test written at the test stage, which fails
if the check stops working.

---

## 4. Schema concepts (Ch. 9 §9.3)

| Item | Meaning | Example |
|---|---|---|
| Primary key | Unique identifier for one row. | `users.id` |
| Foreign key | Field pointing to another table. | `tasks.project_id` |
| Unique constraint | Prevents duplicates. | `users.email` must be unique |
| Index | Makes common lookups faster. | index `tasks` by `project_id` |
| Status field | Controlled value showing state. | `todo`, `doing`, `done` |

---

## 5. Ownership and isolation rules

Every query must be scoped correctly. State the rule explicitly so the agent cannot
"forget" it.

| Entity | Scoping rule |
|---|---|
| Recipe, WeeklyPlan | Every read/write is scoped by `account_id`. |
| IngredientLine, PlannedMeal, ShoppingList, ShoppingListItem | Every read/write is scoped through its parent to an account the caller owns. |
| All entities | Isolation between customers is still open: [TODO: does data need to be isolated between customers? — Q-008] |

---

## 6. Sensitive data

| Field | Sensitivity | Storage rule | Logging rule |
|---|---|---|---|
| `password_hash` | Credential | Hashed only — never plain text. Applies only if password authentication is chosen ([TODO: which authentication model? — Q-009]). | Never logged. |
| `accounts.email` | Personal data | Stored; unique index. | [TODO: what must never leak or be logged? — Q-012] |

---

## 7. Retention and deletion

| Data | Retention period | Deletion behavior (hard / soft / archive) |
|---|---|---|
| Recipe, IngredientLine | Until the account holder deletes them. | [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013] |
| WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem | [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013] | [TODO: what are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? — Q-013] |

---

## 8. Migration plan

→ [`../ops/database-migration-plan.md`](../../07-ops/01-deployment/database-migration-plan.md)

| Migration question | Answer |
|---|---|
| Is the migration reversible? | Every migration ships with an up and a down. |
| Will existing data break? | New fields arrive nullable, with a backfill before becoming required. |
| Can code and database deploy safely? | The schema change deploys before the code that depends on it. |
| Is downtime required? | Not at this scale; staged migrations if a table ever grows large. |

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

| Item | Decision |
|---|---|
| What is stored | Photos of finished dishes, uploaded by the account holder (Round 6). Which entity a photo attaches to is part of Q-023. |
| Where | [TODO: what are the photo storage rules — where stored, maximum size, allowed image types, malware scanning, retention, and which entity a photo attaches to? — Q-023] |
| **Max size** per file | [TODO: what are the photo storage rules — where stored, maximum size, allowed image types, malware scanning, retention, and which entity a photo attaches to? — Q-023] |
| Allowed types | Images only (security-specification §3); the exact allow-list is part of Q-023. |
| Type verified by | Content inspection of the file itself, never the extension (security-specification §3). |
| Naming | Stored under a generated ID; the original filename is a display field only (rules below). |
| Access control | Owner-only — readable and deletable solely by the owning account (SEC-Z-002). |
| Public or private | Private to one user (Round 6). |
| Malware scanning | [TODO: what are the photo storage rules — where stored, maximum size, allowed image types, malware scanning, retention, and which entity a photo attaches to? — Q-023] |
| Retention / cleanup | [TODO: what are the photo storage rules — where stored, maximum size, allowed image types, malware scanning, retention, and which entity a photo attaches to? — Q-023] |
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
