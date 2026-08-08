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
| **Problem statement** | Home cooks keep recipes scattered across screenshots, bookmarks, and handwritten cards. Planning a week of meals means opening several places and still forgetting items at the shop, which costs a second trip and food that spoils. Pantry should let a cook keep recipes in one place, plan a week, and shop from a single list. |
| **Primary users** | Individual home cooks managing their own recipes and weekly meal planning (B2C). |
| **Secondary users** | None in version one — one person uses Pantry for their own cooking; there is no separate reviewer, manager, or support role. |
| **Business goal** | Home cooks adopt Pantry as the single home for their recipes and weekly plan, so they shop once and waste less; the value that earns continued use is turning a chosen week of meals into one shopping list. |
| **User goal** | Keep all recipes in one place, plan the week's meals, and leave for the shop with one list — nothing forgotten, fewer second trips, less spoiled food. |
| **Current pain points** | Recipes live in screenshots, bookmarks, and handwritten cards; planning a week means opening several separate places; items are forgotten at the shop; a forgotten item means a second trip; unbought or unused ingredients spoil. |
| **Core capabilities** | Save a recipe with its ingredients; plan which meals to cook in a week; generate one shopping list from that week; search saved recipes. The one it competes on is generating a single shopping list from a chosen week (`Q-003`). |
| **Desired outcome** | A home cook plans a week of meals in one place and shops from a single generated list, making second trips and spoiled food the exception rather than the norm. |
| **Out of scope** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Success measures** | A chosen week of meals produces one shopping list the cook actually shops from; a weekly shop is completed without a forgotten-item second trip; recipes that were scattered are all found in one place. |
| **Constraints** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Risks** | The core "week → one list" value may not clearly beat the scattered status quo, so cooks do not switch; and the recipe library is precious and hard to re-enter (years of handwritten cards), so losing it would end the project. |
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
| Primary user | Who uses the system most often? | Individual home cooks planning and cooking their own meals. |
| Secondary user | Who reviews, manages, or supports the system? | None in version one — a single-user consumer product. |
| Goal | What should improve after the system exists? | A home cook plans a week and shops from one list, instead of juggling several places and forgetting items. |
| Constraint | What must limit the design? | A browser-based web application used by one individual consumer. |
| Risk | What could make the project fail? | The core "week → one list" value not clearly beating the scattered status quo, or loss of the hard-to-re-enter recipe library. |

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

---

> Blueprint: blueprints/01-docs/01-intent/intent.md
