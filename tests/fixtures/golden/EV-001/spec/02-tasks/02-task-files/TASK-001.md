# TASK-001: Project skeleton and account sign-in

> Source: Ch. 4 §4.5 (`TASK-001.md` starter) + Ch. 14 (agent-friendly task template) +
> Ch. 16 §16.5 (engineering task template). One task = one outcome.

---

**Task ID:** TASK-001
**Task title:** Project skeleton and account sign-in
**Priority:** P0
**Status:** Not started
**Assigned to:** AI agent

---

## Source requirement or spec section

`REQ-F-005` (private account), `REQ-NF-002` (only the account may read or write its data),
`SEC-A-001` (sign-in required); ADR-001 (modular monolith), ADR-002 (relational store).

## Business reason

Every recipe, plan, and list is private to one account, so nothing else can be built or
tested until an account can sign in and requests can be scoped to it.

## Goal

Stand up the modular-monolith skeleton and a working sign-in so a home cook has a private
account every later feature can be scoped to — one outcome: an authenticated session.

## Inputs

- [`technical-spec.md`](../../01-docs/04-technical-spec/technical-spec.md) §2, §7
- [`security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md) §1
- [`database-design.md`](../../01-docs/06-api-and-data-design/database-design.md) (Account)

## Expected files or components

The Account/Auth module, the API-layer skeleton, and config loading — inside the module
boundaries set by ADR-001.

## Expected output

A running app with config loading, an Account table, and sign-in / sign-out that establishes
a session; a signed-out request to any data route is refused.

## Step-by-step instructions

1. Create the modular-monolith skeleton (UI, API, domain modules, data layer) per ADR-001.
2. Add the Account entity with a store-neutral schema per ADR-002.
3. Implement sign-in, sign-out, and session handling (concrete model deferred — `Q-009`).
4. Refuse any data route without a signed-in session (SEC-A-001).

## Dependencies

None.

## Constraints / Boundaries

- Do not change unrelated files.
- Do not add unrequested features.
- Do not rename public interfaces unless this task explicitly requires it.
- Do not introduce a new dependency without approval.
- Use only portable SQL and types (ADR-002); no SQLite-only features.

## Do not change

No recipe, planning, or list behaviour exists yet — do not build it in this task.

## Acceptance check / Done criteria

The app runs; a cook can sign in and out; a signed-out request to a data route returns 401.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-007 | A cook signs in to their own private account | Session created; the cook reaches only their own data |
| STEST-002 | A protected route is opened with no session | 401 / sign-in prompt; no data returned |
| STEST-003 | Passwords are stored and logged | Only a hash is stored; no log line contains a password |
| FTEST-004 | A data action is attempted while signed out | 401 + sign-in prompt; no data changed |

## Review checklist

- [ ] Code matches the source requirement.
- [ ] No unrelated feature was added.
- [ ] Tests pass.
- [ ] Error messages are clear and safe.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Recipes, planning, list generation, and photos — later tasks.

## Stop condition

Stop and ask if the authentication model (`Q-009`) must be pinned down before proceeding.

---

> Blueprint: blueprints/02-tasks/02-task-files/TASK-001.md
