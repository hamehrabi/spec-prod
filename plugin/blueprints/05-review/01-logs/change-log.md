# Change Log

> Source: Ch. 4 §4.8–4.9 (Step 7) — "Use `change-log.md` to record important changes and
> decisions."
>
> This works **even if you do not use Git**. The core idea: every important change should
> leave a record. When a requirement changes, record it. When an agent completes a task,
> record it. When you accept or reject a change, record why.

---

## Entries

| Date | Type | Change | Requirement / Task | Reason | Decision | Recorded by |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | Spec / Task / Test / Code / Review / Release | | REQ-### / TASK-### | | Accepted / Rejected | |
| | | | | | | |

**Types:** Intent · Spec · Task · Test · Code · Review · Release · Fix · Scope

---

## Entry template

```
Date:
Type:
What changed:
Why it changed:
Requirement / Task:
Files or documents affected:
Accepted / Rejected — and why:
Follow-up needed:
```

---

## What is worth recording (Ch. 4 §4.8)

| Change type | Example entry |
|---|---|
| New intent document | Add engineering intent for the task manager project. |
| Updated requirements | Refine task creation requirements and acceptance criteria. |
| New task file | Add TASK-001 for task creation API. |
| Test plan added | Add acceptance and failure tests for task creation. |
| Implementation completed | Implement TASK-001 task creation workflow. |
| Review notes added | Record review results for TASK-001. |
| Change rejected | Reject auto-assign suggestion — outside approved scope. |

---

## Related logs

| Log | Purpose |
|---|---|
| [`review-log.md`](review-log.md) | Review findings and accept/reject decisions. |
| [`feedback-register.md`](feedback-register.md) | Feedback from users and stakeholders. |
| [`../docs/spec-change-log.md`](../../01-docs/09-change-control/spec-change-log.md) | Versioned specification changes. |
| [`../tasks/scope-change-log.md`](../../02-tasks/03-control/scope-change-log.md) | Scope additions/removals and their decision trail. |
| [`../ops/release-notes.md`](../../07-ops/04-release/release-notes.md) | What shipped, when. |

---

# WORKED EXAMPLE — ProjectBoard

| Date | Type | Change | Requirement / Task | Reason | Decision | Recorded by |
|---|---|---|---|---|---|---|
| 2026-03-01 | Intent | Added engineering intent for ProjectBoard. | — | Project start | Accepted | Product owner |
| 2026-03-04 | Spec | Refined task creation requirements and acceptance criteria. | REQ-F-001 | Ambiguity found in the review | Accepted | Tech lead |
| 2026-03-05 | Spec | ADR-001: modular monolith. | — | One developer, needs structure | Accepted | Tech lead |
| 2026-03-08 | Task | Added TASK-006 for the task creation API. | REQ-F-001 | Feature breakdown | Accepted | Tech lead |
| 2026-03-10 | Test | Added acceptance and failure tests for task creation. | REQ-F-001 | Before implementation | Accepted | Developer |
| 2026-03-12 | Code | Implemented TASK-006 task creation workflow. | TASK-006 | Task complete | Accepted | Agent + reviewer |
| 2026-03-12 | Review | Recorded review results for TASK-006. | TASK-006 | Review gate | Accepted | Reviewer |
| 2026-03-20 | Spec | Added login lockout after a security review finding. | REQ-AUTH-006 | 5 failed attempts unbounded | Accepted | Tech lead |
| 2026-03-25 | Fix | 404 body no longer confirms another user's task exists. | BUG-001 | Information leakage | Accepted | Developer |
| 2026-03-28 | Review | **Rejected** agent's auto-assign suggestion. | — | Outside approved scope; no requirement | **Rejected** | Product owner |
| 2026-03-30 | Scope | CSV export accepted into v1 (SC-001). | REQ-F-007 | 3 of 5 pilot teams asked | Accepted | Product owner |
| 2026-04-01 | Fix | Viewer could PATCH a task via the API. | BUG-003 | UI hid it; server allowed it | Accepted | Developer |
| 2026-04-05 | Release | Shipped v1.0.0. | REQ-AUTH-001, REQ-F-001…007 | Release gate passed | Accepted | Release owner |

## Entry detail — the rejection

```
Date:            2026-03-28
Type:            Review
What changed:    Nothing. The agent proposed auto-assigning new tasks to the project
                 owner when no assignee is given.
Why it changed:  It did not. The proposal was rejected.
Requirement:     none - that was the problem
Files affected:  none (change reverted before merge)
Rejected because:
  There is no requirement for auto-assignment. It would silently change ownership
  semantics, which is the core idea of the product. If it is wanted, it needs a
  requirement, an acceptance criterion, and a test first.
Follow-up:       Logged as a scope request; product owner declined (see SC-003 pattern).
```

> **Why the rejections matter as much as the changes.** A change log that only records
> what was accepted cannot tell you *why* the product does not do something. Six months
> later, "why doesn't it auto-assign?" has an answer here.
