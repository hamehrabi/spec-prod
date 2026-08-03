# Performance Test Plan

> Source: Ch. 17 §17.6, Ch. 7 §7.9, Ch. 24 §24.5.
> You do not need enterprise load testing in every project, but you should define simple
> performance expectations **before** code generation.

A useful performance plan starts with a plain-language target: how fast should the key
action feel, how many records should the page handle, and what should happen when the
system becomes slow?

---

| Test ID | Workflow | Metric | Target | Data volume | Action if exceeded | Status |
|---|---|---|---|---|---|---|
| PTEST-001 | Login | Response time | Under 2 s | normal traffic | Check auth service, database lookup, token creation. | Planned |
| PTEST-002 | Dashboard load | Initial page data load | Under 3 s | standard project | Review query design, caching, API payload size. | |
| PTEST-003 | List endpoint | Average response time | Under 500 ms | paginated list | Add pagination, indexes, or filtering rules. | |
| PTEST-004 | Report export | Job completion time | Under 60 s | normal report | Move to background job or improve query plan. | |

---

## Simple performance expectations (Ch. 17 §17.6)

| Feature | Simple performance expectation |
|---|---|
| Dashboard loading | Should load within two seconds for a normal account. |
| Task list | Should handle at least 100 items without freezing. |
| Search | Results should appear quickly for common queries. |
| External service call | Show a friendly message if the service times out. |

---

## Weak vs. measurable (Ch. 7 §7.9)

| Weak statement | Stronger requirement |
|---|---|
| "The dashboard should load fast." | "The task dashboard should load within 2 seconds for a workspace with up to 1,000 tasks." |
| "Search should be quick." | "Task search should return results within 1 second for common filters." |
| "The app should support many users." | "The first version should support 50 active users in one workspace without visible slowdown." |

---

## Performance risks to check in review (Ch. 20 §20.5)

| Performance risk | What to check |
|---|---|
| Repeated queries | Does the code query the database inside a loop? |
| Overfetching | Does it load fields or records that are not needed? |
| Slow external calls | Does one request depend on many network calls? |
| Missing limits | Can a user request unlimited records? |
| Blocking work | Should heavy work move to a background job? |

> Only refactor for performance when the change supports a clear goal: faster response,
> lower cost, fewer failures, or simpler scaling. Avoid asking the agent to "optimize
> everything" without a target.

---

## Performance tip (Ch. 7 §7.9)

Set realistic targets for the version you are building now. Overengineering performance
too early makes the system harder to finish and harder to understand.

Production performance signals → [`../ops/monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)

---

# WORKED EXAMPLE — ProjectBoard

| Test ID | Workflow | Metric | Target | Data volume | Action if exceeded | Status |
|---|---|---|---|---|---|---|
| PTEST-001 | Login | Response time | Under 2 s | normal traffic | Check password hashing cost and the user lookup index | Passing |
| PTEST-002 | Project dashboard | Initial data load | Under 3 s | 20 projects, 2,000 tasks | Review query design and payload size | Passing |
| PTEST-003 | Task list | Response time | Under 2 s | **500 tasks in one project** | Add pagination and an index | **Was failing — now passing** |
| PTEST-004 | CSV export job | Completion time | Under 60 s | 10,000 tasks | Keep the job pending; do not time out the user | Passing |

## PTEST-003 — the test that changed the design

```
Requirement:  REQ-NF-001 - "The task list must load within two seconds for up to 500 tasks."

First run:    7.1 s for a project with 500 tasks.
Evidence:     Endpoint returned ALL tasks in one response; no LIMIT, no index on
              tasks(project_id).

Root cause:   Two problems, not one.
              1. The list endpoint had no pagination (unbounded result set).
              2. Every row triggered a separate query for the assignee name (N+1).

Fix (TASK-007 + TASK-011):
              - Paginate at 50 items per page  -> ADR-003
              - Add index on tasks(project_id, status)
              - Join the assignee instead of querying per row

Second run:   0.34 s for the first page of 500 tasks.

Spec updates: ADR-003 written. REQ-NF-001 kept as-is (the target was right; the
              implementation was wrong).
```

## Review risks this project actually hit

| Performance risk | Found in | Outcome |
|---|---|---|
| Repeated queries | Task list assignee lookup (N+1) | Fixed with a join; PTEST-003 now guards it |
| Overfetching | Task list returned `description` for every row | Removed from the list payload |
| Missing limits | No pagination on the list endpoint | ADR-003 makes pagination mandatory |
| Blocking work | CSV export ran inside the request | Moved to a background job (ADR-005) |
| Slow external calls | Invite email sent synchronously | Moved to a job; ADR-004 superseded |

> **The rule applied:** nobody was asked to "make it faster". One workflow, one number,
> one target, one cause. That is what made the fix small and provable.
