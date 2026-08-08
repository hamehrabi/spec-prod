# Production Readiness Checklist

> Source: Appendix N + Ch. 23 §23.8 + Ch. 28 §28.13.
> A feature is **not** production-ready just because it works locally. It must be
> configured, observable, recoverable, secure, and maintainable.

**Release:** Pantry v1.0 — no release has been prepared yet; this checklist runs before the first one.
**Date:** —
**Release owner:** The developer

---

## Readiness areas (Appendix N)

| Area | Readiness questions | Status |
|---|---|---|
| Requirements | Do released behaviors match approved requirements and acceptance criteria? | Not started |
| Tests | Have unit, integration, end-to-end, security, and regression tests passed? | Not started |
| Configuration | Are environment variables documented and separated by environment? | Not started |
| Secrets | Are secrets stored outside source code? | Not started |
| Build | Does the production build complete successfully? | Not started |
| Database | Are migrations reversible or safely recoverable? | Not started |
| Security | Have authentication, authorization, validation, and secrets been reviewed? | Not started — authentication waits on Q-009 |
| Reliability | Are timeouts, retries, recovery paths, and background jobs specified? | Not started — the reliability spec is written; its tests are not |
| Monitoring | Are logs, metrics, traces, and alerts available for critical workflows? | Not started — appetite open (Q-020) |
| Rollback | Is there a clear rollback or roll-forward plan? | Not started |
| Support | Are known issues, user messages, and operational runbooks documented? | Not started — user messages wait on Q-022 |

---

## Deployment checklist (Ch. 23 §23.8)

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | Not started |
| Tests | Do unit, integration, and key end-to-end tests pass? | Not started |
| Configuration | Are required environment variables documented? | Not started |
| Secrets | Are secrets stored outside source code? | Not started |
| Build | Does the production build complete successfully? | Not started |
| Migration | Are database changes planned and reversible where possible? | Not started |
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
| Requirements | Did we build what was requested? | Requirements document and traceability matrix. | Pass / Fix gaps |
| Behavior | Does the system do what the spec says? | Test results and review screens. | Pass / Improve |
| Security | Can users access only allowed data? | Permission tests and code review evidence. | Pass / **Block release** |
| Reliability | Does the system recover from common failures? | Retry, timeout, queue, and logging tests. | Pass / Add failure handling |
| Deployment | Can we release and roll back safely? | Deployment checklist and rollback plan. | Pass / Delay release |
| Maintenance | Will the spec stay current after release? | Feedback loop, monitoring, spec-drift process. | Pass / Assign owner |

---

## Post-release smoke test

Run against the **deployed** system, not localhost.

1. Sign in as a test user.
2. Create the primary entity.
3. Add a child record.
4. Perform the core action.
5. Trigger the main failure path and confirm the safe message.
6. Confirm logs and audit events exist.
7. Confirm monitoring shows no critical errors.

**Evidence captured:** none yet — fills at the first release.

---

## Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | The developer | | Approve / Hold |
| Rollback owner | The developer | | Acknowledged |
| Security reviewer | The developer | | Pass / Block |

> Blueprint: blueprints/07-ops/01-deployment/production-readiness-checklist.md
