# Database Design

> Source: Ch. 7 §7.6, Ch. 9 §9.2–9.3, Appendix E.
> **Beginner rule:** a schema should make invalid data *harder to store*. Do not rely
> only on code to protect important rules.

---

## 0. There is no database — read this first

CON-001 forbids a server and a database. This document is still required, because the
system plainly remembers things: which stage intake reached, which identifiers are already
used, what the developer answered. Those facts have to live somewhere, and "somewhere" is a
design decision whether or not it is written down.

**The store is the developer's filesystem, and the generated workspace is the record.**

| Conventional term | What it is here |
|---|---|
| Database | The generated workspace folder in the developer's repository |
| Table | A folder of generated Markdown files |
| Row | One generated file, or one table row inside it |
| Primary key | The identifier string (`REQ-F-001`, `TASK-003`, …) |
| Foreign key | An identifier referenced from another file |
| Constraint | A validation check run before intake reports success |
| Transaction | **None.** Each file write is independent — see §7 |
| Migration | A blueprint change that alters a generated file's structure |

### The consequence that shapes everything else

**Answers are not stored as answers. They are stored as their consequences.** When the
developer says "modular monolith", nothing anywhere records the string "modular monolith"
as an answer to question 5.1. What gets recorded is an ADR, a technical-spec section, and a
set of task files that assume it.

This is a deliberate choice with a real cost, stated here so nobody discovers it later:

| Gained | Paid for with |
|---|---|
| One source of truth. The specs cannot drift from a hidden answer log, because there is no answer log. | **Changing an early answer does not re-derive the later files.** There is no replay. |
| Resume works by reading the specs — the same thing a human or a later agent reads. | Resume cannot distinguish "the developer answered this" from "the developer hand-edited this afterwards", and does not try to. |
| Nothing to corrupt, migrate, or back up separately (CON-001). | Correcting a Round 2 decision at Round 7 is a manual edit across several files, not a re-run. |

An agent will propose adding `.intake-state.json` to fix that last row. **Reject it** — it
creates a second source of truth that immediately begins to disagree with the files, and it
is explicitly forbidden by CON-001. If the cost becomes intolerable, the answer is a
documented "revise a decision" procedure, not a hidden state file.

> **The acceptance gate tested this rule and it held.** REQ-F-038 introduced genuinely new
> state — *has the developer accepted this round?* — which must survive an interrupted
> session. The obvious answer was `.accepted.json`. **ADR-006 chose a dated row in a generated
> artifact instead**, so the workspace remains the only store and acceptance is inspectable by
> a human. The rule bent to accommodate a real need without breaking: state lives *in the
> artifacts*, never *beside* them.
>
> Note also what the gate gives back to the "no replay" cost above: **revise** re-runs one
> round and rewrites its files in place. That is not replay — earlier answers are still not
> re-derivable — but it does mean a decision can be corrected *at the moment it is presented*,
> which is when the developer is most likely to notice it is wrong.

---

## 1. Entity model (meaning before storage)

Identify what the system must remember, before you design tables.

