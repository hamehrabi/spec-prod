# Task Handoff Notes

> Source: Ch. 30 §30.2, Ch. 29 §29.3, Ch. 11 §11.7.
> Notes passed between a human and an agent, or between sessions, when a task is picked
> up, paused, or returned.

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

Trigger a checkpoint when the agent or developer finds ambiguity.

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
| One task at a time | Do not combine login, registration, password reset, and roles in one request. |
| Approved files only | Tell the agent which folders or files it may edit. |
| Plan before edit | Ask for a short plan before allowing implementation. |
| No silent assumptions | Require the agent to report unclear requirements before coding. |
| Tests required | Every behavior change includes or updates a test. |
| Review before next task | Do not move on until you have checked the current result. |

---

# WORKED EXAMPLE — ProjectBoard, TASK-006

## Handoff entry

```
Task ID:        TASK-006 (Implement task creation)
Date:           2026-03-26
From -> To:     agent -> human
Current status: In progress

What is done:
  - validate_task_input() with title length and trim rules
  - create_task_for_project() with project membership check
  - POST /api/v1/projects/{id}/tasks handler wired to the service
  - Unit tests UTEST-004 (empty title) and UTEST-005 (title too long)

What is not done:
  - Due-date rule BR-003 (no past dates) is NOT implemented
  - FTEST-001 (missing required field) not written

Files touched so far:
  - src/03-api/tasks/create_handler.py
  - src/04-services/tasks/create_task.py
  - src/04-services/tasks/validate_task_input.py
  - tests/unit/test_validate_task_input.py

Assumptions made:
  - Assumed "trimmed before saving" means trailing whitespace only counts against the
    120-char limit AFTER trimming. This was not stated in the spec.

Open questions blocking progress:
  - BR-003 says a due date "cannot be earlier than today when the task is created".
    Does that rule also apply on EDIT? (Raised as Q-005 - not answered.)

Next concrete step:
  Implement BR-003 for the CREATE path only, and write FTEST-001.

Do not change:
  auth module, users table, project creation.

Tests currently passing: UTEST-004, UTEST-005
Tests currently failing: none
```

## Mid-work checkpoint that triggered the handoff

| Check | Answer |
|---|---|
| What assumption is being made? | That BR-003 applies only at creation, not on edit. |
| What is blocking progress? | The requirement is silent about the edit path. |
| Which design choice is in question? | Whether validation lives in one shared validator or two. |
| Decision needed from whom? | Product owner. |
| Revised task boundary | TASK-006 covers CREATE only. Edit-path validation becomes TASK-014 once Q-005 is answered. |

## What the three stages produced

| Stage | Agent output | What the human checked |
|---|---|---|
| **Prepare** | Restated TASK-006, listed 4 files it planned to touch, flagged that BR-003 wording was ambiguous. | Scope matched the task; the ambiguity was raised **before** coding, not after. |
| **Implement** | Changed exactly those 4 files. No schema change, no auth change. | Diff contained no unrelated edits. |
| **Report** | Listed files, the assumption about trimming, the unresolved BR-003 question, and which tests pass. | The assumption was visible, so it could be accepted or corrected instead of shipping silently. |

> **The rule that saved this task:** the agent was required to report unclear requirements
> *before* coding. Without it, BR-003 would have been silently half-implemented and the
> gap would have surfaced in production instead of at handoff.
