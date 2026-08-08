# Monitoring Plan

> Source: Ch. 24 (Monitoring, Maintenance, and Spec Drift) + Ch. 30 §30.2.
> Define monitoring **in the spec, before deployment**. Adding monitoring only after a
> failure is a beginner mistake.

> **Production is not the end.** It is where your software begins meeting real users,
> real traffic, real errors, and real maintenance pressure.

**The appetite is undecided** — [TODO: what is your monitoring appetite? — Q-020]. The
signal tables below define *what could be watched* from the requirements; how much of it
is wired up waits on that answer.

---

## 1. What to monitor (Ch. 24 §24.2)

Start with the features that matter most: for Pantry that is the core flow — save a
recipe, plan the week, generate the shopping list.

| Area | Question it answers | Signal | Trigger | Response | Owner |
|---|---|---|---|---|---|
| Availability | Can users reach the system? | `/health` checks, failed requests | non-200 | Restart; investigate | Developer |
| Correctness | Is the system producing the expected result? | `LIST_GENERATION_FAILED` count | any repeated occurrence | Check the generation transaction | Developer |
| Performance | Is the system fast enough? | Generation and search response times | Over the REQ-NF-001 targets | Check queries against performance-tests.md | Developer |
| Errors | What is breaking and how often? | Error-level log events | sustained appearance | Read the runbook | Developer |
| Usage | Are users using the feature as intended? | Lists generated per week | product signal, not an alert | Product reflection | Developer |
| Security | Are suspicious actions happening? | Failed sign-ins, safe-404 spikes | spike over baseline | Review actor and route | Developer |

## 2. Logging and observability (Ch. 24 §24.3)

Logs are the **messages**. Observability is the ability to use those messages *with*
metrics, traces, and alerts to understand the system.

| Log type | Use it when | What to include |
|---|---|---|
| Info | A normal important event occurs. | Operation name, request ID, status, relevant object ID |
| Warning | Something unusual happens but the system recovers. | Condition, recovery action, affected workflow |
| Error | A workflow fails or produces an unexpected result. | Error message, stack trace, request ID, user-safe context |
| Audit | A sensitive action occurs. | Actor, action, target, time, permission result |
| Performance | A task or request is slow. | Duration, endpoint, query or job type, threshold exceeded |

**Structured log example**
```json
{
  "level": "error",
  "event": "list_generation_failed",
  "request_id": "REQ-20491",
  "account_id": "ACC-118",
  "plan_id": "PLAN-42",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "recovery_action": "user_can_retry"
}
```

> A useful log tells you what happened, where, and which request or user action caused it.
> A noisy log repeats low-value information until important signals become hard to find.

**Never log:** passwords · tokens · reset links · full secret values · raw payment data.
What else must never be logged for Pantry is open — [TODO: what must never leak or be
logged? — Q-012].

The log events this workspace already names: `LIST_GENERATION_FAILED`,
`RECIPE_SAVE_FAILED`, `PHOTO_UPLOAD_FAILED` (reliability-specification §3), each with
`request_id`, `account_id`, and a safe reason.

## 3. Error tracking (Ch. 24 §24.4)

Group failures so you see **patterns**, not ten disconnected reports of the same bug.

| Error condition | Capture | Severity | Response |
|---|---|---|---|
| A valid user cannot sign in. | Request ID, account ID, auth step, error class | **High** | Investigate immediately; protect account access. |
| List generation fails repeatedly. | Request ID, plan ID, duration | **High** — it is the core | Check the transaction and its timeout. |
| A request reaches another account's data. | Actor, endpoint, permission result | **Critical** | Review SEC-Z-001 enforcement and logs immediately. |
| Photo upload rejections spike. | Request ID, safe reason | Medium | Check the validation rule against real usage. |

## 4. Performance monitoring (Ch. 24 §24.5)

Begin with a specific question: *which user action is slow, how slow is it, what is the
target, and what part of the system is likely responsible?* Do not begin with random
optimization.

| Workflow | Metric | Target | Action if exceeded |
|---|---|---|---|
| Generate shopping list | Response time | Under 2 s for 21 meals (REQ-NF-001) | Check the generation query — one query for the week, not one per meal. |
| Recipe search | Response time | Under 1 s for 500 recipes (REQ-NF-001) | Check the search query and its index. |
| Recipe save | Response time | No stated number — a single-transaction write | Investigate only if users notice. |
| Any request | Maximum wait | 10 s cap (reliability §4) | The request is killed, never hung. |

## 5. User feedback loop

→ [`../review/feedback-register.md`](../../05-review/01-logs/feedback-register.md)

Monitoring tells you what the system is doing; feedback tells you how it *feels*. A system
can have zero errors and still be confusing.

---

## Monitoring and maintenance specification (Ch. 24)

| Section | What to define |
|---|---|
| Feature or workflow | Name the production workflow being monitored. |
| Monitoring signals | Logs, metrics, errors, performance values, user feedback sources. |
| Health expectations | What healthy behavior looks like. |
| Alert conditions | When a signal should trigger attention. |
| Owner or reviewer | Who reviews the signal or issue. |
| Spec update rule | When the specification must be updated. |
| Test update rule | When tests must be added or changed. |
| Release follow-up | What must be checked after the next deployment. |

> Blueprint: blueprints/07-ops/02-monitoring/monitoring-plan.md
