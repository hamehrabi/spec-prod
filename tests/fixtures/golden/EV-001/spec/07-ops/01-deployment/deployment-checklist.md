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
> here, under *Deployment readiness*. Deployment target is not decided yet — plan for a
> container (Q-012).

---

## Release identity

| Field | Value |
|---|---|
| Release name / version | Pantry v1.0 |
| Date | 2026-08-07 |
| Release owner | Developer |
| **Rollback owner** | Developer |
| Requirements included | REQ-F-001 … REQ-F-005 |

---

## Pre-release checklist (Ch. 23 §23.8)

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | Not started |
| Tests | Do unit, integration, and key end-to-end tests pass? | Not started |
| Configuration | Are required environment variables documented? | Ready — environment-config.md |
| Secrets | Are secrets stored outside source code? | Ready — `.gitignore` + `.env.example` |
| Build | Does the production build complete successfully? | Not started |
| Migration | Are database changes planned and reversible where possible? | Ready — MIG-001 |
| Monitoring | Are logs and error checks available after deployment? | Blocked on Q-018 |
| Rollback | Is the rollback path clear before release? | Ready — rollback-plan.md |

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

> **Never deploy a feature you cannot explain, test, and roll back.**

---

## Environments (Ch. 23 §23.2)

> [TODO: which environments will exist? — Q-017]

| Environment | Purpose | Typical data | Release rule |
|---|---|---|---|
| Local | You build and run the app while developing. | Small fake data | Fast changes are allowed. |
| Test | You run automated checks and verify behavior. | Controlled sample data | Only tested changes move forward. |
| Production | The cook depends on this. | Real recipe data | Only reviewed, deployable changes enter. |

---

## Deployment steps

```
1. Install dependencies.
2. Run linting and static checks.
3. Run unit and integration tests.
4. Build the production application.
5. Apply database migrations (schema before code).
6. Start the application.
7. Run a smoke test against the health endpoint.
8. Monitor logs for the first release window.
```

Commands for this project are set when the stack is chosen (TASK-001).

---

## Post-deploy smoke test

1. Sign in as a test cook.
2. Save a recipe with ingredients.
3. Create a weekly plan and add the recipe.
4. Generate the shopping list (the core action).
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
| Release owner | Developer | | Approve / Hold |
| Rollback owner | Developer | | Acknowledged |
| Security reviewer | Developer | | Pass / Block |

---

> Blueprint: blueprints/07-ops/01-deployment/deployment-checklist.md
