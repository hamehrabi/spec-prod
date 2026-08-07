# requirements.md — Requirements Document

> **Purpose (Ch. 4 §4.4):** Lists functional and non-functional requirements.
> **When you use it:** Before product and technical specs.
> **Source:** Ch. 5.

A useful requirement is **clear, testable, bounded, and traceable**.

**Project name:** Pantry

**Problem statement:** *(from [`intent.md`](../01-intent/intent.md))* Home cooks keep recipes
scattered and forget items when shopping for a week of meals; the system should keep recipes
in one place and turn a week of chosen meals into one shopping list.

**Primary users:**
- Home cook (account owner) — the only role; single user, no sharing.

---

## 1. Functional requirements

Format: `REQ-F-###: [Actor] must be able to [action] [object] so that [outcome].`

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-001 | A home cook must be able to create an account and sign in so that their recipes and plans are private to them. | Must |
| REQ-F-002 | A home cook must be able to save a recipe with a title and one or more ingredient lines so that their recipes live in one place. | Must |
| REQ-F-003 | A home cook must be able to search their saved recipes so that they can find a recipe again. | Must |
| REQ-F-004 | A home cook must be able to create a weekly plan and add planned meals (chosen recipes) to it so that they can decide what to cook that week. | Must |
| REQ-F-005 | A home cook must be able to generate one shopping list from a weekly plan, covering every ingredient of every planned meal, so that they can shop for the week in one trip. [TODO: should identical ingredients across meals be merged into one line, and how are units combined? — Q-009] | Must |

*Example:* `REQ-F-001: A team member must be able to create a task with a title,
description, due date, and status so that work can be tracked clearly.`

| Element | Question to ask | Example |
|---|---|---|
| Actor | Who performs the action? | Project manager |
| Action | What must they do? | Assign a task |
| Object | What is being acted on? | A task record |
| Result | What should happen after the action? | The assigned user can see the task |

---

## 2. Non-functional requirements

Format: `REQ-NF-###: [Quality condition with a measurable limit].`

| ID | Category | Requirement |
|---|---|---|
| REQ-NF-001 | Performance | Generating a shopping list from a weekly plan must feel immediate for a single cook's data. [TODO: precise target depends on expected scale — Q-001] |
| REQ-NF-002 | Security | Only the signed-in account owner may read or write their recipes, plans, and lists. |
| REQ-NF-003 | Reliability | If generating a shopping list fails, the system must show a clear error and preserve the weekly plan. |
| REQ-NF-004 | Usability | A cook must be able to go from a week's chosen meals to a shopping list without reading a manual. |
| REQ-NF-005 | Maintainability | Recipe and planning logic must be separable from account and authentication logic. |
| REQ-NF-006 | Accessibility | The interface must be operable by keyboard and usable with a screen reader. |
| REQ-NF-007 | Privacy | A cook's recipes, plans, and lists are private to their account and are never shared. |

**Examples (Ch. 5 §5.3)**

| Category | Requirement example |
|---|---|
| Performance | The dashboard must load within three seconds for a workspace with up to 1,000 tasks. |
| Security | Only authenticated users may access workspace data. |
| Reliability | If task creation fails, the system must show an error and preserve the user's input. |
| Usability | A new user must be able to create their first task without reading a separate manual. |
| Maintainability | Task-related logic must be separated from user-authentication logic. |

> **Do not write impossible quality claims.** Avoid "the app must never fail" or "the
> system must always be fast." Replace them with measurable expectations, known limits,
> and graceful failure behavior.

---

## 3. User roles and permissions

Format: `REQ-R-###`. Define these **before** design begins, or the agent may build
features that expose data to the wrong users.

| Role | Can do | Cannot do |
|---|---|---|
| Home cook (account owner) | Create, save, and search recipes; plan weeks; generate and view shopping lists; manage their own account. | Access any other account's data; there is no sharing, admin, or viewer role. |

| ID | Role requirement |
|---|---|
| REQ-R-001 | A home cook may only read and write data belonging to their own account. |

**Examples (Ch. 5 §5.4)**

| Role | Can do | Cannot do |
|---|---|---|
| Owner | Create workspace, invite users, manage billing, delete workspace. | Bypass audit rules or view another workspace. |
| Project manager | Create projects, assign tasks, update project settings. | Manage billing or delete the workspace. |
| Team member | Create tasks, update assigned tasks, comment on work. | Invite users or change workspace settings. |
| Viewer | Read permitted projects and tasks. | Create, edit, delete, or assign tasks. |