| Entity | Purpose | Key fields | Relationships | Rule that must always be true |
|---|---|---|---|---|
| **Blueprint** | One template file shipped inside the plugin, defining the section structure a generated file must follow. | path, section structure, worked-example section | Belongs to one blueprint library; produces zero or one generated artifact per workspace | A blueprint is **read-only at runtime**. The kit never writes to one. |
| **Blueprint library** | The versioned set of all blueprints, shipped with the plugin. | version, blueprint list | Has many blueprints | Ships complete inside the plugin — never fetched (CON-003). |
| **Generated workspace** | The specification workspace created inside the developer's repository. It *is* the state. | root path (fixed, at repo root), stage reached, identifier namespace | Has many generated artifacts; belongs to one repository | Exactly one per repository. Its root folder is the only place the kit may write freely (BR-008). |
| **Stage** | One of the ten steps / eight rounds of intake. Not stored as a field — **derived** by inspecting which artifacts exist. | ordinal, name, expected artifacts | Belongs to one workspace; produces many artifacts | A stage is complete when every artifact it owns exists and contains no unfilled blueprint placeholder. |
| **Generated artifact** | One Markdown file written into the workspace. | path, source blueprint, stage, identifiers defined | Belongs to one workspace and one stage; derived from one blueprint | Must end with a resolvable link to its source blueprint (REQ-F-016). |
| **Identifier** | A stable ID minted into the workspace's namespace. | prefix, number, defining artifact | Defined in exactly one artifact; referenced by many | **Unique within a workspace and never reused, even after deletion** (BR-007). |
| **Open question** | A fact the developer did not supply. | `Q-###`, question text, decision owner, blocking stage, status | Belongs to one workspace; may be referenced by any artifact | Every `[TODO]` marker in any artifact has a matching row here (BR-003). |
| **Validation check** | One rule run over a finished workspace before success is reported. | check name, target, pass/fail, evidence | Belongs to one workspace | A check that did not run is reported as *not run* — never as passed (BR-009). |
| **Stage acceptance** | The developer's explicit acceptance of one round's output. | stage, date, decision | Belongs to one workspace; one per completed stage | Stored as a **dated row in the generated change-control artifact** — never a state file (ADR-006). A stage with files but no row is **written-but-unaccepted**, and resume re-presents its gate. |
| **Blueprint manifest entry** | One blueprint's path and checksum, plus any deliberate exclusion. | path, checksum, exclusion reason | Belongs to the blueprint library | Verified **before the first write and again at the end**. An unlisted blueprint is a failure, not a bonus (REQ-F-042). |
| **Traceability link** | A resolved edge: requirement → task → test. | from ID, to ID, kind | Connects identifiers within one workspace | An unresolved link is left **visible as a blank cell**, not hidden or filled. |

| Question | Your answer |
|---|---|
| What objects must the system remember? | Which blueprints exist, which workspace it is filling, how far intake has got, which identifiers are taken, what the developer could not answer, and which checks were run. |
| What details describe each object? | See the table above. Every one is derivable from the filesystem; none is stored separately. |
| How do objects relate? | One repository → one workspace → many artifacts → many identifiers → many traceability links. Blueprints sit outside, read-only, shipped with the plugin. |
| What rule must always be true? | The workspace is the only writable store, identifiers are never reused, and an unanswered fact is a `[TODO]` with a matching open question — never a guess. |

---

## 2. Entity definition (Appendix E, adapted — filesystem, not tables)

The template's field/type/index vocabulary does not apply to Markdown files, so each entity
is defined by its **location, its shape, and the rules that must hold**.

```
Entity: Generated workspace
Purpose: The specification workspace produced inside the developer's repository.
         It is simultaneously the product's output and its only state store.

Location:      spec/ — a single fixed folder at the repository root.
Cardinality:   Exactly one per repository.
Contains:      01-docs/ 02-tasks/ 03-tests/ 04-src/ 05-review/ 06-agent/ 07-ops/
               plus the entry-point file, README.md, .gitignore, .env.example

Identity:      The folder path. There is no ID, no UUID, no name field.
Stage:         Derived, never stored. Computed by checking which artifacts exist.
Namespace:     Identifiers are unique within this folder and mean nothing outside it.

Ownership:     The developer's. The kit creates it and may update files inside it;
               the developer may hand-edit anything, and the kit must tolerate that.
Write rule:    The kit writes freely inside this folder and nowhere else without a
               confirmation naming the file (BR-008, REQ-F-024).
Sensitive:     Contains the developer's product idea and business rules in plain text.
               Never transmitted (BR-014). Must contain no credential (REQ-NF-002).
Retention:     Indefinite. The kit never deletes it, never prunes it, never garbage-
               collects it. It lives and dies with the developer's repository.
Backup:        The developer's own version control. The kit provides none and
               claims none — see backup-and-recovery.md.
```

