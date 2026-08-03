# Monitoring Plan

> Source: Ch. 24 (Monitoring, Maintenance, and Spec Drift) + Ch. 30 §30.2.
> Define monitoring **in the spec, before deployment**. Adding monitoring only after a
> failure is a beginner mistake.

> **Production is not the end.** It is where your software begins meeting real users,
> real traffic, real errors, and real maintenance pressure.

---

## 1. What to monitor (Ch. 24 §24.2)

Start with the features that matter most: login, payments, dashboards, uploads,
background jobs, API calls, and anything connected to user trust.

| Area | Question it answers | Signal | Trigger | Response | Owner |
|---|---|---|---|---|---|
| Availability | Can users reach the system? | Uptime checks, failed requests, unavailable endpoints | | | |
| Correctness | Is the system producing the expected result? | Failed workflows, invalid outputs, failed test probes | | | |
| Performance | Is the system fast enough? | Response time, page load time, queue delay | | | |
| Errors | What is breaking and how often? | Exception count, error rate, repeated stack traces | | | |
| Usage | Are users using the feature as intended? | Feature usage, drop-off points, completion rate | | | |
| Security | Are suspicious actions happening? | Repeated failed logins, permission failures, unusual access | | | |

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
  "event": "report_export_failed",
  "request_id": "REQ-20491",
  "user_id": "USER-118",
  "project_id": "PROJ-42",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "recovery_action": "user_can_retry"
}
```

> A useful log tells you what happened, where, and which request or user action caused it.
> A noisy log repeats low-value information until important signals become hard to find.

**Never log:** passwords · tokens · reset links · full secret values · raw payment data.

## 3. Error tracking (Ch. 24 §24.4)

Group failures so you see **patterns**, not ten disconnected reports of the same bug.

| Error condition | Capture | Severity | Response |
|---|---|---|---|
| A valid user cannot authenticate. | Request ID, user ID, auth step, error class | **High** | Investigate immediately; protect account access. |
| A core job fails after timeout. | Job ID, duration, timeout value | Medium | Check queue, database, retry logic. |
| Unauthorized user reaches a restricted endpoint. | Actor, endpoint, permission result | **Critical** | Review authorization rule and security logs. |
| External API call fails repeatedly. | Provider, status code, retry count | Medium | Apply fallback or degrade gracefully. |

## 4. Performance monitoring (Ch. 24 §24.5)

Begin with a specific question: *which user action is slow, how slow is it, what is the
target, and what part of the system is likely responsible?* Do not begin with random
optimization.

| Workflow | Metric | Target | Action if exceeded |
|---|---|---|---|
| Login | Response time | Under 2 s | Check auth service, database lookup, token creation. |
| Dashboard load | Initial data load | Under 3 s | Review query design, caching, payload size. |
| Background job | Completion time | Under 60 s | Move work to background or improve the query plan. |
| List endpoint | Average response time | Under 500 ms | Add pagination, indexes, or filtering. |

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

## Prompt — create monitoring requirements from a feature spec (Ch. 24 §24.2)

```
You are reviewing the feature specification below. Create monitoring requirements for this
feature. Include availability, correctness, performance, error tracking, security, and
user-facing impact. Do not invent features outside the specification.
Return the result as a table with Signal, Reason, Trigger, and Response.
```

---

# WORKED EXAMPLE — ProjectBoard v1.0

## Signals in place at launch

| Area | Signal | Trigger | Response | Owner |
|---|---|---|---|---|
| Availability | `/health` non-200 | any | Page on-call; roll back | Developer |
| Availability | 5xx rate | > 2% over 5 min | Page on-call; check rollback triggers | Developer |
| Correctness | Task create success rate | < 98% over 15 min | Check validation and DB write path | Developer |
| Performance | p95 on `GET /projects/{id}/tasks` | > 2 s (REQ-NF-001) | Check index + pagination | Developer |
| Errors | `EXPORT_GENERATION_FAILED` count | > 5 in 1 hour | Check queue and worker health | Developer |
| Usage | Tasks created per active project per week | < 3 | Product signal, not an alert | Product owner |
| Security | `AUTH_LOGIN_FAILED` per account | ≥ 5 in 10 min | Lockout fires (REQ-AUTH-006); review if repeated | Tech lead |
| Security | `AUTHZ_DENIED` spike | > 20 in 10 min | Possible probing; review actor and endpoint | Tech lead |

## Log events emitted

| Event | Level | Context fields |
|---|---|---|
| `AUTH_LOGIN_SUCCESS` | info | request_id, user_id |
| `AUTH_LOGIN_FAILED` | warning | request_id, user_id, attempt_count |
| `AUTH_LOCKOUT_APPLIED` | warning | request_id, user_id, unlock_at |
| `SESSION_EXPIRED` | info | request_id, user_id |
| `TASK_CREATED` | info | request_id, user_id, project_id, task_id |
| `TASK_VALIDATION_FAILED` | info | request_id, user_id, project_id, field |
| `AUTHZ_DENIED` | warning | request_id, user_id, role, endpoint |
| `DB_TIMEOUT` | error | request_id, operation, duration_ms |
| `EXPORT_GENERATION_FAILED` | error | request_id, user_id, project_id, error_code, retry_count |

**Never logged:** password, `password_hash`, session token, invite token, email address.

## A real log line

```json
{
  "level": "error",
  "event": "export_generation_failed",
  "request_id": "REQ-20491",
  "user_id": "USER-118",
  "project_id": "PROJ-42",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "retry_count": 2,
  "recovery_action": "user_can_retry"
}
```

`request_id` is what made this debuggable — the same ID appears on the originating
`POST /exports` line, so the whole chain can be reconstructed.

## Error grouping — week 1

| Error condition | Count | Severity | Response |
|---|---|---|---|
| `TASK_VALIDATION_FAILED` field=title | 214 | Info — not an error | Users hitting the 3-char minimum. **Product signal**: the message was unclear. → FB-001 |
| `DB_TIMEOUT` on task list | 9 | Medium | All on one 500-task project → led to PTEST-003 and MIG-003 |
| `AUTHZ_DENIED` on PATCH /tasks | 3 | **Critical** | All from one Viewer account → surfaced BUG-003 |
| `EXPORT_GENERATION_FAILED` | 1 | Medium | Transient provider error; retry succeeded |

## What monitoring found that testing did not

> 214 validation failures on the title field. Every test passed — the rule worked exactly
> as specified. But users were repeatedly hitting a 3-character minimum they could not
> see until after submitting. Not a bug. Not a spec violation. **A product problem that
> only production traffic could reveal.** It became FB-001 and changed the UI copy.
