# deployment-checklist.md — Deployment Checklist

> **Purpose (Ch. 4 §4.3):** The `/ops` folder stores deployment and maintenance notes.
> This is the release gate you run every time.
> **Sources:** Ch. 16 §16.9, Ch. 23 §23.8, Appendix N.

**Detail documents in this folder**

| Document | Covers |
|---|---|
| [`deployment-plan.md`](deployment-plan.md) | Full release plan template (Ch. 23 §23.9). |
| [`cicd-pipeline.md`](cicd-pipeline.md) | Install → lint → test → build → smoke gates. |
| [`database-migration-plan.md`](database-migration-plan.md) | Reversibility, backfill, deploy order. |
| [`rollback-plan.md`](rollback-plan.md) | Stable version, triggers, owner, comms. |
| [`production-readiness-checklist.md`](production-readiness-checklist.md) | Full Appendix N pass + sign-off. |
| [`environment-config.md`](environment-config.md) | Every config key and its security note. |
| [`runbook.md`](../02-monitoring/runbook.md) | What to do when something breaks. |

> **No container file ships with this workspace.** Packaging is a decision about your stack,
> not a template — write the image definition next to the code and record what it assumes
> here, under *Deployment readiness*. A `Dockerfile` copied from a specification kit is the
> one you never read.

> **Practical rule (Ch. 23):** do not ask an AI agent to "make this production ready" after
> the code is already messy. Give the agent deployment requirements **before**
> implementation begins.

---

## Release identity

| Field | Value |
|---|---|
| Release name / version | |
| Date | |
| Release owner | |
| **Rollback owner** | |
| Requirements included | REQ-### |

---

## Pre-release checklist (Ch. 23 §23.8)

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | Not started / Ready / Blocked |
| Tests | Do unit, integration, and key end-to-end tests pass? | |
| Configuration | Are required environment variables documented? | |
| Secrets | Are secrets stored outside source code? | |
| Build | Does the production build complete successfully? | |
| Migration | Are database changes planned and reversible where possible? | |
| Monitoring | Are logs and error checks available after deployment? | |
| Rollback | Is the rollback path clear before release? | |

## Deployment readiness (Ch. 16 §16.9)

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

## Environments (Ch. 23 §23.2)

| Environment | Purpose | Typical data | Release rule |
|---|---|---|---|
| Local | You build and run the app while developing. | Small fake data | Fast changes are allowed. |
| Test | You run automated checks and verify behavior. | Controlled sample data | Only tested changes move forward. |
| Production | Real users depend on this. | Real user data | Only reviewed, deployable changes enter. |

> An environment is not just a server. It is a **promise about how carefully code should be
> handled** there. Local can be flexible. Production must be controlled.

---

## Deployment steps

```
1. Install dependencies.
2. Run linting and static checks.
3. Run unit and integration tests.
4. Build the production application.
5. Apply database migrations.
6. Start the application.
7. Run a smoke test against the health endpoint.
8. Monitor logs for the first release window.
```

Commands for this project:
```
Install:  
Lint:     
Test:     
Build:    
Migrate:  
Start:    
Smoke:    
```

---

## Post-deploy smoke test

1. Sign in as a test user.
2. Create the primary entity.
3. Add a child record.
4. Perform the core action.
5. Trigger the main failure path and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

**Evidence captured:**

---

## Deployment approval (Appendix N)

- [ ] The release owner has reviewed the final checklist.
- [ ] A rollback owner is named.
- [ ] Monitoring is active **before** users depend on the feature.
- [ ] The team knows what signals indicate failure.
- [ ] Specs are updated to match the deployed behavior.

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | | | Approve / Hold |
| Rollback owner | | | Acknowledged |
| Security reviewer | | | Pass / Block |

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

# WORKED EXAMPLE — ProjectBoard v1.0.0

## Release identity

| Field | Value |
|---|---|
| Release name / version | ProjectBoard v1.0.0 |
| Date | 2026-04-05 |
| Release owner | Tech lead |
| **Rollback owner** | Developer on call |
| Requirements included | REQ-AUTH-001/006, SEC-A-002, REQ-F-001/003/005/006/007, REQ-NF-001, BR-003, BR-004 |

## Pre-release checklist

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | **Ready** — RTM audit 2026-04-04 |
| Tests | Do unit, integration, and key E2E tests pass? | **Ready** — 61 pass, 0 fail |
| Configuration | Are required env vars documented? | **Ready** — 8 keys in environment-config.md |
| Secrets | Are secrets stored outside source? | **Ready** — 2 managed secrets, `.env` gitignored |
| Build | Does the production build complete? | **Ready** |
| Migration | Are DB changes planned and reversible? | **Ready** — MIG-003, MIG-004, both with down scripts |
| Monitoring | Are logs and error checks available? | **Ready** — 4 signals wired |
| Rollback | Is the rollback path clear before release? | **Ready** — tag v0.9.3 |

## Deployment readiness

- [x] Requirements were satisfied.
- [x] Technical design was followed.
- [x] Tests passed.
- [x] No unrelated files were changed.
- [x] Configuration values are known.
- [x] Database changes are documented.
- [x] Error handling is acceptable.
- [x] Rollback steps are written.
- [x] Monitoring or manual checks are planned.

## Commands run

```
npm ci
npm run lint
pytest 03-tests/05-executable -q        # 61 passed
npm run build
python manage.py migrate                # MIG-003, MIG-004
npm start
curl -f https://projectboard.example/health
```

## Post-deploy smoke test — evidence

| Step | Result |
|---|---|
| 1. Sign in as smoke user | ✅ 200, session created |
| 2. Create project "Smoke 2026-04-05" | ✅ 201 |
| 3. Add a task | ✅ 201, status `todo` |
| 4. Move task to `done` | ✅ 200 |
| 5. Submit an empty title | ✅ 400, safe message, no row |
| 6. Confirm logs | ✅ `AUTH_LOGIN_SUCCESS`, `TASK_CREATED` with request_id |
| 7. Confirm monitoring | ✅ no critical errors in the 30-min window |

## Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | Tech lead | 2026-04-05 | **Approve** |
| Rollback owner | Developer on call | 2026-04-05 | Acknowledged |
| Security reviewer | Reviewer | 2026-04-01 | **Pass** (after BUG-003 fix) |

## The release that was held

> v1.0-rc1 on 2026-04-02 was **held**, not shipped. The traceability audit found SEC-A-002
> (session expiry) had a spec and a test but no implementation. "Tests pass" was true —
> there simply was no code for that requirement to fail against. Held for two days,
> TASK-015 completed, then released.
