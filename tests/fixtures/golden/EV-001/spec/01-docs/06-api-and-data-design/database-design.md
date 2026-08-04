# Database Design

> Source: Ch. 7 §7.6, Ch. 9 §9.2–9.3, Appendix E.
> **Beginner rule:** a schema should make invalid data *harder to store*. Do not rely
> only on code to protect important rules.

---

## 1. Entity model (meaning before storage)

Identify what the system must remember, before you design tables.

| Entity | Purpose | Key fields | Relationships | Rule that must always be true |
|---|---|---|---|---|
| Account | The one cook who owns everything else. | id, email, created_at | Owns every other row in the system. | Every other entity resolves to exactly one account. |
| Recipe | A saved dish with the things needed to cook it. | id, account_id, title, created_at | Has many ingredient lines. Referenced by planned meals. | A recipe has a title and belongs to one account. |
| IngredientLine | One line of a recipe — the thing, how much, in what unit. | id, recipe_id, ingredient_name, quantity, unit | Belongs to one recipe. | Quantity and unit are either both present or both absent; a quantity without a unit is unusable in a shopping list. |
| WeeklyPlan | Seven consecutive days the cook is planning for. | id, account_id, start_date | Has many planned meals. Produces shopping lists. | Covers exactly seven days from start_date (BR-003). |
| PlannedMeal | One recipe placed on one day of a plan. | id, weekly_plan_id, recipe_id, day_offset | Links a plan to a recipe. | day_offset is 0 to 6. The same recipe may appear on more than one day (BR-003). |
| ShoppingList | The consolidated result of one plan, at one moment. | id, weekly_plan_id, generated_at | Has many items. Belongs to one plan. | Immutable once generated (BR-005). |
| ShoppingListItem | One line to buy — an ingredient, a summed quantity, a unit. | id, shopping_list_id, ingredient_name, quantity, unit | Belongs to one shopping list. | Unique per (list, ingredient_name, unit) — that uniqueness *is* BR-001. |

| Question | Your answer |
|---|---|
| What objects must the system remember? | The cook's account; recipes and their ingredient lines; a weekly plan and the meals placed on its days; the shopping list generated from a plan and its lines. |
| What details describe each object? | See the key fields above. Quantities carry a unit; every owned row carries the account it belongs to. |
| How do objects relate? | Account → recipes and plans. Recipe → ingredient lines. Plan → planned meals → recipes. Plan → shopping lists → items. |
| What rule must always be true? | Two: every row resolves to exactly one account (REQ-NF-002), and a shopping list holds at most one line per ingredient-and-unit (BR-001). |

**The uniqueness constraint on `ShoppingListItem` is the core rule made structural.** BR-001
says identical ingredients combine into one line. Writing that as a database constraint rather
than as a step in the generation code is what makes it hard to break later — a schema should
make invalid data harder to store.

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

> **Field types are named in the abstract**, because the data store is Round 5's question
> ([`Q-014`](../01-intent/open-questions.md)). What is written here is what must be stored and
> what must be true of it; whether `quantity` becomes `NUMERIC(10,3)` or something else is a
> decision the store gets to influence.

```
accounts
- id: identifier, primary key
- email: text, required, unique
- created_at: timestamp, required

recipes
- id: identifier, primary key
- account_id: identifier, required, foreign key -> accounts.id
- title: text, required, max 200
- created_at: timestamp, required

ingredient_lines
- id: identifier, primary key
- recipe_id: identifier, required, foreign key -> recipes.id, cascade on delete
- ingredient_name: text, required, max 100
- quantity: decimal, optional
- unit: text, optional, max 20
- constraint: quantity and unit are both present or both absent

weekly_plans
- id: identifier, primary key
- account_id: identifier, required, foreign key -> accounts.id
- start_date: date, required
- created_at: timestamp, required

planned_meals
- id: identifier, primary key
- weekly_plan_id: identifier, required, foreign key -> weekly_plans.id, cascade on delete
- recipe_id: identifier, required, foreign key -> recipes.id, restrict on delete
- day_offset: integer, required, 0 to 6
- constraint: the same recipe may repeat within a plan, so no uniqueness on (plan, recipe)

shopping_lists
- id: identifier, primary key
- weekly_plan_id: identifier, required, foreign key -> weekly_plans.id
- generated_at: timestamp, required

shopping_list_items
- id: identifier, primary key
- shopping_list_id: identifier, required, foreign key -> shopping_lists.id, cascade on delete
- ingredient_name: text, required, max 100
- quantity: decimal, optional
- unit: text, optional, max 20
- constraint: unique on (shopping_list_id, ingredient_name, unit)   -- BR-001
```

**Three delete behaviours, and they are not the same decision.** Ingredient lines cascade with
their recipe because they have no meaning without it. Planned meals **restrict** the deletion of
a recipe, which is BR-004 written into the schema rather than left to the application. Shopping
list items cascade with their list because the list is a snapshot and a snapshot is deleted
whole.

---

## 4. Schema concepts (Ch. 9 §9.3)

| Item | Meaning | Example |
|---|---|---|
| Primary key | Unique identifier for one row. | `recipes.id` |
| Foreign key | Field pointing to another table. | `ingredient_lines.recipe_id` |
| Unique constraint | Prevents duplicates. | `(shopping_list_id, ingredient_name, unit)` — this one enforces BR-001 |
| Index | Makes common lookups faster. | index `recipes` by `account_id`; index `ingredient_lines` by `ingredient_name` for REQ-F-002 |
| Status field | Controlled value showing state. | none in this design — nothing here has a lifecycle |

---

