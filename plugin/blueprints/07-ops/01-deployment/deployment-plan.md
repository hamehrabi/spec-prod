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

*What this release makes possible, in user terms.*

```
Release Goal
Deploy version 1.0 of [product] so [role] can [core capability].

Release must include:
- [feature]
- [feature]
- production configuration template
- smoke test for /health
```

## 2. Requirements included

| Req ID | Requirement | Test evidence |
|---|---|---|
| REQ-### | | TEST-### |

## 3. Environments (Ch. 23 §23.2)

| Environment | Purpose | Typical data | Release rule |
|---|---|---|---|
| Local | You build and run the app while developing. | Small fake data | Fast changes are allowed. |
| Test | You run automated checks and verify behavior. | Controlled sample data | Only tested changes move forward. |
| Production | Real users depend on this. | Real user data | Only reviewed, deployable changes enter. |

> An environment is not just a server. It is a **promise about how carefully code should be
> handled** in that place. Local can be flexible. Production must be controlled.

## 4. Configuration

→ [`../ops/environment-config.md`](environment-config.md) · [`../.env.example`](../../.)

| Config key | Purpose | Example value | Security note |
|---|---|---|---|
| `APP_ENV` | Identifies the current environment. | local / test / production | Not secret. |
| `DATABASE_URL` | Connects the app to its database. | connection string | **Secret** in production. |
| `JWT_SIGNING_KEY` | Signs authentication tokens. | long random value | Must never be printed in logs. |
| `LOG_LEVEL` | Controls logging detail. | info / warn / error | Avoid `debug` in production. |

## 5. Secrets that must not appear in code

-

## 6. Build and test commands

```
Install:  
Lint:     
Test:     
Build:    
Start:    
Smoke:    
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

→ [`monitoring-plan.md`](../02-monitoring/monitoring-plan.md)

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

---

## Prompts

**Ask the agent for a pipeline plan (Ch. 23 §23.4)**
```
Using the requirements, technical specification, and test plan below, create a simple
deployment pipeline. Include install, lint, test, build, smoke test, deployment
verification, and rollback readiness. Do not assume any external repository. Keep the
steps executable from the project folder.
```

**Controlled deployment task for an agent (Ch. 23 §23.9)**
```
Using the approved technical specification and deployment checklist, create the deployment
support files for [project].

You must produce:
1. A production environment variable template.
2. A simple Dockerfile.
3. A smoke test script for /health.
4. A deployment checklist in markdown.
5. A rollback note explaining how to return to the previous stable version.

Do not change application behavior unless a required deployment file exposes a missing
requirement.
```

**Deployment review (Appendix J)**
```
Review this deployment plan for environment setup, configuration, migrations, rollback,
monitoring, and production readiness.
```

---

# WORKED EXAMPLE — ProjectBoard v1.0

```
1.  Release name:  ProjectBoard v1.0.0
2.  Release goal:  Authenticated users can create projects, create tasks under projects,
                   update task status from todo to done, and export a project to CSV.
3.  Approved requirements included:
       REQ-AUTH-001, REQ-AUTH-006, SEC-A-002,
       REQ-F-001, REQ-F-003, REQ-F-005, REQ-F-006, REQ-F-007,
       REQ-NF-001, BR-003, BR-004
4.  Environments:
       Local:      SQLite, seeded fake data
       Test:       Postgres, 500-task fixture project (for PTEST-003)
       Production: Postgres, single low-cost instance (CON-004)
5.  Required configuration values:
       APP_ENV, APP_PORT, APP_BASE_URL, DATABASE_URL, JWT_SIGNING_KEY,
       SESSION_TIMEOUT_MINUTES, LOG_LEVEL, EXPORT_MAX_ROWS
6.  Secrets that must not appear in code:
       DATABASE_URL, JWT_SIGNING_KEY
7.  Build command:   npm run build
8.  Test command:    pytest 03-tests/05-executable -q
9.  Database migration plan:
       MIG-003 add index tasks(project_id, status)  - reversible, no lock at this size
       MIG-004 add export_jobs table                - reversible, new table only
       Order: schema first, then application code.
10. Deployment steps:
       install -> lint -> test -> build -> migrate -> start -> smoke -> watch logs 30 min
11. Smoke test:      ETEST production script, steps 1-7
12. Monitoring checks: error rate, p95 on /tasks, export job failures, failed logins
13. Rollback steps:  see rollback-plan.md (tag v0.9.3)
14. Final approval checklist: production-readiness-checklist.md
```

## Configuration as deployed

| Config key | Purpose | Production value | Security note |
|---|---|---|---|
| `APP_ENV` | Identifies the environment. | `production` | Not secret. |
| `DATABASE_URL` | Database connection. | *(managed secret)* | **Secret.** |
| `JWT_SIGNING_KEY` | Signs session tokens. | *(managed secret)* | **Secret** — never logged. |
| `SESSION_TIMEOUT_MINUTES` | Idle expiry (SEC-A-002). | `30` | Not secret. |
| `LOG_LEVEL` | Logging detail. | `info` | `debug` would leak request bodies. |
| `EXPORT_MAX_ROWS` | Guard on CSV size. | `50000` | Not secret. |

## What the plan caught before release

> Writing step 9 exposed that MIG-003 had been written to run **after** the code that used
> the index. On a 500-task fixture nobody would notice; on production data the first list
> query after deploy would have timed out. The order was corrected to schema-first.
