# TASK-001: Project structure and config loading

> Source: Ch. 4 §4.5 (`TASK-001.md` starter) + Ch. 14 (agent-friendly task template) +
> Ch. 16 §16.5 (engineering task template).
> Copy to `TASK-###-short-name.md`. One task = one outcome.

---

**Task ID:** TASK-001
**Task title:** Project structure and config loading
**Priority:** P0
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

Technical spec §2 (modular monolith, ADR-001), §12 (deployment); `.env.example`.

## Business reason

Nothing else can be built or tested until the project runs locally and reads its
configuration from the environment.

## Goal

Create the module skeleton (ui, api, domain, data) and load configuration from the
environment, with a health check that proves the app starts.

## Inputs

- `01-docs/04-technical-spec/technical-spec.md` §2
- `spec/.env.example`
- ADR-001 (modular monolith), ADR-002 (relational store)

## Expected files or components

Project root: module folders for `ui`, `api`, `domain`, `data`; a config loader; a health
endpoint.

## Expected output

The app starts locally and `GET /health` returns 200; configuration is read from the
environment, not hardcoded.

## Step-by-step instructions

1. Create the four named modules (ui, api, domain, data) with clear boundaries (ADR-001).
2. Add a config loader that reads from environment variables (see `.env.example`).
3. Add a `GET /health` endpoint returning 200.
4. Add a smoke test that the app boots and `/health` responds.

## Dependencies

None.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features.
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- No business feature (recipes, plans, lists) in this task.

## Do not change

There is nothing before this task; do not add authentication, recipes, or any domain logic.

## Acceptance check / Done criteria

The app boots locally; `GET /health` returns 200; no secret is hardcoded.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| UTEST-000 | App boots with a valid config | Startup succeeds; `/health` returns 200. |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Any business feature (recipes, plans, lists, photos).
- Authentication (TASK-002, blocked on Q-006).

## Stop condition

Stop and ask if the deployment target (Q-012) affects the config or health-check shape.

---

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
