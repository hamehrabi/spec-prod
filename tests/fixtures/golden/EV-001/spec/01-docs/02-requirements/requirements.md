# requirements.md — Requirements Document

> **Purpose (Ch. 4 §4.4):** Lists functional and non-functional requirements.
> **When you use it:** Before product and technical specs.
> **Source:** Ch. 5.

A useful requirement is **clear, testable, bounded, and traceable**.

**Project name:** Pantry

**Problem statement:** People who cook at home keep recipes scattered across screenshots,
bookmarks and handwritten cards. When they plan a week of meals they have to open six
places and still forget something at the shop, which costs them a second trip and food
that goes off. (From [`intent.md`](../01-intent/intent.md).)

**Primary users:**
- Account holder — a home cook using Pantry for their own recipes, plans, and lists.

---

## 1. Functional requirements

Format: `REQ-F-###: [Actor] must be able to [action] [object] so that [outcome].`

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-001 | An account holder must be able to save a recipe with its ingredient lines so that their recipes live in one place instead of screenshots, bookmarks and cards. | Must |
| REQ-F-002 | An account holder must be able to plan which meals to cook in a week by adding saved recipes to a weekly plan. | Must |
| REQ-F-003 | An account holder must be able to generate one shopping list from a weekly plan so that one trip covers the week's shop. | Must |
| REQ-F-004 | An account holder must be able to search their saved recipes so that a recipe can be found when planning. | Must |

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
| REQ-NF-001 | Performance | The core task is the speed priority: generating the week's shopping list must complete within 2 seconds for a plan of up to 21 meals, and search must return within 1 second for a library of up to 500 recipes. |
| REQ-NF-002 | Security | Only the authenticated account holder may access their account's recipes, plans, and lists. |
| REQ-NF-003 | Reliability | When a save or a generation fails, the system says so plainly, keeps what the user typed, and never reports success for work that did not happen. |
| REQ-NF-004 | Usability | A home cook can complete the core flow — save a recipe, plan the week, generate the list — without training or a manual. |
| REQ-NF-005 | Maintainability | Modules have clear boundaries with no import cycles; a feature slice can be added end to end without touching unrelated modules (FF-001). |
| REQ-NF-006 | Accessibility | The whole core flow is completable with a keyboard alone; every field has a visible label; errors are announced to screen readers; core screens show zero critical violations in an automated accessibility scan (FF-003). |
| REQ-NF-007 | Privacy | [TODO: what must never leak or be logged? — Q-012] |

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
| Account holder | Save and search their own recipes, plan their weeks, generate and view their shopping lists. | See, change, or share any other account's data. There is no sharing in version one. |

| ID | Role requirement |
|---|---|
| REQ-R-001 | An account holder must be able to access only their own recipes, plans, and lists, and must not be able to reach any other account's data. |

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

Pantry is a single-user tool: **one role**, the account holder. No sharing, no invitations,
no admin.

Full permission matrix and enforcement rules → [`technical-spec.md` §7 Security](../04-technical-spec/technical-spec.md#7-security-requirements)

---

## 4. Business rules

Policy decisions the software must enforce. Write them **separately from code
instructions** — when the rule changes you update the spec first, then the tests and code.

| ID | Rule | Why it matters |
|---|---|---|
| BR-001 | A shopping list is generated from exactly one weekly plan and covers every ingredient line of that week's planned meals. | This is the core promise — "one shopping list from that week". A list that misses a line recreates the forgotten-item problem. |
| BR-002 | A planned meal must reference a recipe saved in the same account. | Keeps the plan buildable from the user's own library and blocks cross-account references. |
| BR-003 | Every recipe, plan, and list belongs to one account and is never shared. | The permission model is "single user only, no sharing". |

---

## 5. System constraints

Maintained in [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md),
which `intent.md` delegates them to. Referenced here as `CON-###`.

| ID | Constraint | Affects requirements |
|---|---|---|
| CON-001–CON-008 | [TODO: what hard constraints already exist? — Q-005] | Unknown until Q-005 is answered. |

---

## 6. Acceptance criteria

Format: Given–When–Then. These become the acceptance tests in
[`../tests/acceptance-tests.md`](../../03-tests/02-functional/acceptance-tests.md).

| ID | Requirement | Criterion |
|---|---|---|
| AC-001 | REQ-F-001 | **Given** a signed-in account holder, **When** they save a recipe with a title and at least one ingredient line, **Then** the recipe appears in their saved recipes. |
| AC-002 | REQ-F-002 | **Given** a signed-in account holder with saved recipes, **When** they add a recipe to a weekly plan, **Then** the plan shows that meal for the week. |
| AC-003 | REQ-F-003 | **Given** a weekly plan with planned meals, **When** the account holder generates its shopping list, **Then** exactly one list is produced containing an item for every ingredient line of every planned meal in that week. |
| AC-004 | REQ-F-004 | **Given** a signed-in account holder with saved recipes, **When** they search using a word from a recipe's title, **Then** the matching recipes are listed. |
| AC-005 | REQ-F-003 | **Given** two planned recipes that share an ingredient, **When** the shopping list is generated, **Then** [TODO: when two planned recipes share an ingredient, does the shopping list combine them into one line, or list them separately? — Q-011]. |

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

> Blueprint: blueprints/01-docs/02-requirements/requirements.md