```
Entity: Identifier
Purpose: A stable handle that makes a requirement traceable to a task, a test, and code.

Format:        <PREFIX>-<ZERO-PADDED NUMBER>, e.g. REQ-F-001, TASK-014, FF-002
Prefixes:      REQ-F  REQ-NF  REQ-R  BR  CON  AC  US  ADR  TASK  TEST  ATEST  UTEST
               ETEST  STEST  PTEST  FTEST  SEC-A  Q  FF  EV  RISK
Minted by:     The artifact that defines it, at the moment that artifact is written.
Scope:         Unique within one generated workspace.
Reuse:         Never. A deleted REQ-F-007 leaves a permanent hole; the next requirement
               is REQ-F-008. Reuse silently re-points every test and task that
               referenced it (BR-007).
Verified by:   The validation step — every referenced identifier must resolve to a
               definition in the same workspace (REQ-F-029, AC-013).
```

---

## 3. Schema — the workspace layout

The generated workspace's folder structure **is** the schema. It is specified in full in
[`technical-spec.md`](../04-technical-spec/technical-spec.md) and reproduced from the
blueprint library at generation time. It is not restated here, because restating it would
create two definitions that drift.

What belongs here instead is the **shape rule** every artifact obeys:

```
<generated-artifact>
  ├── H1 title matching the blueprint's title
  ├── the blueprint's sections, in the blueprint's order
  │     └── filled with this developer's content only  (BR-002)
  │     └── unknown facts as [TODO: <the exact question>]  (BR-003)
  ├── identifiers defined here, each unique in the workspace  (BR-007)
  └── final line: > Blueprint: <relative path to source blueprint>  (REQ-F-016)
```

---

## 4. Schema concepts, translated

| Conventional item | Equivalent here | Enforced by |
|---|---|---|
| Primary key | The identifier string | Uniqueness check at validation |
| Foreign key | An identifier referenced from another artifact | Resolution check — every reference must have a definition (AC-013) |
| Unique constraint | No identifier defined twice | Validation |
| Index | None, and none needed — a workspace is ~90 files, read by grep | — |
| Status field | The `Status` column in the open-questions table: Open · Answered · Deferred · Rejected | Validation: no `[TODO]` without a matching Open row |
| Not-null constraint | A blueprint row that must be either specified or explicitly marked *not needed with a reason* | Validation: **no blank rows** |

---

## 5. Ownership and isolation rules

Every write must be scoped correctly. State the rule explicitly so the agent cannot
"forget" it.

| Entity | Scoping rule |
|---|---|
| Generated workspace | The kit may create and update files **only** at paths under the workspace root. Any path outside it requires an explicit confirmation naming the file (BR-008, REQ-R-002). |
| Blueprint library | **Read-only.** The kit never writes to the plugin's own files during intake. A developer wanting different templates edits their generated copy, not the library. |
| Developer's existing files | **Out of bounds.** Specifically, an existing root `CLAUDE.md` is never modified; the kit writes its entry point inside the workspace and prints the line to add (REQ-F-026, AC-021). |
| Developer's `.env` and secret files | **Never read.** Not to check them, not to template from them, not to list them. |
| Identifier namespace | Scoped to one workspace. Two workspaces in two repositories may both hold a `REQ-F-001`; they are unrelated and must never be cross-referenced. |

> The kit runs with the developer's own filesystem permissions. Nothing but its own rules
> stops it from writing anywhere in their repository — which is exactly why the rules are
> stated here as constraints and proven by denial tests (REQ-F-021), not left as intentions.

---

## 6. Sensitive data

| Field | Sensitivity | Storage rule | Logging rule |
|---|---|---|---|
| The developer's problem statement, requirements, and business rules | Confidential business information | Plain text in their own repository, under their own version control. Never transmitted (BR-014). | Never logged anywhere outside their machine. There is no remote log. |
| Repository contents the kit reads (existing `CLAUDE.md`, existing workspace) | Confidential | Read into the session only. Never copied into a generated artifact except where the developer's answer put it there. | Not logged. |
| Credentials, tokens, keys | Credential | **Never stored in any generated artifact** (REQ-NF-002). `.env` is excluded by the generated `.gitignore`, and that file is written before `.env.example`. | Never logged; never echoed back in a report. |
| Everything above, in aggregate | — | **Never leaves the machine.** No telemetry, no error reporting, no usage analytics (CON-007, BR-014). | — |

