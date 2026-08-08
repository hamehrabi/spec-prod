# backup-and-recovery.md — Availability, Backup, Restore

> **Purpose:** what happens when you lose the data, not just the release.
> **When you use it:** before first production deploy. Reviewed quarterly.
> **Note:** `rollback-plan.md` covers reversing a **release**. This covers losing **data**.

> **A backup you have never restored is not a backup — it is a hope.**
> The restore is the feature. The backup is just its input.

---

## 1. Availability target

State it as a number, then translate it — most people agree to "three nines" without
knowing what they agreed to.

| Uptime | Downtime / year | Downtime / month |
|---|---|---|
| 99.0% | 87 h 46 min | 7 h 18 min |
| 99.9% | 8 h 46 min | 43 min |
| 99.99% | 52 min | 4 min 23 s |
| 99.999% | 5 min 35 s | 26 s |

| Item | Value |
|---|---|
| Target uptime | **99.0%** — a single home cook uses this in the evening; a few hours down "by the next evening" is survivable. No 24/7 need. |
| Measured how | Manual — the owner notices if the app does not load; baseline is structured logs + error alerts (Q-016 monitoring appetite deferred). |
| Planned maintenance excluded? | Yes — a short evening maintenance window is acceptable; nobody cooks from it at 3am. |
| Who is told when it is breached | The owner (single B2C user, one account). |

> Each extra nine costs roughly an order of magnitude more. **Pick the one the business
> will actually pay for**, not the one that sounds serious.

## 2. RTO and RPO — the two numbers that matter

| Term | Question it answers | Your answer |
|---|---|---|
| **RTO** — Recovery Time Objective | How long may we be **down**? | **A few hours — restored by the next evening.** A whole evening down is fine; nobody cooks from it at 3am. No 24/7 requirement. |
| **RPO** — Recovery Point Objective | How much **data** may we lose? | **Up to ~24 hours of edits** (a nightly backup). A day of edits would sting but survive — *except* the recipe library, which is near zero-tolerance (see below). |

Your RPO **is** your backup frequency. Nightly backups mean an RPO of 24 hours — say that
out loud to whoever owns the data before you write it down.

> **The recipe-library exception.** A lost day of *edits* is survivable, so a nightly
> backup states a 24-hour objective honestly. But total loss of the **recipe library**
> (Recipe + IngredientLine — years of handwritten cards) would end the project, so its
> loss tolerance is effectively **zero**: it requires a durable, off-box copy and a
> periodically tested restore, regardless of what a day of edits costs.

## 3. What is backed up

| Asset | Method | Frequency | Retention | Where | Encrypted |
|---|---|---|---|---|---|
| Database (Account, Recipe, IngredientLine, WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem) | File/dump backup of the relational store (SQLite now, Postgres-ready — ADR-002) | Nightly | [TODO: retention window — set with deployment target (Q-017)] | Off-box, a different failure domain from production. Exact location set with the deployment target [TODO: Q-017] | [TODO: encryption-at-rest mechanism — set with deployment target and secret mechanism (Q-017)] |
| Recipe photos (private uploaded files — Q-008) | Included in the nightly off-box backup alongside recipe data | Nightly | [TODO: retention window (Q-017)] | Off-box, same durable location as the DB backup [TODO: Q-017] | [TODO: encryption-at-rest (Q-017)] |
| Secrets / config (`APP_SECRET`, `DATABASE_URL`) | Kept outside the repo; secret mechanism set with the deployment target | On change | current value | Outside the app, with the deployment target [TODO: Q-017] | Yes — held by the secret store, not with the backups |
| Audit / structured logs | In the app's structured logs (baseline monitoring) | continuous | not backed up on purpose — see below | local + production log output | n/a |

☐ **Not backed up on purpose:** structured application logs — *why:* they are an
operational signal (error alerts baseline, Q-016), not user data; the recipe library and
plans are the irreplaceable assets and are covered above.

## 4. Restore procedure

```
1. Provision a fresh instance of the relational store (SQLite file now; Postgres later — ADR-002).
2. Restore the most recent nightly backup of the database AND the recipe photos.
3. Point DATABASE_URL at the restored store (07-ops/01-deployment/environment-config.md).
4. Start the application and run the post-deploy smoke test (deployment-checklist.md).
5. Confirm the recipe library is intact — the recipe library must never be lost.

Estimated restore time:            a few hours, well within RTO (by the next evening)
Verification after restore:        smoke test + confirm Recipe/IngredientLine counts and a spot-check recipe
Who can perform it:                the owner/developer (single-user project)
Who must approve it:               the owner (a restore discards edits written since the nightly backup)
```

## 5. Restore test log

> The one row that makes this file real.

| Date | What was restored | Into | Time taken | Result | Issues found |
|---|---|---|---|---|---|
| — | — | — | — | — | No entries yet — a restore of the recipe library must be performed and timed before the first production deploy, then re-tested periodically. |

## 6. Failure scenarios

| Scenario | Detected by | Response | Data loss | Owner |
|---|---|---|---|---|
| Single instance dies | health check / app fails to load | restart / replace the stateless container | none | owner |
| Database corruption | error alerts + failed queries | restore latest nightly backup | up to RPO (~24 h of edits) | owner |
| Accidental mass delete | owner notices | restore latest nightly backup; recover the recipe library | up to ~24 h of edits; recipe library must not be lost | owner |
| Region / provider outage | app unreachable | wait for provider or redeploy the stateless container elsewhere; restore off-box backup if needed | none if backup intact | owner |
| Ransomware / compromised credentials | error alerts / anomaly | rotate `APP_SECRET`, restore from the durable off-box copy *(needs an offline or immutable copy)* | up to ~24 h; recipe library recovered from off-box copy | owner |

## 7. Checklist

- [ ] RTO and RPO agreed **with the business**, not chosen by engineering alone
- [ ] Backups run automatically and **alert on failure** *(a silent backup job is the most common failure)*
- [ ] Backups live in a **different failure domain** than production
- [ ] Backups are encrypted, and the key is not stored with them
- [ ] **A restore has been performed and timed** — at least once
- [ ] Restore time is within RTO
- [ ] Someone other than the author can perform the restore
- [ ] One backup copy is offline or immutable *(ransomware)*
- [ ] Retention satisfies any legal or contractual requirement

---

> Blueprint: blueprints/07-ops/01-deployment/backup-and-recovery.md
