# Reliability Specification

> Source: Ch. 22 — Reliability and Error Handling.
> Reliable software is not software that never fails. It fails in **controlled,
> understandable, and recoverable** ways.

> **Spec rule:** do not describe reliability as a general wish. Write it as a specific
> rule: *"If X fails, the system must do Y, record Z, and show message M."*

**Feature name:** Pantry — save recipes, plan a week, generate one shopping list
**Requirement ID:** `REQ-NF-003`

---

## 1. Normal behavior

A signed-in cook saves recipes, plans meals on the days of a week, and generates one shopping
list from that week. Every action is a single synchronous request that either completes and is
shown as saved, or fails cleanly with the cook's input preserved. Reliability is a driving
characteristic (FF-002).

---

## 2. Failure sources to consider (Ch. 22 §22.2)

| Failure source | Question to ask | Example recovery rule |
|---|---|---|
| User input | Missing, invalid, or unexpected data? | Reject with field-level validation messages. |
| Database | Write fails or takes too long? | Do not show success. Return a retry-safe error and log the failure. |
| Network | Request times out? | Apply a timeout rule and let the user retry safely. |
| External service | Third-party API unavailable? | Not applicable in version one — no external services (`Q-007`). |
| Background job | Job fails after the user left the page? | Not applicable in version one — no background jobs; every action is synchronous. |

---

## 3. Important failure states

```
- Failure state: RECIPE_SAVE_FAILED
  - Trigger:        The database write for a new or edited recipe fails.
  - Recovery path:  The action is not reported as saved; the form is returned with input intact.
  - User message:   "We could not save your recipe right now. Please try again."
  - Log event:      RECIPE_SAVE_FAILED with account id and a safe error code (no recipe content).
  - Test case:      FTEST-001

- Failure state: LIST_GENERATION_FAILED
  - Trigger:        The read while generating a shopping list from a week fails.
  - Recovery path:  No partial list is shown; a retry-safe error is returned.
  - User message:   "We could not generate your list. Please try again."
  - Log event:      LIST_GENERATION_FAILED with account id and a safe error code.
  - Test case:      FTEST-002
```

| Error state | Recovery path | What to test |
|---|---|---|
| Save fails | Return a retry-safe error; keep the cook's input. | A simulated save failure does not report success and preserves input (FTEST-001). |
| Empty week | Show an empty list with a clear message. | Generating from a week with no meals yields an empty list, not an error (AC-003). |
| Not signed in | Ask the user to sign in. | A protected action while signed out returns 401 (SEC-A-001). |
| Another account's data | Safe not-found. | A request for a week the account does not own is denied (BR-002, SEC-Z-001). |

---

## 4. Timeout rules

| Operation | Maximum wait |
|---|---|
| Generate shopping list (read) | A few seconds, then a retry-safe error rather than an indefinite hang. |
| Save recipe or plan (write) | A few seconds, then a retry-safe error; nothing partially written. |

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
| Generate shopping list (read-only) | Yes | 1 | brief | Show a retry-safe error message. |
| Save recipe or plan (write) | No — would risk a duplicate | 0 | — | Return a retry-safe error; nothing written. |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures,
> and hammered dependencies.

## 6. Background job and queue rules

None in version one — every action is synchronous request/response, so there are no background
jobs or queues to define. Revisit if list generation becomes slow enough to move off the
request path (`Q-010`).

## 7. Logging requirements

| Log requirement | Good practice |
|---|---|
| Event name | Clear names such as `RECIPE_SAVE_FAILED`, `LIST_GENERATED`. |
| Severity | Use `info`, `warning`, `error`, `critical` consistently. |
| Request / correlation ID | Attach a request ID so related events can be traced. |
| Safe context | Account ID and action — never recipe content, photos, or credentials. |
| Failure reason | Error type or safe error code, not a sensitive dump. |
| Outcome | Whether the system recovered, retried, or stopped safely. |

**Must never be logged:** passwords · tokens · reset links · full secret values · recipe and
plan content · photos (`REQ-NF-007`; full list is `Q-012`).

**Structured log example (Ch. 24 §24.3)**
```json
{
  "level": "error",
  "event": "recipe_save_failed",
  "request_id": "REQ-20491",
  "account_id": "ACC-118",
  "reason": "database_timeout",
  "duration_ms": 12000,
  "recovery_action": "user_can_retry"
}
```

## 8. Data safety rules

| Rule | Definition |
|---|---|
| Partial write protection | A multi-step write (a plan and its planned meals, a list and its items) runs in one transaction; a failure rolls the whole change back. |
| Duplicate protection | Regenerating a list for the same week does not accumulate duplicate lists — it replaces or returns the same list (BR-001). |
| Ordering guarantees | Not required — one user, synchronous actions; there is no concurrent ordering to guarantee. |

## 9. User-facing error messages

| Weak message | Better message | Why it is better |
|---|---|---|
| `DatabaseError: connection refused` | "We could not save your changes right now. Please try again." | Understandable; reveals no internals. |
| `Invalid request` | "Please enter a recipe title before saving." | Tells the user exactly what to fix. |
| `Unauthorized` | "You do not have permission to view this." | Explains without exposing security details. |
| `Job failed` | "We could not generate your list. Please try again." | Gives a next action. |

## 10. Monitoring / alerting notes

→ [`../../07-ops/02-monitoring/monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)

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

**Not applicable in version one.** Pantry has no message bus and publishes no events; every
write is a single local database transaction, so an event cannot escape a failed commit. The
pattern below is kept for the day an event bus or external consumer is added (`Q-007`).

There is **no transaction spanning a database and a message bus.** If one is ever added,
committing the state change and publishing the event are two steps that can fail between —
the outbox pattern closes that gap:

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
| Recipe | recipe + its ingredient lines | account, plans (by ID) | version field |
| WeeklyPlan | plan + its planned meals | recipes (by ID), account | version field |
| ShoppingList | list + its items | week / plan (by ID), account | version field |

---

> Blueprint: blueprints/01-docs/07-security-and-reliability/reliability-specification.md
