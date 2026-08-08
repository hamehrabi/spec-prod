# TASK-001: Create project structure and configuration loading

> Source: Ch. 4 §4.5 (`TASK-001.md` starter) + Ch. 14 (agent-friendly task template) +
> Ch. 16 §16.5 (engineering task template).
> Copy to `TASK-###-short-name.md`. One task = one outcome.

---

**Task ID:** TASK-001
**Task title:** Create project structure and configuration loading
**Priority:** P0
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

ADR-001 (modular monolith), ADR-002 (relational store, SQLite first),
technical-spec §1 (system overview).

## Business reason

Every slice that follows needs a running skeleton to land in. Without this there is
nowhere to put the first feature and no way to check anything runs.

## Goal

A runnable application skeleton with module boundaries per ADR-001 and configuration
loaded from the environment — one outcome, no features.

## Inputs

- technical-spec §1 and §5 (module boundaries)
- ADR-001, ADR-002
- `.env.example` (the variables that must load: `APP_ENV`, `DATABASE_PATH`, `PHOTO_STORAGE_PATH`)

## Expected files or components

The `04-src/` layout described in `04-src/README.md`, when it exists. The concrete file
layout is the task's own output; nothing else prescribes it.

## Expected output

The application starts locally, reads its configuration from the environment, opens the
SQLite database at `DATABASE_PATH`, and answers an empty health check.

## Step-by-step instructions

1. Create the module structure ADR-001 describes — separate modules for recipes, plans,
   lists, and accounts, with no import cycles (REQ-NF-005).
2. Add configuration loading for the variables named in `.env.example`, with safe failure
   when one is missing.
3. Add a health-check route that touches no business logic.

## Dependencies

None. This is the first task.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features.
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- Do not implement any business feature — no recipes, plans, lists, search, or photos.

## Do not change

`spec/` — the specification workspace is read-only for implementation tasks.

## Acceptance check / Done criteria

The application starts locally with a copied `.env`, the health check answers, and no
business route exists.

## Tests to run or create

> **Test rows are DEFINED in their test files (`03-tests/…`), and only there.** This table
> CITES them: the id and the file that owns it, never the scenario or expected result
> restated. A task that restates a test carries a second copy with nothing keeping the two in
> step — consistent on the day it is written, wrong the first time the owning file changes. A
> reviewer reads the id and opens the owning file. (`fitness-functions.md`'s register states
> the same rule for `FF-` ids, for the same reason.)

| Test ID | Defined in |
|---|---|
| — | No test row exists for the skeleton; the health check is its own evidence. The first cited tests arrive with TASK-004. |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Authentication (TASK-002, blocked on Q-009).
- Any entity table (TASK-003 onwards).
- Any screen.

## Stop condition

Stop and ask if the module boundaries in ADR-001 cannot be expressed in the chosen
runtime, or if configuration needs a variable `.env.example` does not name.

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
