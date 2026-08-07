# product-spec.md — Product Requirements Document (PRD)

> **Purpose (Ch. 4 §4.4):** Explains user flows, feature scope, and user experience.
> **When you use it:** Before design and implementation.
> **Sources:** Ch. 6, Appendix B.

> **Beginner rule (Ch. 6):** do not describe database tables, frameworks, endpoints, or
> file structure here. Those decisions belong in [`technical-spec.md`](../04-technical-spec/technical-spec.md).

**Product name:** Pantry
**Version:** PRD v1.0
**Owner:** Developer
**Date:** 2026-08-07

---

## 1. Product summary

Pantry is a web application for one home cook. It keeps their recipes in one place, lets
them choose which meals to cook across a week, and turns that week into a single shopping
list. The whole point is that planning and shopping become one quick task instead of six
scattered ones.

## 2. Problem statement

Home cooks keep recipes scattered across screenshots, bookmarks and handwritten cards. When
they plan a week of meals they open six places and still forget something at the shop — a
second trip, and food that goes off.

## 3. Product goal

> This product helps **a home cook** turn a week of chosen meals into one complete shopping
> list, quickly, so nothing is forgotten.

| Weak goal | Stronger goal |
|---|---|
| Build a task app. | Help small teams create, assign, and track daily work in one place. |
| Make customer support better. | Help support teams answer repeated questions faster with an AI-assisted knowledge base. |
| Create an analytics dashboard. | Help managers see key business numbers without opening spreadsheets. |

## 4. Success metrics

| # | Metric | Type |
|---|---|---|
| 1 | [TODO: what does success look like in the first month? — Q-010] | Measurable user or business result |
| 2 | A week of chosen meals produces one shopping list covering every ingredient of every planned meal. | Quality or adoption signal |
| 3 | No second trip for a forgotten item (no missing-item reports against a generated list). | Failure or risk signal to monitor |

*Examples:* "80 percent of new users create their first task within five minutes." ·
"Average first response time is reduced by 30 percent." · "Managers can view the five core
metrics on one dashboard."

## 5. Goals / Non-goals

**Goals**
- Recipes live in one searchable place.
- A week of chosen meals becomes one shopping list, fast, with nothing forgotten.

**Non-goals** → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope)

## 6. Primary users (personas)

A persona reminds you that software is built for people with goals, frustrations, limits,
and responsibilities — not for an abstract crowd.

**Persona 1**
- Role: Home cook (the account owner)
- Goal: Cook a planned week without forgetting an ingredient at the shop.
- Frustration: Recipes are scattered; the shopping list is assembled by hand and misses things.
- Main use cases: Save a recipe, plan a week of meals, generate one shopping list, search recipes.
- Success condition: Walks into the shop with one complete list.

**Persona 2**
- Not applicable — Pantry has a single user type (the home cook); there is no sharing, admin, or viewer role.

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
| Save a recipe | A cook saves a recipe with a title and one or more ingredient lines. | Recipes must live in one place before a list can be built. |
| Search recipes | A cook finds a saved recipe by title or ingredient. | A library you cannot search is scattered again. |
| Plan a week | A cook creates a weekly plan and adds chosen recipes as planned meals. | Choosing the week is the input to the core. |
| Generate one shopping list | A cook generates one list from a weekly plan, covering every planned ingredient. | This is the one thing the product competes on. |

> **Scope control habit (Ch. 6 §6.4):** for every feature you include, write one sentence
> explaining why it belongs in this version. If you cannot explain the value, move it to
> out of scope.

## 8. Out of scope

**Not included in this version**

| Feature | Reason | Future status |
|---|---|---|
| [TODO: explicit out-of-scope list — Q-003] | Not asked at express depth. | Waiting for information |

Full non-goals list → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope)

## 9. User stories

Format: `US-###: As a [specific role], I want [one clear capability], so that [benefit].`

| ID | Story | Supports | Produces task | Produces test |
|---|---|---|---|---|
| US-001 | As a home cook, I want to save a recipe with its ingredients, so that my recipes live in one place. | REQ-F-002 | TASK-### | TEST-### |
| US-002 | As a home cook, I want to search my saved recipes, so that I can find one again. | REQ-F-003 | TASK-### | TEST-### |
| US-003 | As a home cook, I want to plan which meals to cook this week, so that I can decide before shopping. | REQ-F-004 | TASK-### | TEST-### |
| US-004 | As a home cook, I want one shopping list from my week's plan, so that I shop in one trip and forget nothing. | REQ-F-005 | TASK-### | TEST-### |

| Weak story | Stronger story |
|---|---|
| As a user, I want tasks. | As a team member, I want to create a task with a due date so that I can record work that needs attention. |
| As an admin, I want control. | As an owner, I want to invite team members so that work can be shared inside one workspace. |
| As a manager, I want reports. | As a project manager, I want to see overdue tasks so that I can follow up quickly. |

## 10. User flows

A good flow includes the start point, user action, system response, success path, and
**at least one failure path**.

**Flow name:** Generate a shopping list from the week
- Start: The cook opens a weekly plan with planned meals.
- Action: The cook selects "Generate shopping list".
- Input: The weekly plan and its planned meals' recipes.
- System response: The system gathers every ingredient of every planned meal into one list.
- Success path: One shopping list is shown, covering all planned ingredients.
- Failure path: If generation fails, a clear error is shown and the weekly plan is preserved (REQ-NF-003).

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
| Must-have | The first useful version fails without it. | Save recipe, plan a week, generate one shopping list, search recipes. |
| Should-have | Important, but the product can still be tested without it. | Check off items on a shopping list. |
| Could-have | Useful improvement if time allows. | Photos of finished dishes (see Round 6). |
| Later / Won't | Not needed for the first version. | Sharing, multi-user (Q-005). |

> **Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
> main product idea? If yes, it may not be a must-have for the first version.

## 12. Dependencies

No external services are confirmed for version one — external dependencies are decided in
Round 6 (Q-007). The data store choice is recorded in
[`../05-architecture/decisions.md`](../05-architecture/decisions.md).

## 13. Risks

| Risk | Type (product / technical / security / operational) | Mitigation |
|---|---|---|
| Shopping list misses or mis-combines ingredients | Product | Nail the combine rule (Q-009); cover with acceptance and failure tests. |
| Loss of the recipe library | Operational | Backups sized to the recovery objective (see Round 8 backup-and-recovery). |

## 14. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

## 15. Links to requirements

- Supports REQ-F-002, REQ-F-003, REQ-F-004, REQ-F-005
- Supports REQ-NF-003, REQ-NF-004
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

**Next:** [`technical-spec.md`](../04-technical-spec/technical-spec.md)

> Blueprint: blueprints/01-docs/03-product-spec/product-spec.md
