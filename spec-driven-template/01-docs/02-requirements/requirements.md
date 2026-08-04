# requirements.md — Requirements Document

> **Purpose (Ch. 4 §4.4):** Lists functional and non-functional requirements.
> **When you use it:** Before product and technical specs.
> **Source:** Ch. 5.

A useful requirement is **clear, testable, bounded, and traceable**.

**Project name:**

**Problem statement:** *(from [`intent.md`](../01-intent/intent.md))*

**Primary users:**
- [Role 1]
- [Role 2]

---

## 1. Functional requirements

Format: `REQ-F-###: [Actor] must be able to [action] [object] so that [outcome].`

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-001 | | Must / Should / Could / Won't |
| REQ-F-002 | | |

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
| REQ-NF-001 | Performance | |
| REQ-NF-002 | Security | |
| REQ-NF-003 | Reliability | |
| REQ-NF-004 | Usability | |
| REQ-NF-005 | Maintainability | |
| REQ-NF-006 | Accessibility | |
| REQ-NF-007 | Privacy | |

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
| Owner | Create workspace, invite users, manage billing, delete workspace. | Bypass audit rules or view another workspace. |
| Project manager | Create projects, assign tasks, update project settings. | Manage billing or delete the workspace. |
| Team member | Create tasks, update assigned tasks, comment on work. | Invite users or change workspace settings. |
| Viewer | Read permitted projects and tasks. | Create, edit, delete, or assign tasks. |

*Replace with your project's real roles.*

| ID | Role requirement |
|---|---|
| REQ-R-001 | The system must support the roles listed above. |
| REQ-R-002 | *e.g. A Viewer must be able to read assigned project information but must not create, edit, assign, or delete tasks.* |

Full permission matrix and enforcement rules → [`technical-spec.md` §7 Security](../04-technical-spec/technical-spec.md#7-security-requirements)

---

## 4. Business rules

Policy decisions the software must enforce. Write them **separately from code
instructions** — when the rule changes you update the spec first, then the tests and code.

| ID | Rule | Why it matters |
|---|---|---|
| BR-001 | | |
| BR-002 | | |

**Examples (Ch. 5 §5.5)**

| Business rule | Why it matters |
|---|---|
| A completed task cannot be edited unless it is reopened. | Protects completed work from accidental changes. |
| Only an Owner can delete a workspace. | Prevents destructive actions by lower-permission users. |
| A task due date cannot be earlier than today when the task is created. | Prevents invalid planning data. |
| A user can belong to multiple workspaces, but workspace data must remain separate. | Protects data boundaries. |

---

## 5. System constraints

Maintained in [`intent.md` §3](../01-intent/intent.md#3-constraints). Referenced here as `CON-###`.

| ID | Constraint | Affects requirements |
|---|---|---|
| CON-001 | | REQ-### |

---

## 6. Acceptance criteria

Format: Given–When–Then. These become the acceptance tests in
[`../tests/acceptance-tests.md`](../../03-tests/02-functional/acceptance-tests.md).

| ID | Requirement | Criterion |
|---|---|---|
| AC-001 | REQ-F-001 | **Given** [starting condition], **When** [action], **Then** [expected result]. |
| AC-002 | REQ-F-001 | **Given** [edge case or failure], **When** [action], **Then** [safe behavior or error response]. |

**Examples (Ch. 5 §5.7)**

| Requirement | Acceptance criteria |
|---|---|
| A team member must be able to create a task. | Given a signed-in team member, when they submit a valid task form, then the task is saved and shown in the task list. |
| A viewer must not edit tasks. | Given a signed-in viewer, when they open a task, then edit controls are hidden or disabled. |
| Task creation must handle errors. | Given a network failure, when the user submits the form, then the system shows an error and keeps the typed values. |

---

## 7. Open questions

→ [`intent.md` §5](../01-intent/intent.md#5-open-questions)

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

## Prompts

**Draft requirements from intent (Prompt box 3.1)**
```
Use this Engineering Intent Document to draft clear software requirements.

Intent: [paste intent document]

Return functional requirements, non-functional requirements, business rules, permissions,
constraints, and acceptance criteria. Do not choose implementation tools yet.
```

**Extract business rules (Ch. 5)**
```
You are helping me prepare software requirements.

Project idea: [paste the project idea]

List the business rules that the system should enforce. Do not write code.
For each rule, explain what user behavior it controls and what could go wrong if the
rule is missing.
```

**Requirements review (Ch. 5)**
```
Act as a strict software requirements reviewer.

Review the requirements below for ambiguity, missing actors, missing acceptance criteria,
hidden implementation details, and untestable language.

Return your response in three sections:
1. Problems found
2. Revised requirements
3. Questions that must be answered before design begins

Requirements: [paste your requirements here]
```

---

**Next:** [`product-spec.md`](../03-product-spec/product-spec.md)

---

# WORKED EXAMPLE — task management app (Ch. 5)

| Requirement type | Example requirement |
|---|---|
| Functional | REQ-F-001: A team member must be able to create a task with a title, description, due date, and status. |
| Functional | REQ-F-002: A project manager must be able to assign a task to one team member. |
| Non-functional | REQ-NF-001: The task list must load within two seconds for up to 500 tasks. |
| Role rule | REQ-R-001: A viewer must not create, edit, assign, or delete tasks. |
| Business rule | BR-001: A completed task cannot be edited unless it is reopened. |
| Constraint | CON-001: The first version must support web use only. |
| Acceptance criteria | AC-001: Given a signed-in team member, when they submit a valid task form, then the task is saved and displayed in the task list. |
