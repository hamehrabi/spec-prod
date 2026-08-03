# Monitoring Plan

> Source: Ch. 24.
> **This project cannot be monitored, and that is a decision rather than a gap.**

---

## Why there is no monitoring

| Reason | Source |
|---|---|
| Nothing runs. No process, no endpoint, no server to observe. | ADR-002 |
| No network calls, so no telemetry could be sent even if we wanted it. | CON-003 |
| **No telemetry, usage analytics, or error reporting — ever.** It is a promise to the user, not an implementation detail. | CON-007, BR-014 |

**The cost, stated plainly:** the kit cannot see its own failure rate. If the fill step fails
on one file in ten across all users, nobody finds out. There is no aggregate anywhere and no
way to build one. This is the same hole as **Q-002**, and it is the price of the privacy
promise.

---

## Signals that do exist

Everything below is owned by the kit author and observes the kit **before** it reaches anyone
— never a real developer's run.

| Signal | What it watches | Where | Alerts? |
|---|---|---|---|
| **Merge gate** | 14 fitness functions + six test levels, on every change | CI | Blocks the merge |
| **Scheduled install test** | Can the **published** plugin still be installed and run? | CI, on a schedule | **Yes — the only alert in the project** |
| **Eval scorers** | Did a change to a question or instruction help or hurt? | CI, over 36 answer scripts | Blocks the merge |
| `todo_density` | Rising `[TODO]` counts release over release | Eval runs | Reviewed at release |
| **Human eval sample** | Hollowness — the thing no count detects | A person, before each release | Blocks the release |
| User reports | Everything else | However users reach you | `[TODO: no channel exists]` |

**The scheduled install test is the single most valuable signal here.** It is RISK-004's only
detector, and it is the only thing standing between "the host changed and broke every
installation" and "a user tells us".

---

## Log events

**There is no log.** No file, no remote sink, no error report.

What replaces it, entirely within the developer's own session:

| Event | Form |
|---|---|
| Round completed | `Round N — wrote X files` |
| A write was declined | Named as skipped; offered again on resume |
| A boundary was blocked | The **path** and what would change — never the file's contents |
| A failure state | One of the nine named states, with what survived |
| Validation | Every check as passed / failed / **not run**, and the **count that ran** |
| Closing report | File count · `[TODO]`s · blocking questions · **assumptions made** |

The **committed workspace** is the durable audit trail. That is why REQ-F-035 keeps `spec/`
in version control: a git history of specification changes is the closest thing to
observability this product can honestly have.

---

## Never logged, never transmitted

- The contents of `.env` or any secret file — never even **read** (SEC-A-002)
- Any credential
- **Any content read from outside `spec/`** — including in the message explaining why a write
  was blocked. Name the path; never quote the file
- The developer's idea, requirements, or source code
- Anything at all to anywhere off the machine (BR-014)

---

## What would have to change for monitoring to exist

Recorded so that a future "we should add a little telemetry" is recognised as what it is:

| Wanted | Requires | Which means |
|---|---|---|
| Intake completion rate (SM-2) | A network call | Superseding CON-003 **and** CON-007 |
| Error reporting | A network call | As above |
| Even opt-in analytics | A network call | **As above.** Opt-in telemetry is still telemetry, and the promise is part of the product |

The honest alternative, if SM-2 matters enough: **ask users directly.** It scales badly and
it is not automatic — and it is the only method compatible with what this product promises.

> Blueprint: ../../../spec-driven-template/07-ops/02-monitoring/monitoring-plan.md
