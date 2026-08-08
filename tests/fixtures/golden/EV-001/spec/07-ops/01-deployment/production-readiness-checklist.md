# Production Readiness Checklist

> Source: Appendix N + Ch. 23 §23.8 + Ch. 28 §28.13.
> A feature is **not** production-ready just because it works locally. It must be
> configured, observable, recoverable, secure, and maintainable.

**Release:** Pantry v1.0 (first production release)
**Date:** 2026-08-08
**Release owner:** The owner/developer (single-user B2C project)

---

## Readiness areas (Appendix N)

| Area | Readiness questions | Status |
|---|---|---|
| Requirements | Do released behaviors match approved requirements and acceptance criteria? | Not started |
| Tests | Have unit, integration, end-to-end, security, and regression tests passed? | Not started |
| Configuration | Are environment variables (`APP_ENV`, `DATABASE_URL`, `APP_SECRET`) documented and separated by environment? | Not started |
| Secrets | Are secrets stored outside source code? | Not started |
| Build | Does the production container build complete successfully? | Not started |
| Database | Are migrations reversible or safely recoverable (ADR-002)? | Not started |
| Security | Have the deny tests (STEST-001..005) and SEC-A-001..004 / SEC-Z-001..002 been reviewed? | Not started |
| Reliability | Are timeouts, retries, recovery paths, and REQ-NF-003 reliability specified? Are FF-001, FF-002, FF-003 green? | Not started |
| Monitoring | Are structured logs + error alerts available for critical workflows (baseline; Q-016)? | Not started |
| Rollback | Is there a clear rollback plan that never loses the recipe library? | Not started |
| Support | Are known issues, user messages, and the backup/restore requirement documented? | Not started |

---

## Deployment checklist (Ch. 23 §23.8)

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | Not started |
| Tests | Do unit, integration, and key end-to-end tests pass? | Not started |
| Configuration | Are required environment variables documented? | Not started |
| Secrets | Are secrets stored outside source code? | Not started |
| Build | Does the production container build complete successfully? | Not started |
| Migration | Are database changes planned and reversible (ADR-002)? | Not started |
| Monitoring | Are logs and error checks available after deployment? | Not started |
| Rollback | Is the rollback path clear before release? | Not started |

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
| Requirements | Did we build what was requested? | Requirements (REQ-F-001..006, REQ-NF-001..007, REQ-R-001) and traceability matrix. | Pass / Fix gaps |
| Behavior | Does the system do what the spec says? | Test results, incl. the core flow REQ-F-004 (generate one list). | Pass / Improve |
| Security | Can the owner access only their own data? | Deny tests STEST-001..005 and code review evidence. | Pass / **Block release** |
| Reliability | Does the system recover from common failures? | REQ-NF-003 reliability, timeout/logging tests, FF-001/FF-002/FF-003 green. | Pass / Add failure handling |
| Deployment | Can we release and roll back safely? | Deployment checklist, rollback plan, and the backup/restore requirement — a tested restore of the recipe library. | Pass / Delay release |
| Maintenance | Will the spec stay current after release? | Feedback loop, structured logs (Q-016), spec-drift process. | Pass / Assign owner |

---

## Post-release smoke test

Run against the **deployed** system, not localhost.

1. Sign in as the account owner.
2. Create a Recipe (the primary entity).
3. Add an IngredientLine and a PlannedMeal to the WeeklyPlan.
4. Generate the single ShoppingList from the week's plan (REQ-F-004, the core action).
5. Trigger the main failure path and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

**Evidence captured:** Captured at the first release (not yet run).

---

## Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | The owner/developer | 2026-08-08 | Hold — pending first pass |
| Rollback owner | The owner/developer | 2026-08-08 | Acknowledged |
| Security reviewer | The owner/developer | 2026-08-08 | Pending — STEST-001..005 must pass |

---

> Blueprint: blueprints/07-ops/01-deployment/production-readiness-checklist.md
