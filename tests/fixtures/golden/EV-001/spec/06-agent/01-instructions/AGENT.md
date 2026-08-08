# AGENT INSTRUCTIONS

> Source: Ch. 4 §4.7 (`AGENT.md` starter) + Ch. 11 §11.8 (agent instruction file) +
> Appendix H.
> Keep this **short enough to reuse often**. If it becomes too long, the assistant may
> ignore parts of it. Version it: `AGENT v1.0`.

---

## Role

You are assisting with a **spec-driven software project**. Do not invent features. Follow
the approved requirements, specifications, tasks, and tests.

## Project goal

Pantry is a web application for home cooks. One account holder saves recipes with their
ingredient lines, plans which meals to cook in a week, generates one shopping list from
that week, and searches their saved recipes. The capability it competes on is turning a
week of chosen meals into one shopping list. Single user, no sharing; private dish photos
are the only stored files.

## Current stage

Task planning complete; implementation not started. TASK-001 is the first task, and
TASK-002, TASK-012, and TASK-017 are blocked on open questions Q-009, Q-011, and Q-023.

---

## Source-of-truth order

When information conflicts, the higher item wins.

1. `01-docs/01-intent/intent.md`
2. `01-docs/03-product-spec/product-spec.md`
3. `01-docs/04-technical-spec/technical-spec.md` (+ `01-docs/05-architecture/architecture-decisions/`)
4. `01-docs/06-api-and-data-design/` — API specification and database design
5. `01-docs/07-security-and-reliability/` — security and reliability specifications
6. Current task file in `02-tasks/02-task-files/`
7. Existing code and tests

## Use these folders

| Folder | Contains |
|---|---|
| `01-docs/01-intent/` | Why the project exists: intent, constraints, non-goals, open questions |
| `01-docs/02-requirements/` … `09-change-control/` | Requirements, product spec, design, API, data, security, reliability, traceability |
| `02-tasks/` | Bounded work items and the task register |
| `03-tests/01-plan/` … `04-failure/` | Test plans and specifications |
| `03-tests/05-executable/` | Executable tests |
| `04-src/` | Application code |
| `05-review/` | Review checklists and evidence |
| `06-agent/` | Agent rules, context packs, prompts, handoffs |
| `07-ops/` | Deployment, monitoring, maintenance, runbook |

---

## Rules

1. **Follow the current task only.**
2. **Do not add unrequested features.**
3. **Do not change unrelated files.**
4. **Ask before making assumptions** that affect scope, security, data, or architecture.
5. **Explain important changes in simple language.**
6. **Connect every implementation change to a requirement and a test check.**
7. Do not remove or weaken tests to make code pass.
8. Do not introduce new dependencies without approval.
9. Do not expose secrets, tokens, or private data — in code, logs, examples, or output.
10. Do not rename public interfaces unless the task explicitly requires it.
11. If a request has no matching spec entry, **pause and ask** instead of implementing it.

## Workflow rule

Before making changes: **restate the task, list the files you plan to inspect, and identify
assumptions.** Wait for approval if the task is unclear.

Work in three stages, never skipping one:

| Stage | You must |
|---|---|
| Prepare | Restate the task, list relevant files, identify assumptions. |
| Implement | Change only approved files; keep the solution small. |
| Report | Summarize changes, tests, risks, and unresolved questions. |

## Change rule

Change only files needed for the approved task. Do not refactor unrelated code.

## Testing rule

For behavior changes, add or update tests. Tests come from **acceptance criteria**, not
from the code you just wrote. If tests cannot be run, explain what should be tested
manually.

---

## Output format

Every completion must include:

- **Summary of changes**
- **Files affected** (and why each one)
- **Requirement covered** (REQ-### / TASK-###)
- **Tests added or updated, and which should pass**
- **Risks or assumptions**
- **Questions that need a human decision**
- **Any file changed that was not listed in the task plan**

---

## Not allowed (Appendix H)

- Do not invent requirements.
- Do not remove tests to make code pass.
- Do not introduce new dependencies without approval.
- Do not expose secrets, tokens, or private data.
- Do not expand scope without approval.

---

## Project-specific rules from ADRs

| ADR ID | Rule the agent must follow | Fitness function ID |
|---|---|---|
| ADR-001 | Each feature area (recipes, plans, lists, accounts) lives in its own module with no import cycles; route handlers must not contain business rules; shopping-list generation lives in a domain service. | FF-001 |
| ADR-002 | Use only relational features SQLite and Postgres share; every multi-row write (recipe + lines, list + items) is one transaction; reference across aggregates by ID. | FF-004 |

> **Cite the ADR; do not restate the decision.** Every accepted ADR that constrains
> implementation gets a row here, and the right-hand cell is **the one imperative it puts on
> the agent** — "route handlers must not contain business rules" — not the decision, the options
> weighed, or the rationale. Those live in the ADR
> ([`../../01-docs/05-architecture/architecture-decisions/`](../../01-docs/05-architecture/architecture-decisions/)),
> which is the only place they are defined.
>
> This table used to arrive pre-numbered `ADR-001`, so it minted identifiers `adr-index.md`
> already owned and a run filled both — one decision with two homes, free to disagree the day
> either is edited. The ID column is blank now because it is a citation.

## Lessons from past mistakes

> **Keep this section current.** Add a line here whenever a bug reveals a repeatable AI
> mistake (see `05-review/debugging-specification.md`). It is a standing habit, not a gap to
> fill once — so it stays in the delivered file rather than being replaced by an answer.

| Date | Mistake | Rule added |
|---|---|---|

---

## Agent rule checklist (Appendix H)

- [ ] The agent is given the correct project context.
- [ ] The task has a clear acceptance criterion.
- [ ] The agent knows what it must not change.
- [ ] The agent must explain assumptions before acting on them.
- [ ] The agent must preserve tests and security rules.

> Blueprint: blueprints/06-agent/01-instructions/AGENT.md
