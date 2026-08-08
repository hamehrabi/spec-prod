# Monitoring Plan

> Source: Ch. 24 (Monitoring, Maintenance, and Spec Drift) + Ch. 30 §30.2.
> Define monitoring **in the spec, before deployment**. Adding monitoring only after a
> failure is a beginner mistake.

> **Production is not the end.** It is where your software begins meeting real users,
> real traffic, real errors, and real maintenance pressure.

**Baseline for Pantry v1:** structured logs + error alerts. That is the whole appetite for
now — no metrics dashboard, no tracing. Whether to grow beyond this (logs only vs. +alerts
vs. full metrics/tracing) is `[TODO: monitoring appetite — (Q-016)]`. Environments are
`[TODO: environments — (Q-015)]` and the deployment target is `[TODO: deployment target — (Q-017)]`.

---

## 1. What to monitor (Ch. 24 §24.2)

Pantry is a single-user web app for one home cook. The things that matter most are: they
can sign in, they can save a recipe without losing it, and a week of chosen meals turns
into one shopping list. Alert on error events **and on backup failure** (the recipe library
is the irreplaceable asset — see [`backup-and-recovery.md`](../01-deployment/backup-and-recovery.md)).

| Area | Question it answers | Signal | Trigger | Response | Owner |
|---|---|---|---|---|---|
| Availability | Can the cook reach the app? | App fails to load / `/health` non-200 | Owner notices, or a failed load | Restart the stateless container; check the store | Owner |
| Correctness | Does a week of meals turn into one list? | `LIST_GENERATION_FAILED` (error); `LIST_GENERATED` (success) | Any `LIST_GENERATION_FAILED` | Check the plan → list path (REQ-F-004 core) | Owner |
| Performance | Is the app fast enough for evening use? | Manual — the owner notices a slow save or slow list | Owner reports it | Investigate only the slow action (Ch. 24 §24.5) | Owner |
| Errors | What is breaking and how often? | `RECIPE_SAVE_FAILED`, `LIST_GENERATION_FAILED` counts | Any error event | Read the log, protect the cook's input (FF-002) | Owner |
| Usage | Is the core flow being used? | `LIST_GENERATED` frequency | Product signal, not an alert | Note it; do not page on it | Owner |
| Security | Is access working as specified? | `AUTH_REQUIRED` (a protected action reached without a session) | Repeated `AUTH_REQUIRED` | Confirm the auth rule (SEC-A-001..004) is enforced | Owner |
| Durability | Is the recipe library actually protected? | Backup job result | **Backup failure** | Investigate immediately; a silent backup job is the top durability risk | Owner |

## 2. Logging and observability (Ch. 24 §24.3)

Logs are the **messages**. Observability is the ability to use those messages *with*
metrics, traces, and alerts to understand the system. Pantry's baseline is structured logs
+ error alerts only; richer observability is deferred (Q-016).

| Log type | Use it when | What to include |
|---|---|---|
| Info | A normal important event occurs. | Operation name, request ID, status, relevant object ID |
| Warning | Something unusual happens but the system recovers. | Condition, recovery action, affected workflow |
| Error | A workflow fails or produces an unexpected result. | Error message, request ID, user-safe context |
| Audit | A sensitive action occurs. | Actor (the one account), action, target, time, result |
| Performance | A task or request is slow. | Duration, action, threshold exceeded |

**Structured log example**
```json
{
  "level": "error",
  "event": "LIST_GENERATION_FAILED",
  "request_id": "REQ-3F0A",
  "reason": "plan_read_failed",
  "recovery_action": "user_can_retry"
}
```

> A useful log tells you what happened, where, and which request or user action caused it.
> A noisy log repeats low-value information until important signals become hard to find.

**Never log** (REQ-NF-007; full leak list is `[TODO: leak list — (Q-012)]`): passwords ·
tokens · reset links · secrets · recipe/plan content · recipe photos.

## 3. Error tracking (Ch. 24 §24.4)

Group failures so you see **patterns**, not disconnected reports of the same bug. These are
the log events to reference; alert on every error event.

| Error condition | Capture | Severity | Response |
|---|---|---|---|
| A recipe fails to save (`RECIPE_SAVE_FAILED`). | Request ID, reason (no recipe content — REQ-NF-007) | **High** | Preserve the cook's input (FF-002); investigate the save path. |
| List generation fails (`LIST_GENERATION_FAILED`). | Request ID, reason (no plan content) | **High** | Check the plan → list path (REQ-F-004 core); the cook can retry. |
| A protected action is reached without a session (`AUTH_REQUIRED`). | Request ID, action, auth step | Medium | Confirm the auth rule (SEC-A-001..004); redirect to sign-in. |
| Backup job fails. | Job result, reason | **Critical** | Investigate immediately — the recipe library is the irreplaceable asset. |

## 4. Performance monitoring (Ch. 24 §24.5)

Begin with a specific question: *which user action is slow, how slow is it, what is the
target, and what part of the system is likely responsible?* Do not begin with random
optimization. Pantry has no metrics dashboard at baseline (Q-016), so performance is watched
by the owner noticing, then investigated for the one slow action only.

| Workflow | Metric | Target | Action if exceeded |
|---|---|---|---|
| Save a recipe | Owner-perceived responsiveness | Feels immediate | Check the save path; do not lose input (FF-002). |
| Generate the shopping list | Owner-perceived responsiveness | Feels immediate for a week of meals | Check the plan → list aggregation (REQ-F-004). |
| Sign in | Owner-perceived responsiveness | Feels immediate | Check the auth path (SEC-A-001..004). |

## 5. User feedback loop

→ [`../review/feedback-register.md`](../../05-review/01-logs/feedback-register.md)

Monitoring tells you what the system is doing; feedback tells you how it *feels*. A system
can have zero errors and still be confusing.

---

## Monitoring and maintenance specification (Ch. 24)

| Section | What to define |
|---|---|
| Feature or workflow | The plan → one shopping list flow (REQ-F-004 core); recipe save; sign-in. |
| Monitoring signals | Structured logs (`RECIPE_SAVE_FAILED`, `LIST_GENERATION_FAILED`, `LIST_GENERATED`, `AUTH_REQUIRED`) + error alerts; backup job result. |
| Health expectations | Cook can sign in, save recipes without loss, and generate one list per week of meals. |
| Alert conditions | Any error event, and any backup failure. |
| Owner or reviewer | The owner (single-user project). |
| Spec update rule | Update the spec when production behavior changes (spec-change-log at [`../../01-docs/09-change-control/spec-change-log.md`](../../01-docs/09-change-control/spec-change-log.md)). |
| Test update rule | New or changed behavior gets a matching test (ATEST/UTEST/ITEST/STEST/PTEST/ETEST/FTEST). |
| Release follow-up | After deploy, confirm the four log events emit and error alerts fire. |

---

> Blueprint: blueprints/07-ops/02-monitoring/monitoring-plan.md
