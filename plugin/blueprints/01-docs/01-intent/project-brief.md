# Project Brief

> Source: Ch. 16 §16.2 — Project Brief Template.
> Plain language. Not technical. Written before requirements exist.

**Project name:**

**Problem you want to solve:**

**Primary users:**

**Main outcome:**

**Must-have features:**
-
-

**Out-of-scope features:**
-
-

**Known constraints:**
-

**Success signal:**

---

## Separate vision from implementation (Ch. 2 §2.2)

Write these in two columns. Do not let implementation ideas contaminate the vision.

| Vision statement (what should improve) | Implementation idea (how it might be built) |
|---|---|
| | |
| | |

---

## Raw-idea interrogation (Ch. 2 §2.1)

| Question | Answer |
|---|---|
| Who is this for? (the actual user, not the requester) | |
| What problem hurts enough to solve? | |
| What outcome should improve? | |
| What must the system **not** do? | |
| What constraints already exist? | |

---

## Problem statement formula (Ch. 2 §2.3)

> [Affected user] currently faces [difficulty], which causes [consequence].
> The system should [desired improvement].

**Your problem statement:**

---

## Prompt — clarify a raw idea (Prompt box 2.1)

```
You are helping me clarify a raw software idea before writing requirements.

Idea: [paste the idea here]

Ask me the smallest set of questions needed to identify the problem, users, goals,
constraints, and scope boundaries. Do not design the solution yet.
```

## Prompt — improve a problem statement (Prompt box 2.2)

```
Rewrite this vague software request as a clear problem statement.

Request: [paste request]

Use this structure: affected user, current difficulty, consequence, desired improvement.
Keep it specific and do not invent features.
```

---

# WORKED EXAMPLE — ProjectBoard

> The running example used from Ch. 2 through Ch. 25. Everything below is filled in;
> the blueprint above is what you copy for your own project.

**Project name:** ProjectBoard

**Problem you want to solve:** Small consulting teams track work in scattered chats,
notebooks, and spreadsheets. This causes missed deadlines and unclear ownership.

**Primary users:** Team members who create and update tasks; team leads who review progress.

**Main outcome:** Each member knows what to do next, and a lead can see overdue work
without asking anyone.

**Must-have features:**
- Create a task with title, description, due date, status
- Assign a task to one team member
- Update task status
- View tasks by project

**Out-of-scope features:** Billing, file uploads, real-time chat, calendar sync,
advanced analytics, mobile app store release.

**Known constraints:** Web-only for v1. Simple enough for a small team to start using
without training. Must be buildable in about one week.

**Success signal:** A member creates and updates a task in under one minute; a lead sees
overdue and completed tasks from one dashboard.

## Vision vs. implementation

| Vision statement | Implementation statement |
|---|---|
| You want team members to know what to do next without a status meeting. | You may need a task list, assignee field, due dates, and a progress dashboard. |
| You want leads to spot slipping work early. | You may need an overdue filter, status counts, and a dashboard query. |

## Raw-idea interrogation

| Question | Answer |
|---|---|
| Who is this for? | Small consulting teams of 3–15 people. |
| What problem hurts enough to solve? | Ownership and deadlines are invisible; status meetings waste time. |
| What outcome should improve? | Fewer missed deadlines; clearer task ownership. |
| What must the system **not** do? | Replace chat, store files, or handle billing. |
| What constraints already exist? | One-week first version, browser-only, no training budget. |

## Problem statement

> Small teams lose track of task ownership, due dates, and progress. This causes missed
> deadlines and repeated status meetings. The system should make responsibilities and
> progress visible in one simple workspace.
