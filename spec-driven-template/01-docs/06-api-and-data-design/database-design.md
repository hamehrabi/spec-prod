# Database Design

> Source: Ch. 7 §7.6, Ch. 9 §9.2–9.3, Appendix E.
> **Beginner rule:** a schema should make invalid data *harder to store*. Do not rely
> only on code to protect important rules.

---

## 1. Entity model (meaning before storage)

Identify what the system must remember, before you design tables.

| Entity | Purpose | Key fields | Relationships | Rule that must always be true |
|---|---|---|---|---|
| | | | | |
| | | | | |

| Question | Your answer |
|---|---|
| What objects must the system remember? | |
| What details describe each object? | |
| How do objects relate? | |
| What rule must always be true? | |

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
users
- id: string, primary key
- name: string, required
- email: string, required, unique
- password_hash: string, required
- role: string, required
- created_at: datetime, required

projects
- id: string, primary key
- owner_id: string, foreign key -> users.id
- name: string, required
- description: string, optional
- status: string, required
- created_at: datetime, required

tasks
- id: string, primary key
- project_id: string, foreign key -> projects.id
- title: string, required, max 120
- description: string, optional
- status: string, required   -- todo | in_progress | done
- priority: string, optional -- low | medium | high
- assignee_id: string, optional foreign key -> users.id
- due_date: date, optional
- created_at: datetime, required
- updated_at: datetime, required
```

*Replace the example above with your project's real schema.*

> ### The core subdomain's rule belongs HERE, not only in prose
>
> [`subdomain-map.md`](../01-intent/subdomain-map.md) names exactly one **core** subdomain — the
> one thing the product competes on. Whatever makes that thing correct is the rule most worth
> enforcing in the store, and the one a reader is most likely to assume is already handled.
>
> **Go through §1's "Rule that must always be true" column and, for each rule, write the
> constraint that enforces it above — naming the rule in a trailing comment.** A uniqueness
> constraint, a foreign key, a check constraint, a `not null`. For example, if the core is
> *turning a week of meals into ONE shopping list*, then the same ingredient must not appear on
> a list twice, and that is `unique (shopping_list_id, ingredient_name, unit)` — not a sentence.
>
> **If a rule cannot be expressed as a constraint, say where it IS enforced** — a service-layer
> check, a background job — and name the test that would fail if it stopped working. What is
> not allowed is a rule stated in §1 and enforced nowhere: a rule that lives only in a sentence
> is a rule the first refactor removes, and every functional test still passes without it.
>
> This section shipped with primary and foreign keys only, and every generated workspace
> inherited that shape — so a run could name what its product competes on and enforce it
> nowhere, with nothing to notice.

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
| | All reads/writes must be scoped by `owner_id` / `tenant_id`. |
| | |

---

## 6. Sensitive data

| Field | Sensitivity | Storage rule | Logging rule |
|---|---|---|---|
| `password_hash` | Credential | Hashed only — never plain text. | Never logged. |
| | | | |

---

## 7. Retention and deletion

| Data | Retention period | Deletion behavior (hard / soft / archive) |
|---|---|---|
| | | |

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

- [ ] Core entities the system must remember are identified.
- [ ] Relationships between entities are clear.
- [ ] Fields, keys, constraints, and indexes are planned.
- [ ] Ownership/tenant scoping is stated for every entity.
- [ ] Sensitive fields are identified with storage and logging rules.
- [ ] Deletion and retention behavior is documented.
- [ ] Migration reversibility is considered.

---

## Prompt — identify entities (Prompt box 9.1)

```
Using the requirements below, list the main entities this system must store. For each
entity, identify important fields, relationships, and business rules. Do not create
database tables yet. Focus only on meaning and relationships.
```

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
| What is stored | *uploads, generated exports, avatars…* |
| Where | object store / disk / provider |
| **Max size** per file | *unbounded uploads are a denial-of-service and a bill* |
| Allowed types | *allow-list, not deny-list* |
| Type verified by | **content inspection, not the file extension** |
| Naming | *never the user-supplied filename — it is untrusted input* |
| Access control | **signed URLs with expiry** / proxied through the app |
| Public or private | |
| Malware scanning | |
| Retention / cleanup | *who deletes orphans, and when* |
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

# WORKED EXAMPLE — ProjectBoard

## File storage — CSV exports

The only files ProjectBoard stores. Uploads were explicitly out of scope for v1.

| Item | Decision |
|---|---|
| What | Generated CSV exports (REQ-F-007) |
| Where | Object store, private bucket |
| Max size | 10 MB — `EXPORT_MAX_ROWS = 50000` caps it upstream |
| Allowed types | Generated by us; no user upload path exists |
| Naming | `exports/{project_id}/{export_job_id}.csv` — no user input in the path |
| Access | **Signed URL, 15-minute expiry**, issued only to a member of that project |
| Public? | Private. Never listable. |
| Scanning | n/a — we generate the content |
| Retention | **Purged after 7 days** by a nightly job |
| Backed up | **No** — regenerable in under 60 s (recorded in `backup-and-recovery.md`) |

**Write order:** file first, then `export_jobs.status = 'ready'`. If the process dies
between the two, the file is an orphan the nightly job removes. The reverse order would
have shown the user a **Ready** button that downloads nothing.

> **What this section caught:** the first implementation returned the raw bucket URL and
> made the bucket public, because signed URLs were "extra work". Any project's export was
> readable by anyone who guessed a UUID — no login required. It passed every functional
> test, because the download worked.

## Entity model and schema

## 1. Entity model

| Entity | Purpose | Key fields | Relationships | Rule that must always be true |
|---|---|---|---|---|
| User | A person using the system. | id, name, email, role, created_at | Owns many projects; assigned many tasks. | Email is unique. |
| Project | Groups tasks around a goal. | id, owner_id, name, status, created_at | Belongs to one user; has many tasks. | A project always has an owner. |
| Task | A unit of work inside a project. | id, project_id, title, status, assignee_id, due_date | Belongs to one project; assigned to at most one user. | A task cannot exist without a project. |

## 2. Entity definition — tasks

```
Table: tasks
Purpose: Stores a unit of work inside a project.

