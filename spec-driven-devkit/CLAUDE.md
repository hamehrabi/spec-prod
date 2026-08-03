# spec-driven-devkit

A Claude Code plugin that turns a raw idea into a traceable specification workspace inside a
developer's own repository — so an agent builds to a standard they set in advance.

**This is a spec-driven project. Every change traces to a requirement.**
If you cannot name the requirement, stop and ask.

> ⚠ **This folder specifies the kit. It is not the kit.** `spec/` **here** is the
> specification — never edit it to make a task pass. `spec/` in a *developer's* repository is
> what the kit generates for them. The glossary keeps these apart: read it before anything else.

## Start here

| You need | Read |
|---|---|
| The two-meanings glossary — read this first | [`01-docs/10-reference/glossary.md`](01-docs/10-reference/glossary.md) |
| Why this exists, and what it deliberately is **not** | [`01-docs/01-intent/intent.md`](01-docs/01-intent/intent.md) |
| Where effort goes — core / generic / supporting | [`01-docs/01-intent/subdomain-map.md`](01-docs/01-intent/subdomain-map.md) |
| What must be true (REQ-###, BR-###, AC-###) | [`01-docs/02-requirements/requirements.md`](01-docs/02-requirements/requirements.md) |
| The **three** qualities that settle every design call | [`01-docs/02-requirements/driving-characteristics.md`](01-docs/02-requirements/driving-characteristics.md) |
| How it is built | [`01-docs/04-technical-spec/technical-spec.md`](01-docs/04-technical-spec/technical-spec.md) |
| Binding decisions you must not silently reverse | [`01-docs/05-architecture/architecture-decisions/`](01-docs/05-architecture/architecture-decisions/adr-index.md) |
| The three contracts (command · blueprint · workspace) | [`01-docs/06-api-and-data-design/api-specification.md`](01-docs/06-api-and-data-design/api-specification.md) |
| The data model — there is no database | [`01-docs/06-api-and-data-design/database-design.md`](01-docs/06-api-and-data-design/database-design.md) |
| Who may do what, and the boundary | [`01-docs/07-security-and-reliability/security-specification.md`](01-docs/07-security-and-reliability/security-specification.md) |
| What happens when things fail | [`01-docs/07-security-and-reliability/reliability-specification.md`](01-docs/07-security-and-reliability/reliability-specification.md) |
| Limits, cache, scale, cost ceiling | [`01-docs/04-technical-spec/runtime-and-scale.md`](01-docs/04-technical-spec/runtime-and-scale.md) |
| What proves it works | [`03-tests/01-plan/test-plan.md`](03-tests/01-plan/test-plan.md) |
| Requirement → task → test → code | [`01-docs/08-traceability/traceability.md`](01-docs/08-traceability/traceability.md) |
| **The full rules you must follow** | [`06-agent/01-instructions/AGENT.md`](06-agent/01-instructions/AGENT.md) |
| The model boundary — the kit is *run by* a model, not calling one | [`01-docs/07-security-and-reliability/ai-boundary-spec.md`](01-docs/07-security-and-reliability/ai-boundary-spec.md) |
| How we know an instruction change helped | [`03-tests/03-non-functional/ai-evals.md`](03-tests/03-non-functional/ai-evals.md) |

## Working a task

0. **The blueprint library is the authority.** It ships verified (REQ-F-042) and decides what
   each stage must produce (REQ-F-043). Never hardcode a file list; never edit a blueprint.
1. Read the task file in [`02-tasks/02-task-files/`](02-tasks/01-planning/task-index.md).
2. Read **only** the specs that task names. Do not read the whole workspace.
3. **Restate the task, list the files you will touch, and name any assumption. Wait.**
4. Change only the files the task allows.
5. Add or update tests — they come from acceptance criteria, never from the code you wrote.
6. Report: files changed and why · requirement covered · tests added · risks ·
   **any file you touched that the task did not list**.

## Never

- Never write code with no requirement behind it.
- Never change a file outside the task's allowed list without saying so first.
- Never weaken or delete a test to make something pass.
- Never reverse an ADR silently — supersede it with a new one.
- Never commit a secret. Config comes from the environment — and this project has none.
- Never implement an allow rule without its **deny** test.
- **Never add a script, dependency, or package manifest** (ADR-002). If a task seems to need
  executable code, the task is wrong — stop and ask.
- **Never add a state, progress, or cache file** (ADR-004/ADR-006). Stage and acceptance are
  both derived by reading the workspace.
- **Never proceed past an acceptance gate on silence**, and never make the gate skippable.
- **Never modify a blueprint, and never regenerate the integrity manifest to make a check pass.**
- **Never edit `spec/` in this repository.**

## Commands

```
install:  [TODO: ask the team - TASK-001 chooses the plugin install path]
test:     [TODO: ask the team - test runner unchosen, Q-011]
lint:     n/a - the payload is Markdown and a manifest (ADR-002)
run:      [TODO: ask the team - the intake command name is unchosen, Q-009]
gate:     [TODO: ask the team - CI provider unchosen, Q-010]
          # 14 fitness functions + six test levels; must pass before merge
```

## Where things stand

- **Stage:** specifications complete · implementation not started
- **Next task:** [`02-tasks/02-task-files/TASK-001.md`](02-tasks/02-task-files/TASK-001.md)
- **Open questions blocking work:** [`01-docs/01-intent/open-questions.md`](01-docs/01-intent/open-questions.md) — 20 open, **4 block release** (Q-002, Q-007, Q-016, Q-022)
- **Change log:** [`05-review/01-logs/change-log.md`](05-review/01-logs/change-log.md)
- **Produced by:** the intake in `spec-driven-template/MASTER-PROMPT.md`, 2026-08-03
- **Plugin version:** `[TODO: no version exists yet — TASK-001 creates the manifest]`

> Keep this file under 100 lines and update it when the structure or stage changes.
> A stale map sends agents to files that moved.
