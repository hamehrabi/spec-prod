# Agent Task List

> Source: Front Matter workspace, Ch. 14, Ch. 25 §25.8, Ch. 30 §30.2.
> An agent-friendly task list is **not** a normal to-do list. Each entry gives the agent
> instructions in a format that reduces guessing.
>
> **The best task list is boring, specific, and controlled.**

The work is sequenced as **thin vertical slices — one feature end to end at a time**
(Round 7): recipes, then plans, then the shopping list (the core), then search. Each slice
is reviewable by using it. The code is written by **an AI coding agent, one task at a time**
(Round 7), which is why every task carries an out-of-scope boundary.

---

## Task table

| Task ID | Agent task | Input artifacts | Acceptance check | Depends on | Out of scope |
|---|---|---|---|---|---|
| TASK-001 | Create project structure and configuration loading. | Technical spec, ADR-001, ADR-002. | Project runs locally with an empty health check. | — | Any business feature. |
| TASK-002 | Implement account record and sign-in. **Blocked on Q-009** — the authentication model is not chosen. | database-design (accounts), security-specification §1, Q-009 answer. | SEC-A-001: a signed-out request to any data route returns 401. | TASK-001 | Password reset, multi-factor, any second role. |
| TASK-003 | Create the Recipe and IngredientLine tables with their constraints. | database-design.md, REQ-F-001. | Both tables exist; a recipe row cannot exist without an account; lines carry a stable `position`. | TASK-001 | Plans, lists, photos, search. |
| TASK-004 | Implement the save-recipe endpoint with validation. | api-specification.md, REQ-F-001, security-specification §3. | AC-001 behaviour over the API; recipe + lines written in one transaction; invalid input saves nothing. | TASK-002, TASK-003 | Editing other entities; search; any UI. |
| TASK-005 | Build the save/edit recipe screen. | frontend-component-spec.md, REQ-NF-004, REQ-NF-006. | A recipe can be saved from the browser; keyboard-only completion works; failure keeps typed values. | TASK-004 | Planning screens; list screens. |
| TASK-006 | Write the recipe-slice tests. | acceptance-, integration-, failure-, unit-test plans. | ATEST-001, ITEST-001, ITEST-005, UTEST-001, UTEST-002, FTEST-001, FTEST-002, FTEST-008 pass. | TASK-004, TASK-005 | Tests for other slices. |
| TASK-007 | Create the WeeklyPlan and PlannedMeal tables. | database-design.md, REQ-F-002. | Tables exist; a planned meal references a recipe in the same account (BR-002 constraint). | TASK-003 | Shopping-list tables. |
| TASK-008 | Implement plan endpoints — create a week's plan, add and remove planned meals. | api-specification.md, REQ-F-002, BR-002. | AC-002 behaviour over the API; a cross-account recipe reference is rejected. | TASK-002, TASK-007 | List generation; recipes UI. |
| TASK-009 | Build the week view screen. | frontend-component-spec.md, REQ-NF-004, REQ-NF-006. | A saved recipe can be planned into a week from the browser. | TASK-008 | Shopping-list screen. |
| TASK-010 | Write the plan-slice tests. | acceptance-, integration-, security-test plans. | ATEST-002, ITEST-003, STEST-006 pass. | TASK-008, TASK-009 | Tests for other slices. |
| TASK-011 | Create the ShoppingList and ShoppingListItem tables. | database-design.md, REQ-F-003. | Tables exist; items carry a stable `position`; a list belongs to exactly one plan. | TASK-007 | Generation logic. |
| TASK-012 | Implement the shopping-list generation domain service — **the core**. **Blocked on Q-011** — whether shared ingredients combine into one line is undecided. | REQ-F-003, BR-001, REQ-NF-001, Q-011 answer. | AC-003: one list, an item for every ingredient line of the week, in one transaction, within 2 s for 21 meals. | TASK-011 | Endpoint and screen (TASK-013); any change to recipes or plans. |
| TASK-013 | Implement the generate-list endpoint and the shopping-list screen. | api-specification.md, frontend-component-spec.md. | The list is generated and shown from the browser; failure leaves the plan unchanged. | TASK-012 | Editing list items beyond the generated content. |
| TASK-014 | Write the list-slice tests — the full pyramid, because this is the core. | all test plans. | ATEST-003, ATEST-005, ITEST-004, UTEST-003, UTEST-005, FTEST-005, FTEST-006, PTEST-001, ETEST-003 pass. | TASK-013 | Tests for other slices. |
| TASK-015 | Implement recipe search — endpoint and screen. | REQ-F-004, api-specification.md. | AC-004 behaviour; results scoped to the calling account; 1 s for 500 recipes. | TASK-004 | Ranking, filters, or fuzzy matching not in the spec. |
| TASK-016 | Write the search-slice tests. | acceptance-, integration-, performance-test plans. | ATEST-004, ITEST-006, PTEST-002 pass. | TASK-015 | Tests for other slices. |
| TASK-017 | Implement dish-photo upload, storage, and viewing. **Blocked on Q-023** — the storage rules are not decided. | database-design file-storage table, SEC-Z-002, Q-023 answer. | A photo is stored privately and viewable only by its owner; FTEST-007 and STEST-003 pass. | TASK-004 | Sharing, thumbnails, or processing of any kind. |

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
| Build recipes. | TASK-004: implement the save-recipe endpoint that validates title and ingredient lines, writes recipe + lines in one transaction, and returns the saved recipe. |
| Add errors. | Return the safe validation error naming the field, with nothing written (FTEST-001). |
| Make the list work. | TASK-012: implement generation exactly as BR-001 states, one transaction, within the REQ-NF-001 target — and stop if Q-011 is still open. |
| Build photos. | TASK-017: implement upload against the Q-023 rules once they exist; owner-only reads per SEC-Z-002. |

> Blueprint: blueprints/02-tasks/01-planning/agent-task-list.md
