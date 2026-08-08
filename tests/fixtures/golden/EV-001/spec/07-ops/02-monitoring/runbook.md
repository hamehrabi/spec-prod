# Operational Runbook

> Source: Appendix N ("Are known issues, user messages, and operational runbooks
> documented?") + Ch. 22 + Ch. 24.
> What to do when something breaks — written **before** you need it.

---

## Service facts

| Item | Value |
|---|---|
| Service name | Pantry |
| Repository / location | This repository |
| Environments | local; test and production open (Q-019, Q-018) |
| Health endpoint | `/health` |
| Log location | Decided with the deployment target (Q-018) |
| Metrics dashboard | None planned until Q-020 sets the appetite |
| Error tracker | Same |
| On-call owner | The developer |
| Rollback approver | The developer |

## Start / stop / restart

```
Start:    decided with TASK-001's stack choice
Stop:     decided with TASK-001
Restart:  decided with TASK-001
Status:   check /health
Logs:     decided with the deployment target (Q-018)
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
| **Critical** | Data exposure, unauthorized access, total outage, **loss of the recipe library**. | Immediate | Roll back; security review; restore from backup. |
| **High** | Core flow broken; sign-in failing. | < 30 min | Investigate; roll back if not fixed quickly. |
| **Medium** | A secondary feature fails (photos, search ranking). | Same day | Fix forward with a task and test. |
| **Low** | Cosmetic or rare edge case. | Next cycle | Log as feedback. |

The 12 h RTO (Round 8) gives every severity level breathing room — but library loss has
no acceptable duration, which is why it sits in Critical.

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

### Database file problems (SQLite)
- [ ] Confirm the file at `DATABASE_PATH` exists and is not locked by another process.
- [ ] If corrupt: stop the application and restore per `backup-and-recovery.md` — never
      edit the live file.
- [ ] Confirm the photo directory and the database still agree after any restore.

### Photo storage drift
- [ ] Check for orphan files (file without a row) or orphan rows (row without a file).
- [ ] The write order is file first, then row (database-design addendum) — an orphan file
      is expected debris after a failure; an orphan row is a bug.

---

## Manual recovery procedures

| Situation | Procedure | Risk | Approver |
|---|---|---|---|
| Database corruption or accidental mass delete | Restore per `backup-and-recovery.md` §4 | Loses edits since the snapshot (≤ 24 h) | The developer |

---

## Do **not** do these during an incident

- Do not ask an AI agent to "fix everything" — work from evidence, one cause at a time
  (Ch. 19 §19.4).
- Do not deploy an unreviewed change to production to "try something."
- Do not disable a test or a validation rule to make an error disappear.
- Do not skip recording the incident once service is restored.

> Blueprint: blueprints/07-ops/02-monitoring/runbook.md
