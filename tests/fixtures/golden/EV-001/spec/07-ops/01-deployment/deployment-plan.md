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
Deploy Pantry v1.0 so one home cook can save recipes, plan a week, and generate one
shopping list.

Release must include:
- Save a recipe; search recipes
- Plan a week; generate one shopping list
- Production configuration template
- Smoke test for /health
```

## 2. Requirements included

| Req ID | Requirement | Test evidence |
|---|---|---|
| REQ-F-002 | Save a recipe with ingredients | ITEST-001, E2E-001 |
| REQ-F-003 | Search recipes | ITEST-002 |
| REQ-F-004 | Plan a week | ITEST-003 |
| REQ-F-005 | Generate one shopping list | ATEST-001, E2E-002 |
| REQ-F-001 | Account and sign-in | STEST-002 (blocked on Q-006) |

## 3. Environments (Ch. 23 §23.2)

> [TODO: which environments will exist? — Q-017]. The standard three are described below;
> version one may run with fewer.

| Environment | Purpose | Typical data | Release rule |
|---|---|---|---|
| Local | You build and run the app while developing. | Small fake data (SQLite) | Fast changes are allowed. |
| Test | You run automated checks and verify behavior. | Controlled sample data | Only tested changes move forward. |
| Production | The cook depends on this. | Real recipe data | Only reviewed, deployable changes enter. |

> An environment is not just a server. It is a **promise about how carefully code should be
> handled** in that place.

## 4. Configuration

→ [`../ops/environment-config.md`](environment-config.md) · [`../.env.example`](../../.)

## 5. Secrets that must not appear in code

- `DATABASE_URL` (when on Postgres)
- The authentication secret, once the auth model is chosen (Q-006)

## 6. Build and test commands

```
Install:  install dependencies for the chosen stack
Lint:     run the linter / static checks
Test:     run the executable test suite (03-tests/05-executable)
Build:    build the production application
Start:    start the app
Smoke:    call GET /health and run the production smoke steps
```

The exact commands are set when the stack is chosen in TASK-001 (project structure).

## 7. Database migration plan

→ [`database-migration-plan.md`](database-migration-plan.md)

## 8. Deployment steps

1. Install dependencies.
2. Run linting and static checks.
3. Run unit and integration tests.
4. Build the production application.
5. Apply database migrations (schema before code).
6. Start the application.
7. Run a smoke test against the health endpoint.
8. Monitor logs for the first release window.

## 9. Smoke test

→ [`../tests/end-to-end-tests.md`](../../03-tests/02-functional/end-to-end-tests.md) (Production smoke test)

## 10. Monitoring checks

→ [`monitoring-plan.md`](../02-monitoring/monitoring-plan.md)

## 11. Rollback

→ [`rollback-plan.md`](rollback-plan.md)

## 12. Final approval

→ [`production-readiness-checklist.md`](production-readiness-checklist.md)

> **Deployment target:** not decided yet — plan for a container so the decision stays open
> at no cost (Q-012).

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
