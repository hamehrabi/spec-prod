# Open Questions

> Source: Appendix A, Ch. 7 §7.11, Appendix C.
> Open questions must be **captured**, not hidden. An unresolved question that reaches an
> AI agent becomes a silent assumption — and silent assumptions become defects.

> **Technical spec guardrail (Appendix C):** open questions must not be treated as
> assumptions.

| ID | Question | Why it matters | Decision owner | Must be answered before | Status | Answer / decision |
|---|---|---|---|---|---|---|
| Q-001 | | | | Design / Implementation / Release | Open | |
| Q-002 | | | | | Open | |
| Q-003 | | | | | Open | |

**Status values:** Open · Answered · Deferred · Rejected

---

## The ambiguity test (Ch. 2 §2.6)

Before moving forward, ask: *Could two competent developers build two different things
from this instruction?* If yes, it belongs in this table.

| Ambiguous statement | Why it is dangerous | Clarified version |
|---|---|---|
| "Users can create tasks." | Does not define fields, ownership, deadlines, or permissions. | "A signed-in user can create a task with title, description, due date, priority, and assignee." |
| "Admins can manage users." | Does not say what *manage* means. | "An admin can view users, deactivate accounts, reset roles, and see account status." |
| "The app should be secure." | Too broad to test. | "The app requires login, role-based access, input validation, and safe error messages." |

---

## Prompt — find hidden assumptions before coding (Appendix J, Template 1)

```
Before writing code, review the specification below.
List any missing details, contradictions, risky assumptions, or unclear requirements.
Do not implement anything yet.

Specification:
[PASTE SPEC]

Return:
- Missing details
- Contradictions
- Questions I should answer
- Safe assumptions, if any
```

---

# WORKED EXAMPLE — ProjectBoard

| ID | Question | Why it matters | Decision owner | Must be answered before | Status | Answer / decision |
|---|---|---|---|---|---|---|
| Q-001 | Can a task exist without a project? | Changes the schema: `tasks.project_id` nullable or required. | Tech lead | Design | Answered | No. A task cannot exist without a project. `project_id` is required. |
| Q-002 | What happens to tasks when a project is deleted? | Determines cascade vs. soft delete vs. block. | Product owner | Design | Answered | Deleting a project is blocked while it has open tasks. |
| Q-003 | Can a Viewer see tasks assigned to other members? | Affects the read query and the RBAC table. | Product owner | Design | Open | |
| Q-004 | How long should a session last before it expires? | Needed for SEC-A-002 and the expired-session failure test. | Tech lead | Implementation | Open | |
| Q-005 | Should the due date accept past dates on edit (not just create)? | BR-003 only covers creation today. | Product owner | Implementation | Deferred | Revisit after user testing. |

## Ambiguity test applied

| Ambiguous statement found in the brief | Why it is dangerous | Clarified version |
|---|---|---|
| "Users can manage tasks." | Does not define who, which actions, or ownership. | "A signed-in team member can create, edit, complete, and delete **their own** tasks." |
| "Leads can see progress." | Does not define which numbers or which period. | "A team lead can view counts of overdue, in-progress, and completed tasks for a selected project." |
| "The app should be secure." | Too broad to test. | "The app requires login, role-based access, backend input validation, and safe error messages." |
