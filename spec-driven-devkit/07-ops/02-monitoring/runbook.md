# Runbook

> Source: Ch. 24 §24.6.
> **Nothing is running, so nobody is on call.** This runbook is for the four situations that
> can actually happen, all of which arrive as a message rather than an alert.

**Owner:** kit author (one person — CON-008; there is no escalation path)

---

## RB-1 — The scheduled install test failed

**The most important entry here.** It is RISK-004's detector, and a failure means the
published plugin may no longer install for anyone.

```
1. CONFIRM manually. Install the published plugin into a clean repository yourself.
   Do not act on a CI failure alone - the failure may be in CI, not in the plugin.

2. Determine which side changed:
     - Did we publish recently?          -> our change; go to RB-2
     - Did the host release recently?    -> RSK-3 has occurred

3. If the host changed:
     a. Read the host's release notes. Identify what moved.
     b. Check whether EXISTING installations still work, or only new ones fail.
        These are very different blast radii and change the urgency.
     c. Fix against the DOCUMENTED mechanism. Never against an undocumented one -
        that is how this happens twice.
     d. Publish, then re-run the install test against the published artifact.

4. Record it in change-log.md and add a row to AGENT.md "Lessons from past mistakes"
   if it reveals a repeatable mistake.

Reassurance to give users: generated workspaces are UNAFFECTED. They are plain
Markdown and remain valid, readable, and committed. What breaks is the ability to
run a NEW intake - not anything they already have. (Mitigation 2, ADR-001/002.)
```

## RB-2 — A user reports the kit wrote outside `spec/`, or touched one of their files

**Triggers T3/T4 in [`rollback-plan.md`](../01-deployment/rollback-plan.md). Highest urgency in the project.**

```
1. Get the repro: version, platform, answer script, the exact path touched.
2. Tell the user immediately what to do:
       git diff, and revert anything they did not intend.
   Their version control is the only recovery. The kit has no undo, by design.
3. Reproduce locally. If confirmed:
       - Write a DENIAL test that FAILS against the bad version.
       - Fix. Run the full gate - do not shortcut it because it is urgent.
       - Publish, and delist the bad version so new installs cannot get it.
       - Announce, naming the affected versions and the symptom.
4. Root cause in debugging-specification.md, with root cause separated from symptom.
```

## RB-3 — A user reports a broken blueprint back-link

```
1. Ask for the version line in their spec/ entry-point file (ADR-005).
2. Compare against the installed plugin version.
   - Mismatch  -> expected. Point them at the migration note for that release.
   - Match     -> this is a real defect. Treat as RB-4.
3. Tell them plainly: NOTHING IS REQUIRED. A broken back-link is a navigation
   inconvenience, not corruption. Their specs are intact.
   Do NOT let them regenerate a workspace they have hand-edited.
4. If no migration note exists for that release, a release step was missed.
   Write it now, and add the check to deployment-checklist.md if it is absent.
```

## RB-4 — A user reports a hollow or malformed generated workspace

```
1. Ask for: the plugin version, their answer script if they can reconstruct it,
   and the specific file. Do NOT ask for their workspace contents - it is their
   confidential product information and we have no business holding it.
2. Reproduce with the nearest matching golden answer script.
3. If reproduced: this is RISK-002 or RISK-003 occurring in the field.
       - Add their case as a new answer script in the eval golden set.
         Real cases cover what invented ones did not - this is how the set grows.
       - Fix; verify against the whole set, not just their case.
4. If NOT reproduced: the gap is in the eval coverage, not the kit. Add the case
   anyway. An unreproducible report is evidence the fixtures are too narrow.
```

---

## What is deliberately absent

| Usual runbook entry | Why |
|---|---|
| Service is down | Nothing runs. |
| High error rate / latency | No process, no requests. |
| Database failover, restore to a point in time | No database. |
| Rotate a leaked credential | The kit holds none. |
| Scale up / drain a node | No infrastructure. |
| Page the on-call engineer | One person, no rota. |

---

## Standing rules for every entry above

1. **Never ask a user for their workspace contents.** It is their confidential product
   information. Ask for the version, the platform, and the symptom.
2. **Reproduce before fixing.** A report without a repro is a signal, not a diagnosis.
3. **Never shortcut the gate because a fix is urgent.** An urgent fix that breaks something
   else turns a bad day into a bad week.
4. **Every fix gets a regression test that failed against the bad version.** Anything else is
   a claim, not evidence (Ch. 19 §19.6).
5. **`[TODO]`: there is no channel for users to report anything.** Every entry here assumes a
   report arrives somehow. Decide where before the first release — during an incident is the
   wrong time to find out.

> Blueprint: ../../../spec-driven-template/07-ops/02-monitoring/runbook.md
