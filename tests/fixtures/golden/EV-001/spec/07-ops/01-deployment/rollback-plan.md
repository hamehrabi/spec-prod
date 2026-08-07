# Rollback Plan

> Source: Ch. 23 §23.7.
> Rollback means returning to a previous safe version after a release causes problems.
> **A rollback strategy must exist before deployment begins.** If you only start thinking
> about rollback after users are affected, you are already late.
>
> Rollback planning is part of responsible deployment, not a sign of failure.

**Release:** Pantry v1.0
**Date:** 2026-08-07

---

## 1. Last known stable version

| Item | Value |
|---|---|
| Version / tag | — (v1.0 is the first release) |
| Commit SHA | — |
| Deployed on | — |
| Verified working by | — |

## 2. Restore procedure

```
Application rollback:
1. Check out the previous stable tag.
2. Rebuild and restart.
3. Leave additive schema changes in place (a previous version ignores them).
4. Confirm GET /health returns 200 and run the smoke steps.

Estimated time to restore:
Verification after restore: smoke steps (sign in, save recipe, generate list)
```

## 3. Database rollback rule

| Question | Answer |
|---|---|
| Were there schema changes in this release? | MIG-001 creates the initial schema. |
| Is the down migration tested? | Must be tested before production. |
| Is a backup / restore point available? | Take one before running migrations (see backup-and-recovery.md). |
| If the schema cannot be reversed, what is the forward-fix plan? | Prefer additive changes; roll code back and leave additive schema in place. |

> If the migration is **not** reversible, rollback becomes roll-*forward*. Document that
> explicitly — do not discover it during an incident.

## 4. Health checks that trigger rollback

| Signal | Threshold | Observation window | Action |
|---|---|---|---|
| Error rate (5xx) | > 2% of requests | first 30 min | Roll back |
| Core route availability (`/health`) | any non-200 | continuous | Roll back |
| Response time | core action sustained slow | first 30 min | Investigate → roll back if sustained |
| Cross-account data leak | any occurrence | immediate | **Roll back immediately** |

## 5. Ownership

| Role | Name | Contact |
|---|---|---|
| Release owner | Developer (single owner) | — |
| **Rollback approver** | Developer | — |
| On-call during window | Developer | — |

## 6. Communication

```
If users are affected, send:

"[Status] We identified an issue affecting [feature] starting at [time].
We have [rolled back / are rolling back] to the previous version.
[Expected resolution]. We will update at [time]."
```

| Audience | Channel | Who sends it |
|---|---|---|
| The cook (user) | in-app / email | Developer |

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

> Blueprint: blueprints/07-ops/01-deployment/rollback-plan.md
