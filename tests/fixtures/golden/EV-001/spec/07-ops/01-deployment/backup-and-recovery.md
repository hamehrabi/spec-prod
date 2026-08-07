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
| Target uptime | ~99% is ample — being down an evening is acceptable (nobody cooks from it at 3am). |
| Measured how | External check on `GET /health`. |
| Planned maintenance excluded? | Yes. |
| Who is told when it is breached | The developer (single owner). |

> High availability is **not** a goal here. This is a personal tool; a few hours of downtime
> is survivable, so effort goes into **not losing the recipe library**, not into uptime nines.

## 2. RTO and RPO — the two numbers that matter

| Term | Question it answers | Your answer |
|---|---|---|
| **RTO** — Recovery Time Objective | How long may we be **down**? | **Up to an evening** (a few hours). Being down a whole evening is fine. |
| **RPO** — Recovery Point Objective | How much **data** may we lose? | **Up to a day of *edits*** (nightly backup). **But the recipe library must never be lost** — it is years of handwritten cards, and losing it would end the project. |

Your RPO **is** your backup frequency. Nightly backups mean an RPO of 24 hours for edits —
accepted. The recipe library gets **more** than that: a durable, tested, ideally offline copy,
because it is irreplaceable.

## 3. What is backed up

| Asset | Method | Frequency | Retention | Where | Encrypted |
|---|---|---|---|---|---|
| Database (recipes, plans, lists) | Full backup + a durable/off-site copy of the recipe data | Nightly | Long — recipes are irreplaceable | Different failure domain from the host | ✅ |
| Uploaded dish photos | Backed up with the account's data | Nightly | With the database | Different failure domain | ✅ (private) |
| Secrets / config | Manual export | On rotation | current + 1 | Outside the platform | ✅ |

☐ **Not backed up on purpose:** generated shopping lists — *why:* regenerable from the
weekly plan, which is in the database. (Kept in the DB backup anyway; not a separate concern.)

## 4. Restore procedure

```
1. Provision the store from the most recent backup.
2. Restore the dish-photo files alongside it.
3. Point the app at the restored data and restart.
4. Run the production smoke test (end-to-end-tests.md).
5. Confirm the most recent recipe is present, and note how much edit data was lost.

Estimated restore time:            within the RTO (an evening)
Verification after restore:        smoke test + newest-recipe check
Who can perform it:                the developer
Who must approve it:               the developer (a restore discards edits since the backup)
```

## 5. Restore test log

> The one row that makes this file real.

| Date | What was restored | Into | Time taken | Result | Issues found |
|---|---|---|---|---|---|

No restore has been tested yet — perform and time one against a copy **before** the first
production deploy. A backup that has never been restored is a hope, not a backup.

## 6. Failure scenarios

| Scenario | Detected by | Response | Data loss | Owner |
|---|---|---|---|---|
| Single instance dies | health check | restart / replace | none | developer |
| Database corruption | error rate / failed queries | restore latest backup | up to RPO (a day of edits) | developer |
| **Loss of the recipe library** | user report / failed reads | restore from the durable/off-site copy | **must be none** — the library is irreplaceable | developer |
| Accidental mass delete | user report | restore from backup | none if caught within retention | developer |
| Ransomware / compromised credentials | alert / anomalous access | rotate secrets; restore from an offline/immutable copy | up to RPO | developer |

## 7. Checklist

- [ ] RTO and RPO agreed **with the owner** — done: RTO an evening, RPO a day of edits, library irreplaceable
- [ ] Backups run automatically and **alert on failure**
- [ ] Backups live in a **different failure domain** than the host
- [ ] Backups are encrypted, and the key is not stored with them
- [ ] **A restore has been performed and timed** — at least once (not yet — do before first deploy)
- [ ] Restore time is within RTO
- [ ] Someone other than the author can perform the restore (n/a — single owner; write it down clearly instead)
- [ ] One backup copy of the **recipe library** is offline or immutable — strongly recommended (years of cards)
- [ ] Retention keeps the recipe library effectively forever

---

> Blueprint source: this file is new to the template — added to close the
> availability / backup / recovery layer.

> Blueprint: blueprints/07-ops/01-deployment/backup-and-recovery.md