Fields:
- id:           string, required, primary key
- project_id:   string, required, foreign key -> projects.id
- title:        string, required, 3-120 chars
- description:  text, optional
- status:       enum(todo, in_progress, done), required, default 'todo'
- priority:     enum(low, medium, high), optional
- assignee_id:  string, optional, foreign key -> users.id
- due_date:     date, optional
- created_at:   datetime, required
- updated_at:   datetime, required

Primary key:     id
Relationships:   One project has many tasks. One user is assigned many tasks.
Indexes:         project_id, status, due_date, assignee_id
Constraints:     title required; status limited to the three allowed values;
                 assignee must be a member of the task's project
Sensitive data:  none in this table; ownership must be enforced on every query
Migration notes: adding `priority` shipped as a nullable column with a backfill
Retention rules: tasks are deleted with their project only when the project has no
                 open tasks (BR-004)
```

## 3. Ownership and isolation rules

| Entity | Scoping rule |
|---|---|
| Project | Every read/write is scoped by `owner_id` **or** project membership. |
| Task | Every read/write is scoped through `project_id` to a project the user can access. |

> A user must never reach another user's task by guessing an ID. This is enforced in the
> service layer and proven by STEST-001 and STEST-007.

## 4. Sensitive data

| Field | Sensitivity | Storage rule | Logging rule |
|---|---|---|---|
| `users.password_hash` | Credential | Hashed only — never plain text. | Never logged. |
| `users.email` | Personal data | Stored; unique index. | Logged only as `user_id`, never the address. |

## 5. Retention and deletion

| Data | Retention period | Deletion behavior |
|---|---|---|
| Task | Life of the project | Hard delete with the project |
| Project | Until the owner deletes it | Blocked while open tasks exist (BR-004) |
| User | Until account closure | Soft delete; tasks keep `assignee_id` as null |

## 6. Migration example — adding `priority`

| Migration question | Answer for MIG-002 |
|---|---|
| Is the migration reversible? | Yes — `down` drops the column. |
| Will existing data break? | No — added as nullable, so old rows stay valid. |
| Can code and database deploy safely? | Schema first, then the code that writes the field. |
| Is downtime required? | No — nullable add does not lock the table at this size. |

---
