# Reliability Specification

> Source: Ch. 22 — Reliability and Error Handling.
> Reliable software is not software that never fails. It fails in **controlled,
> understandable, and recoverable** ways.

> **Spec rule:** do not describe reliability as a general wish. Write it as a specific
> rule: *"If X fails, the system must do Y, record Z, and show message M."*

**Feature name:**
**Requirement ID:** REQ-###

---

## 1. Normal behavior

*What happens when everything works.*

---

## 2. Failure sources to consider (Ch. 22 §22.2)

| Failure source | Question to ask | Example recovery rule |
|---|---|---|
| User input | Missing, invalid, or unexpected data? | Reject with field-level validation messages. |
| Database | Write fails or takes too long? | Do not show success. Return a retry-safe error and log the failure. |
| Network | Request times out? | Apply a timeout rule and let the user retry safely. |
| External service | Third-party API unavailable? | Queue the action for later or mark it pending. |
| Background job | Job fails after the user left the page? | Store job status, retry if safe, expose the final result. |

---

## 3. Important failure states

Copy per failure state.

```
- Failure state: [name]
  - Trigger:        [what causes it]
  - Recovery path:  [what the system does next]
  - User message:   [plain language, safe, with a next action]
  - Log event:      [EVENT_NAME with safe context fields]
  - Test case:      TEST-###
```

| Error state | Recovery path | What to test |
|---|---|---|
| Invalid login input | Reject and show clear field-level feedback. | Empty password returns a validation error. |
| Wrong credentials | Safe message without revealing which field was wrong. | Incorrect email or password produces the same message. |
| Database timeout | Stop the request, log the timeout, ask the user to try again. | A simulated timeout does not show successful login. |
| Expired session | Redirect to login and preserve the next safe destination. | A protected route redirects instead of crashing. |

---

## 4. Timeout rules

| Operation | Maximum wait |
|---|---|
| | _ seconds |

## 5. Retry rules

| Decision | Rule |
|---|---|
| Timeout | Set a maximum wait so the system never hangs forever. |
| Retry count | Limit retries. Do not retry endlessly. |
| Retry delay | Wait briefly before retrying instead of hammering the service. |
| Idempotency | Only retry operations that will not create duplicate harmful effects. |
| Stop condition | Define when the system gives up and reports a controlled failure. |

| Operation | Safe to retry? | Max retries | Delay | On give-up |
|---|---|---|---|---|
| | Yes / No | | | |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures,
> and hammered dependencies.

## 6. Background job and queue rules

| Requirement | Definition |
|---|---|
| Job name | *What work the job performs.* |
| Trigger | *What event creates the job.* |
| Input data | *The minimum safe data the job needs.* |
| Retry rule | *When and how the job retries.* |
| Failure state | *What status is stored if the job cannot complete.* |
| User visibility | *Whether the user sees pending, failed, or completed status.* |

## 7. Logging requirements

| Log requirement | Good practice |
|---|---|
| Event name | Clear names such as `AUTH_LOGIN_FAILED`, `JOB_RETRY_SCHEDULED`. |
| Severity | Use `info`, `warning`, `error`, `critical` consistently. |
| Request / correlation ID | Attach a request ID so related events can be traced. |
| Safe context | User ID, role, action — never secrets or raw credentials. |
| Failure reason | Error type or safe error code, not a sensitive dump. |
| Outcome | Whether the system recovered, retried, queued, or stopped safely. |

**Must never be logged:** passwords · tokens · reset links · full secret values · raw
payment data.

**Structured log example (Ch. 24 §24.3)**
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

## 8. Data safety rules

| Rule | Definition |
|---|---|
| Partial write protection | *Transactions protect multi-step writes.* |
| Duplicate protection | |
| Ordering guarantees | |

## 9. User-facing error messages

| Weak message | Better message | Why it is better |
|---|---|---|
| `DatabaseError: connection refused` | "We could not save your changes right now. Please try again." | Understandable; reveals no internals. |
| `Invalid request` | "Please enter a project name before saving." | Tells the user exactly what to fix. |
| `Unauthorized` | "You do not have permission to edit this project." | Explains without exposing security details. |
| `Job failed` | "Your report could not be generated. You can try again or contact support." | Gives a next action. |

