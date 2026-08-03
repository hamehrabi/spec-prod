# backup-and-recovery.md — Availability, Backup, Restore

> **Purpose:** what happens when you lose the data, not just the release.
> **When you use it:** before first production deploy. Reviewed quarterly.
> **Note:** `rollback-plan.md` covers reversing a **release**. This covers losing **data**.

> **A backup you have never restored is not a backup — it is a hope.**
> The restore is the feature. The backup is just its input.

---

## 0. There are two different things to lose

Confusing them would produce a file that protects the wrong asset.

| Asset | Whose | Backed up by | Covered here? |
|---|---|---|---|
| **The kit's own repository** — blueprints, instructions, specs, CI | The kit author's | The kit author | **Yes** |
| **A published plugin version** | Distributed via the marketplace | The marketplace | Yes, briefly |
| **A developer's generated workspace** | Theirs | **Their own version control** | Only to state plainly that **the kit provides no backup and claims none** |

**The kit never deletes a developer's files** (`database-design.md` §7) and never copies them
anywhere (CON-007). Their `spec/` folder is committed to their repository — that is the whole
backup story, and it is theirs.

---

## 1. Availability target

| Uptime | Downtime / year | Downtime / month |
|---|---|---|
| 99.0% | 87 h 46 min | 7 h 18 min |
| 99.9% | 8 h 46 min | 43 min |
| 99.99% | 52 min | 4 min 23 s |
| 99.999% | 5 min 35 s | 26 s |

| Item | Value |
|---|---|
| Target uptime | **Not applicable — nothing runs.** There is no service, no endpoint, and no process the kit owns (ADR-002). A developer with the plugin installed can use it whether or not the kit author's repository, CI, or marketplace listing are reachable. |
| Measured how | n/a |
| Planned maintenance | n/a |
| Who is told when breached | n/a |

**Translated into the only availability that exists here:** *can a developer install the kit
today?* That depends on the marketplace, which is the host's to run. If it is down, existing
installations keep working and new ones wait. **No number is set, because none would be ours
to meet.**

## 2. RTO and RPO — the two numbers that matter

Applied to the one asset the kit author actually owns: **the repository**.

| Term | Question it answers | Answer |
|---|---|---|
| **RTO** — Recovery Time Objective | How long may we be unable to **release**? | **Up to 1 week.** Nothing here is time-critical to anyone. Under 50 users, no service to restore, no customer waiting. |
| **RPO** — Recovery Point Objective | How much **work** may we lose? | **~1 day.** |

> **Your RPO *is* your backup frequency.** Here that means: **push to the remote at least
> daily.** An RPO of one day and a habit of pushing weekly is a stated RPO of one day and a
> real one of seven. The number above is a commitment to a push cadence, not an aspiration.

## 3. What is backed up

| Asset | Method | Frequency | Retention | Where | Encrypted |
|---|---|---|---|---|---|
| The repository (blueprints, instructions, specs, CI, fixtures) | `git push` to the remote | **At least daily** — this *is* the RPO | Indefinite | Remote host, a different failure domain from the laptop | In transit; at rest per the host |
| Published plugin versions | Immutable once published | Per release | Per marketplace policy | Marketplace | Per host |
| Golden workspaces (eval fixtures) | Committed to the repository | With every change | Indefinite | With the repo | — |

☑ **Not backed up on purpose:**

| Not backed up | Why |
|---|---|
| **Generated workspaces in developers' repositories** | They are not ours and never leave their machines (CON-007, BR-014). Backing them up would require the telemetry the product is built not to have. |
| CI run artifacts and logs | Regenerable by re-running the gate. Storing them would cost space for zero recovery value. |
| The developer's model-usage cost data | The kit cannot see it (CON-007). |

**There are no secrets to back up.** The kit holds none (`security-specification.md` §5) —
which removes the asset most likely to be lost irrecoverably in a small project.

## 4. Restore procedure