**A role you list here is a role the agent will build.** Four roles is four permission paths,
four sets of deny tests, and an invitation flow. A single-user tool has one role; say so.

Full permission matrix and enforcement rules → [`technical-spec.md` §7 Security](../04-technical-spec/technical-spec.md#7-security-requirements)

---

## 4. Business rules

Policy decisions the software must enforce. Write them **separately from code
instructions** — when the rule changes you update the spec first, then the tests and code.

| ID | Rule | Why it matters |
|---|---|---|
| BR-001 | A shopping list is generated from exactly one weekly plan and includes every ingredient of every planned meal in that plan. | This is the product's core promise — nothing forgotten. |
| BR-002 | A recipe must have a title and at least one ingredient line. | A recipe with no ingredients cannot contribute to a shopping list. |
| BR-003 | Every recipe, plan, and list belongs to exactly one account and is private to it. | Single-user isolation; a cook must never see another account's data. |

**Examples (Ch. 5 §5.5)**

| Business rule | Why it matters |
|---|---|
| A completed task cannot be edited unless it is reopened. | Protects completed work from accidental changes. |
| Only an Owner can delete a workspace. | Prevents destructive actions by lower-permission users. |
| A task due date cannot be earlier than today when the task is created. | Prevents invalid planning data. |
| A user can belong to multiple workspaces, but workspace data must remain separate. | Protects data boundaries. |

---

## 5. System constraints

Maintained in [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md),
which `intent.md` delegates them to. Referenced here as `CON-###`.

| ID | Constraint | Affects requirements |
|---|---|---|
| CON-001…008 | [TODO: hard constraints not asked at express depth — Q-004] | REQ-F-001 … REQ-F-005 |

---

## 6. Acceptance criteria

Format: Given–When–Then. These become the acceptance tests in
[`../tests/acceptance-tests.md`](../../03-tests/02-functional/acceptance-tests.md).

| ID | Requirement | Criterion |
|---|---|---|
| AC-001 | REQ-F-005 | **Given** a weekly plan with planned meals, **When** the cook generates a shopping list, **Then** the list contains an item for every ingredient of every planned meal. |
| AC-002 | REQ-F-005 | **Given** generation fails, **When** the cook retries, **Then** a clear error is shown and the weekly plan is preserved. |
| AC-003 | REQ-F-002 | **Given** a signed-in cook, **When** they save a recipe with a title and ingredient lines, **Then** it appears in their recipe list and is findable by search. |
| AC-004 | REQ-NF-002 | **Given** a cook signed into account A, **When** they request account B's data, **Then** access is denied. |

---

## 7. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

---

## Requirement quality checklist (Ch. 5)

| Check | Question | ✔ |
|---|---|---|
| Clear | Can you understand the requirement without guessing? | [ ] |
| Actor defined | Does it say who performs the action? | [ ] |
| Action defined | Does it say exactly what must happen? | [ ] |
| Bounded | Does it avoid hidden extra features? | [ ] |
| Testable | Can you prove whether it works? | [ ] |
| Traceable | Can it become a task, test, and code change later? | [ ] |
| No implementation leak | Does it avoid technical decisions that belong in the technical spec? | [ ] |

> **The safest habit:** before you send requirements to an AI agent, read each one and ask
> "could two people interpret this differently?" If yes, rewrite it.

---

## Common requirement mistakes (Ch. 5 §5.8)

| Mistake | Weak example | Better approach |
|---|---|---|
| Vague wording | "The dashboard should be nice." | State what the dashboard must show and how users will use it. |
| No actor | "Tasks can be deleted." | Say which role can delete tasks and under what condition. |
| No boundary | "Users can manage projects." | List the allowed project actions for each role. |
| No acceptance criteria | "Users can reset passwords." | Add the expected email flow, token expiry, and failure behavior. |
| Implementation hidden in requirement | "Use a modal with React state." | Describe behavior first; save implementation details for the technical spec. |

---

## Writing workflow (Ch. 5)

1. Start with the problem statement from the Engineering Intent Document.
2. List the primary user roles before listing features.
3. Write functional requirements using actor, action, object, and outcome.
4. Add non-functional requirements that define quality expectations.
5. Write business rules separately from implementation choices.
6. List constraints so the AI assistant does not invent unrealistic solutions.
7. Add acceptance criteria for every important requirement.
8. Review the document for ambiguity before moving to the PRD.

---

**Next:** [`product-spec.md`](../03-product-spec/product-spec.md)

> Blueprint: blueprints/01-docs/02-requirements/requirements.md