## 10. Monitoring / alerting notes

→ [`../ops/monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)

---

## Definition of done (Ch. 22 §22.8)

- [ ] All expected failure states are handled.
- [ ] Logs are safe and useful.
- [ ] User-facing errors are clear.
- [ ] Tests cover normal behavior **and** failure behavior.

## Reliability review checklist (Ch. 22)

| Check | Yes / No |
|---|---|
| Each important feature has known failure states. | |
| Each failure state has a recovery path. | |
| Timeouts are defined for slow operations. | |
| Retry rules are limited and safe. | |
| Background jobs have status and failure handling. | |
| Logs are useful and do not expose secrets. | |
| User-facing error messages are clear and safe. | |
| Tests cover both normal and failure behavior. | |

---

## Prompts

**Ask for logging rules (Ch. 22 §22.4)**
```
Using the reliability requirements below, propose safe logging rules for this feature.
Include event names, severity levels, useful context fields, and fields that must never
be logged. Do not write implementation code yet.
```

**Agent instruction for reliability work (Ch. 22)**
```
Implement the [feature] reliability behavior exactly as specified. Do not invent
additional failure states. Add tests for pending, completed, failed, retry, and
user-visible status behavior before changing production code.
```

---

# ADDENDUM — Transactional Reliability

> Added from the architecture review. Source: Khononov, *Learning DDD*, Ch. 5 & 9.
> These two rules prevent the most common causes of production data corruption.

## A1. The dual-write problem — use the outbox

There is **no transaction spanning a database and a message bus.** This is broken:

```
commit task to database        ✅
publish TaskCreated to bus     💥  process dies here
```

The task exists; no consumer ever hears about it. Publishing *before* the commit is worse
— the event escapes and cannot be retracted if the commit then fails.

**The outbox pattern:**

1. Commit the state change **and** the outgoing events in the **same atomic transaction**
   (an `outbox` table, or events embedded in the document).
2. A relay reads newly committed events from the database.
3. The relay publishes them to the bus.
4. On success it marks them published.

| Guarantee | Consequence |
|---|---|
| **At-least-once** | If the relay dies after publishing but before marking, the message goes out **again**. Every consumer must be able to **deduplicate**. |

| Checklist | |
|---|---|
| Any event that must reliably leave a transaction uses the outbox | [ ] |
| Consumers deduplicate on a message ID | [ ] |
| Consumers tolerate out-of-order arrival | [ ] |
| The relay is monitored — a stalled relay is silent data loss | [ ] |

## A2. Transaction boundaries

| Rule | Meaning |
|---|---|
| **One aggregate instance per transaction** | Needing to commit two together is the signal your boundaries are wrong. |
| **Inside the boundary: strongly consistent** | Only data that must be consistent *right now* belongs inside. |
| **Outside: eventually consistent** | Reference other aggregates **by ID**, never by embedding. |
| **Optimistic concurrency is mandatory** | Carry a version; assert on write that the version read is the version being overwritten. Your store must support it. |

> If you are reaching for a saga to paper over operations that truly must be atomic,
> **your boundaries are wrong.** Fix the boundary; do not add the saga.

| Entity / aggregate | Transaction boundary | Consistency outside | Concurrency control |
|---|---|---|---|
| | | eventual | version field |

---

# WORKED EXAMPLE — ProjectBoard

### The bug this addendum exists because of

```
BUG-006, 2026-04-18
Symptom:   3 tasks created; assignees never received their notification email.
Cause:     create_task() committed the row, then called publish(TaskAssigned).
           The worker was restarted mid-deploy. Three events evaporated.
Detection: A user asked "why didn't I get an email?" - nothing in the logs was
           an error, because nothing errored. The events simply never existed.
```

**Fix:** `TaskAssigned` is now written to an `outbox` table inside the same transaction as
the task row. A relay polls, publishes, marks sent.

```sql
BEGIN;
  INSERT INTO tasks (...) VALUES (...);
  INSERT INTO outbox (event_type, payload, created_at)
       VALUES ('TaskAssigned', '{...}', now());
COMMIT;
-- relay publishes and marks sent, separately and retryably
```

| Checklist | Status |
|---|---|
| Events leave via outbox | ✅ MIG-006 added the table |
| Consumers deduplicate | ✅ on `event_id` — the relay **will** re-send |
| Out-of-order tolerated | ✅ email handler is idempotent per `(task_id, assignee_id)` |
| Relay monitored | ✅ alert if unpublished rows older than 5 minutes |

### Transaction boundaries as drawn

| Aggregate | Boundary | Outside the boundary | Concurrency |
|---|---|---|---|
| **Project** | project + membership list | tasks (by ID) | `version` column |
| **Task** | one task + its status history | project, assignee (by ID) | `version` column |

**The boundary question that changed the design:** *"can a task and its project be updated
in one transaction?"* The first schema said yes — task creation also bumped
`projects.task_count`. That made every task write contend on the project row. Splitting
them (task count became a derived read) removed the contention **and** revealed that
`task_count` was never a real invariant, only a convenience.

## CSV export

> Based on the Ch. 22 report-generation example, applied to ProjectBoard's CSV export.

**Feature name:** Export project tasks to CSV
**Requirement ID:** REQ-F-007

## 1. Normal behavior

The user clicks **Export**. The system creates a background job, shows status `Pending`,
and makes the file available when the job completes.

## 2. Important failure states

```
- Failure state: Export job fails
  - Trigger:        Worker crashes or the query times out
  - Recovery path:  Retry up to 2 times; then mark the export Failed
  - User message:   "Your export could not be generated. Please try again."
  - Log event:      EXPORT_GENERATION_FAILED with request_id, project_id, user_id, error_code
  - Test case:      FTEST-010

- Failure state: Export is slow
  - Trigger:        Project has more than 10,000 tasks
  - Recovery path:  Keep the job Pending and continue in the background; do not time out the user
  - User message:   "Still working. We will notify you when the file is ready."
  - Log event:      EXPORT_SLOW with duration_ms and task_count
  - Test case:      PTEST-004
```

| Error state | Recovery path | What to test |
|---|---|---|
| Invalid login input | Reject with field-level feedback. | Empty password returns a validation error. |
| Wrong credentials | Same safe message for wrong password and unknown email. | Both paths produce identical output. |
| Database timeout on task create | Stop, log the timeout, ask the user to retry. | Simulated timeout never shows "Task created". |
| Expired session | Redirect to login, preserve the intended destination. | Protected route redirects instead of crashing. |

## 3. Timeout and retry rules

| Operation | Safe to retry? | Max retries | Delay | On give-up |
|---|---|---|---|---|
| Export job | Yes (idempotent — regenerates the same file) | 2 | 5 s, 15 s | Status `Failed`; user can retry manually |
| Send invite email | Yes for network errors only | 2 | 5 s, 15 s | Mark `pending_review`; task itself still saved |
| Create task (DB write) | **No** — would duplicate | 0 | — | Return retry-safe 500; nothing written |

## 4. Background job rules

| Requirement | Value |
|---|---|
| Job name | `export_project_tasks` |
| Trigger | User clicks Export |
| Input data | project_id, requested_by, filter state — nothing else |
| Retry rule | 2 retries on transient errors only |
| Failure state | `Failed`, visible to the requesting user |
| User visibility | Pending / Ready / Failed shown in the export panel |

## 5. Logging

```json
{
  "level": "error",
  "event": "export_generation_failed",
  "request_id": "REQ-20491",
  "user_id": "USER-118",
  "project_id": "PROJ-42",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "recovery_action": "user_can_retry"
}
```

## 6. Definition of done — checked

- [x] All expected failure states are handled (slow, failed, retries exhausted).
- [x] Logs are safe and useful — no email addresses, no tokens.
- [x] User-facing errors are clear and offer a next action.
- [x] Tests cover the happy path **and** FTEST-010 / PTEST-004.

---
