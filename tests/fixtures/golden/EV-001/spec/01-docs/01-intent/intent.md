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
| **Problem statement** | Home cooks keep recipes scattered across screenshots, bookmarks and handwritten cards. Planning a week of meals means opening six places and still forgetting something at the shop, which costs a second trip and food that goes off. One cook should be able to keep their recipes in one place and turn a week of chosen meals into a single shopping list. |
| **Primary users** | Individual home cooks (B2C), using it for themselves. [TODO: how many people will use it in the first six months? — Q-001] |
| **Secondary users** | None identified in version one — a single cook uses it for themselves (from: primary user is an individual consumer). |
| **Business goal** | For the cook, planning a week and shopping for it becomes one quick task instead of six scattered ones. Success is a correct single shopping list produced from a week's chosen meals. |
| **User goal** | Keep all their recipes in one place and turn a week of chosen meals into one shopping list, without forgetting an ingredient. |
| **Current pain points** | Recipes scattered across screenshots, bookmarks and handwritten cards; planning means opening six places; ingredients forgotten at the shop; a second trip; food going off. |
| **Core capabilities** | Save a recipe with its ingredients; plan which meals to cook in a week; generate one shopping list from that week; search saved recipes. |
| **Desired outcome** | A cook plans a week, walks into the shop with one complete list, and forgets nothing. |
| **Out of scope** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Success measures** | A week of chosen meals produces one shopping list covering every ingredient of every planned meal; a saved recipe can be found again by searching; the plan-the-week-to-list path is the fast path the product competes on. |
| **Constraints** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Risks** | The single-shopping-list generation is the one thing the product competes on; if it is wrong or misses items, the product has no reason to exist. Scope creeping beyond one cook's recipes and week. |
| **Open questions** | → [`open-questions.md`](open-questions.md) |

### Starter (Appendix A)

```
Project Name: Pantry
Problem Statement: Home cooks keep recipes scattered and forget items when shopping for a week of meals.
Primary Users: Individual home cooks (B2C).
Business Goal: Planning and shopping for a week becomes one task, not six.
User Goal: Recipes in one place; a week of meals becomes one shopping list.
Pain Points: Scattered recipes; forgotten items; a second trip; wasted food.
Desired Outcome: One complete shopping list from a week's chosen meals.
Out of Scope: See constraints-and-non-goals.md.
Success Measures: One list covers every planned ingredient; a saved recipe is findable by search.
Constraints: See constraints-and-non-goals.md.
Open Questions: See open-questions.md.
```

---

## Users, goals, and constraints (Ch. 2 §2.4)

| Element | Question to answer | Your answer |
|---|---|---|
| Primary user | Who uses the system most often? | An individual home cook, for themselves (B2C). |
| Secondary user | Who reviews, manages, or supports the system? | None identified — single-user (from: individual consumer). |
| Goal | What should improve after the system exists? | A week of meals becomes one shopping list, with nothing forgotten. |
| Constraint | What must limit the design? | Recorded in [`constraints-and-non-goals.md`](constraints-and-non-goals.md) (decided in Round 2). |
| Risk | What could make the project fail? | Getting the single-shopping-list generation wrong — it is the one thing the product competes on. |

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
