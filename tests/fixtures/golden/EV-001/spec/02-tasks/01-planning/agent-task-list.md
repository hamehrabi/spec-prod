# Agent Task List

> Source: Front Matter workspace, Ch. 14, Ch. 25 §25.8, Ch. 30 §30.2.
> An agent-friendly task list is **not** a normal to-do list. Each entry gives the agent
> instructions in a format that reduces guessing.
>
> **The best task list is boring, specific, and controlled.**

---

## Task table

| Task ID | Agent task | Input artifacts | Acceptance check | Depends on | Out of scope |
|---|---|---|---|---|---|
| TASK-001 | Create the modular-monolith skeleton and account sign-in. | technical-spec §2/§7, security-spec §1, ADR-001/ADR-002 | App runs; sign-in works; a signed-out data request returns 401. | — | Any recipe, planning, or list feature. |
| TASK-002 | Add recipe save with ingredient lines, scoped to the account. | requirements REQ-F-001, database-design, security-spec §3 | Recipe saves and lists; missing title rejected; never visible to another account. | TASK-001 | Search, planning, photos. |
| TASK-003 | Add search over the cook's own recipes. | requirements REQ-F-002, api-specification | Search returns own matches; empty result on no match. | TASK-002 | Ranking, external search service. |
| TASK-004 | Add weekly planning with the reference and delete-guard rules. | requirements REQ-F-003, database-design (WeeklyPlan, PlannedMeal) | Plan saves; non-owned recipe rejected; delete blocked while referenced. | TASK-002 | List generation. |
| TASK-005 | Implement the ShoppingList service and generate-list endpoint. | requirements REQ-F-004, database-design, security-spec §7 | One list of all planned meals; empty week → empty list; other account denied. | TASK-004 | Ticking items; pricing; quantities. |
| TASK-006 | Add check / uncheck for shopping-list items. | requirements REQ-F-006, database-design | Items check and uncheck and persist; own list only. | TASK-005 | Anything beyond checking off. |

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
| Build recipes. | Create the Recipe and IngredientLine entities scoped by `account_id`, validate the title, and add create/read endpoints (TASK-002). |
| Add errors. | Return a retry-safe error on a save failure without reporting success, preserving the cook's input (REQ-NF-003). |
| Make the list. | Implement a ShoppingList service that gathers every planned meal's ingredient lines from one week into one list (TASK-005). |
| Build planning. | Add WeeklyPlan and PlannedMeal, enforce the owned-recipe reference rule (BR-003), and block deletion of a referenced recipe (BR-004). |

---

> Blueprint: blueprints/02-tasks/01-planning/agent-task-list.md
