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
| Target uptime | |
| Measured how | *from where, on which endpoint* |
| Planned maintenance excluded? | |
| Who is told when it is breached | |

> Each extra nine costs roughly an order of magnitude more. **Pick the one the business
> will actually pay for**, not the one that sounds serious.

## 2. RTO and RPO — the two numbers that matter

| Term | Question it answers | Your answer |
|---|---|---|
| **RTO** — Recovery Time Objective | How long may we be **down**? | |
| **RPO** — Recovery Point Objective | How much **data** may we lose? | |

Your RPO **is** your backup frequency. Nightly backups mean an RPO of 24 hours — say that
out loud to whoever owns the data before you write it down.

## 3. What is backed up

| Asset | Method | Frequency | Retention | Where | Encrypted |
|---|---|---|---|---|---|
| Database | | | | *different failure domain from production* | |
| Uploaded files / objects | | | | | |
| Secrets / config | | | | | |
| Audit log | | | | | |

☐ **Not backed up on purpose:** ____________ — *why:* ____________

## 4. Restore procedure

```
1.
2.
3.

Estimated restore time:            (must be ≤ RTO)
Verification after restore:
Who can perform it:
Who must approve it:
```

## 5. Restore test log

> The one row that makes this file real.

| Date | What was restored | Into | Time taken | Result | Issues found |
|---|---|---|---|---|---|
| | | staging | | ✅ / ❌ | |

## 6. Failure scenarios

| Scenario | Detected by | Response | Data loss | Owner |
|---|---|---|---|---|
| Single instance dies | health check | restart / replace | none | |
| Database corruption | | restore to point in time | up to RPO | |
| Accidental mass delete | user report | | | |
| Region / provider outage | | | | |
| Ransomware / compromised credentials | | *(needs an offline or immutable copy)* | | |

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

## WORKED EXAMPLE — ProjectBoard

### Availability

| Item | Value |
|---|---|
| Target | **99.5%** — about 3 h 39 min/month |
| Measured | External check on `GET /health`, 1 min interval |
| Planned maintenance | Excluded, announced 48 h ahead |
| Told when breached | Product owner |

> **Why not 99.9%.** It was the first instinct. 99.9% means 43 min/month, which rules out
> a single instance with a restart window and effectively mandates redundancy —
> contradicting CON-004 (one low-cost instance). The team wrote **99.5%** and named the
> constraint. That is a decision; "we'll aim for high availability" is not.

### RTO / RPO

| Term | Value | Reasoning |
|---|---|---|
| **RTO** | **4 hours** | An internal-facing tool. A half-day outage is painful, not fatal. |
| **RPO** | **24 hours** | Nightly backup. Explicitly accepted by the product owner: *"losing a day of task edits is survivable; losing the project list is not."* |

### What is backed up

| Asset | Method | Frequency | Retention | Where | Encrypted |
|---|---|---|---|---|---|
| Postgres | Managed snapshot | Nightly 02:00 UTC | 30 days | Provider, separate region | ✅ |
| Export files | — | — | 7 days (auto-purge) | — | n/a |
| Secrets | Manual export to password manager | On rotation | current + 1 | Outside the platform | ✅ |
| Audit log | In the database | (with DB) | 30 days | | ✅ |

☐ **Not backed up on purpose:** generated CSV exports — *why:* regenerable from source
data in under 60 s. Backing them up would cost storage for zero recovery value.

### Restore procedure

```
1. Provision a new database instance from the most recent snapshot.
2. Point DATABASE_URL at it (07-ops/01-deployment/environment-config.md).
3. Restart the application.
4. Run smoke steps 1-5 (07-ops/01-deployment/deployment-checklist.md).
5. Confirm the most recent task in the UI, and note how much data was lost.

Estimated restore time:  ~35 minutes   (RTO is 4 h - comfortable)
Verification:            smoke test + newest-record check
Who can perform:         tech lead, developer on call
Who must approve:        product owner (a restore discards data written since the snapshot)
```

### Restore test log

| Date | What | Into | Time | Result | Issues found |
|---|---|---|---|---|---|
| 2026-03-30 | Full DB snapshot | staging | 38 min | ✅ | **Restored database had no application user** — the role lived only in a hand-run script. Fixed by moving role creation into MIG-001. |
| 2026-06-30 | Full DB snapshot | staging | 31 min | ✅ | None |

> **This is why the file exists.** The first restore *"worked"* — the data was all there.
> The application still could not connect, because a database role had been created by
> hand once, months earlier, and never written down. Discovered on a Tuesday afternoon in
> staging instead of during an outage.

### Failure scenarios

| Scenario | Detected by | Response | Data loss | Owner |
|---|---|---|---|---|
| Instance dies | `/health` alert | Platform restarts automatically | none | auto |
| DB corruption | Error rate + failed queries | Restore latest snapshot | ≤ 24 h | Tech lead |
| Accidental project delete | User report | Restore to staging, re-import that project | none if caught in 30 days | Tech lead |
| Provider region outage | External check | **Accepted.** Wait for provider. | none | — |
| Credential compromise | Audit log / alert | Rotate all secrets, restore if data altered | ≤ 24 h | Tech lead |

> Region outage is **accepted, not solved** — multi-region contradicts CON-004. That is
> written down so nobody is surprised, and so the decision is revisited when the
> constraint changes rather than during the incident.

### Checklist status

- [x] RTO/RPO agreed with the product owner — not chosen by engineering alone
- [x] Backups automatic, **alert on failure**
- [x] Different region from production
- [x] Encrypted, key held separately
- [x] **Restore performed and timed — twice**
- [x] 35 min ≪ 4 h RTO
- [x] Two people can perform it
- [ ] **Offline/immutable copy — NOT in place.** Accepted risk for v1; RISK-006, revisit at v2.
- [x] 30 days satisfies the client contract

---

> Blueprint source: this file is new to the template — added to close the
> availability / backup / recovery layer.
