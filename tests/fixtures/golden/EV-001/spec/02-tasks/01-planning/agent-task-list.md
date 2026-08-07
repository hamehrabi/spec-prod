# Agent Task List

> Source: Front Matter workspace, Ch. 14, Ch. 25 §25.8, Ch. 30 §30.2.
> An agent-friendly task list is **not** a normal to-do list. Each entry gives the agent
> instructions in a format that reduces guessing.
>
> **The best task list is boring, specific, and controlled.**

> Sequencing: **thin vertical slices** — one feature end to end before the next. Built by an
> **AI coding agent, one task at a time**. IDs match `task-index.md`.

---

## Task table

| Task ID | Agent task | Input artifacts | Acceptance check | Depends on | Out of scope |
|---|---|---|---|---|---|
| TASK-001 | Create project structure and configuration loading. | technical-spec, .env.example | Project runs locally with an empty health check. | — | Any business feature. |
| TASK-003 | Implement the Recipe + IngredientLine model with validation (title + ≥1 line). | REQ-F-002, BR-002, database-design §1/§3 | A recipe with a title and ≥1 ingredient line can be stored; invalid is rejected. | TASK-001 | Account/auth; UI; search. |
| TASK-004 | Implement `POST /api/v1/recipes` and `GET /api/v1/recipes`, scoped to the account. | REQ-F-002, api-specification | Valid recipe saved and returned; another account's recipe is 404. | TASK-003 | UI; search ranking. |
| TASK-006 | Implement recipe search (`GET /api/v1/recipes?q=`). | REQ-F-003, api-specification | A saved recipe is found by title/ingredient. | TASK-004 | Fuzzy/semantic search. |
| TASK-007 | Implement weekly-plan create and add-planned-meal. | REQ-F-004, database-design | A plan can be created and a recipe added as a planned meal. | TASK-003 | List generation. |
| TASK-008 | Implement shopping-list generation from a plan. | REQ-F-005, BR-001, Q-009 | List includes every planned ingredient (per the Q-009 combine rule). | TASK-007 | Anything not in REQ-F-005. |

---

## Breaking a feature into tasks (Ch. 14 §14.2)

Start with **one approved feature**, not the whole product. Split it into the pieces
needed to make it real.

| Feature area | Possible task | Output | Test signal |
|---|---|---|---|
| Data | Create the entity fields | Schema or model | Record can be stored |
| Rules | Define validation | Validation function | Invalid input is rejected |
| API | Create the endpoint | Endpoint contract | Correct response is returned |
| UI | Build the form | Screen or component | User can submit |
| Error handling | Map error responses | Error response rules | Failure returns a safe message |
| Tests | Cover happy + failure paths | Test suite | Suite passes |

**Guiding question:** *What is the smallest useful piece of work that can be completed,
tested, and reviewed without building the entire feature?*

**The one-outcome rule:** if one task has more than one major outcome, split it. A task
that creates a database model, endpoint, screen, **and** tests is not one task — it is a
mini-project.

**A useful task answers five questions:**
1. What should be changed?
2. Why is it needed?
3. Which spec does it come from?
4. How will you know it is done?
5. What should **not** be changed?

---

## Avoid these task words

"handle everything" · "make it robust" · "finish the feature" · "improve the app" ·
"clean this up" · "make it better"

They sound helpful but leave too much room for interpretation.

| Weak task | Better task |
|---|---|
| Build login. | Create a `POST /auth/login` endpoint that accepts email and password, validates input, checks the password hash, and returns a session token on success. |
| Add errors. | Return a safe invalid-credentials error without revealing whether the email exists. |
| Make sessions work. | Create session expiration logic and reject expired tokens. |
| Build the shopping list. | TASK-008: Generate one shopping list from a weekly plan, covering every planned ingredient per the Q-009 combine rule, scoped to the account, with tests. |

---

> Blueprint: blueprints/02-tasks/01-planning/agent-task-list.md
