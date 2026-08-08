# Rollback Plan

> Source: Ch. 23 §23.7.
> Rollback means returning to a previous safe version after a release causes problems.
> **A rollback strategy must exist before deployment begins.** If you only start thinking
> about rollback after users are affected, you are already late.
>
> Rollback planning is part of responsible deployment, not a sign of failure.

**Release:** Pantry v1.0 (first production release)
**Date:** 2026-08-08

> **The one rule that overrides everything here:** a rollback must **never lose the recipe
> library**. Pair every app rollback with the backup/restore in
> [`backup-and-recovery.md`](backup-and-recovery.md) — the recipe library (Recipe +
> IngredientLine) is years of handwritten cards and is near zero-tolerance for loss.

---

## 1. Last known stable version

| Item | Value |
|---|---|
| Version / tag | None yet — this is the first production release; the stable tag is recorded when it is cut. |
| Commit SHA | Recorded at the first production deploy. |
| Deployed on | Pending the first production deploy. |
| Verified working by | The owner/developer, after the first smoke test. |

## 2. Restore procedure

```
Application rollback:
1. Redeploy the previous stable container image / git tag (stateless — no state to migrate back).
2. [TODO: exact build/run commands (Q-018)]
3. Confirm the recipe library is intact BEFORE and AFTER (see section 3 and backup-and-recovery.md).
4. Start the application.
5. Smoke: sign in, open a recipe, generate one shopping list (REQ-F-004).

Estimated time to restore:  a few hours at most — well within RTO (by the next evening)
Verification after restore: smoke steps (login, view recipe, generate one list) + confirm
                            Recipe/IngredientLine counts unchanged
```

## 3. Database rollback rule

| Question | Answer |
|---|---|
| Were there schema changes in this release? | Confirmed per release against database-migration-plan.md; the first release brings up the initial schema (ADR-002). |
| Is the down migration tested? | Yes — every migration is reversible (ADR-002); down migrations are tested on staging-like data. |
| Is a backup / restore point available? | Yes — the nightly off-box backup of the recipe library (backup-and-recovery.md); take a fresh restore point before running migrations. |
| If the schema cannot be reversed, what is the forward-fix plan? | Not applicable — ADR-002 requires reversible migrations; a down migration always exists. |

> If the migration is **not** reversible, rollback becomes roll-*forward*. Document that
> explicitly — do not discover it during an incident. Under ADR-002 this should not happen.
> **Never reverse a migration in a way that drops recipe data — restore from backup instead.**

## 4. Health checks that trigger rollback

| Signal | Threshold | Observation window | Action |
|---|---|---|---|
| Error rate | error alerts fire (baseline monitoring — Q-016) | first release window | Roll back |
| Core route availability | `/health` non-200, or "generate one list" (REQ-F-004) fails | continuous | Roll back |
| Response time | noticeably slow to load / generate a list | first release window | Investigate → roll back if sustained |
| Failed logins / auth errors | owner cannot sign in | immediate | Roll back |
| Data integrity anomaly (esp. missing/altered recipes) | any | immediate | **Roll back immediately and restore the recipe library from backup** |

## 5. Ownership

| Role | Name | Contact |
|---|---|---|
| Release owner | The owner/developer | Set by the owner |
| **Rollback approver** | The owner/developer | Set by the owner |
| On-call during window | The owner/developer | Set by the owner |

## 6. Communication

```
If users are affected, send:

"[Status] We identified an issue affecting [feature] starting at [time].
We have [rolled back / are rolling back] to the previous version.
[Expected resolution]. We will update at [time]."
```

| Audience | Channel | Who sends it |
|---|---|---|
| Users | The owner is the only user — self-aware; no external notice needed | n/a — single B2C user |
| Stakeholders | Not needed — no sharing, one account (single-user project) | n/a |
| Team | Recorded in the debugging spec (see Post-rollback) | The owner/developer |

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
