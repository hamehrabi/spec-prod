# product-spec.md — Product Requirements Document (PRD)

> **Purpose (Ch. 4 §4.4):** Explains user flows, feature scope, and user experience.
> **When you use it:** Before design and implementation.
> **Sources:** Ch. 6, Appendix B.

> **Beginner rule (Ch. 6):** do not describe database tables, frameworks, endpoints, or
> file structure here. Those decisions belong in [`technical-spec.md`](../04-technical-spec/technical-spec.md).

**Product name:**
**Version:** PRD v1.0
**Owner:**
**Date:**

---

## 1. Product summary

*Explain the product in 3–5 sentences.*

## 2. Problem statement

*What problem are you solving and why does it matter?*

## 3. Product goal

> [This product helps] **[target user]** [achieve outcome] [under important constraint].

| Weak goal | Stronger goal |
|---|---|
| Build a task app. | Help small teams create, assign, and track daily work in one place. |
| Make customer support better. | Help support teams answer repeated questions faster with an AI-assisted knowledge base. |
| Create an analytics dashboard. | Help managers see key business numbers without opening spreadsheets. |

## 4. Success metrics

| # | Metric | Type |
|---|---|---|
| 1 | | Measurable user or business result |
| 2 | | Quality or adoption signal |
| 3 | | Failure or risk signal to monitor |

*Examples:* "80 percent of new users create their first task within five minutes." ·
"Average first response time is reduced by 30 percent." · "Managers can view the five core
metrics on one dashboard."

## 5. Goals / Non-goals

**Goals**
-

**Non-goals** → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope)

## 6. Primary users (personas)

A persona reminds you that software is built for people with goals, frustrations, limits,
and responsibilities — not for an abstract crowd.

**Persona 1**
- Role:
- Goal:
- Frustration:
- Main use cases:
- Success condition:

**Persona 2**
- Role:
- Goal:
- Frustration:
- Main use cases:
- Success condition:

*Example (Ch. 6 §6.3)*

| Persona field | Example |
|---|---|
| Name or role | Project manager |
| Goal | Assign work and know what is delayed. |
| Frustration | Tasks are scattered across messages and notebooks. |
| Main use cases | Create project, assign task, review task status, follow up on overdue work. |
| Success condition | Can see all active work without asking every team member. |

## 7. Feature scope

**In scope for this version**

| Feature | In-scope behavior | Why it belongs now |
|---|---|---|
| | | |
| | | |

*Example*

| Feature | In-scope behavior | Why it belongs now |
|---|---|---|
| Task creation | A signed-in user can create a task with title, description, status, and due date. | The product has no value if work cannot be captured. |
| Task list | A user can view tasks assigned to them or created by them. | Users need a simple place to see current work. |
| Basic assignment | A project manager can assign a task to one team member. | Team work requires ownership. |
| Status update | A user can mark a task pending, in progress, or complete. | Progress tracking is core to the product. |

> **Scope control habit (Ch. 6 §6.4):** for every feature you include, write one sentence
> explaining why it belongs in this version. If you cannot explain the value, move it to
> out of scope.

## 8. Out of scope

**Not included in this version**

| Feature | Reason | Future status |
|---|---|---|
| | | |

Full non-goals list → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope)

## 9. User stories

Format: `US-###: As a [specific role], I want [one clear capability], so that [benefit].`

| ID | Story | Supports | Produces task | Produces test |
|---|---|---|---|---|
| US-001 | As a …, I want …, so that … | REQ-F-001 | — | — |
| US-002 | | | | |

> **"Produces task" and "Produces test" are written by a LATER round, not this one.** Tasks and
> tests do not exist yet when the stories are written, so the honest value here is `—`.
>
> **Never write `TASK-###` or `TEST-###` into these cells.** A stub reads as an identifier that
> exists — a reader follows it and finds nothing — and it is not the sanctioned way to record
> something unknown. If a story still has no task once the task list is written, that is a gap
> worth a `[TODO]`, not a stub.

| Weak story | Stronger story |
|---|---|
| As a user, I want tasks. | As a team member, I want to create a task with a due date so that I can record work that needs attention. |
| As an admin, I want control. | As an owner, I want to invite team members so that work can be shared inside one workspace. |
| As a manager, I want reports. | As a project manager, I want to see overdue tasks so that I can follow up quickly. |

## 10. User flows

A good flow includes the start point, user action, system response, success path, and
**at least one failure path**. Failure paths matter because real users make mistakes, lose
connection, forget fields, or lack permission.

**Flow name:**
- Start:
- Action:
- Input:
- System response:
- Success path:
- Failure path:

*Example (Ch. 6 §6.7)*

