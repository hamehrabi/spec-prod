# Monitoring Plan

> Source: Ch. 24 (Monitoring, Maintenance, and Spec Drift) + Ch. 30 §30.2.
> Define monitoring **in the spec, before deployment**. Adding monitoring only after a
> failure is a beginner mistake.

> **Production is not the end.** It is where your software begins meeting real users,
> real traffic, real errors, and real maintenance pressure.

> [TODO: what is the monitoring appetite — structured logs + error alerts, logs only, or
> full metrics and tracing? — Q-018]. Version one plans **structured logs plus error
> alerts** as a starting point.

---

## 1. What to monitor (Ch. 24 §24.2)

Start with the features that matter most: sign-in, the core action (list generation),
photo upload, and anything connected to user trust.

| Area | Question it answers | Signal | Trigger | Response | Owner |
|---|---|---|---|---|---|
| Availability | Can the cook reach the system? | `/health` non-200; failed requests | any non-200 | Investigate; roll back | Developer |
| Correctness | Is the list produced correctly? | `LIST_GENERATION_FAILED` count | > a few / hour | Check the generation path | Developer |
| Errors | What is breaking and how often? | Error rate / repeated stack traces | sustained | Investigate root cause | Developer |
| Security | Suspicious actions? | Repeated failed logins; cross-account attempts | ≥ 5 in 10 min | Review; confirm lockout | Developer |

## 2. Logging and observability (Ch. 24 §24.3)

| Log type | Use it when | What to include |
|---|---|---|
| Info | A normal important event occurs. | Operation name, request ID, status, relevant object ID |
| Warning | Something unusual happens but the system recovers. | Condition, recovery action, affected workflow |
| Error | A workflow fails or produces an unexpected result. | Error message, request ID, user-safe context |
| Audit | A sensitive action occurs. | Actor (account), action, target, time, permission result |
| Performance | A task or request is slow. | Duration, endpoint, threshold exceeded |

**Structured log example**
```json
{
  "level": "error",
  "event": "list_generation_failed",
  "request_id": "REQ-20491",
  "account_id": "ACC-118",
  "weekly_plan_id": "PLAN-42",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "recovery_action": "user_can_retry"
}
```

**Never log:** passwords · tokens · reset links · full secret values · email addresses.

## 3. Error tracking (Ch. 24 §24.4)

Group failures so you see **patterns**, not disconnected reports of the same bug.

| Error condition | Capture | Severity | Response |
|---|---|---|---|
| A valid cook cannot authenticate. | Request ID, account ID, auth step, error class | **High** | Investigate; protect account access. |
| List generation fails after timeout. | Request ID, plan ID, duration | Medium | Check the generation and DB path. |
| A request reaches another account's data. | Actor, endpoint, permission result | **Critical** | Review authorization rule and logs. |

## 4. Performance monitoring (Ch. 24 §24.5)

Begin with a specific question: *which user action is slow, how slow, what is the target,
and what part is likely responsible?* Do not begin with random optimization.

| Workflow | Metric | Target | Action if exceeded |
|---|---|---|---|
| Generate shopping list | Response time | Feels immediate | Check for an N+1 over ingredients. |
| Recipe search | Response time | Feels immediate | Add an index on `recipes(account_id)`. |

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

---

> Blueprint: blueprints/07-ops/02-monitoring/monitoring-plan.md
