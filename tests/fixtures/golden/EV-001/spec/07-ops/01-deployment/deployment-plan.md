# Deployment Plan

> Source: Ch. 23 §23.9 (Deployment Planning Template) + Ch. 16 §16.9.
> **Practical rule:** do not ask an AI agent to "make this production ready" after the code
> is already messy. Give the agent deployment requirements **before** implementation begins.

---

## Template (Ch. 23)

```
1.  Release name:
2.  Release goal:
3.  Approved requirements included:
4.  Environments:
      - Local:
      - Test:
      - Production:
5.  Required configuration values:
6.  Secrets that must not appear in code:
7.  Build command:
8.  Test command:
9.  Database migration plan:
10. Deployment steps:
11. Smoke test:
12. Monitoring checks:
13. Rollback steps:
14. Final approval checklist:
```

---

## 1. Release goal

```
Release Goal
Deploy version 1.0 of Pantry so a home cook can turn a week of chosen meals into ONE
shopping list.

Release must include:
- REQ-F-004 (generate one shopping list from the week's plan) — the core feature
- managing recipes and the weekly plan (REQ-F-001..006)
- production configuration template
- smoke test for /health
```

## 2. Requirements included

| Req ID | Requirement | Test evidence ID |
|---|---|---|
| REQ-F-004 | Generate ONE shopping list from the week's plan (CORE) | ATEST-002, UTEST-003, ITEST-004, ETEST-001 (→ traceability.md) |
| REQ-F-001..003, REQ-F-005..006 | Save recipes, search, plan a week, sign in, tick off | ATEST-001/005/006/007/008, UTEST-001/002/005, ITEST-001/002/003/005 |
| REQ-NF-001..007 | Non-functional (performance, reliability, accessibility, privacy) | PTEST-001/002, FTEST-001/002; governed by FF-001..003 |
| REQ-R-001 | Single owner role — one account, no sharing | STEST-001, STEST-002 |
| BR-001..004 | Business rules | ATEST-002, ITEST-003/006, FTEST-005/006 |
| SEC-A-001..004, SEC-Z-001..002 | Security requirements | STEST-001..005 (deny tests) |

## 3. Environments (Ch. 23 §23.2)

| Environment | Purpose | Typical data | Release rule |
|---|---|---|---|
| Local | You build and run the app while developing. | Small fake recipes and plans (SQLite) | Fast changes are allowed. |
| Test | You run automated checks and verify behavior. | [TODO: test environment between local and production is undecided (Q-015)] | Only tested changes move forward. |
| Production | The single home cook depends on this. | Real recipes, plans, lists, private photos | Only reviewed, deployable changes enter. |

> An environment is not just a server. It is a **promise about how carefully code should be
> handled** in that place. Local can be flexible. Production must be controlled.

## 4. Configuration

→ [`../ops/environment-config.md`](environment-config.md) · [`../.env.example`](../../.)

| Config key | Purpose | Example value | Security note |
|---|---|---|---|
| `APP_ENV` | Identifies the current environment. | local / test / production | Not secret. |
| `DATABASE_URL` | Connects the app to its database. | SQLite path now; Postgres URL later (ADR-002) | **Secret** in production. |
| `APP_SECRET` | Signs the session. | long random value | **Secret** — must never be printed in logs. |

## 5. Secrets that must not appear in code

- `APP_SECRET` (session signing) — mechanism depends on the deployment target (Q-017) and auth signing depends on Q-009.
- `DATABASE_URL` (once it points at a Postgres instance with credentials).

## 6. Build and test commands

```
Install:  [TODO: install command (Q-018)]
Lint:     [TODO: lint command (Q-018)]
Test:     [TODO: test + fitness-function command — FF-001, FF-002, FF-003 (Q-018)]
Build:    [TODO: build container image (Q-018)]
Start:    [TODO: run command (Q-018)]
Smoke:    [TODO: smoke command against /health (Q-018)]
```

## 7. Database migration plan

→ [`database-migration-plan.md`](database-migration-plan.md) — every migration reversible; schema portable SQLite → Postgres (ADR-002).

## 8. Deployment steps

1. Install dependencies.
2. Run linting and static checks.
3. Run unit and integration tests, plus fitness functions FF-001, FF-002, FF-003.
4. Build the production container image.
5. Apply database migrations (reversible — ADR-002).
6. Start the application (stateless container).
7. Run a smoke test against the health endpoint.
8. Monitor logs for the first release window.

## 9. Smoke test

→ [`../tests/end-to-end-tests.md`](../../03-tests/02-functional/end-to-end-tests.md) (Production smoke test)

## 10. Monitoring checks

→ [`monitoring-plan.md`](../02-monitoring/monitoring-plan.md) — baseline is structured logs + error alerts; monitoring appetite deferred (Q-016).

## 11. Rollback

→ [`rollback-plan.md`](rollback-plan.md) — a rollback must never lose the recipe library.

## 12. Final approval

→ [`production-readiness-checklist.md`](production-readiness-checklist.md)

---

## Deployment readiness checklist (Ch. 16 §16.9)

- [ ] Requirements were satisfied.
- [ ] Technical design was followed.
- [ ] Tests passed.
- [ ] No unrelated files were changed.
- [ ] Configuration values are known.
- [ ] Database changes are documented.
- [ ] Error handling is acceptable.
- [ ] Rollback steps are written.
- [ ] Monitoring or manual checks are planned.

> **Never deploy a feature you cannot explain, test, and roll back.** If you cannot
> describe what changed, why it changed, how it was tested, and what you will do if it
> fails, the feature is not ready.

---

> Blueprint: blueprints/07-ops/01-deployment/deployment-plan.md
