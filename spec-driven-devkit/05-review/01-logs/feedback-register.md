# Feedback Register

> Source: Ch. 29 §29.4.
> Feedback → affected requirement → owner → decision. Feedback that is not routed to a
> requirement is a conversation, not an input.

---

## Register

| ID | Date | Source | Feedback | Affected requirement | Owner | Decision | Where it went |
|---|---|---|---|---|---|---|---|
| FB-001 | 2026-08-03 | Kit author, Round 4 | *"Deep documents matter more than a short interview"* | REQ-F-009, REQ-F-017 | Kit author | **Accepted, reshaped.** Depth comes from inference and blueprint quality, not more questions | DD-007 |
| FB-002 | 2026-08-03 | Kit author, Round 4 | Four driving characteristics wanted | BR-011 | Kit author | **Pushed back once; three accepted.** Security recorded as rejected, with its reason | `driving-characteristics.md` |
| FB-003 | 2026-08-03 | Kit author, Round 3 | *"Confirm every file on first run"* — chosen after being told ~90 confirmations is unworkable | REQ-F-025 | Kit author | **Accepted as chosen.** Implemented as *never request blanket permission* — the host already prompts, so it costs nothing to build | REQ-F-025, SEC-Z-002, RISK-007 |
| | | | | | | | |

---

## How feedback enters the product

```
feedback arrives
   -> which requirement does it affect?     (if none, it is a scope change -> scope-change-log.md)
   -> owner decides: accept / reshape / defer / reject
   -> if accepted: update the requirement, the tests, and the traceability row
   -> THEN create a task
```

**Feedback with no affected requirement is a scope change**, and it goes through
[`scope-change-log.md`](../../02-tasks/03-control/scope-change-log.md) instead. That routing
rule is what stops "a user said X" becoming an unapproved feature.

---

## The pattern worth noticing in the three entries above

Two of the three were **accepted and reshaped**, not accepted as stated:

| Feedback | As asked | As implemented | What the reshape protected |
|---|---|---|---|
| FB-001 | A longer, deeper interview | Depth from **inference**, interview unchanged | *"Developers finish the intake"* — the stated success measure |
| FB-003 | Per-file confirmation the kit builds | The kit **never requests blanket permission**; the host's own prompt stands | Nothing to build, and the enforcement stays independent of the kit's good behaviour |

> **The useful question is rarely accept-or-reject.** It is *what shape can this take that
> does not spend a driver?* Both reshapes above cost nothing and preserved something.
>
> FB-002 is the counter-example: it was pushed back on **once**, and then the kit author's
> choice stood. Pushing back twice would have been arguing with someone about their own
> product.

---

## Where feedback will come from once there are users

| Source | Expected | Note |
|---|---|---|
| Direct reports | The main channel | **`[TODO]`: no channel exists.** Named in `rollback-plan.md` and `runbook.md` |
| Abandoned intakes | The most valuable signal there is | **Invisible** — CON-007 forbids the telemetry that would show it. This is Q-002 |
| Real answer scripts | From anyone willing to share one | Each becomes an eval case; invented cases cover what we thought of |
| The kit author's own use | Continuous | Q-006 — whether the kit is used on itself is still open |

> The second row is the register's own blind spot: **the feedback that matters most is the
> feedback the product is designed to be unable to receive.**

> Blueprint: ../../../spec-driven-template/05-review/01-logs/feedback-register.md
