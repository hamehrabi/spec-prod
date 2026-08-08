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
| **Project name** | Pantry |
| **Problem statement** | People who cook at home keep recipes scattered across screenshots, bookmarks and handwritten cards. When they plan a week of meals they have to open six places and still forget something at the shop, which costs them a second trip and food that goes off. |
| **Primary users** | Home cooks — individual consumers (B2C). |
| **Secondary users** | None identified — inferred from "Individual consumers (B2C)": one person's tool, with nobody reviewing, managing, or supporting it. Say if that is wrong. |
| **Business goal** | [TODO: what does success look like in the first month? — Q-006] |
| **User goal** | Plan a week of meals in one place instead of six, and leave the shop with everything the week needs. |
| **Current pain points** | Recipes live in screenshots, bookmarks and handwritten cards; planning a week means opening six places; something is still forgotten at the shop; the cost is a second trip and food that goes off. |
| **Core capabilities** | Save a recipe with its ingredients · plan which meals to cook in a week · generate one shopping list from that week · search saved recipes. |
| **Desired outcome** | A week of chosen meals becomes one shopping list, so one trip covers the week and less food is wasted. |
| **Out of scope** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Success measures** | [TODO: what does success look like in the first month? — Q-006] |
| **Constraints** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Risks** | [TODO: what could make the project fail? — Q-007] |
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

## Users, goals, and constraints (Ch. 2 §2.4)

| Element | Question to answer | Your answer |
|---|---|---|
| Primary user | Who uses the system most often? | A home cook planning the week's meals and the shop for them. |
| Secondary user | Who reviews, manages, or supports the system? | None identified — inferred from the B2C answer. |
| Goal | What should improve after the system exists? | The week's meals and the shopping for them are handled in one place, with nothing forgotten. |
| Constraint | What must limit the design? | [TODO: what hard constraints already exist? — Q-005] |
| Risk | What could make the project fail? | [TODO: what could make the project fail? — Q-007] |

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

**Next:** [`requirements.md`](../02-requirements/requirements.md)

> Blueprint: blueprints/01-docs/01-intent/intent.md
