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
| Release name / version | Pantry v1.0 — no release has been prepared yet |
| Date | — |
| Release owner | The developer |
| **Rollback owner** | The developer |
| Requirements included | REQ-F-001–004, REQ-NF-001–006, REQ-R-001 |

---

## Pre-release checklist (Ch. 23 §23.8)

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | Not started |
| Tests | Do unit, integration, and key end-to-end tests pass? | Not started |
| Configuration | Are required environment variables documented? | Not started |
| Secrets | Are secrets stored outside source code? | Not started |
| Build | Does the production build complete successfully? | Not started |
| Migration | Are database changes planned and reversible where possible? | Not started |
| Monitoring | Are logs and error checks available after deployment? | Not started — appetite open (Q-020) |
| Rollback | Is the rollback path clear before release? | Not started |

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
| Test | You run automated checks and verify behavior. | Controlled sample data | Only tested changes move forward. Existence open — Q-019. |
| Production | Real users depend on this. | The real recipe library | Only reviewed, deployable changes enter. Target open — Q-018. |

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
Install:  decided with TASK-001's stack choice
Lint:     decided with TASK-001
Test:     decided with TASK-001
Build:    decided with TASK-001
Migrate:  decided with TASK-001
Start:    decided with TASK-001
Smoke:    the production smoke test in end-to-end-tests.md
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

**Evidence captured:** none yet — fills at the first release.

---

## Deployment approval (Appendix N)

- [ ] The release owner has reviewed the final checklist.
- [ ] A rollback owner is named.
- [ ] Monitoring is active **before** users depend on the feature.
- [ ] The team knows what signals indicate failure.
- [ ] Specs are updated to match the deployed behavior.

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | The developer | | Approve / Hold |
| Rollback owner | The developer | | Acknowledged |
| Security reviewer | The developer | | Pass / Block |

> Blueprint: blueprints/07-ops/01-deployment/deployment-checklist.md
