# intent.md — Engineering Intent Document

> **Purpose (Ch. 4 §4.4):** Captures problem, users, goals, scope, and constraints.
> **When you use it:** Before writing requirements.
> **Sources:** Appendix A + Ch. 2 §2.7.

One page. Shorter than a PRD, simpler than a technical spec. It is the bridge between a
rough idea and formal requirements — and a strong input for AI, because you can hand the
agent this instead of a vague idea.

**Detail documents in this folder**

| Document | Covers |
|---|---|
| [`project-brief.md`](project-brief.md) | The raw idea, vision vs. implementation, problem-statement formula. |
| [`constraints-and-non-goals.md`](constraints-and-non-goals.md) | Full constraint table and out-of-scope decisions. |
| [`open-questions.md`](open-questions.md) | Unresolved questions and the ambiguity test. |

> **Beginner rule (Ch. 2):** do not ask an AI agent to build from a vague idea. First
> convert the idea into engineering intent.

---

## The document

| Field | Value |
|---|---|
| **Project name** | *Short working name.* |
| **Problem statement** | *The pain, the consequence, and the desired improvement. No implementation details.* |
| **Primary users** | *Who uses the system most often.* |
| **Secondary users** | *Who reviews, manages, or supports it.* |
| **Business goal** | *What success means for the organization or project owner.* |
| **User goal** | *What users should be able to achieve more easily.* |
| **Current pain points** | *Frustrations, delays, risks, or manual steps that exist today.* |
| **Core capabilities** | *The first set of capabilities the system must support.* |
| **Desired outcome** | *The state that should be true after the solution works.* |
| **Out of scope** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Success measures** | *3–5 measurable signs the project is working.* |
| **Constraints** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Risks** | *What could make the project fail.* |
| **Open questions** | → [`open-questions.md`](open-questions.md) |

### Starter (Appendix A)

```
Project Name:
Problem Statement:
Primary Users:
Business Goal:
User Goal:
Pain Points:
Desired Outcome:
Out of Scope:
Success Measures:
Constraints:
Open Questions:
```

---

## Filled example — "TeamTask Lite" (Ch. 2 §2.8)

| Field | Example |
|---|---|
| Project name | TeamTask Lite |
| Problem statement | Small teams lose track of task ownership, due dates, and progress. This causes missed deadlines and repeated status meetings. The system should make responsibilities and progress visible in one simple workspace. |
| Primary users | Team members who create, update, and complete tasks. |
| Secondary users | Team leads who review progress and identify blocked work. |
| Core capabilities | Create tasks, assign owners, set due dates, set status, add priority, comment, view a simple progress dashboard. |
| Out of scope | Billing, file uploads, private chat, calendar sync, advanced analytics, app-store release. |
| Constraints | The first version must be simple, browser-based, and understandable without formal training. |
| Success criteria | A member can create and update a task in under one minute; a lead can see overdue and completed tasks from the dashboard. |

### How the example was derived (Ch. 2 §2.8)

| Step | Question | Answer |
|---|---|---|
| 1 | Who is affected? | Small teams with 3 to 15 members. |
| 2 | What problem do they face? | They lose track of task ownership, due dates, and progress. |
| 3 | What happens because of it? | Deadlines are missed; meetings are spent asking for status. |
| 4 | What outcome should improve? | Each member knows what to do next; leads see progress quickly. |
| 5 | What should the first version include? | Tasks, assignees, due dates, status, priority, comments, basic dashboard. |
| 6 | What should wait? | File uploads, chat, billing, calendar sync, advanced automation. |
| 7 | What constraints matter? | Simple enough for a small team to start using without training. |

---

## Users, goals, and constraints (Ch. 2 §2.4)

| Element | Question to answer | Your answer |
|---|---|---|
| Primary user | Who uses the system most often? | |
| Secondary user | Who reviews, manages, or supports the system? | |
| Goal | What should improve after the system exists? | |
| Constraint | What must limit the design? | |
| Risk | What could make the project fail? | |

> **Important distinction:** a goal is not a feature. "Create task comments" is a feature.
> "Make task discussions easier to follow" is a goal.

---

## Intent quality checklist (Appendix A)

- [ ] The problem is stated without assuming a specific technical solution.
- [ ] The intended users are named clearly.
- [ ] The desired outcome can be measured or observed.
- [ ] Out-of-scope items are written before implementation begins.
- [ ] Open questions are captured instead of being hidden.

## Chapter checklist (Ch. 2)

| Before you move to requirements, confirm that you have: | Done |
|---|---|
| A clear problem statement. | [ ] |
| Defined primary and secondary users. | [ ] |
| Separated vision from implementation details. | [ ] |
| Listed first-version capabilities. | [ ] |
| Listed what is out of scope. | [ ] |
| Identified constraints and risks. | [ ] |
| Defined simple success criteria. | [ ] |

> **Self-check (Ch. 2):** if this document does not make writing requirements *easier*,
> it is too vague.

---

## Prompts

**Create an Engineering Intent Document (Prompt box 2.4)**
```
Use the information below to draft an Engineering Intent Document.

Project idea: [paste idea]
Known users: [paste users]
Known business need: [paste business need]
Known constraints: [paste constraints]

Return a concise document with: problem statement, users, goals, core capabilities,
out of scope, constraints, risks, and success criteria.
```

**Turn a project idea into engineering intent (Ch. 25 §25.2)**
```
You are helping me prepare a spec-driven software project.

Project idea: [paste idea]

Create a concise engineering intent document with:
- problem statement
- target users
- intended outcome
- success criteria
- non-goals
- engineering constraints

Keep it practical and suitable for a beginner project.
```

---

**Next:** [`requirements.md`](../02-requirements/requirements.md)
