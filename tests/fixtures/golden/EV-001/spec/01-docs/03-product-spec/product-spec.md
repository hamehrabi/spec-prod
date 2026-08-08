# product-spec.md — Product Requirements Document (PRD)

> **Purpose (Ch. 4 §4.4):** Explains user flows, feature scope, and user experience.
> **When you use it:** Before design and implementation.
> **Sources:** Ch. 6, Appendix B.

> **Beginner rule (Ch. 6):** do not describe database tables, frameworks, endpoints, or
> file structure here. Those decisions belong in [`technical-spec.md`](../04-technical-spec/technical-spec.md).

**Product name:** Pantry
**Version:** PRD v1.0
**Owner:** Developer (product owner)
**Date:** 2026-08-08

---

## 1. Product summary

Pantry is a web application for home cooks. It keeps recipes — currently scattered across
screenshots, bookmarks and handwritten cards — in one place. A cook plans which meals to
cook in a week from their saved recipes, and Pantry turns that week into one shopping
list, so one trip covers the shop. It is a single-user product: each account holder sees
only their own recipes, plans, and lists.

## 2. Problem statement

People who cook at home keep recipes scattered across screenshots, bookmarks and
handwritten cards. When they plan a week of meals they have to open six places and still
forget something at the shop, which costs them a second trip and food that goes off.

## 3. Product goal

> Pantry helps **home cooks** turn a week of chosen meals into one shopping list, with
> their recipes kept in one place.

| Weak goal | Stronger goal |
|---|---|
| Build a task app. | Help small teams create, assign, and track daily work in one place. |
| Make customer support better. | Help support teams answer repeated questions faster with an AI-assisted knowledge base. |
| Create an analytics dashboard. | Help managers see key business numbers without opening spreadsheets. |

## 4. Success metrics

| # | Metric | Type |
|---|---|---|
| 1 | [TODO: what does success look like in the first month? — Q-006] | Measurable user or business result |
| 2 | [TODO: what does success look like in the first month? — Q-006] | Quality or adoption signal |
| 3 | [TODO: what does success look like in the first month? — Q-006] | Failure or risk signal to monitor |

*Examples:* "80 percent of new users create their first task within five minutes." ·
"Average first response time is reduced by 30 percent." · "Managers can view the five core
metrics on one dashboard."

## 5. Goals / Non-goals

**Goals**
- Recipes live in one place instead of screenshots, bookmarks and handwritten cards.
- A week of meals is planned from saved recipes in one application.
- One shopping list covers the week's shop — no second trip, less food wasted.
- A saved recipe can be found again by searching.

**Non-goals** → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope)

## 6. Primary users (personas)

A persona reminds you that software is built for people with goals, frustrations, limits,
and responsibilities — not for an abstract crowd.

**Persona 1**
- Role: Home cook — an individual consumer using Pantry for their own kitchen.
- Goal: Plan the week's meals and do the shop in one trip.
- Frustration: Recipes are scattered across screenshots, bookmarks and handwritten cards; planning means opening six places; something is always forgotten at the shop.
- Main use cases: Save a recipe with its ingredients, plan the week, generate the shopping list, search saved recipes.
- Success condition: Leaves the shop with everything the week's meals need.

**Persona 2** — none. Pantry is a single-user product with no sharing (Rounds 1 and 3), so
there is no second role to describe.

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
| Save a recipe | An account holder saves a recipe with a title and its ingredient lines. | The product has no value if recipes cannot be captured. |
| Plan a week | An account holder adds saved recipes to a weekly plan as planned meals. | The week is the unit the shopping list is generated from. |
| Generate the shopping list | One action turns a weekly plan into one shopping list covering every ingredient line (BR-001). | This is the capability Pantry competes on. |
| Search recipes | An account holder finds saved recipes by searching. | A library nobody can search sends the cook back to their screenshots. |

> **Scope control habit (Ch. 6 §6.4):** for every feature you include, write one sentence
> explaining why it belongs in this version. If you cannot explain the value, move it to
> out of scope.

## 8. Out of scope

**Not included in this version**

| Feature | Reason | Future status |
|---|---|---|
| [TODO: which capabilities are explicitly out of scope for version one? — Q-004] | Not asked at express depth. | Waiting for information |

Full non-goals list → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope)

## 9. User stories

Format: `US-###: As a [specific role], I want [one clear capability], so that [benefit].`

| ID | Story | Supports | Produces task | Produces test |
|---|---|---|---|---|
| US-001 | As a home cook, I want to save a recipe with its ingredients, so that my recipes live in one place. | REQ-F-001 | — | — |
| US-002 | As a home cook, I want to plan which meals to cook in a week, so that the week is decided once, in one place. | REQ-F-002 | — | — |
| US-003 | As a home cook, I want one shopping list generated from my week, so that one trip covers the shop. | REQ-F-003 | — | — |
| US-004 | As a home cook, I want to search my saved recipes, so that I can find a recipe when planning. | REQ-F-004 | — | — |

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

**Flow name:** Plan a week and generate the shopping list
- Start: A signed-in account holder opens their weekly plan.
- Action: They add saved recipes to the week as planned meals, then choose Generate shopping list.
- Input: The recipes chosen for the week.
- System response: The system creates one shopping list covering every ingredient line of the planned meals (BR-001).
- Success path: The list is shown, ready for the shop. (How duplicate ingredients appear is open — Q-011.)
- Failure path: If generation fails, the system says so plainly, the plan is unchanged, and nothing pretends to have worked (REQ-NF-003).

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
| Must-have | The first useful version fails without it. | Save a recipe · plan a week · generate the shopping list · search recipes |
| Should-have | Important, but the product can still be tested without it. | None named. |
| Could-have | Useful improvement if time allows. | None named. |
| Later / Won't | Not needed for the first version. | [TODO: which capabilities are explicitly out of scope for version one? — Q-004] |

> **Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
> main product idea? If yes, it may not be a must-have for the first version.

## 12. Dependencies

None in version one (Round 6). Pantry calls no external service — every dependency not
added is an outage it cannot have and a bill it does not pay. This section gains an entry
the day email, storage, or any third-party API arrives.

## 13. Risks

| Risk | Type (product / technical / security / operational) | Mitigation |
|---|---|---|
| [TODO: what could make the project fail? — Q-007] | — | — |

## 14. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

## 15. Links to requirements

- Supports REQ-F-001, REQ-F-002, REQ-F-003, REQ-F-004
- Supports REQ-NF-001 through REQ-NF-007
- Supports BR-001, BR-002, BR-003

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

**Next:** [`technical-spec.md`](../04-technical-spec/technical-spec.md)

> Blueprint: blueprints/01-docs/03-product-spec/product-spec.md
