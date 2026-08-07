# Reliability Specification

> Source: Ch. 22 — Reliability and Error Handling.
> Reliable software is not software that never fails. It fails in **controlled,
> understandable, and recoverable** ways.

> **Spec rule:** do not describe reliability as a general wish. Write it as a specific
> rule: *"If X fails, the system must do Y, record Z, and show message M."*

**Feature name:** Pantry — core reliability
**Requirement ID:** REQ-NF-003

---

## 1. Normal behavior

A recipe is saved, a week is planned, and a shopping list is generated from a plan — each
quickly, on the account owner's own data. Reliability is a driving characteristic (FF-003).

---

## 2. Failure sources to consider (Ch. 22 §22.2)

| Failure source | Question to ask | Example recovery rule |
|---|---|---|
| User input | Missing, invalid, or unexpected data? | Reject with field-level validation messages. |
| Database | Write fails or takes too long? | Do not show success. Return a retry-safe error and log the failure. |
| Network | Request times out? | Apply a timeout rule and let the user retry safely. |
| External service | Third-party API unavailable? | n/a in v1 — no external service (Q-007). |
| Background job | Job fails after the user left the page? | Only the optional photo-cleanup job; retry on the next run. |

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
| Shopping-list generation fails | Show a safe error; preserve the weekly plan; allow retry. | A simulated failure keeps the plan and shows no stack trace. |
| Recipe save fails (database) | Reject; keep typed values; ask to retry. | A simulated DB error keeps input and shows no success. |
| Expired session | Redirect to sign-in and preserve the next safe destination. | A protected route redirects instead of crashing. |

---

## 4. Timeout rules

| Operation | Maximum wait |
|---|---|
| Generate shopping list | A few seconds — it is local and deterministic. |

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
| Generate shopping list | Yes (idempotent — regenerates) | 1 | — | Show a safe error; the plan is preserved. |
| Save recipe (DB write) | No — would duplicate | 0 | — | Retry-safe error; nothing written. |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures,
> and hammered dependencies.

## 6. Background job and queue rules

| Requirement | Definition |
|---|---|
| Job name | Dish-photo orphan cleanup (only if photos are stored). |
| Trigger | Scheduled (e.g. nightly). |
| Input data | File keys with no owning row. |
| Retry rule | Idempotent — safe to retry on the next run. |
| Failure state | Logged; retried next run. |
| User visibility | None — background maintenance. |

## 7. Logging requirements

| Log requirement | Good practice |
|---|---|
| Event name | Clear names such as `AUTH_LOGIN_FAILED`, `LIST_GENERATION_FAILED`. |
| Severity | Use `info`, `warning`, `error`, `critical` consistently. |
| Request / correlation ID | Attach a request ID so related events can be traced. |
| Safe context | Account ID, action — never secrets or raw credentials. |
| Failure reason | Error type or safe error code, not a sensitive dump. |
| Outcome | Whether the system recovered, retried, queued, or stopped safely. |

**Must never be logged:** passwords · tokens · reset links · full secret values · raw
payment data.

**Structured log example (Ch. 24 §24.3)**
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

## 8. Data safety rules

| Rule | Definition |
|---|---|
| Partial write protection | Generating a list writes the list and its items in one transaction. |
| Duplicate protection | List generation is idempotent per plan; a recipe is created once per request. |
| Ordering guarantees | Single user; no cross-request ordering needs. |

## 9. User-facing error messages

| Weak message | Better message | Why it is better |
|---|---|---|
| `DatabaseError: connection refused` | "We could not save your changes right now. Please try again." | Understandable; reveals no internals. |
| `Invalid request` | "Please enter a recipe title before saving." | Tells the user exactly what to fix. |
| `Unauthorized` | "You do not have permission to view this." | Explains without exposing security details. |
| `Job failed` | "Your list could not be generated. You can try again." | Gives a next action. |

> The overall slow / failure UX policy (a clear message and retry vs. a queued-pending
> status vs. silent retry) was not asked at this depth — [TODO: what should the user see when
> something is slow or fails? — Q-015]. Version one follows REQ-NF-003: a clear message,
> the plan preserved, and a retry.

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

Not applicable to Pantry version one — there is no message bus and no external events
(Q-007). Kept for the record: if events are ever published, use an `outbox` table committed
in the same transaction, with a relay that publishes and marks sent (at-least-once; consumers
must deduplicate).

| Checklist | |
|---|---|
| Any event that must reliably leave a transaction uses the outbox | [ ] n/a in v1 |
| Consumers deduplicate on a message ID | [ ] n/a in v1 |
| Consumers tolerate out-of-order arrival | [ ] n/a in v1 |
| The relay is monitored — a stalled relay is silent data loss | [ ] n/a in v1 |

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
| Recipe (+ ingredient lines) | recipe + its lines | — | version field |
| WeeklyPlan (+ planned meals) | plan + its planned meals | recipes (by ID) | version field |
| ShoppingList (+ items) | list + its items | plan (by ID) | version field |

---

> Blueprint: blueprints/01-docs/07-security-and-reliability/reliability-specification.md