```
1. Clone the repository from the remote onto a working machine.
2. Install the plugin locally from the clone and confirm the command registers.
3. Run the full CI gate locally, or push a branch and let CI run it.
4. Run one full intake against the "clean" repository fixture and confirm it completes
   and validates 12 of 12.
5. Confirm the published plugin version matches the version in the manifest.

Estimated restore time:   ~1 hour        (RTO is 1 week - very comfortable)
Verification:             the CI gate passes AND one manual intake completes
Who can perform it:       the kit author
Who must approve it:      nobody - restoring loses nothing
```

> **Step 4 is the one that matters.** A repository that clones and a gate that passes prove
> the files came back. Only an actual intake proves the **product** came back — and this is
> a product whose behaviour lives in prose that a checksum cannot validate.

## 5. Restore test log

> The one row that makes this file real.

| Date | What was restored | Into | Time taken | Result | Issues found |
|---|---|---|---|---|---|
| *(empty)* | | | | | |

**First test scheduled: before the first published release.** It is a hard gate on the
[`production-readiness-checklist.md`](production-readiness-checklist.md), not a nice-to-have.

The specific thing it is expected to catch: **something that only exists on the author's
machine.** A local plugin-install path, a marketplace credential, a CI secret, a step done by
hand once and never written down. That class of gap is invisible in a repository that looks
complete, and it is exactly what a clean-machine restore finds.

## 6. Failure scenarios

| Scenario | Detected by | Response | Loss | Owner |
|---|---|---|---|---|
| Laptop lost or dies | Immediately obvious | Clone from the remote; restore procedure above | ≤ 1 day of unpushed work (= RPO) | Kit author |
| Repository host outage | Push or clone fails | **Accepted.** Wait. Nothing depends on it being up | none | — |
| Marketplace outage | Install fails | **Accepted.** Existing installs keep working | none | — |
| A published version is broken | **Scheduled CI install test** (Round 8) | Publish a fix; the previous version stays installable | none | Kit author |
| **Host plugin format changes** | **Scheduled CI install test** — RISK-004's detector | Release a compatible version; existing workspaces are unaffected because they are plain Markdown | none | Kit author |
| Credential compromise | Host security alerts | Rotate repository and marketplace credentials | none — the kit holds no user data | Kit author |
| A developer loses their workspace | Their problem, in their repository | **Nothing the kit can do.** Their version control is the backup, which is why REQ-F-035 keeps `spec/` committed | none to us | The developer |
| **Ransomware on the author's machine** | Files unreadable | Clone from the remote. **No offline or immutable copy exists** | ≤ 1 day | Kit author |

> Two scenarios are **accepted rather than solved** — host and marketplace outages. Both are
> someone else's infrastructure, neither takes anything away from a developer who has already
> installed the kit, and mitigating them would mean building the private distribution channel
> the subdomain map explicitly rules out as waste.

## 7. Checklist

- [x] RTO and RPO agreed **explicitly** — Round 8, with the cost of the stricter option named.
- [ ] **Backups run automatically and alert on failure** — **they do not.** `git push` is manual, so the RPO depends on a human habit. `[TODO: is a daily push realistic? If not, lower the stated RPO to match reality rather than leaving a number nobody meets.]`
- [x] Backups live in a **different failure domain** than the working copy — remote host, not the laptop.
- [x] Encrypted in transit; the kit holds no secrets to protect at rest.
- [ ] **A restore has been performed and timed** — **not yet.** Scheduled before first release, and gated on the readiness checklist.
- [x] Restore time (~1 h) is within RTO (1 week).
- [ ] **Someone other than the author can perform the restore** — **no.** One person (CON-008). This is RISK-012, accepted knowingly: the mitigation is that this workspace exists, so the specs outlive the person.
- [ ] **One backup copy is offline or immutable** — **not in place.** Accepted for v1 at this scale; revisit if the repository ever holds anything that cannot be reassembled.
- [x] Retention satisfies any legal or contractual requirement — none apply. **Q-007 (licence and attribution) is a separate open question and is not settled by this row.**

> **Four unticked boxes, each with a reason.** The one to fix first is the second: an RPO of
> one day that depends on remembering to push is a number, not a control. Either automate it
> or write down the number that is actually true.

> Blueprint: ../../../spec-driven-template/07-ops/01-deployment/backup-and-recovery.md
