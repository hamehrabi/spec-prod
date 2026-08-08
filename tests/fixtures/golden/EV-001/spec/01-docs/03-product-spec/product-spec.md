# product-spec.md — Product Requirements Document (PRD)

> **Purpose (Ch. 4 §4.4):** Explains user flows, feature scope, and user experience.
> **When you use it:** Before design and implementation.
> **Sources:** Ch. 6, Appendix B.

> **Beginner rule (Ch. 6):** do not describe database tables, frameworks, endpoints, or
> file structure here. Those decisions belong in [`technical-spec.md`](../04-technical-spec/technical-spec.md).

**Product name:** Pantry
**Version:** PRD v1.0
**Owner:** Developer
**Date:** 2026-08-08

---

## 1. Product summary

Pantry is a browser-based app for a home cook to keep all of their recipes in one place, plan which meals to cook across a week, and generate a single shopping list from that week. It is used by one person, for their own cooking, with their data private to them. The thing it competes on is turning a chosen week of meals into one shopping list, so the cook shops once instead of forgetting items and making a second trip. Everything else — saving recipes, planning the week, searching — exists to feed that one outcome.

## 2. Problem statement

Home cooks keep recipes scattered across screenshots, bookmarks, and handwritten cards. Planning a week means opening several places and still forgetting items at the shop, which costs a second trip and food that spoils.

## 3. Product goal

> This product helps **home cooks** turn a planned week of meals into one shopping list, under the constraint of a simple, single-user web app.

| Weak goal | Stronger goal |
|---|---|
| Build a task app. | Help small teams create, assign, and track daily work in one place. |
| Make customer support better. | Help support teams answer repeated questions faster with an AI-assisted knowledge base. |
| Create an analytics dashboard. | Help managers see key business numbers without opening spreadsheets. |

## 4. Success metrics

| # | Metric | Type |
|---|---|---|
| 1 | [TODO: what does success look like in the first month? — deferred at express depth (`Q-010`)] | Measurable user or business result |
| 2 | A cook shops for a planned week without a forgotten-item second trip. | Quality or adoption signal |
| 3 | The recipe library is never lost or corrupted (a loss would end the project). | Failure or risk signal to monitor |

*Examples:* "80 percent of new users create their first task within five minutes." ·
"Average first response time is reduced by 30 percent." · "Managers can view the five core
metrics on one dashboard."

## 5. Goals / Non-goals

**Goals**
- Keep every recipe in one place; plan a week; generate one shopping list from that week; find a saved recipe quickly.

**Non-goals** → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope) — the explicit out-of-scope list was deferred at express depth (`Q-004`).

## 6. Primary users (personas)

A persona reminds you that software is built for people with goals, frustrations, limits,
and responsibilities — not for an abstract crowd.

**Persona 1**
- Role: Home cook (the only user)
- Goal: Cook a planned week without forgetting ingredients at the shop.
- Frustration: Recipes are scattered across screenshots, bookmarks, and cards; the weekly shop always misses something.
- Main use cases: Save a recipe, search recipes, plan the week, generate the shopping list, tick items off while shopping.
- Success condition: Shops once for the whole week's meals, from one list.

**Persona 2**
- Not applicable — version one is a single-user consumer product with one role (see `REQ-R-001`). There is no reviewer, manager, or support persona.

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
| Save a recipe | A signed-in cook saves a recipe with a title and a list of ingredient lines. | Recipes are the raw material for the week and the list. |
| Search recipes | A cook searches their saved recipes by text. | A growing library is useless if a recipe cannot be found. |
| Plan a week | A cook assigns saved recipes to days of a week. | Deciding the week in one place is the input to the list. |
| Generate one shopping list | A cook generates a single list from a week's planned meals. | This is the core promise — one week, one list. |
| Tick off list items | A cook marks items bought while shopping. | Makes the list usable in the shop. |

> **Scope control habit (Ch. 6 §6.4):** for every feature you include, write one sentence
> explaining why it belongs in this version. If you cannot explain the value, move it to
> out of scope.

## 8. Out of scope

**Not included in this version**

| Feature | Reason | Future status |
|---|---|---|
| [TODO: what is explicitly out of scope for version one? — deferred at express depth (`Q-004`)] | Not asked at express depth. | Waiting for information |

Full non-goals list → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope)

## 9. User stories

Format: `US-###: As a [specific role], I want [one clear capability], so that [benefit].`

| ID | Story | Supports | Produces task | Produces test |
|---|---|---|---|---|
| US-001 | As a home cook, I want to save a recipe with its ingredients, so that my recipes live in one place. | REQ-F-001 | — | — |
| US-002 | As a home cook, I want to search my saved recipes, so that I can find one quickly. | REQ-F-002 | — | — |
| US-003 | As a home cook, I want to plan which recipes to cook across a week, so that the week is decided in one place. | REQ-F-003 | — | — |
| US-004 | As a home cook, I want to generate one shopping list from the week, so that I can shop once without forgetting items. | REQ-F-004 | — | — |
| US-005 | As a home cook, I want to tick items off while shopping, so that I can see what is still needed. | REQ-F-006 | — | — |

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

**Flow name:** Generate the week's shopping list (core)
- Start: The cook opens a week that has planned meals.
- Action: Selects "Generate shopping list".
- Input: The week's planned meals (each a saved recipe with ingredient lines).
- System response: Gathers the ingredients of every planned meal into one list.
- Success path: The shopping list is shown; the cook can tick items off while shopping.
- Failure path: If the week has no planned meals, an empty list with a clear message is shown — not an error (AC-003).

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
| Must-have | The first useful version fails without it. | Save a recipe; plan a week; generate one shopping list; sign in. |
| Should-have | Important, but the product can still be tested without it. | Search recipes; tick off list items. |
| Could-have | Useful improvement if time allows. | — |
| Later / Won't | Not needed for the first version. | → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md#non-goals--out-of-scope) (`Q-004`) |

> **Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
> main product idea? If yes, it may not be a must-have for the first version.

## 12. Dependencies

None planned for version one. Whether any external service is used is decided in Round 6 (`Q-007`); the working assumption is none.

## 13. Risks

| Risk | Type (product / technical / security / operational) | Mitigation |
|---|---|---|
| The "week → one list" flow does not clearly beat the scattered status quo, so cooks do not switch. | Product | Keep the core flow fast (interface priority) and simple; make it the shortest path in the UI. |
| The recipe library is lost or corrupted (years of handwritten cards). | Operational | Backup and recovery targets set in Round 8; the store enforces ownership and cascades so data stays consistent. |
| One account's private data is exposed. | Security | Single account, private by design; every query scoped by `account_id` (Round 6 controls and deny tests). |

## 14. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

## 15. Links to requirements

- Supports REQ-F-001 – REQ-F-006
- Supports REQ-NF-001 – REQ-NF-007
- Supports BR-001 – BR-004

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

---

> Blueprint: blueprints/01-docs/03-product-spec/product-spec.md
