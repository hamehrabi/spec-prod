# Pantry — specification workspace (agent entry point)

One map for a session that opens this workspace with no memory of the interview. It **links;
it does not restate.** The rules live in
[`06-agent/01-instructions/AGENT.md`](06-agent/01-instructions/AGENT.md) — read them first.
The human-facing readme is [`README.md`](README.md).

## Start here

| What you need | Where |
|---|---|
| Why this exists | [`01-docs/01-intent/intent.md`](01-docs/01-intent/intent.md) |
| What it must do | [`01-docs/02-requirements/requirements.md`](01-docs/02-requirements/requirements.md) |
| How it is built | [`01-docs/04-technical-spec/technical-spec.md`](01-docs/04-technical-spec/technical-spec.md) · [`decisions.md`](01-docs/05-architecture/decisions.md) |
| Entities & API | [`database-design.md`](01-docs/06-api-and-data-design/database-design.md) · [`api-specification.md`](01-docs/06-api-and-data-design/api-specification.md) |
| Who can do what / failure | [`security-specification.md`](01-docs/07-security-and-reliability/security-specification.md) · [`reliability-specification.md`](01-docs/07-security-and-reliability/reliability-specification.md) |
| Rules for the AI agent | [`06-agent/01-instructions/AGENT.md`](06-agent/01-instructions/AGENT.md) |
| The next unit of work | [`02-tasks/01-planning/task-index.md`](02-tasks/01-planning/task-index.md) |
| How a requirement is proven | [`03-tests/01-plan/test-plan.md`](03-tests/01-plan/test-plan.md) |
| Requirement → task → test | [`01-docs/08-traceability/traceability.md`](01-docs/08-traceability/traceability.md) |
| What changed or was skipped | [`01-docs/09-change-control/spec-change-log.md`](01-docs/09-change-control/spec-change-log.md) |
| Open questions | [`01-docs/01-intent/open-questions.md`](01-docs/01-intent/open-questions.md) |

## Working a task

1. Read [`AGENT.md`](06-agent/01-instructions/AGENT.md) — the rules and the do-not lists.
2. Take the next task from [`task-index.md`](02-tasks/01-planning/task-index.md); start at TASK-001 and respect the dependency order.
3. Open its file in [`02-tasks/02-task-files/`](02-tasks/02-task-files/) — one outcome, its tests, its boundaries.
4. Write the tests it names **before** the code; keep the change inside the task's files.
5. Trace it in [`traceability.md`](01-docs/08-traceability/traceability.md); update the spec in the same change if behaviour changed.

## Never

- Never build beyond the current task, or add sharing, nutrition, pricing, or recipe import (out of scope).
- Never reach another account's data — every read and write is scoped by `account_id` (BR-002, SEC-Z-001).
- Never put business logic in route handlers or UI; the core list logic imports no UI or store code (ADR-001, FF-001).
- Never use a SQLite-only feature; keep SQL portable and every migration reversible (ADR-002).
- Never log a password, token, reset link, secret, recipe/plan content, or photo (REQ-NF-007).
- Never treat an open question (`Q-###`) as an assumption — stop and ask.

## Commands

The toolchain is not chosen yet (`Q-018`); set these before the first build.

```
install: [TODO: ask the team — the dependency install command (Q-018)]
test:    [TODO: ask the team — the unit/integration/e2e command (Q-018)]
lint:    [TODO: ask the team — the lint command (Q-018)]
run:     [TODO: ask the team — the run command (Q-018)]
gate:    [TODO: ask the team — tests + FF-001/FF-002/FF-003, merge-blocking (Q-018)]
```

## Where things stand

- **Stage:** interview complete — all eight rounds accepted (see the change log). No code written yet.
- **Depth:** express — thinner where lower-priority questions were dropped; every gap is a `Q-###` in [`open-questions.md`](01-docs/01-intent/open-questions.md).
- **Next task:** TASK-001 (project skeleton + account sign-in), then TASK-002…006 in order.
- **Must be answered before real use:** auth model (`Q-009`), performance target (`Q-010`), hard constraints (`Q-005`), deployment target (`Q-017`), toolchain (`Q-018`).
- **Produced by:** spec-driven-devkit v0.1.0. This entry point is the generated map, stamped with the plugin version rather than a blueprint back-link; if a link here breaks, check the installed plugin version against this stamp.
