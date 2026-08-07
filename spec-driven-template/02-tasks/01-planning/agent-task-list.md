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
| A-001 | Create project structure and configuration loading. | Technical spec, deployment assumptions. | Project runs locally with an empty health check. | — | Any business feature. |
| A-002 | | REQ-###, DB spec, TEST-### | | A-001 | |
| A-003 | | | | | |

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
| Build task assignment. | TASK-04: Add task assignment using `assignee_id`, enforce project membership, update the create/update task API, and add tests for valid and invalid assignees. |

---

## Prompts

**Turn a spec into tasks (Prompt box 3.2 / Ch. 14 §14.6)**
```
Using the approved specification below, create a controlled engineering task list.

For each task, include: task ID, source requirement, goal, expected files, constraints,
dependencies, done criteria, and review notes.

Do not add features that are not in the specification. If something is unclear, mark it
as a question instead of inventing behavior.
```

**Generate only the next safe task (Ch. 14 §14.8)**
```
You are working from the approved [feature] specification.
Generate the implementation instructions for Task [ID] only.

Use these constraints:
- Do not create [adjacent features].
- Do not change [protected area] unless the task requires it.
- Follow the approved API contract.
- Include tests for [happy path], [invalid input], [missing field], [safe error message].

Return: files to edit, steps, done criteria, and review checklist.
```

---

# WORKED EXAMPLE — login feature task plan (Ch. 14 §14.8)

| Task ID | Title | Depends on | Done criteria | Out of scope |
|---|---|---|---|---|
| AUTH-01 | Define user credential fields | None | Email and password fields defined with constraints | No UI work |
| AUTH-02 | Write password validation rules | AUTH-01 | Weak passwords rejected by rule | No password reset |
| AUTH-03 | Create login API contract | AUTH-01 | Request and response shapes documented | No token refresh |
| AUTH-04 | Implement login endpoint | AUTH-02, AUTH-03 | Valid credentials return success; invalid return safe error | No registration |
| AUTH-05 | Create login form behavior | AUTH-03 | Form submits to approved endpoint | No visual redesign |
| AUTH-06 | Create login tests | AUTH-04, AUTH-05 | Happy path and failure cases covered | No unrelated auth tests |

> **Why this is safe:** each item has a source, a dependency, done criteria, and an
> out-of-scope boundary. The agent can work, but it cannot freely redesign the feature.
