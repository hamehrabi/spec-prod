# requirements.md — Requirements Document

> **Purpose (Ch. 4 §4.4):** Lists functional and non-functional requirements.
> **When you use it:** Before product and technical specs.
> **Source:** Ch. 5.

A useful requirement is **clear, testable, bounded, and traceable**.

**Project name:** Pantry

**Problem statement:** *(from [`intent.md`](../01-intent/intent.md))* Home cooks keep recipes scattered across screenshots, bookmarks, and handwritten cards and forget items when shopping for a planned week, which costs second trips and spoiled food. Pantry lets a cook keep recipes in one place, plan a week, and shop from a single list.

**Primary users:**
- Home cook — an individual consumer who saves recipes, plans a week, and shops (the only role; no sharing in version one)

---

## 1. Functional requirements

Format: `REQ-F-###: [Actor] must be able to [action] [object] so that [outcome].`

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-001 | A home cook must be able to save a recipe with a title and a list of ingredient lines so that their recipes live in one place. | Must |
| REQ-F-002 | A home cook must be able to search their saved recipes so that they can find one quickly. | Must |
| REQ-F-003 | A home cook must be able to plan which saved recipes to cook on the days of a week so that the week is decided in one place. | Must |
| REQ-F-004 | A home cook must be able to generate one shopping list from a week's plan, gathering the ingredients of every planned meal, so that they can shop once without forgetting items. | Must |
| REQ-F-005 | A home cook must be able to sign in to their own private account so that their recipes, plans, and lists are theirs alone. | Must |
| REQ-F-006 | A home cook must be able to tick off items on the shopping list as they shop so that they can see what is still needed. | Should |

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
| REQ-NF-001 | Performance | Generating a shopping list from a week's plan must return promptly for one cook's library; the measurable threshold is set as a fitness function ([`fitness-functions.md`](../04-technical-spec/fitness-functions.md), Round 4). |
| REQ-NF-002 | Security | Only the signed-in account may read or write its own recipes, plans, and lists; there is no sharing in version one. |
| REQ-NF-003 | Reliability | If saving a recipe, plan, or list fails, the system must show a clear error and preserve the cook's input. |
| REQ-NF-004 | Usability | A home cook must be able to plan a week and generate its shopping list without reading a separate manual. |
| REQ-NF-005 | Maintainability | The core list-generation logic must be kept separate from recipe storage and account/authentication concerns. |
| REQ-NF-006 | Accessibility | Core screens must be operable by keyboard and expose text labels for assistive technology. |
| REQ-NF-007 | Privacy | Recipe and plan data (and any recipe photos) are private to the one account and are never exposed to anyone else or written to logs. |

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
| Home cook (owner) | Create, read, update, and delete their own recipes, weekly plans, and shopping lists; generate a list from a week. | Reach anyone else's data — there is no other user, and nothing is shared. |

| ID | Role requirement |
|---|---|
| REQ-R-001 | A signed-in home cook may act only on their own recipes, plans, and lists; version one has one role and no sharing, so there are no cross-user permissions to grant. |

**Examples (Ch. 5 §5.4)**

| Role | Can do | Cannot do |
|---|---|---|
| Owner | Create workspace, invite users, manage billing, delete workspace. | Bypass audit rules or view another workspace. |
| Project manager | Create projects, assign tasks, update project settings. | Manage billing or delete the workspace. |
| Team member | Create tasks, update assigned tasks, comment on work. | Invite users or change workspace settings. |
| Viewer | Read permitted projects and tasks. | Create, edit, delete, or assign tasks. |

| Role requirement example |
|---|
| A Viewer must be able to read assigned project information but must not create, edit, assign, or delete tasks. |

**A role you list here is a role the agent will build.** Four roles is four permission paths,
four sets of deny tests, and an invitation flow. A single-user tool has one role; say so.

Full permission matrix and enforcement rules → [`technical-spec.md` §7 Security](../04-technical-spec/technical-spec.md#7-security-requirements)

---

## 4. Business rules

Policy decisions the software must enforce. Write them **separately from code
instructions** — when the rule changes you update the spec first, then the tests and code.

| ID | Rule | Why it matters |
|---|---|---|
| BR-001 | A shopping list is generated from exactly one weekly plan and includes the ingredients of every meal planned in that week. | This is the core promise — one week of meals becomes one list. |
| BR-002 | Every recipe, plan, list, and photo belongs to exactly one account and is never visible to another account. | Protects the single user's private data. |
| BR-003 | A planned meal must reference a saved recipe owned by the same account. | Keeps a week's plan consistent and prevents cross-account references. |
| BR-004 | A recipe cannot be deleted while a weekly plan still references it. | Stops a deletion from silently breaking a planned week. |

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
| CON-001–CON-008 | Deferred at express depth — hard constraints were not asked; see [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md) and `Q-005`. | — |

---

## 6. Acceptance criteria

Format: Given–When–Then. These become the acceptance tests in
[`../tests/acceptance-tests.md`](../../03-tests/02-functional/acceptance-tests.md).

| ID | Requirement | Criterion |
|---|---|---|
| AC-001 | REQ-F-001 | **Given** a signed-in cook, **When** they submit a recipe with a title and ingredient lines, **Then** it is saved and appears in their recipe list. |
| AC-002 | REQ-F-004 | **Given** a week with planned meals, **When** the cook generates the shopping list, **Then** the list contains the ingredients of every planned meal as one list. |
| AC-003 | REQ-F-004 | **Given** a week with no planned meals, **When** the cook generates the shopping list, **Then** an empty list is shown with a clear message rather than an error. |
| AC-004 | REQ-NF-002 | **Given** a signed-in cook, **When** they view any recipe, plan, or list, **Then** they only ever see data belonging to their own account. |

**Examples (Ch. 5 §5.7)**

| Requirement | Acceptance criteria |
|---|---|
| A team member must be able to create a task. | Given a signed-in team member, when they submit a valid task form, then the task is saved and shown in the task list. |
| A viewer must not edit tasks. | Given a signed-in viewer, when they open a task, then edit controls are hidden or disabled. |
| Task creation must handle errors. | Given a network failure, when the user submits the form, then the system shows an error and keeps the typed values. |

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

---

> Blueprint: blueprints/01-docs/02-requirements/requirements.md
