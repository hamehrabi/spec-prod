# deployment-checklist.md — Deployment Checklist

> **Purpose (Ch. 4 §4.3):** The `/ops` folder stores deployment and maintenance notes.
> This is the release gate you run every time.
> **Sources:** Ch. 16 §16.9, Ch. 23 §23.8, Appendix N.

**Detail documents in this folder**

| Document | Covers |
|---|---|
| [`deployment-plan.md`](deployment-plan.md) | Full release plan template (Ch. 23 §23.9). |
| [`cicd-pipeline.md`](cicd-pipeline.md) | Install → lint → test → fitness → build → smoke gates. |
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
| Release name / version | Pantry v1.0 (first production release) |
| Date | 2026-08-08 |
| Release owner | The owner/developer (single-user B2C project) |
| **Rollback owner** | The owner/developer |
| Requirements included | REQ-F-001..006 (F-004 = generate one shopping list, CORE), REQ-NF-001..007, REQ-R-001, BR-001..004, SEC-A-001..004, SEC-Z-001..002 |

---

## Pre-release checklist (Ch. 23 §23.8)

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | Not started |
| Tests | Do unit, integration, and key end-to-end tests pass? | Not started |
| Configuration | Are required environment variables documented? | Not started |
| Secrets | Are secrets stored outside source code? | Not started |
| Build | Does the production build (container) complete successfully? | Not started |
| Migration | Are database changes planned and reversible (ADR-002)? | Not started |
| Monitoring | Are logs and error checks available after deployment? | Not started |
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

Local + production are known; a test environment between them is undecided (Q-015). The
app ships as a stateless **container** so the deployment target stays open (Q-017).

| Environment | Purpose | Typical data | Release rule |
|---|---|---|---|
| Local | You build and run the app while developing. | Small fake recipes/plans | Fast changes are allowed. |
| Test | You run automated checks and verify behavior. | [TODO: a test environment between local and production is undecided (Q-015)] | Only tested changes move forward. |
| Production | The single home cook depends on this. | Real recipes, plans, shopping lists, private photos | Only reviewed, deployable changes enter. |

> An environment is not just a server. It is a **promise about how carefully code should be
> handled** there. Local can be flexible. Production must be controlled.

---

## Deployment steps

```
1. Install dependencies.
2. Run linting and static checks.
3. Run unit and integration tests, plus the fitness functions (FF-001, FF-002, FF-003).
4. Build the production container image.
5. Apply database migrations (reversible — ADR-002).
6. Start the application (stateless container).
7. Run a smoke test against the health endpoint.
8. Monitor logs for the first release window.
```

Commands for this project:
```
Install:  [TODO: install command (Q-018)]
Lint:     [TODO: lint command (Q-018)]
Test:     [TODO: test + fitness-function command (Q-018)]
Build:    [TODO: build container image (Q-018)]
Migrate:  [TODO: migrate command (Q-018)]
Start:    [TODO: run command (Q-018)]
Smoke:    [TODO: smoke command against /health (Q-018)]
```

---

## Post-deploy smoke test

1. Sign in as the account owner.
2. Create a Recipe (the primary entity).
3. Add an IngredientLine to it, and add a PlannedMeal to the WeeklyPlan.
4. Generate the single ShoppingList from the week's plan (REQ-F-004, the core action).
5. Trigger the main failure path (e.g. generate with an empty plan) and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

**Evidence captured:** Captured at the first release (not yet run).

---

## Deployment approval (Appendix N)

- [ ] The release owner has reviewed the final checklist.
- [ ] A rollback owner is named.
- [ ] Monitoring is active **before** users depend on the feature.
- [ ] The team knows what signals indicate failure.
- [ ] Specs are updated to match the deployed behavior.

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | The owner/developer | 2026-08-08 | Hold — pending first pass |
| Rollback owner | The owner/developer | 2026-08-08 | Acknowledged |
| Security reviewer | The owner/developer | 2026-08-08 | Pending — deny tests STEST-001..005 must pass |

---

> Blueprint: blueprints/07-ops/01-deployment/deployment-checklist.md
