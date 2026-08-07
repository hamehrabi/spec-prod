# Project Context Pack

> Source: Ch. 12 §12.8 + Appendix I.
> A **focused** package of project information for **one task**. Not the whole project.

> **Context pack rule:** give the agent enough context to succeed, but not so much that it
> loses the task. The best context pack is specific, traceable, and current.
>
> **Too little context** → the agent guesses. **Too much context** → the agent gets confused.

---

## Template (Ch. 12 §12.8)

```markdown
# Project Context Pack

## 1. Project Background
Project name:   Pantry
Purpose:        Keep a home cook's recipes in one place and turn a week of meals into one list.
Primary users:  One home cook (account owner)
Current stage:  [Planning / building / testing / improving]

## 2. Current Task
Task:            [One focused task, e.g. TASK-004 save-recipe API]
Expected output: [What should be created or changed]
Do not change:   [Files, schema, features, or decisions to protect]

## 3. Relevant Requirements
Requirement ID:        [REQ-###]
Requirement statement: [What the system must do]
Acceptance criteria:
- [Criterion 1]
- [Criterion 2]

## 4. Technical Decisions
Architecture rule: Modular monolith; business logic in domain modules (ADR-001).
Data rule:         Every row is scoped by account_id; portable relational SQL only (ADR-002).
API rule:          [Relevant endpoint or contract rule]
Security rule:     Only the account owner may read or write their data.

## 5. File Map
[Show only the folders and files relevant to this task]

## 6. Coding Standards
- Keep functions small and readable.
- Validate all inputs.
- Return safe error messages.
- Add or update tests for changed behavior.

## 7. Tests to Run
- [TEST-### and expected outcome]

## 8. Review Rules
Before finishing, explain:
- What changed
- Which requirement was implemented
- Which tests should pass
- Any assumption made
```

---

## The context slice pattern (Ch. 12 §12.3)

For a focused task, supply exactly five things:

1. **Current goal** — what you want done now.
2. **Relevant requirement** — the requirement being implemented.
3. **Technical rule** — architecture, API, database, or style constraint.
4. **Acceptance criteria** — how you will judge the result.
5. **Restrictions** — what the agent must not change.

```
Current goal: Implement the save-recipe validation logic.
Relevant requirement: REQ-F-002 — a cook can save a recipe with a title and ≥1 ingredient line.
Acceptance criteria:
- Title is required.
- At least one ingredient line is required.
- Invalid input returns a safe error message and saves nothing.
Technical rule: Validation lives in the service layer, not the route handler (ADR-001).
Restriction: Do not change the database schema or authentication in this task.
```

---

## What to include and exclude (Ch. 12 §12.5)

| Task type | Include | Usually exclude |
|---|---|---|
| Frontend screen | User story, UI behavior, component rules, error states | Database migration details |
| API endpoint | Request/response contract, validation rules, auth rule, tests | Full product roadmap |
| Database change | Entity fields, relationships, constraints, migration notes | UI copy and screen layout |
| Test writing | Acceptance criteria, expected behavior, edge cases | Unrelated features |

---

## File map example (Ch. 12 §12.4)

A file map prevents the agent from creating duplicate folders, placing code in the wrong
layer, or ignoring the structure you already chose. List only what the current task needs.

```
pantry/
  01-docs/
    02-requirements/requirements.md
    04-technical-spec/technical-spec.md
  06-agent/
    02-context/context-pack.md
  04-src/
    ui/                      # screens and components
    api/                     # route handlers
    domain/                  # business logic (recipes, planning, shopping-list)
    data/                    # data access and schema helpers
  03-tests/
    unit/
    integration/
```

---

## Preventing context confusion (Ch. 12 §12.6)

Context confusion happens when the agent receives mixed, stale, incomplete, or conflicting
information — then follows the wrong instruction even when your current prompt is clear.

**Common triggers:**
- Old requirements that were never removed.
- Two different names for the same feature.
- A prompt that conflicts with the technical specification.
- File maps that no longer match the actual structure.
- Acceptance criteria not linked to the current task.

**Rule:** when a decision changes, **update the context before you ask for more work**.
Do not rely on the agent to guess which instruction is newer.

## Updating the context pack (Ch. 12 §12.7)

Update **after review**, not during uncontrolled generation:
complete a small task → review the output → decide what changed → update the pack →
start the next task.

- [ ] Did the requirement change?
- [ ] Did the technical decision change?
- [ ] Did the file structure change?
- [ ] Did a new rule need to be added?
- [ ] Did an old rule become false?
- [ ] Does the next task need a smaller context slice?

---

> Blueprint: blueprints/06-agent/02-context/context-pack.md
