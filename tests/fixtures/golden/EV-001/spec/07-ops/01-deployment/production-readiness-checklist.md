# Production Readiness Checklist

> Source: Appendix N + Ch. 23 §23.8 + Ch. 28 §28.13.
> A feature is **not** production-ready just because it works locally. It must be
> configured, observable, recoverable, secure, and maintainable.

**Release:** Pantry v1.0
**Date:** 2026-08-07
**Release owner:** Developer

> The developer's explicit "safe to run for real" conditions were not asked at this depth —
> [TODO: what must be true before this is safe to run for real? — Q-013]. The standard
> readiness areas below apply meanwhile.

---

## Readiness areas (Appendix N)

| Area | Readiness questions | Status |
|---|---|---|
| Requirements | Do released behaviors match approved requirements and acceptance criteria? | Ready — spec complete |
| Tests | Have unit, integration, end-to-end, security, and regression tests passed? | Not started — planned |
| Configuration | Are environment variables documented and separated by environment? | Ready — environment-config.md |
| Secrets | Are secrets stored outside source code? | Ready — `.gitignore` + `.env.example` |
| Build | Does the production build complete successfully? | Not started |
| Database | Are migrations reversible or safely recoverable? | Ready — MIG-001 reversible |
| Security | Have authentication, authorization, validation, and secrets been reviewed? | Blocked — auth model open (Q-006) |
| Reliability | Are timeouts, retries, recovery paths, and background jobs specified? | Ready — reliability-specification.md |
| Monitoring | Are logs, metrics, traces, and alerts available for critical workflows? | Blocked — monitoring appetite open (Q-018) |
| Rollback | Is there a clear rollback or roll-forward plan? | Ready — rollback-plan.md |
| Support | Are known issues, user messages, and operational runbooks documented? | Ready — runbook.md |

---

## Deployment approval (Appendix N)

- [ ] The release owner has reviewed the final checklist.
- [ ] A **rollback owner is named**.
- [ ] Monitoring is active **before** users depend on the feature.
- [ ] The team knows what signals indicate failure.
- [ ] Specs are updated to match the deployed behavior.

---

## Final release review (Ch. 28 §28.13)

| Review area | Question | Evidence required | Decision |
|---|---|---|---|
| Requirements | Did we build what was requested? | Requirements document and traceability matrix. | Pass / Fix gaps |
| Behavior | Does the system do what the spec says? | Test results and review screens. | Pass / Improve |
| Security | Can users access only allowed data? | Permission tests and code review evidence. | Pass / **Block release** |
| Reliability | Does the system recover from common failures? | Retry, timeout, queue, and logging tests. | Pass / Add failure handling |
| Deployment | Can we release and roll back safely? | Deployment checklist and rollback plan. | Pass / Delay release |
| Maintenance | Will the spec stay current after release? | Feedback loop, monitoring, spec-drift process. | Pass / Assign owner |

---

## Post-release smoke test

Run against the **deployed** system, not localhost.

1. Sign in as a test cook.
2. Save a recipe with ingredients.
3. Create a weekly plan and add the recipe.
4. Generate the shopping list (the core action).
5. Trigger the main failure path and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

**Evidence captured:**

---

## Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | Developer | | Approve / Hold |
| Rollback owner | Developer | | Acknowledged |
| Security reviewer | Developer | | Pass / Block |

---

> Blueprint: blueprints/07-ops/01-deployment/production-readiness-checklist.md
