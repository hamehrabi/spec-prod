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

*[One paragraph describing the product.]*

## Current stage

*[intent | requirements | specification | task planning | testing | implementation | review | release | maintenance]*

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

*Every accepted ADR that constrains implementation should list its rule here.*

| ADR | Rule the agent must follow |
|---|---|
| ADR-001 | |

## Lessons from past mistakes

> **Keep this section current.** Add a line here whenever a bug reveals a repeatable AI
> mistake (see `05-review/debugging-specification.md`). It is a standing habit, not a gap to
> fill once — so it stays in the delivered file rather than being replaced by an answer.

| Date | Mistake | Rule added |
|---|---|---|
| | | |

---

## Agent rule checklist (Appendix H)

- [ ] The agent is given the correct project context.
- [ ] The task has a clear acceptance criterion.
- [ ] The agent knows what it must not change.
- [ ] The agent must explain assumptions before acting on them.
- [ ] The agent must preserve tests and security rules.

---

## Prompt — improve this file (Prompt box 4.3)

```
Review this agent instruction file for a spec-driven AI engineering project.

Instruction file: [paste AGENT.md]

Find vague rules, missing boundaries, missing test expectations, and anything that could
allow the assistant to make uncontrolled changes. Return a cleaner version.
```

---

# WORKED EXAMPLE — ProjectBoard AGENT.md (AGENT v1.1)

> This is the file as it actually stood at the v1.0 release, after two incidents forced
> rule changes. The blueprint above is what you copy; this shows what a lived-in version
> looks like.

```markdown
# AGENT INSTRUCTIONS — ProjectBoard (AGENT v1.1)

## Role
You are assisting with a spec-driven software project. Do not invent features. Follow the
approved requirements, specifications, tasks, and tests.

## Project goal
ProjectBoard is a small web app that helps consulting teams of 3-15 people create
projects, add tasks, assign owners, set due dates, and track status in one workspace.

## Current stage
Implementation (v1.0 hardening)

## Source-of-truth order
1. 01-docs/01-intent/intent.md
2. 01-docs/03-product-spec/product-spec.md
3. 01-docs/04-technical-spec/technical-spec.md (+ 05-architecture/architecture-decisions/)
4. 01-docs/06-api-and-data-design/
5. 01-docs/07-security-and-reliability/
6. Current task file in 02-tasks/02-task-files/
7. Existing code and tests

## Rules
1. Follow the current task only.
2. Do not add unrequested features.
3. Do not change unrelated files.
4. Ask before making assumptions that affect scope, security, data, or architecture.
5. Explain important changes in simple language.
6. Connect every implementation change to a requirement and a test check.
7. Do not remove or weaken tests to make code pass.
8. Do not introduce new dependencies without approval (CON-006: no paid services).
9. Do not expose secrets, tokens, or private data.
10. Do not rename public interfaces unless the task explicitly requires it.
11. If a request has no matching spec entry, pause and ask.

## Output format
- Summary of changes
- Files affected (and why each one)
- Requirement covered (REQ-### / TASK-###)
- Tests added or updated, and which should pass
- Risks or assumptions
- Questions that need a human decision
- Any file changed that was not listed in the task plan
```

## Project-specific rules from ADRs

| ADR | Rule the agent must follow |
|---|---|
| ADR-001 | Each feature area lives in a named module. Route handlers must not contain business rules. Business logic goes in domain modules, never in UI components. |
| ADR-002 | Task status is only `todo`, `in_progress`, `done`. Never add a status without a new ADR. |
| ADR-003 | Every list endpoint is paginated. Never return an unbounded result set. |
| ADR-005 | Never call the email provider inside a request handler. Enqueue a job. |

## Lessons from past mistakes

| Date | Mistake | Rule added |
|---|---|---|
| 2026-03-12 | Added a helper to `users_repo.py` while working on TASK-006 (task creation). | Rule 3 strengthened: list allowed files in every task; report any file changed outside them. |
| 2026-03-29 | Assumed a session lookup always returns an object → 500 instead of 401 (BUG-002). | Never assume a lookup returns an object. Handle the null path **and** confirm the spec states the behavior. |
| 2026-04-01 | Implemented the allow path for task editing but not the deny path (BUG-003). | For every permission rule, implement and test the **denial** path in the same task. |

> **Why AGENT.md is versioned.** Each row in "lessons" cost a real bug. Ch. 30 §30.3 says
> agent rules change when a repeated AI mistake appears — with a reason and an example.
> That is exactly what these three rows are.
