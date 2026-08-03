# Production Readiness Checklist

> Source: Appendix N + Ch. 23 §23.8 + Ch. 28 §28.13.
> A feature is **not** production-ready just because it works locally. It must be
> configured, observable, recoverable, secure, and maintainable.

**Release:**
**Date:**
**Release owner:**

---

## Readiness areas (Appendix N)

| Area | Readiness questions | Status |
|---|---|---|
| Requirements | Do released behaviors match approved requirements and acceptance criteria? | Not started / Ready / Blocked |
| Tests | Have unit, integration, end-to-end, security, and regression tests passed? | |
| Configuration | Are environment variables documented and separated by environment? | |
| Secrets | Are secrets stored outside source code? | |
| Build | Does the production build complete successfully? | |
| Database | Are migrations reversible or safely recoverable? | |
| Security | Have authentication, authorization, validation, and secrets been reviewed? | |
| Reliability | Are timeouts, retries, recovery paths, and background jobs specified? | |
| Monitoring | Are logs, metrics, traces, and alerts available for critical workflows? | |
| Rollback | Is there a clear rollback or roll-forward plan? | |
| Support | Are known issues, user messages, and operational runbooks documented? | |

---

## Deployment checklist (Ch. 23 §23.8)

| Check | Question | Status |
|---|---|---|
| Requirements | Do released features match approved requirements? | |
| Tests | Do unit, integration, and key end-to-end tests pass? | |
| Configuration | Are required environment variables documented? | |
| Secrets | Are secrets stored outside source code? | |
| Build | Does the production build complete successfully? | |
| Migration | Are database changes planned and reversible where possible? | |
| Monitoring | Are logs and error checks available after deployment? | |
| Rollback | Is the rollback path clear before release? | |

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

**Evidence captured:**

---

## Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | | | Approve / Hold |
| Rollback owner | | | Acknowledged |
| Security reviewer | | | Pass / Block |

---

# WORKED EXAMPLE — ProjectBoard v1.0.0

**Release:** v1.0.0 · **Date:** 2026-04-05 · **Release owner:** Tech lead

## Readiness areas

| Area | Readiness question | Status |
|---|---|---|
| Requirements | Do released behaviors match approved requirements and acceptance criteria? | **Ready** — RTM audit 2026-04-04, 0 open gaps |
| Tests | Have unit, integration, E2E, security, and regression tests passed? | **Ready** — 61/61 |
| Configuration | Are env vars documented and separated by environment? | **Ready** — 11 keys, 3 environments |
| Database | Are migrations reversible or safely recoverable? | **Ready** — MIG-003, MIG-004 both additive + down scripts |
| Security | Auth, authorization, validation, secrets reviewed? | **Ready** — passed 2026-04-01 after BUG-003 |
| Reliability | Timeouts, retries, recovery paths, background jobs specified? | **Ready** — export job spec'd with 2 retries |
| Monitoring | Logs, metrics, alerts available for critical workflows? | **Ready** — 4 signals |
| Rollback | Clear rollback or roll-forward plan? | **Ready** — tag v0.9.3 |
| Support | Known issues, user messages, runbooks documented? | **Ready** — 2 known issues logged |

## Final release review

| Review area | Evidence | Decision |
|---|---|---|
| Requirements | RTM: 11 requirements, all with task + test + code + review | **Pass** |
| Behavior | 61 tests green; 7/7 smoke steps | **Pass** |
| Security | STEST-001…008 pass; BUG-003 fixed and regression-guarded | **Pass** |
| Reliability | FTEST-008/009/010 prove no false success, no lost work | **Pass** |
| Deployment | Rollback tested on staging; tag verified | **Pass** |
| Maintenance | Feedback register live; monthly drift review scheduled | **Pass** — owner: tech lead |

## Deployment approval

- [x] The release owner has reviewed the final checklist.
- [x] A rollback owner is named — developer on call.
- [x] Monitoring is active **before** users depend on the feature.
- [x] The team knows what signals indicate failure (5 triggers).
- [x] Specs are updated to match the deployed behavior (CHG-003, CHG-004, CHG-005).

| Role | Name | Date | Decision |
|---|---|---|---|
| Release owner | Tech lead | 2026-04-05 | **Approve** |
| Rollback owner | Developer on call | 2026-04-05 | Acknowledged |
| Security reviewer | Reviewer | 2026-04-01 | **Pass** |

## The release candidate that was held

> **v1.0-rc1, 2026-04-02 — HELD.** Every test passed. The build was green. The
> traceability audit found SEC-A-002 (session expiry) had a requirement and a test but
> **no implementation** — the test asserted a redirect that no code produced, and it was
> passing because the fixture never expired a token.
>
> "Tests pass" was true and meaningless. Held two days; TASK-015 completed; released
> 2026-04-05. This row is why **Requirements** sits above **Tests** in the table.
