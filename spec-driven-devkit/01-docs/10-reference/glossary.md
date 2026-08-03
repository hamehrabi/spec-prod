# Glossary

> Source: Ch. 4.
> **Every term that appears in a requirement belongs here with one agreed meaning.**
> This project needs a glossary more than most: it is a tool that produces specifications,
> described by a specification, and the same words apply to both.

---

## The distinction everything depends on

| Term | Means | Never means |
|---|---|---|
| **the kit** | The product being built — a Claude Code plugin | The thing it produces |
| **the kit author** | Whoever builds and maintains the kit | The kit's user |
| **the developer** | The kit's **user**, who installs it into their own project | The kit author |
| **the developer's project** | The application the developer is building. The kit never contains it | This project |
| **the generated workspace** | The specification files the kit produces inside the developer's repository | This workspace |
| **`spec/` (in this repository)** | **This** specification, of the kit. **Never edited to make a task pass** | Anything the kit generates |
| **`spec/` (in a developer's repository)** | What the kit creates for them | This one |
| **the intake agent** | The Claude Code session running the interview | The build agent |
| **the build agent** | A later session that reads a generated workspace and writes the developer's code | The intake agent |

> When a requirement says **"the system"**, it means **the kit**. When it means the output, it
> says **"the generated workspace"** explicitly.

---

## Product terms

| Term | Meaning here |
|---|---|
| **Intake** | The guided interview: up to eight rounds, at most four questions each, ending in a validated workspace |
| **Round** | One group of up to four questions, followed by writing that round's files and a summary line |
| **Depth** | The single command argument: `default` or `express`. Changes how much is asked and written — **never which path runs** |
| **Blueprint** | One template file shipped inside the plugin. **Read-only at run time.** Its *path* is a contract |
| **Blueprint library** | The ~90 blueprints, versioned with the plugin |
| **Fill procedure** | The six steps turning one blueprint into one filled artifact (ADR-003) |
| **Back-link** | The `> Blueprint: …` line ending every generated file. Written once, never updated — which is why a rename is breaking |
| **Boundary layer** | The rule that every destination path normalises inside `spec/`, or the run stops and asks |
| **Validation** | Twelve checks run by the agent at the end of an intake, on the developer's machine |
| **Fitness function** | An automated check in the **kit author's CI** that fails the build. Not the same as validation |
| **Golden workspace / answer script** | A fixed set of answers, and the workspace it produces. The fixtures for tests and evals |
| **Hand-off block** | The copy-pasteable instruction printed at the end, starting the build session |

## Method terms

| Term | Meaning |
|---|---|
| **Core subdomain** | The one thing the product competes on. Built in-house, richest modelling, never duplicated. **Here: intake question design and specification synthesis** |
| **Generic subdomain** | Everyone needs it, nobody wins with it. **Buy or adopt.** Here: plugin packaging, distribution, file writing |
| **Supporting subdomain** | Necessary, simple, rarely changes. Build simply |
| **Driving characteristic** | One of exactly **three** quality attributes that shape structure. Here: simplicity/feasibility · reliability/graceful failure · auditability |
| **ADR** | A binding decision record. **Immutable once accepted** — superseded, never edited |
| **Deny test** | A test proving a forbidden action is refused. **Must be seen to fail** before it is trusted |
| **Traceability** | Requirement → task → test → code. **Blank cells are the point** |
| **Drift** | The specification and the thing it describes becoming different without anyone noticing |

## Identifier prefixes

| Prefix | Defined in |
|---|---|
| `REQ-F` `REQ-NF` `REQ-R` `BR` `AC` | `requirements.md` |
| `CON` | `constraints-and-non-goals.md` |
| `US` | `product-spec.md` |
| `ADR` `DD` | `05-architecture/` |
| `FF` | `fitness-functions.md` |
| `SEC-A` `SEC-Z` | `security-specification.md` |
| `TASK` | `task-index.md` |
| `ATEST` `UTEST` `TEST` `ETEST` `STEST` `PTEST` `FTEST` | `03-tests/` |
| `EV` | `ai-evals.md` |
| `Q` | `open-questions.md` |
| `RISK` `RSK` | `risk-storming.md` · `intent.md` |
| `SC` | `scope-change-log.md` |
| `FB` | `feedback-register.md` |

> **`RSK-###` and `RISK-###` are different.** `RSK` are the product risks named in
> `intent.md` during Round 1; `RISK` are the scored entries in the risk register. They
> cross-reference — RSK-1 is RISK-001 — and the duplication is a wart worth knowing about
> rather than a distinction worth preserving.

## Terms deliberately **not** used

| Avoided | Why |
|---|---|
| "Deploy" | Nothing is deployed. The kit is **published**; developers **install** |
| "Production" | There is none. The nearest thing is every developer's own machine |
| "Database", "schema", "migration" | No database. The migration problem is **blueprint paths** |
| "Config", "environment", "flag" | None exist, by decision. A flag is a branch, and Simplicity counts branches |
| "Monitoring", "telemetry", "analytics" | Forbidden (CON-007) |
| "Robust", "appropriately", "as needed" | Each hands a decision to the reader without saying so |

> Blueprint: ../../../spec-driven-template/01-docs/10-reference/glossary.md
