# Reliability Specification

> Source: Ch. 22 — Reliability and Error Handling.
> Reliable software is not software that never fails. It fails in **controlled,
> understandable, and recoverable** ways.

> **Spec rule:** do not describe reliability as a general wish. Write it as a specific
> rule: *"If X fails, the system must do Y, record Z, and show message M."*

**Feature name:** Generate one shopping list from a weekly plan (the core capability)
**Requirement ID:** REQ-F-003

---

## 1. Normal behavior

The account holder opens their weekly plan and generates its shopping list. One list is
created in a single transaction, covering every ingredient line of the week's planned
meals (BR-001), and is shown within the REQ-NF-001 target.

---

## 2. Failure sources to consider (Ch. 22 §22.2)

| Failure source | Question to ask | Example recovery rule |
|---|---|---|
| User input | Missing, invalid, or unexpected data? | Reject with field-level validation messages. |
| Database | Write fails or takes too long? | Do not show success. Return a retry-safe error and log the failure. |
| Network | Request times out? | Apply a timeout rule and let the user retry safely. |
| External service | Third-party API unavailable? | Queue the action for later or mark it pending. |
| Background job | Job fails after the user left the page? | Store job status, retry if safe, expose the final result. |

Pantry has **no external services and no background jobs in version one** (Round 6;
technical-spec §9.5), so the last two rows are dormant until that changes.

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

The failure states this workspace already knows about, filled:

```
- Failure state: Shopping-list generation fails
  - Trigger:        The write fails or times out mid-generation
  - Recovery path:  The transaction rolls back; no partial list exists; the plan is
                    unchanged (REQ-NF-003)
  - User message:   [TODO: when something is slow or fails, what should the user see? — Q-022]
  - Log event:      LIST_GENERATION_FAILED with request_id, account_id, plan_id, safe reason
  - Test case:      — (minted at the test stage against AC-003)

- Failure state: Recipe save fails
  - Trigger:        Validation passes but the write fails
  - Recovery path:  Nothing is stored; every typed value is preserved on screen (REQ-NF-003)
  - User message:   [TODO: when something is slow or fails, what should the user see? — Q-022]
  - Log event:      RECIPE_SAVE_FAILED with request_id, account_id, safe reason
  - Test case:      — (minted at the test stage against AC-001)

- Failure state: Photo upload fails or is rejected
  - Trigger:        The file is not an accepted image, exceeds the limit (Q-023), or the write fails
  - Recovery path:  Nothing is stored; no orphan row and no orphan file (write file first,
                    then row — database-design addendum)
  - User message:   [TODO: when something is slow or fails, what should the user see? — Q-022]
  - Log event:      PHOTO_UPLOAD_FAILED with request_id, account_id, safe reason
  - Test case:      — (minted at the test stage)
```

| Error state | Recovery path | What to test |
|---|---|---|
| Generation fails mid-write | Transaction rolls back; no partial list; plan unchanged. | A simulated failure leaves zero orphan lists and items. |
| Recipe save fails | Nothing stored; typed values kept. | A simulated write failure never shows a saved recipe. |
| Not signed in | Redirect to sign-in, preserving the safe destination. | A protected route redirects instead of crashing. |
| Another account's resource | Safe not-found; nothing revealed (SEC-Z-001). | A guessed ID returns the safe 404. |

---

## 4. Timeout rules

| Operation | Maximum wait |
|---|---|
| Any request served by the application | 10 seconds — proposed by the kit; no number was asked for. The user is never left waiting on a hung request. |

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
| Save recipe | No automatic retry — the user retries; typed input preserved. | 0 | — | Clear error, input kept. |
| Generate shopping list | User-initiated regeneration only; nothing is replaced until it succeeds. | 0 automatic | — | Clear error, plan unchanged. |
| Photo upload | No automatic retry. | 0 | — | Clear error; nothing stored. |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures,
> and hammered dependencies.

## 6. Background job and queue rules

| Requirement | Definition |
|---|---|
| Job name | None in version one — every operation completes in the request. |
| Trigger | n/a |
| Input data | n/a |
| Retry rule | n/a |
| Failure state | n/a |
| User visibility | n/a — revisit this table if imports, reminders, or photo processing arrive. |

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
| Partial write protection | A shopping list and its items are written in one transaction; a recipe and its ingredient lines likewise (ADR-002 — the store supports transactions). |
| Duplicate protection | Regeneration replaces nothing until it succeeds; whether a regenerated list replaces or joins the old one is part of Q-013. |
| Ordering guarantees | Ingredient lines and list items carry a stable `position`; display order never depends on insertion accidents. |

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

**Not applicable in version one:** Pantry has no message bus and no external services
(Round 6); every write is a single database transaction. Revisit this section if events,
queues, or integrations arrive.

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
| Recipe | recipe + its ingredient lines | referenced by planned meals by ID | version field |
| WeeklyPlan | plan + its planned meals | references recipes by ID | version field |
| ShoppingList | list + its items, written in one generation transaction | references its plan by ID | version field |

> Blueprint: blueprints/01-docs/07-security-and-reliability/reliability-specification.md
