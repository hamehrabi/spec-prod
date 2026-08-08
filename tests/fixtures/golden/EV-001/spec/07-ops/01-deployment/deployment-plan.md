# Deployment Plan

> Source: Ch. 23 §23.9 (Deployment Planning Template) + Ch. 16 §16.9.
> **Practical rule:** do not ask an AI agent to "make this production ready" after the code
> is already messy. Give the agent deployment requirements **before** implementation begins.

The deployment target is deliberately undecided (Round 8: "not decided yet"). The plan
below **assumes a container** — the posture that keeps every target open at no cost — and
carries the target itself as Q-018.

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
Deploy version 1.0 of Pantry so a home cook can save recipes, plan a week of meals,
generate one shopping list from that week, and search their saved recipes.

Release must include:
- Save a recipe with its ingredient lines (REQ-F-001)
- Plan a week (REQ-F-002)
- Generate one shopping list from that week (REQ-F-003)
- Search saved recipes (REQ-F-004)
- production configuration template
- smoke test for /health
```

## 2. Requirements included

| Req ID | Requirement | Test evidence ID |
|---|---|---|
| REQ-F-001 | Save a recipe with its ingredient lines. | ATEST-001 |
| REQ-F-002 | Plan which meals to cook in a week. | ATEST-002 |
| REQ-F-003 | Generate one shopping list from a weekly plan. | ATEST-003, ATEST-005 |
| REQ-F-004 | Search saved recipes. | ATEST-004 |
| REQ-NF-001 | Generation ≤ 2 s; search ≤ 1 s at stated volumes. | PTEST-001, PTEST-002 |
| REQ-NF-003 | Failures are plain, keep input, never claim false success. | FTEST-005, FTEST-008 |
| SEC-A-001 / REQ-NF-002 | Signed in before any data. | STEST-002 |
| REQ-R-001 / SEC-Z-001 | Account scoping on every query. | STEST-001 |

## 3. Environments (Ch. 23 §23.2)

| Environment | Purpose | Typical data | Release rule |
|---|---|---|---|
| Local | You build and run the app while developing. | Small fake data, SQLite file | Fast changes are allowed. |
| Test | You run automated checks and verify behavior. | Controlled sample data — a 500-recipe fixture for PTEST-002 | Only tested changes move forward. [TODO: which environments will exist? — Q-019] |
| Production | Real users depend on this. | The real recipe library | Only reviewed, deployable changes enter. Target: [TODO: where will this run? — Q-018] |

> An environment is not just a server. It is a **promise about how carefully code should be
> handled** in that place. Local can be flexible. Production must be controlled.

## 4. Configuration

→ [`../ops/environment-config.md`](environment-config.md) · [`../.env.example`](../../.)

| Config key | Purpose | Example value | Security note |
|---|---|---|---|
| `APP_ENV` | Identifies the current environment. | local / test / production | Not secret. |
| `DATABASE_PATH` | Path to the SQLite database file (ADR-002). | `./data/pantry.db` | The file it names holds everything — protect the file, not the path. |
| `PHOTO_STORAGE_PATH` | Directory for private dish photos (Round 6). | `./data/photos` | Same. |
| `LOG_LEVEL` | Controls logging detail. | info / warn / error | Avoid `debug` in production. |

The authentication secret is added when Q-009 chooses the model — it will be a **secret**.

## 5. Secrets that must not appear in code

- The authentication secret the Q-009 model requires — the only secret version one will
  have, since no external service exists (Round 6).

## 6. Build and test commands

```
Install:  decided with TASK-001's stack choice
Lint:     decided with TASK-001
Test:     decided with TASK-001 — one command for the whole 03-tests/05-executable tree
Build:    decided with TASK-001
Start:    decided with TASK-001
Smoke:    the production smoke test in end-to-end-tests.md
```

## 7. Database migration plan

→ [`database-migration-plan.md`](database-migration-plan.md)

## 8. Deployment steps

1. Install dependencies.
2. Run linting and static checks.
3. Run unit and integration tests.
4. Build the production application.
5. Apply database migrations.
6. Start the application.
7. Run a smoke test against the health endpoint.
8. Monitor logs for the first release window.

## 9. Smoke test

→ [`../tests/end-to-end-tests.md`](../../03-tests/02-functional/end-to-end-tests.md) (Production smoke test)

## 10. Monitoring checks

→ [`monitoring-plan.md`](../02-monitoring/monitoring-plan.md) — appetite open, Q-020.

## 11. Rollback

→ [`rollback-plan.md`](rollback-plan.md)

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

> Blueprint: blueprints/07-ops/01-deployment/deployment-plan.md
