# Maintenance Log

> Source: Ch. 30.
> A dated record of what was actually done to keep the project healthy — distinct from
> `change-log.md` (what changed in the product) and `review-log.md` (what was reviewed).

---

## Log

| Date | Activity | Trigger | Outcome | Follow-up |
|---|---|---|---|---|
| 2026-08-03 | Specification intake completed — 8 rounds | New project | ~95-file workspace produced; 5 ADRs, 14 fitness functions, ~190 test IDs | Begin TASK-001 |
| | | | | |

---

## What belongs here

| Belongs | Does not |
|---|---|
| Routine activity actually performed — a restore test, an eval run, a drift review | Product changes → `change-log.md` |
| Dependency or platform updates | Code reviews → `review-log.md` |
| Incidents and what they cost | Bug root causes → `debugging-specification.md` |
| Deferred maintenance, with the reason | Scope decisions → `scope-change-log.md` |

---

## Scheduled activities awaiting their first entry

Each has a home in [`maintenance-notes.md`](maintenance-notes.md); this is where evidence
that they happened accumulates.

| Activity | First due | Evidence to record |
|---|---|---|
| **Restore from a clean machine** | Before the first release | Date, time taken, and **what was found that existed only on the author's machine** |
| Eval golden-set baseline | With TASK-016 | Quality scores, wall clock, and developer-side model cost |
| Human eval sample | Before the first release | Which cases were read, and by whom |
| Spec drift review | Before the first release | Which of the three drift types was checked |
| Risk register review | Quarterly | **Trend** per risk, not just the score |
| Open-question review | Quarterly | Q-002, Q-003, Q-006, Q-007 — still open? |

---

## Deferred maintenance

Recorded rather than forgotten. An empty deferred list usually means nobody is tracking it.

| Item | Deferred because | Revisit when | Risk of leaving it |
|---|---|---|---|
| No offline or immutable backup copy | Everything is reassemblable at this scale | The repository holds something unique | Ransomware costs ≤ 1 day; acceptable now |
| No second person can perform a restore | One-person project (CON-008) | Anyone else joins | RISK-012, accepted knowingly |
| No user-report channel | No users yet | **Before the first release** | Every runbook entry assumes a report arrives somehow |
| `todo_density` threshold unset | Needs ten real runs to set honestly | After ten real intakes | "Hollow" has no definition until then |
| Two-sessions-one-repo concurrency | No requirement yet | SC-008 decided | Unknown behaviour, unmeasured |

> **The third row is the one to fix first.** It costs nothing, and every entry in the runbook
> quietly depends on it.

> Blueprint: ../../../spec-driven-template/07-ops/03-maintenance/maintenance-log.md
