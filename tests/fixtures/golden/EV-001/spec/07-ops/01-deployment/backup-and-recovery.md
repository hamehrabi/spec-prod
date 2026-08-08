# backup-and-recovery.md — Availability, Backup, Restore

> **Purpose:** what happens when you lose the data, not just the release.
> **When you use it:** before first production deploy. Reviewed quarterly.
> **Note:** `rollback-plan.md` covers reversing a **release**. This covers losing **data**.

> **A backup you have never restored is not a backup — it is a hope.**
> The restore is the feature. The backup is just its input.

The Round 8 answer, verbatim, is the whole design brief for this file: *"A day of edits
would sting but survive. Losing the recipe library would end the project — those are years
of handwritten cards. Being down a whole evening is fine; nobody cooks from it at 3am."*
Durability of the recipe library outranks everything else on this page, including restore
speed.

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
| Target uptime | 99.0% — about 7 h/month. Proposed by the kit from "being down a whole evening is fine"; no number was asked for. |
| Measured how | An external check on the health endpoint, once the deployment target exists ([TODO: where will this run? — Q-018]). |
| Planned maintenance excluded? | Yes — one user, who is also the operator. |
| Who is told when it is breached | The developer. There is nobody else. |

> Each extra nine costs roughly an order of magnitude more. **Pick the one the business
> will actually pay for**, not the one that sounds serious.

## 2. RTO and RPO — the two numbers that matter

| Term | Question it answers | Your answer |
|---|---|---|
| **RTO** — Recovery Time Objective | How long may we be **down**? | **12 hours** — a whole evening and the night after it, from the Round 8 answer. |
| **RPO** — Recovery Point Objective | How much **data** may we lose? | **24 hours** for edits. **The recipe library itself may never be lost** — its loss would end the project, so library durability is a separate, stricter promise than the daily RPO. |

Your RPO **is** your backup frequency. Nightly backups mean an RPO of 24 hours — say that
out loud to whoever owns the data before you write it down. Here it was said, verbatim,
by the developer.

## 3. What is backed up

| Asset | Method | Frequency | Retention | Where | Encrypted |
|---|---|---|---|---|---|
| Database (the SQLite file at `DATABASE_PATH` — the recipe library lives here) | File-level snapshot of the closed database | Nightly | 30 days, plus one long-lived copy per month for the library | [TODO: where will this run? — Q-018] — must be a different failure domain from production | Yes |
| Uploaded files (dish photos at `PHOTO_STORAGE_PATH`) | Directory copy alongside the database snapshot | Nightly | 30 days | Same as above | Yes |
| Secrets / config | Manual copy of `.env` values to the developer's password manager | On change | Current + 1 | Outside the deployment platform | Yes |
| Audit log | ☐ Not backed up on purpose — no audit log exists in version one. *Revisit when:* one is added. | — | — | — | — |

## 4. Restore procedure

```
1. Stop the application.
2. Replace the file at DATABASE_PATH with the chosen snapshot.
3. Replace the PHOTO_STORAGE_PATH directory with its matching copy.
4. Start the application and run the production smoke test (end-to-end-tests.md).
5. Open the most recently saved recipe and note how much data was lost.

Estimated restore time:            Unmeasured until the first test below — must be ≤ 12 h (RTO)
Verification after restore:        Smoke test + newest-recipe check
Who can perform it:                The developer
Who must approve it:               The developer — a restore discards edits since the snapshot
```

## 5. Restore test log

> The one row that makes this file real.

| Date | What was restored | Into | Time taken | Result | Issues found |
|---|---|---|---|---|---|

## 6. Failure scenarios

| Scenario | Detected by | Response | Data loss | Owner |
|---|---|---|---|---|
| Single instance dies | health check | restart / replace | none | Developer |
| Database corruption | failed queries, error rate | restore last night's snapshot | up to 24 h | Developer |
| Accidental mass delete | the developer notices | restore; the monthly library copy bounds the worst case | up to 24 h of edits; the library survives | Developer |
| Region / provider outage | external check | wait — 12 h RTO absorbs an evening | none | Developer |
| Ransomware / compromised credentials | unexpected changes, alerts | restore from the offline monthly copy *(needs an offline or immutable copy — this is the scenario that ends the project without one)* | up to a month of edits in the worst case; the library survives | Developer |

## 7. Checklist

- [x] RTO and RPO agreed **with the business**, not chosen by engineering alone — the Round 8 answer is the agreement, in the owner's own words
- [ ] Backups run automatically and **alert on failure** *(a silent backup job is the most common failure)* — configurable once Q-018 is answered
- [ ] Backups live in a **different failure domain** than production — depends on Q-018
- [ ] Backups are encrypted, and the key is not stored with them
- [ ] **A restore has been performed and timed** — at least once
- [ ] Restore time is within RTO
- [ ] Someone other than the author can perform the restore — not possible in a one-person project; accepted, and revisited if anyone joins
- [ ] One backup copy is offline or immutable *(ransomware — the library-ending scenario, so this is the highest-priority open row)*
- [x] Retention satisfies any legal or contractual requirement — there are none; personal data only

---

> Blueprint source: this file is new to the template — added to close the
> availability / backup / recovery layer.

> Blueprint: blueprints/07-ops/01-deployment/backup-and-recovery.md
