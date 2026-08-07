# Operational Runbook

> Source: Appendix N ("Are known issues, user messages, and operational runbooks
> documented?") + Ch. 22 + Ch. 24.
> What to do when something breaks — written **before** you need it.

---

## Service facts

| Item | Value |
|---|---|
| Service name | Pantry |
| Repository / location | this repository |
| Environments | local / test / production (Q-017) |
| Health endpoint | `/health` |
| Log location | structured logs (destination set at deploy) |
| Metrics dashboard | — (Q-018) |
| Error tracker | grouped by `event` + reason |
| On-call owner | Developer (single owner) |
| Rollback approver | Developer |

## Start / stop / restart

```
Start:    start the app for the chosen stack
Stop:     stop the app
Restart:  restart the app
Status:   curl -f http://localhost:PORT/health
Logs:     tail the structured logs
```

---

## Incident procedure

1. **Confirm the signal.** What alerted? What is the evidence?
2. **Check the health endpoint** and the core user flow (plan → list).
3. **Check recent changes.** Was there a deploy or migration in the window?
4. **Classify severity** (see table below).
5. **Decide: mitigate or roll back** → [`../ops/rollback-plan.md`](../01-deployment/rollback-plan.md)
6. **Communicate** if the cook is affected.
7. **Record** in [`../ops/maintenance-log.md`](../03-maintenance/maintenance-log.md)
   and [`../review/debugging-specification.md`](../../05-review/04-debugging/debugging-specification.md).

| Severity | Condition | Response time | Action |
|---|---|---|---|
| **Critical** | Data exposure, cross-account access, loss of the recipe library, total outage. | Immediate | Roll back; restore data; review. |
| **High** | The core flow is broken; auth failing. | < 30 min | Investigate; roll back if not fixed quickly. |
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

### Lost or corrupt recipe data
- [ ] Stop writes if data is being corrupted.
- [ ] Restore from the most recent good backup (`../01-deployment/backup-and-recovery.md`).
- [ ] The recipe library is irreplaceable — prefer the durable/off-site copy.

### Background jobs stuck (photo cleanup)
- [ ] Check job status values and retry counts.
- [ ] Confirm failures are idempotent-safe to retry.

---

## Manual recovery procedures

| Situation | Procedure | Risk | Approver |
|---|---|---|---|
| Restore the recipe library | Restore from the durable backup; verify newest recipe. | Loses edits since the backup | Developer |

---

## Do **not** do these during an incident

- Do not ask an AI agent to "fix everything" — work from evidence, one cause at a time
  (Ch. 19 §19.4).
- Do not deploy an unreviewed change to production to "try something."
- Do not disable a test or a validation rule to make an error disappear.
- Do not skip recording the incident once service is restored.

---

> Blueprint: blueprints/07-ops/02-monitoring/runbook.md
