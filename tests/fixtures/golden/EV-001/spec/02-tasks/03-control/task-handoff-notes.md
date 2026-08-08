# Task Handoff Notes

> Source: Ch. 30 §30.2, Ch. 29 §29.3, Ch. 11 §11.7.
> Notes passed between a human and an agent, or between sessions, when a task is picked
> up, paused, or returned.

No handoff is in progress yet. When a task is paused or returned, copy the entry block below
and fill it in.

---

## Handoff entries

```
Task ID:
Date:
From → To:          [human → agent | agent → human | session A → session B]
Current status:     [Not started / In progress / Blocked / In review]

What is done:
What is not done:
Files touched so far:
Assumptions made:
Open questions blocking progress:
Next concrete step:
Do not change:
Tests currently passing:
Tests currently failing:
```

---

## Agent three-stage workflow (Ch. 11 §11.7)

The agent must not skip a stage. You check the right-hand column.

| Stage | Agent must do | You check |
|---|---|---|
| **Prepare** | Restate the task, list relevant files, identify assumptions. | The agent understands the scope and is not expanding it. |
| **Implement** | Change only approved files; keep the solution small. | Code matches the spec and creates no surprise behavior. |
| **Report** | Summarize changes, tests, risks, and unresolved questions. | You can review without hunting through every file blindly. |

> **Practical rule:** if an agent cannot explain what it changed, why it changed it, and
> how to verify it, the task is not complete.

---

## Mid-work checkpoint (Ch. 29 §29.7)

Trigger a checkpoint when the agent or developer finds ambiguity. The Answer column is filled
per checkpoint.

| Check | Answer |
|---|---|
| What assumption is being made? | |
| What is blocking progress? | |
| Which design choice is in question? | |
| Decision needed from whom? | |
| Revised task boundary: | |

---

## Control rules while a task is in flight (Ch. 11 §11.5)

| Control rule | How you apply it |
|---|---|
| One task at a time | Do not combine sign-in, recipes, planning, and list generation in one request. |
| Approved files only | Tell the agent which folders or files it may edit. |
| Plan before edit | Ask for a short plan before allowing implementation. |
| No silent assumptions | Require the agent to report unclear requirements before coding. |
| Tests required | Every behavior change includes or updates a test. |
| Review before next task | Do not move on until you have checked the current result. |

---

> Blueprint: blueprints/02-tasks/03-control/task-handoff-notes.md