| Flow step | Example: Create a task |
|---|---|
| Start | Team member opens the task dashboard. |
| Action | Team member selects Add Task. |
| Input | Enters title, description, due date, and status. |
| System response | System validates required fields. |
| Success path | Task is saved and appears in the task list. |
| Failure path | If the title is missing, the system shows a clear error and keeps the typed values. |

## 11. Feature priorities

| Priority | Meaning | Features |
|---|---|---|
| Must-have | The first useful version fails without it. | |
| Should-have | Important, but the product can still be tested without it. | |
| Could-have | Useful improvement if time allows. | |
| Later / Won't | Not needed for the first version. | |

> **Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
> main product idea? If yes, it may not be a must-have for the first version.

## 12. Dependencies

*Services, data sources, APIs, teams, or approvals needed.*

## 13. Risks

| Risk | Type (product / technical / security / operational) | Mitigation |
|---|---|---|
| | | |

## 14. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

## 15. Links to requirements

- Supports REQ-F-001
- Supports REQ-NF-001
- Supports BR-001

---

## Per-requirement format (Appendix B)

```
Requirement ID: REQ-001
Title:
Description:
User Value:
Priority: Must / Should / Could / Won't
Acceptance Criteria:
Dependencies:
Notes:
```

| Priority | Meaning | How to use it |
|---|---|---|
| Must | Required for the first usable release. | Do not start implementation until this is clear. |
| Should | Important but not release-blocking. | Plan after Must requirements. |
| Could | Useful improvement. | Keep for later unless capacity remains. |
| Won't | Not included in this release. | Protects scope from uncontrolled growth. |

---

## PRD quality checklist (Ch. 6)

| Check | Question | ✔ |
|---|---|---|
| Clear product goal | Can you explain the product outcome in one sentence? | [ ] |
| Known users | Have you identified the primary users and their goals? | [ ] |
| Useful success metrics | Can you tell whether the product is working for users? | [ ] |
| Controlled scope | Does the PRD clearly state what is included now? | [ ] |
| Protected focus | Does it clearly state what is out of scope? | [ ] |
| User stories | Are the most important features written from the user point of view? | [ ] |
| User flows | Can you follow the user path from start to success or failure? | [ ] |
| Ready for technical spec | Can a technical designer use this without guessing the product direction? | [ ] |

---

## Writing workflow (Ch. 6)

1. Start with [`requirements.md`](../02-requirements/requirements.md).
2. Write a short product summary in plain language.
3. Define one main product goal before listing features.
4. Add two or three success metrics that can be observed or measured.
5. Describe the main personas and their use cases.
6. Separate in-scope features from out-of-scope features.
7. Write user stories for the most important user outcomes.
8. Write simple user flows for the must-have features.
9. Prioritize features before moving to the technical specification.

---

## Prompts

**Create personas and use cases (Ch. 6 §6.3)**
```
You are helping me prepare a Product Requirements Document.

Project idea: [paste the project idea]
Known requirements: [paste the requirements]

Create 3 user personas. For each persona, include goal, frustration, main use cases, and
success condition. Keep the wording simple and practical. Do not invent technical
implementation details.
```

**Requirement → product spec (Ch. 16 §16.3)**
```
You are helping me turn requirements into a product specification. Use only the
requirements below. Do not invent new features. For each requirement, explain the user
goal, user flow, success metric, and out-of-scope notes. Return a concise product spec
section.
```

**PRD review (Ch. 6)**
```
Act as a strict product requirements reviewer.

Review the PRD below for unclear goals, missing users, weak success metrics, bloated
scope, missing out-of-scope decisions, vague user stories, and missing user flows.

Return your response in four sections:
1. Problems found
2. Suggested improvements
3. Missing questions
4. Revised compact PRD

PRD: [paste your PRD here]
```

---

**Next:** [`technical-spec.md`](../04-technical-spec/technical-spec.md)

---

# WORKED EXAMPLE — SaaS task app PRD (Ch. 6 §6.10)

| PRD section | Example content |
|---|---|
| Product summary | A web-based task management tool that helps small consulting teams create, assign, track, and complete work in one shared workspace. |
| Problem statement | Small teams track work in scattered chats, notebooks, and spreadsheets. This causes missed deadlines and unclear ownership. |
| Product goal | Help consulting teams capture work, assign ownership, and track progress without complex project-management setup. |
| Success metrics | A new user creates a task within five minutes; a manager can see overdue tasks; task list loads within two seconds for 500 tasks. |
| Primary users | Owner, project manager, team member, viewer. |
| Must-have scope | Create task, view task list, assign task, update task status, enforce basic permissions. |
| Out of scope | Mobile app, real-time chat, advanced reporting, multi-assignee tasks. |
