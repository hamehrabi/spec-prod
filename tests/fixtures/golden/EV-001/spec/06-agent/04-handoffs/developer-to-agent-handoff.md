# Developer-to-Agent Handoff

> Source: Ch. 29 §29.3 + Ch. 11 §11.4.
> This is **not** a normal task assignment. An AI agent has no hidden project memory unless
> you provide it.

> **Agent control rule:** the agent should never receive a task that the team cannot
> review. If the output cannot be checked against requirements, tests, or architecture, the
> task is too vague.

---

## Template (Ch. 29 §29.3)

```
Task ID:
Linked requirement(s):
Goal:

Relevant context to use:
  - [requirement / spec section / API contract / ADR]

Files or modules in scope:
Files or modules out of scope:

Constraints:
  - 
  - 

Expected output:
  - [code / tests / documentation / review notes / questions]

Tests to create or update:
  - TEST-###

Questions to ask before changing code:
  - 

Review checklist:
  [ ] 
  [ ] 

Do not proceed if:
  - 
```

---

## The instruction pattern (Ch. 11 §11.4)

```
Task:             [State the exact task]
Source of truth:  [Requirement ID, spec section, or task file]
Allowed files:    [List files or folders the agent may inspect or edit]
Do not change:    [List files, behavior, or design choices that are off-limits]
Expected output:  [Code, tests, documentation, or review notes]
Completion check: [How the work will be verified]
```

---

## Handoff elements (Ch. 29 §29.3)

| Element | What to include | Why it matters | Bad example to avoid |
|---|---|---|---|
| Task boundary | One feature, one bug, one test set, or one document section. | Prevents the agent from changing unrelated work. | "Improve the whole app." |
| Relevant context | Requirements, design notes, API rules, examples, tests. | Gives the agent the source of truth. | "You know what I mean." |
| Forbidden changes | Files, behavior, data, roles, or APIs that must not change. | Protects stable parts of the system. | No boundaries mentioned. |
| Expected output | Code, tests, explanation, checklist, or questions. | Makes completion reviewable. | "Do it well." |
| Review rules | What humans will check before accepting output. | Keeps accountability with the team. | No review criteria. |

---

## Pre-flight checklist (Ch. 11)

Before you let an agent work, confirm that:

- [ ] The task is linked to a requirement, specification, or traceability row.
- [ ] The task is small enough to review in one sitting.
- [ ] The agent knows which files it may change.
- [ ] The agent knows what **not** to change.
- [ ] The agent must explain its plan before implementation.
- [ ] The expected tests or manual checks are clear.
- [ ] The agent must summarize changes, risks, and open questions.

---

## Chat assistant vs. coding agent (Ch. 11 §11.2)

Use both — but do not confuse their roles. First use chat to think through the problem;
then use the agent to perform a narrow, approved implementation task.

| Situation | Use a chat assistant when… | Use a coding agent when… |
|---|---|---|
| Planning | You need to understand options, risks, or structure. | You already have a task and need changes applied. |
| Specification work | You are drafting requirements, PRDs, or technical specs. | You want the agent to update local spec files from approved text. |
| Implementation | You want pseudocode or an explanation before building. | You want code changes made in approved files. |
| Review | You want an independent critique of a design or snippet. | You want the agent to run checks and report mismatches. |

---

## What agents are good and weak at (Ch. 11 §11.1)

| Agents are good at… | Agents are weak at… |
|---|---|
| Generating boilerplate from clear instructions. | Reading your mind when requirements are vague. |
| Following small, well-scoped implementation tasks. | Knowing which trade-off your business prefers. |
| Creating tests from acceptance criteria. | Detecting every security or performance risk without guidance. |
| Explaining code and proposing refactors. | Understanding undocumented legacy behavior. |
| Speeding up repetitive edits. | Protecting your architecture if you give it no boundaries. |

> Blueprint: blueprints/06-agent/04-handoffs/developer-to-agent-handoff.md
