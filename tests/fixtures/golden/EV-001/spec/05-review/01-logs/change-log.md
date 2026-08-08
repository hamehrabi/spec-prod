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

No entries yet — the first accepted or rejected change adds the first row.

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
| New intent document | Add engineering intent for the Pantry project. |
| Updated requirements | Refine the generate-one-list requirements and acceptance criteria (REQ-F-004). |
| New task file | Add TASK-005 for generating one shopping list from a week. |
| Test plan added | Add acceptance and failure tests for generating the list (ATEST/FTEST). |
| Implementation completed | Implement TASK-005 one-list-from-a-week workflow. |
| Review notes added | Record review results for TASK-005. |
| Change rejected | Reject a recipe-sharing suggestion — outside approved scope (one account, no sharing). |

---

## Related logs

| Log | Purpose |
|---|---|
| [`review-log.md`](review-log.md) | Review findings and accept/reject decisions. |
| [`feedback-register.md`](feedback-register.md) | Feedback from users and stakeholders. |
| [`../docs/spec-change-log.md`](../../01-docs/09-change-control/spec-change-log.md) | Versioned specification changes. |
| [`../tasks/scope-change-log.md`](../../02-tasks/03-control/scope-change-log.md) | Scope additions/removals and their decision trail. |
| [`../ops/release-notes.md`](../../07-ops/04-release/release-notes.md) | What shipped, when. |

> Blueprint: blueprints/05-review/01-logs/change-log.md
