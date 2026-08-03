# spec-driven-devkit

A Claude Code plugin that installs a spec-driven development kit into a developer's own
project. It turns a raw idea into a complete, traceable specification workspace — so that
when a coding agent starts building, it builds to a standard the developer set in advance,
and every change it makes can be traced back to a numbered requirement. The kit writes
specifications. It never writes the developer's application code.

> **This folder is the specification of the kit, not the kit itself.** No product code lives
> here. Read [`01-docs/01-intent/project-brief.md`](01-docs/01-intent/project-brief.md) first —
> it contains the glossary that keeps "the kit" and "what the kit generates" from being
> confused, and everything downstream depends on that distinction.

## Status

| | |
|---|---|
| **Stage** | Specification intake in progress — Round 1 of 8 complete |
| **Entry point for agents** | `CLAUDE.md` (written last, once the workspace is complete) |
| **Product code** | None yet, and none in this session |

## Folder map

| Folder | Holds |
|---|---|
| `01-docs/01-intent/` | Why this exists, what it deliberately is not, constraints, open questions, and the subdomain map that decides where effort goes |
| `01-docs/02-requirements/` | Numbered requirements with acceptance criteria, and the three driving characteristics that shape every design call |
| `01-docs/03-product-spec/` | Personas, scope, user stories, and flows — each with its failure path |
| `01-docs/04-technical-spec/` | How it is built, plus fitness functions and runtime/scale limits |
| `01-docs/05-architecture/` | Architecture decision records — binding, and not to be reversed silently |
| `01-docs/06-api-and-data-design/` | Data model, contracts, and external integrations |
| `01-docs/07-security-and-reliability/` | Who may do what, and what happens when things fail |
| `01-docs/08-traceability/` | Requirement → task → test → code. Blank cells are the point |
| `01-docs/09-change-control/` | Version history of the specifications themselves |
| `01-docs/10-reference/` | Glossary, tooling choices, and the repeatable process |
| `02-tasks/` | The work, broken into task files with explicit allowed-file and do-not-change lists |
| `03-tests/` | Test plan and specifications across six levels, derived from acceptance criteria |
| `04-src/` | Layer boundaries only. No code this session |
| `05-review/` | Review checklists, logs, and version-control templates |
| `06-agent/` | The contract the coding agent works under — `AGENT.md` is the rulebook |
| `07-ops/` | Deployment, monitoring, backup and recovery, maintenance, release |

## How this workspace was produced

By running the intake in
[`../spec-driven-template/MASTER-PROMPT.md`](../spec-driven-template/MASTER-PROMPT.md).
Each file here follows the section structure of its blueprint in
[`../spec-driven-template/`](../spec-driven-template/) and ends with a link back to it, so
the original template and its worked example stay one click away.

> Blueprint: ../spec-driven-template/README.md
