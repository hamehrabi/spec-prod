# Operational Runbook

> Source: Appendix N ("Are known issues, user messages, and operational runbooks
> documented?") + Ch. 22 + Ch. 24.
> What to do when something breaks — written **before** you need it.

---

## Service facts

| Item | Value |
|---|---|
| Service name | |
| Repository / location | |
| Environments | local / test / production |
| Health endpoint | `/health` |
| Log location | |
| Metrics dashboard | |
| Error tracker | |
| On-call owner | |
| Rollback approver | |

## Start / stop / restart

```
Start:    
Stop:     
Restart:  
Status:   
Logs:     
```

---

## Incident procedure

1. **Confirm the signal.** What alerted? What is the evidence?
2. **Check the health endpoint** and the core user flow.
3. **Check recent changes.** Was there a deploy or migration in the window?
4. **Classify severity** (see table below).
5. **Decide: mitigate or roll back** → [`../ops/rollback-plan.md`](../01-deployment/rollback-plan.md)
6. **Communicate** if users are affected.
7. **Record** in [`../ops/maintenance-log.md`](../03-maintenance/maintenance-log.md)
   and [`../review/debugging-specification.md`](../../05-review/04-debugging/debugging-specification.md).

| Severity | Condition | Response time | Action |
|---|---|---|---|
| **Critical** | Data exposure, unauthorized access, total outage. | Immediate | Roll back; security review. |
| **High** | Core flow broken for many users; auth failing. | < 30 min | Investigate; roll back if not fixed quickly. |
| **Medium** | A secondary feature fails; job retries exhausted. | Same day | Fix forward with a task and test. |
| **Low** | Cosmetic or rare edge case. | Next cycle | Log as feedback. |

---

## Common failure playbooks

### Application will not start
- [ ] Check for missing/invalid environment variables (`environment-config.md`).
- [ ] Check the migration state — did a migration run partially?
- [ ] Check the last deploy log for build errors.

### High error rate after deploy
- [ ] Compare the error signature against the previous release.
- [ ] Check whether a rollback trigger threshold was crossed.
- [ ] Roll back; then diagnose from the failing test, not from guesswork.

### Slow responses
- [ ] Identify **which** user action is slow (Ch. 24 §24.5).
- [ ] Check for queries inside loops, overfetching, unbounded result sets.
- [ ] Compare against the target in `../tests/performance-tests.md`.

### External dependency failing
- [ ] Confirm the timeout and retry limits are being applied.
- [ ] Confirm the failure path shows the user the specified safe message.
- [ ] Confirm queued/pending work is not lost.

### Background jobs stuck
- [ ] Check job status values and retry counts.
- [ ] Check whether failures are idempotent-safe to retry.
- [ ] Confirm users see the correct pending/failed status.

---

## Manual recovery procedures

| Situation | Procedure | Risk | Approver |
|---|---|---|---|
| | | | |

---

## Do **not** do these during an incident

- Do not ask an AI agent to "fix everything" — work from evidence, one cause at a time
  (Ch. 19 §19.4).
- Do not deploy an unreviewed change to production to "try something."
- Do not disable a test or a validation rule to make an error disappear.
- Do not skip recording the incident once service is restored.

---

# WORKED EXAMPLE — ProjectBoard

## Service facts

| Item | Value |
|---|---|
| Service name | ProjectBoard |
| Environments | local / test / production |
| Health endpoint | `GET /health` |
| Log location | stdout → aggregated log store, 14-day retention |
| Metrics dashboard | "ProjectBoard — core" |
| Error tracker | grouped by `event` + `error_code` |
| On-call owner | Developer |
| Rollback approver | Tech lead (pre-authorized for data-leak trigger) |

## Start / stop / restart

```
Start:    npm start
Stop:     systemctl stop projectboard
Restart:  systemctl restart projectboard
Status:   curl -f https://projectboard.example/health
Logs:     journalctl -u projectboard -f
```

## Worked incident — INC-001, 2026-03-22

```
10:02  Deploy of v0.9.1 completes.
10:06  Alert: 5xx rate 6% (threshold 2%).
10:07  On-call checks /health -> 500.
10:07  Recent change? Yes - deploy 4 minutes ago. Window matches exactly.
10:08  Severity: HIGH (core flow broken for all users).
10:09  Rollback trigger met -> pre-authorized. Roll back to v0.9.0 started.
10:13  /health returns 200. Smoke steps 1-5 pass.
10:15  Users notified.
10:40  Root cause: SESSION_TIMEOUT_MINUTES was never set in production. The config
       loader raised KeyError on first authenticated request.
11:05  Guardrail added: startup validates all required env vars and exits with a
       named error instead of failing on first request.
```

**Follow-through:** recorded as BUG-004; `environment-config.md` gained the pre-deploy
configuration check; "Configuration" became a blocking row on the readiness checklist.

## Playbook applied — application will not start

- [x] Check for missing/invalid environment variables ← **this was the cause**
- [ ] Check the migration state
- [ ] Check the last deploy log for build errors

> The very first item found it. That ordering is not accidental — missing configuration
> has been the cause of 2 of 3 incidents on this service.

## Severity calls made so far

| Incident | Condition | Severity | Response time | Action |
|---|---|---|---|---|
| INC-001 | Total outage after deploy | High | 4 min | Rolled back |
| INC-002 | Viewer could edit tasks (BUG-003) | **Critical** | Same day | Fixed forward + security review |
| INC-003 | Task list slow on one large project | Medium | Next day | PTEST-003 + index |

## Do not do these during an incident — learned the hard way

- Do not ask an AI agent to "fix everything" — during INC-001 the first instinct was to
  paste the stack trace and ask for a patch. The evidence-first prompt found the missing
  variable in one pass instead.
- Do not deploy an unreviewed change to production to "try something."
- Do not disable a test or a validation rule to make an error disappear.
- Do not skip recording the incident once service is restored.
