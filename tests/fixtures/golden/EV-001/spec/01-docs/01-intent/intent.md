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
| **Problem statement** | People who cook at home keep recipes scattered across screenshots, bookmarks and handwritten cards, which causes them to forget items on the weekly shop and make a second trip while food goes off. The system should hold every recipe in one place and turn the meals chosen for a week into a single shopping list. |
| **Primary users** | Individual consumers who cook at home, planning their own meals. |
| **Secondary users** | [TODO: is there anyone who reviews, manages or supports this, or is the cook the only user?] |
| **Business goal** | [TODO: what does success mean for you as the owner of this project?] |
| **User goal** | Keep every recipe in one place, and get one shopping list from the meals chosen for the week. |
| **Current pain points** | Recipes live in screenshots, bookmarks and handwritten cards. Planning a week means opening six places. Items are forgotten at the shop, causing a second trip and food waste. |
| **Core capabilities** | Save a recipe with its ingredients · plan which meals to cook in a week · generate one shopping list from that week · search saved recipes. |
| **Desired outcome** | A home cook finds any saved recipe without hunting, and shops for the week in one trip. |
| **Out of scope** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Success measures** | [TODO: what three to five measurable signs would tell you this is working?] |
| **Constraints** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Risks** | [TODO: what could make this project fail?] |
| **Open questions** | → [`open-questions.md`](open-questions.md) |

---

## Users, goals, and constraints (Ch. 2 §2.4)

| Element | Question to answer | Your answer |
|---|---|---|
| Primary user | Who uses the system most often? | The home cook who saves the recipes and does the shopping. |
| Secondary user | Who reviews, manages, or supports the system? | [TODO: is there anyone who reviews, manages or supports this, or is the cook the only user?] |
| Goal | What should improve after the system exists? | Recipes are findable in one place; a week's shopping is one list and one trip. |
| Constraint | What must limit the design? | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| Risk | What could make the project fail? | [TODO: what could make this project fail?] |

> **Important distinction:** a goal is not a feature. "Create task comments" is a feature.
> "Make task discussions easier to follow" is a goal.

---

## Intent quality checklist (Appendix A)

- [x] The problem is stated without assuming a specific technical solution.
- [x] The intended users are named clearly.
- [ ] The desired outcome can be measured or observed.
- [ ] Out-of-scope items are written before implementation begins.
- [x] Open questions are captured instead of being hidden.

## Chapter checklist (Ch. 2)

| Before you move to requirements, confirm that you have: | Done |
|---|---|
| A clear problem statement. | [x] |
| Defined primary and secondary users. | [ ] |
| Separated vision from implementation details. | [x] |
| Listed first-version capabilities. | [x] |
| Listed what is out of scope. | [ ] |
| Identified constraints and risks. | [ ] |
| Defined simple success criteria. | [ ] |

> **Self-check (Ch. 2):** if this document does not make writing requirements *easier*,
> it is too vague.

---

**Next:** [`requirements.md`](../02-requirements/requirements.md)

> Blueprint: blueprints/01-docs/01-intent/intent.md