## 5. Ownership and isolation rules

Every query must be scoped correctly. State the rule explicitly so the agent cannot
"forget" it.

| Entity | Scoping rule |
|---|---|
| Recipe | All reads and writes scoped by `account_id`. |
| WeeklyPlan | All reads and writes scoped by `account_id`. |
| IngredientLine | Reached only through its recipe, and inherits that recipe's scope. Never queried directly by id. |
| PlannedMeal | Reached only through its plan. A planned meal must not reference a recipe belonging to a different account. |
| ShoppingList | Reached only through its plan. |
| ShoppingListItem | Reached only through its list. |

**The rows reached "only through" a parent are the dangerous ones.** They carry no `account_id`
of their own, so a query written directly against them has nothing to scope by and will happily
return another account's data. REQ-R-002 and AC-005 exist to catch exactly that, and this is why
they are written as denials.

**Isolation between accounts was not asked about.** It follows from the permission model the
cook did choose — *single user, no sharing* — and stating it here is repeating their answer.
There is no organisation, tenant, or team in this design, and adding one later changes the
schema rather than a setting.

---

## 6. Sensitive data

| Field | Sensitivity | Storage rule | Logging rule |
|---|---|---|---|
| `accounts.email` | Personal | Stored as given; never exposed on any read path other than the account's own. | Never logged. |
| Credential material | Credential | [TODO: which authentication model does this project use?] | Never logged, whatever the model turns out to be. |
| `recipes.title`, `ingredient_lines.ingredient_name` | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] | Never logged in bulk. |

**There is no `password_hash` row here, and that is not an oversight.** The authentication
model is Round 5's question and the build-or-buy decision is blocked on `CON-006`. A bought
identity provider means this system stores no credential at all, which is a materially
different sensitive-data table — so it is marked rather than guessed.

**The third row is a real question, not a formality.** A week of someone's meals is a record of
what they eat, when, and how much they buy. Whether that is ordinary content or personal data
changes retention and deletion, and nobody has said.

---

## 7. Retention and deletion

| Data | Retention period | Deletion behavior (hard / soft / archive) |
|---|---|---|
| Recipes and ingredient lines | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] | Blocked while a plan references the recipe (BR-004). Otherwise hard delete, with ingredient lines cascading. |
| Weekly plans and planned meals | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] | Hard delete, cascading to planned meals. |
| Shopping lists and items | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] | Hard delete, cascading. A list is a snapshot; keeping old ones has no stated purpose. |
| Account | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] | [TODO: what happens to a cook's recipes and plans when they close their account?] |

**Deletion behaviour is decided; retention is not.** The two are separable, and writing the
half that follows from BR-004 and BR-005 costs nothing while inventing the other half would set
a period nobody chose.

---

## 8. Migration plan

→ [`../ops/database-migration-plan.md`](../../07-ops/01-deployment/database-migration-plan.md)

| Migration question | Answer |
|---|---|
| Is the migration reversible? | *Provide an up and down migration.* |
| Will existing data break? | *Backfill missing values before making a field required.* |
| Can code and database deploy safely? | *Deploy the schema change before code that depends on it.* |
| Is downtime required? | *Use a staged migration for large tables.* |

> **Deployment caution (Ch. 23):** never treat database changes as ordinary code changes.
> A broken file can be redeployed. A careless database change can damage production data.

---

## Checklist (Ch. 9)

- [x] Core entities the system must remember are identified.
- [x] Relationships between entities are clear.
- [x] Fields, keys, constraints, and indexes are planned.
- [x] Ownership/tenant scoping is stated for every entity.
- [x] Sensitive fields are identified with storage and logging rules.
- [ ] Deletion and retention behavior is documented.
- [ ] Migration reversibility is considered.

The last two are unticked on purpose. Deletion is decided and retention is not, and migration
reversibility cannot be considered before the store is chosen in Round 5.

---

# ADDENDUM — File and Object Storage

> Added to close the storage half of the "database and storage" layer.
> **Skip this section if the system stores no files.** If it does, files are data you are
> responsible for — but almost none of the rules above apply to them.

**Whether this section applies is not yet known**, and it turns on one unanswered question:
[TODO: is capturing a recipe manual entry, a link, a photo, or more than one of these?] A photo
means every row of the table below has to be answered before anything is built. Manual entry
means the whole section is skipped, with that reason recorded.

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
| What is stored | Nothing yet — see the question above. If photos are in, recipe images. |
| Where | [TODO: where will this run?] |
| **Max size** per file | [TODO: is capturing a recipe manual entry, a link, a photo, or more than one of these?] |
| Allowed types | [TODO: is capturing a recipe manual entry, a link, a photo, or more than one of these?] |
| Type verified by | Content inspection, never the file extension. This one does not depend on the answer. |
| Naming | Never the user-supplied filename — it is untrusted input. This one does not depend on the answer either. |
| Access control | Signed URLs with expiry, or proxied through the application. A recipe photo is scoped to one account like every other row. |
| Public or private | Private. Nothing in this product is shared (REQ-R-001). |
| Malware scanning | [TODO: is capturing a recipe manual entry, a link, a photo, or more than one of these?] |
| Retention / cleanup | [TODO: is capturing a recipe manual entry, a link, a photo, or more than one of these?] |

**Four rows are answered even though the question is open**, because they do not depend on it:
verify by content, never trust the filename, keep it private, scope it to the account. Those
hold whatever the capture method turns out to be, and leaving them blank would have implied
otherwise.

---

**Next:** [`api-specification.md`](api-specification.md)

> Blueprint: blueprints/01-docs/06-api-and-data-design/database-design.md
