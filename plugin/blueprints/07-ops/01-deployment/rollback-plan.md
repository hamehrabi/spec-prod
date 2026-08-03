# Rollback Plan

> Source: Ch. 23 §23.7.
> Rollback means returning to a previous safe version after a release causes problems.
> **A rollback strategy must exist before deployment begins.** If you only start thinking
> about rollback after users are affected, you are already late.
>
> Rollback planning is part of responsible deployment, not a sign of failure.

**Release:**
**Date:**

---

## 1. Last known stable version

| Item | Value |
|---|---|
| Version / tag | |
| Commit SHA | |
| Deployed on | |
| Verified working by | |

## 2. Restore procedure

```
Application rollback:
1. 
2. 
3. 

Estimated time to restore:
Verification after restore:
```

## 3. Database rollback rule

| Question | Answer |
|---|---|
| Were there schema changes in this release? | Yes / No |
| Is the down migration tested? | Yes / No |
| Is a backup / restore point available? | Yes / No — taken at: |
| If the schema cannot be reversed, what is the forward-fix plan? | |

> If the migration is **not** reversible, rollback becomes roll-*forward*. Document that
> explicitly — do not discover it during an incident.

## 4. Health checks that trigger rollback

| Signal | Threshold | Observation window | Action |
|---|---|---|---|
| Error rate | | first _ minutes | Roll back |
| Core route availability | | continuous | Roll back |
| Response time | | first _ minutes | Investigate → roll back if sustained |
| Failed logins / auth errors | | | Roll back |
| Data integrity anomaly | any | immediate | Roll back |

## 5. Ownership

| Role | Name | Contact |
|---|---|---|
| Release owner | | |
| **Rollback approver** | | |
| On-call during window | | |

## 6. Communication

```
If users are affected, send:

"[Status] We identified an issue affecting [feature] starting at [time].
We have [rolled back / are rolling back] to the previous version.
[Expected resolution]. We will update at [time]."
```

| Audience | Channel | Who sends it |
|---|---|---|
| Users | | |
| Stakeholders | | |
| Team | | |

---

## Basic rollback strategy contents (Ch. 23 §23.7)

- [ ] The last known stable version.
- [ ] The command or manual step for restoring it.
- [ ] The database rollback rule.
- [ ] The health checks that trigger rollback.
- [ ] The person or role responsible for approving rollback.
- [ ] The communication message if users are affected.

---

## Post-rollback

- [ ] Record the incident in [`../review/debugging-specification.md`](../../05-review/04-debugging/debugging-specification.md).
- [ ] Add a regression test that would have caught it.
- [ ] Update the requirement / spec that was unclear.
- [ ] Update the agent rules if the mistake was AI-generated.
- [ ] Note what signal detected it — and what signal *should* have.

---

# WORKED EXAMPLE — ProjectBoard v1.0.0

**Release:** v1.0.0 · **Date:** 2026-04-05

## 1. Last known stable version

| Item | Value |
|---|---|
| Version / tag | `v0.9.3` |
| Commit SHA | `a4f19c2` |
| Deployed on | 2026-03-29 |
| Verified working by | Tech lead (smoke test 7/7) |

## 2. Restore procedure

```
Application rollback:
1. git checkout v0.9.3
2. npm ci && npm run build
3. (see section 3 - do NOT reverse MIG-003/MIG-004)
4. npm start
5. curl -f https://projectboard.example/health

Estimated time to restore:  ~6 minutes
Verification after restore: smoke steps 1-5 (login, create project, create task,
                            status change, empty-title rejection)
```

## 3. Database rollback rule

| Question | Answer |
|---|---|
| Were there schema changes in this release? | Yes — MIG-003 (index), MIG-004 (`export_jobs` table) |
| Is the down migration tested? | Yes, both, on a staging copy |
| Is a backup / restore point available? | Yes — snapshot 2026-04-05 09:40, taken before migrate |
| If the schema cannot be reversed, what is the forward-fix plan? | n/a — both changes are additive |

> **Important:** MIG-003 and MIG-004 are **additive**. Rolling the code back to v0.9.3 does
> not require dropping them — v0.9.3 simply ignores them. Dropping the index would make the
> rollback slower than the problem it is solving.
> **Roll back code first; leave additive schema alone.**

## 4. Health checks that trigger rollback

| Signal | Threshold | Window | Action |
|---|---|---|---|
| 5xx error rate | > 2% of requests | first 30 min | Roll back |
| `/health` | any non-200 | continuous | Roll back |
| Login success rate | < 95% of baseline | first 30 min | Roll back |
| p95 on `/tasks` | > 4 s | first 30 min | Investigate → roll back if sustained 10 min |
| Cross-project data leak | any occurrence | immediate | **Roll back immediately** |

## 5. Ownership

| Role | Name |
|---|---|
| Release owner | Tech lead |
| **Rollback approver** | Tech lead — *except* the data-leak trigger, which the on-call developer may act on without approval |
| On-call during window | Developer |

## 6. Communication

```
"[Status] We identified an issue affecting task creation starting at 10:05 UTC.
We have rolled back to the previous version. Task data created in that window is
intact. We will confirm full resolution by 11:00 UTC."
```

## The rollback that actually happened

> **v0.9.1, 2026-03-22.** The 5xx rate hit 6% four minutes after deploy. The on-call
> developer rolled back in five minutes **without waiting for approval** — the trigger
> table had made that decision pre-authorized rather than a judgement call under pressure.
> Root cause: a missing environment variable in production. That incident is why
> "Configuration" is now a blocking row on the production readiness checklist.

## Post-rollback

- [x] Incident recorded in `05-review/04-debugging/debugging-specification.md` (BUG-004)
- [x] Regression guard added — startup now fails fast on a missing required env var
- [x] `environment-config.md` gained the pre-deploy configuration check
- [x] Detected by: error-rate alert. **Should have been detected by:** a config check
      before deploy — which is why that check now exists.