---

## 7. Retention, deletion, and the absence of transactions

| Data | Retention period | Deletion behavior |
|---|---|---|
| Generated workspace | Indefinite — the developer's, in their repository | The kit never deletes it. No pruning, no cleanup job, no expiry. |
| Superseded generated artifact | Indefinite | Overwritten in place on a re-run of the same stage; the previous content is recoverable only from the developer's version control. |
| Blueprint library | Life of the installed plugin version | Removed when the plugin is uninstalled by the host. |

### No transactions — say it out loud

Each file write is independent. There is no way to write eleven files atomically, and no
attempt is made to simulate one. The failure mode is therefore **a partially written stage**,
and it is handled by design rather than prevented:

- Stage completeness is **derived by inspection**, not recorded by a flag. A stage that
  wrote seven of eleven files is simply incomplete, and resume continues from there.
- **A file is never written in a state that claims to be complete while being partial**
  (REQ-NF-003, AC-026). Each write is whole-file; there is no append-as-you-go.
- Ordering matters in exactly two places, and both are requirements rather than conventions:
  `.gitignore` is written **before** `.env.example` (REQ-NF-002), and the entry-point file
  is written **last**, after everything it links to exists (BR-006, REQ-F-020).

---

## 8. Migration plan

→ [`database-migration-plan.md`](../../07-ops/01-deployment/database-migration-plan.md)

There is no schema to migrate, but there is a real migration problem: **a new plugin version
may change a blueprint's section structure, and workspaces generated by the old version
still exist in developers' repositories.**

| Migration question | Answer |
|---|---|
| Is the migration reversible? | The developer's version control is the undo. The kit provides no rollback of its own. |
| Will existing data break? | An older generated workspace stays valid and readable — it is Markdown. What breaks is the *blueprint link* at the foot of each file if a template is moved or renamed. |
| Can code and data deploy safely? | The blueprint library ships inside the plugin, so a developer's workspace and the library they have installed can be different versions. This is expected, not an error. |
| Is downtime required? | No. There is nothing running to take down. |
| **What must a version bump do?** | A blueprint rename or restructure requires a migration note in the release. Silently moving a blueprint breaks the back-links in every workspace ever generated. `[TODO: does the generated workspace record which plugin version produced it? It cannot self-diagnose a version mismatch without it — raise in Round 8.]` |

> **Deployment caution (Ch. 23):** never treat database changes as ordinary code changes.
> Here the analogue is the blueprint library: it is the one part of the plugin that has
> copies living in other people's repositories.

---

## 9. File and object storage

**Not applicable in v1 — no object storage, no uploads, no generated binaries.** Everything
the kit writes is Markdown, into the developer's own filesystem, under their version
control. There is no bucket, no signed URL, no orphan cleanup, and no scanning, because
there is nothing to store elsewhere.

Confirmed in Round 6. The one file-adjacent risk is not storage but **scope** — writing to a
path outside the workspace — and that is covered by BR-008 and its denial test, not by the
object-storage rules.

---

## Checklist (Ch. 9)

- [x] Core entities the system must remember are identified.
- [x] Relationships between entities are clear.
- [x] Fields, keys, constraints, and indexes are planned — translated to the filesystem equivalents.
- [x] Ownership/tenant scoping is stated for every entity.
- [x] Sensitive fields are identified with storage and logging rules.
- [x] Deletion and retention behavior is documented.
- [x] Migration reversibility is considered — one `[TODO]` remains on version stamping.

> Blueprint: ../../../spec-driven-template/01-docs/06-api-and-data-design/database-design.md
