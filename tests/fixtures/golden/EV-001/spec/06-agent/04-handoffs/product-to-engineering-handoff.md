# Product-to-Engineering Handoff

> Source: Ch. 29 §29.2.
> Where product intent becomes **buildable engineering work**. The goal is not to hand
> developers a vague idea and ask them to figure it out.

---

## Template (Ch. 29 §29.2)

```
Feature name:
Problem statement:
Target users:
User goals:

Must-have requirements:
  - 
  - 

Acceptance criteria:
  - 
  - 

Non-goals for this release:
  - 

Known constraints:
  - 

Risks and sensitive areas:
  - [security, privacy, reliability, usability, compliance]

Open questions:
  - 

Decision owner:
Date of handoff:
```

---

## Handoff items (Ch. 29 §29.2)

| Item | What it should contain | Question it answers | Common weakness |
|---|---|---|---|
| Problem statement | User pain, business reason, current limitation. | Why should this be built? | The problem is described as a feature request only. |
| User requirement | User goal, action, outcome, acceptance criteria. | What must the user be able to do? | The requirement has no pass/fail condition. |
| Priority and non-goals | Must-have, should-have, later, explicitly out of scope. | What should the team **not** build now? | The team overbuilds because boundaries are missing. |
| Risk notes | Security, privacy, reliability, usability, compliance concerns. | What could go wrong? | Risks are discovered after implementation. |
| Open questions | Unknowns that need a decision before or during design. | What needs clarification? | The AI agent fills gaps with guesses. |

---

## What each role needs (Ch. 29 §29.1)

| Role | What the role needs | What goes wrong without specs | Spec artifact that helps |
|---|---|---|---|
| Product manager | Clear scope, user needs, priorities, acceptance criteria. | Features built that do not match the product goal. | PRD and change log. |
| Developer | Architecture, constraints, data model, APIs, tests. | Code works locally but breaks design, security, or maintainability. | Technical specification and task list. |
| AI agent | Bounded context, explicit instructions, examples, forbidden changes. | The agent guesses, overbuilds, or changes unrelated code. | Agent context pack and task brief. |
| Reviewer | Requirements, expected behavior, tests, risks, evidence. | Review becomes opinion-based instead of evidence-based. | Review checklist and traceability matrix. |
| Stakeholder | Visible progress, trade-offs, decisions, impact. | Feedback arrives late and causes major rework. | Decision log, demo notes, feedback register. |

> **Practical rule:** a shared specification should answer three questions for everyone:
> *What are we building? How will we know it works? What has changed since the last
> decision?*

---

## Downstream chain

```
Product handoff
    → 01-docs/requirements.md          (engineering converts intent to testable behavior)
    → 01-docs/technical-spec.md
    → 02-tasks/                          (bounded work)
    → 06-agent/developer-to-agent-handoff.md
    → 05-review/                        (team review of output)
    → 01-docs/spec-change-log.md        (updated source of truth)
```

---

## Handoff acceptance check

Engineering should refuse a handoff that cannot answer these:

- [ ] Is the problem stated, not just the feature?
- [ ] Are the users named?
- [ ] Does every must-have requirement have a pass/fail acceptance criterion?
- [ ] Are the non-goals written down?
- [ ] Are risks and sensitive areas identified?
- [ ] Are open questions listed with a decision owner?

---

# Worked example — Pantry, generate one shopping list

```
Feature name:      Generate ONE shopping list from a weekly plan
Problem statement: A home cook chooses a week of meals but then has to read every recipe
                   and hand-write a combined shopping list, merging duplicate ingredients
                   by hand. It is slow and error-prone, and it is the reason Pantry exists.
Target users:      The single account owner planning a week of home cooking.
User goals:        Turn the chosen week of meals into one consolidated shopping list without
                   re-reading each recipe.

Must-have requirements:
  - A signed-in cook can generate one shopping list from their weekly plan (REQ-F-004).
  - Ingredient lines from all planned meals are consolidated into shopping-list items.
  - Only the owner's plan and recipes are read (BR-002, SEC-Z-001).

Acceptance criteria:
  - Given a weekly plan of planned meals, when the cook generates the list, then all
    ingredient lines are consolidated into one ShoppingList of items.
  - Given a list already exists for that week, when the cook generates again, then the
    previous list is replaced, not duplicated (BR-001).
  - Given another account's plan, when its data is requested, then the response is a safe
    not-found (BR-002, SEC-Z-001).

Non-goals for this release:
  - Sharing a list with anyone else
  - Nutrition information
  - Pricing or cost estimates
  - Importing recipes from external sites

Known constraints:
  - ADR-001: list-generation is a core module, separate from recipe storage and Account/Auth
  - ADR-002: relational store, portable SQL only (SQLite now, Postgres-ready)

Risks and sensitive areas:
  - Data exposure: the list must never include another account's recipes (SEC-Z-001).
  - Reliability: regenerating a list must not leave two lists for one week (BR-001).
  - Usability: how a generation failure is shown to the cook.

Open questions:
  - Q-013: what should the cook see when list generation fails partway?
    decision owner: Product owner

Decision owner: Product owner
Date of handoff: 2026-08-08
```

## What engineering did with it

| Handoff item | Became |
|---|---|
| Must-have requirements | REQ-F-004 in `../../01-docs/02-requirements/requirements.md` |
| Acceptance criteria | ATEST/STEST families for consolidation, BR-001 replacement, and account scoping |
| "list-generation is a core module" | ADR-001 (module boundary), FF-001 |
| Data-exposure risk | Account-scoped read enforced (BR-002, SEC-Z-001) |
| Reliability risk | BR-001 replacement test |
| Q-013 | [TODO: what should the cook see when list generation fails partway? (Q-013)] — blocks the failure-UX portion of TASK-005 until answered |

---

> Blueprint: blueprints/06-agent/04-handoffs/product-to-engineering-handoff.md
