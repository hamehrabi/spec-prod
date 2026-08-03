# Rollback Plan

> Source: Ch. 23 §23.7.
> `backup-and-recovery.md` covers losing **data**. This covers reversing a **release**.

---

## The shape of rollback here is unusual — read this first

There is no single production to revert. **Every developer runs whichever version they
installed**, on their own machine, on their own schedule.

| Conventional rollback | Here |
|---|---|
| Revert the deployment; everyone is back on the old version in minutes | **Impossible.** Nobody's installation changes because you publish something |
| Blast radius shrinks the moment you roll back | Blast radius **only shrinks as people upgrade** — and some never will |
| The fix is to redeploy | The fix is to **publish a superseding version and tell people** |

**Consequence:** a bad release cannot be recalled. It can only be superseded. That makes the
pre-publish checklist the real control, and this document the damage limitation.

---

## Rollback triggers — with thresholds

Publish a superseding version immediately if **any** of these is true:

| # | Trigger | Threshold | Why this threshold |
|---|---|---|---|
| T1 | Installation fails | **Any** confirmed failure on any supported platform | The kit is unusable; there is no partial degradation to tolerate |
| T2 | Intake cannot complete | **Any** confirmed case with a documented answer script | Same |
| T3 | **A file is written outside `spec/`** | **One occurrence** | The promise that makes the kit safe to try on real work. Zero tolerance |
| T4 | **A developer's existing file was modified** | **One occurrence** | As above, and worse — it is unrecoverable for anyone who had not committed |
| T5 | Validation reports success on a workspace that fails a check | **One occurrence** | BR-009. A workspace that looks validated and is not is worse than no validation |
| T6 | Blueprint back-links broken by a rename with no migration note | Any release where step 5 of the release procedure was missed | Silent, and it damages workspaces already generated |
| T7 | Systematic quality regression | Eval deterministic scorers fall below floor on the published artifact | The output is degrading and nobody outside CI can see it |

**T3 and T4 are the two that justify publishing a fix the same day**, ahead of anything else
in progress. Every other trigger is urgent; those two are about someone else's repository.

## Rollback owner

**Kit author.** One person (CON-008), so there is no escalation path and no second approver —
which means the trigger thresholds above have to be unambiguous enough to act on alone. That
is why each is *one occurrence* rather than a judgement call.

---

## Procedure

```
 1. CONFIRM the trigger with a reproducible case: which version, which platform,
    which answer script. A report without a repro is not yet a trigger.
 2. Decide: SUPERSEDE (fix forward) or DELIST (remove the bad version).
       - Supersede is almost always right; it is the only thing that reaches users.
       - Delist only stops NEW installs. It does nothing for people already on it.
       - For T3/T4, do BOTH.
 3. Write the fix. It gets a task, a requirement link, and a regression test that
    FAILS against the bad version. (Ch. 19 §19.6)
 4. Run the full gate. Do not shortcut it because the fix is urgent - an urgent fix
    that breaks something else is how a bad day becomes a bad week.
 5. Publish the superseding version.
 6. Run the install smoke test against the PUBLISHED artifact.
 7. Announce it: release notes naming the affected versions and the symptom.
    [TODO: there is no announcement channel. Where would you tell users? Decide
    before the first release - during an incident is the wrong time to find out.]
 8. Record it in change-log.md AND debugging-specification.md, with root cause
    separated from symptom.
```

## What developers already on the bad version must do

State this plainly in the release notes, because they cannot be reached any other way:

| Situation | What they do |
|---|---|
| Bad version installed, not yet used | Upgrade. Nothing happened. |
| Bad version used, workspace generated | Upgrade, then re-run intake — resume will redo incomplete stages. Their hand-edits survive. |
| **T3/T4: a file outside `spec/` was touched** | **`git diff` their repository and revert what they did not intend.** Their version control is the only recovery — the kit has no undo, by design. |

> That last row is the strongest possible argument for REQ-F-035 (`spec/` is committed) and
> for never requesting blanket write permission. The recovery story for the worst failure
> mode is *the developer's own git history* — so anything that keeps their repository clean
> and their specs committed is load-bearing.

---

## What cannot be rolled back

| Cannot be undone | Mitigation |
|---|---|
| A version someone already installed | Supersede and announce. There is no recall. |
| A file written into someone's repository | Their version control. The kit never deletes. |
| A blueprint rename that broke existing back-links | The migration note — which is why it is a mandatory release step, not a courtesy. |

## Rollback readiness checklist

- [ ] The previous version is still installable
- [ ] Triggers and thresholds above are current
- [ ] A named owner exists — **yes, and it is one person; see RISK-012**
- [ ] An announcement channel exists — **`[TODO]`, and it is needed before the first release**
- [ ] A regression test can be written that fails against the bad version

> Blueprint: ../../../spec-driven-template/07-ops/01-deployment/rollback-plan.md
