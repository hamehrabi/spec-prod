# Rollback Plan

> Source: Ch. 23 §23.7.
> Rollback means returning to a previous safe version after a release causes problems.
> **A rollback strategy must exist before deployment begins.** If you only start thinking
> about rollback after users are affected, you are already late.
>
> Rollback planning is part of responsible deployment, not a sign of failure.

**Release:** Pantry v1.0 — no release exists yet; this plan is completed with the first one.
**Date:** —

---

## 1. Last known stable version

| Item | Value |
|---|---|
| Version / tag | None yet — the first release creates the first stable tag. |
| Commit SHA | — |
| Deployed on | — |
| Verified working by | — |

## 2. Restore procedure

```
Application rollback:
1. Check out the last stable tag.
2. Rebuild and restart (commands fixed with TASK-001's stack).
3. Leave additive schema changes in place; reverse nothing during the incident.

Estimated time to restore:  unmeasured until the first release — must fit the 12 h RTO
Verification after restore: the production smoke test in end-to-end-tests.md
```

## 3. Database rollback rule

| Question | Answer |
|---|---|
| Were there schema changes in this release? | To be answered per release; MIG-001–005 are all additive by design. |
| Is the down migration tested? | Required before each release (database-migration-plan.md). |
| Is a backup / restore point available? | A nightly snapshot exists once backups run (backup-and-recovery.md); take one immediately before each migration. |
| If the schema cannot be reversed, what is the forward-fix plan? | Additive-only migrations are the standing rule, so rollback leaves schema in place; a genuinely irreversible change must document its forward fix before it ships. |

> If the migration is **not** reversible, rollback becomes roll-*forward*. Document that
> explicitly — do not discover it during an incident.

## 4. Health checks that trigger rollback

| Signal | Threshold | Observation window | Action |
|---|---|---|---|
| Error rate | > 2% of requests — proposed by the kit; no number was asked for | first 30 minutes | Roll back |
| Core route availability | `/health` non-200 | continuous | Roll back |
| Response time | Generation over its 2 s target (REQ-NF-001) | first 30 minutes | Investigate → roll back if sustained |
| Failed sign-ins | Baseline comparison once Q-009's model exists | first 30 minutes | Roll back |
| Data integrity anomaly | any | immediate | Roll back |

## 5. Ownership

| Role | Name | Contact |
|---|---|---|
| Release owner | The developer | — |
| **Rollback approver** | The developer | — |
| On-call during window | The developer | — |

## 6. Communication

```
If users are affected, send:

"[Status] We identified an issue affecting [feature] starting at [time].
We have [rolled back / are rolling back] to the previous version.
[Expected resolution]. We will update at [time]."
```

| Audience | Channel | Who sends it |
|---|---|---|
| Users | The one user is the operator — no message needed. | — |
| Stakeholders | None exist. | — |
| Team | One person. | — |

---

## Basic rollback strategy contents (Ch. 23 §23.7)

- [ ] The last known stable version.
- [ ] The command or manual step for restoring it.
- [x] The database rollback rule.
- [x] The health checks that trigger rollback.
- [x] The person or role responsible for approving rollback.
- [x] The communication message if users are affected.

The unchecked rows fill with the first release — there is no stable version to name yet.

---

## Post-rollback

- [ ] Record the incident in [`../review/debugging-specification.md`](../../05-review/04-debugging/debugging-specification.md).
- [ ] Add a regression test that would have caught it.
- [ ] Update the requirement / spec that was unclear.
- [ ] Update the agent rules if the mistake was AI-generated.
- [ ] Note what signal detected it — and what signal *should* have.

> Blueprint: blueprints/07-ops/01-deployment/rollback-plan.md
