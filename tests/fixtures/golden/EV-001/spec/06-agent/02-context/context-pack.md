# Project Context Pack

> Source: Ch. 12 §12.8 + Appendix I.
> A **focused** package of project information for **one task**. Not the whole project.

> **Context pack rule:** give the agent enough context to succeed, but not so much that it
> loses the task. The best context pack is specific, traceable, and current.
>
> **Too little context** → the agent guesses. **Too much context** → the agent gets confused.

---

## Specs the agent should have on hand (cite by path, do not restate)

| Need | Where it lives |
|---|---|
| Requirements + acceptance criteria | `../../01-docs/02-requirements/requirements.md` (REQ-F-001..006, REQ-NF-001..007, REQ-R-001) |
| Technical decisions + fitness functions | `../../01-docs/04-technical-spec/technical-spec.md`, `../../01-docs/04-technical-spec/fitness-functions.md` (FF-001..003) |
| Architecture decisions | `../../01-docs/05-architecture/decisions.md`, `../../01-docs/05-architecture/architecture-decisions/` (ADR-001, ADR-002) |
| API contract | `../../01-docs/06-api-and-data-design/api-specification.md` |
| Data model + entities | `../../01-docs/06-api-and-data-design/database-design.md` (Account, Recipe, IngredientLine, WeeklyPlan, PlannedMeal, ShoppingList, ShoppingListItem) |
| Security rules | `../../01-docs/07-security-and-reliability/security-specification.md` (SEC-A-001..004, SEC-Z-001..002) |
| Reliability rules | `../../01-docs/07-security-and-reliability/reliability-specification.md` |
| Current task | `../../02-tasks/02-task-files/` (TASK-001..006) |

---

## Template (Ch. 12 §12.8)

```markdown
# Project Context Pack

## 1. Project Background
Project name:   Pantry
Purpose:        Turn a week of chosen meals into ONE shopping list for a single home cook
Primary users:  One account owner (single-user, no sharing)
Current stage:  Building the first working version, one task at a time

## 2. Current Task
Task:            Generate one consolidated shopping list from a weekly plan (TASK-005).
Expected output: ShoppingList generation logic and unit tests.
Do not change:   Recipe storage, Account/Auth, the database schema, or the API contract.

## 3. Relevant Requirements
Requirement ID:        REQ-F-004
Requirement statement: A signed-in cook can generate ONE consolidated shopping list from a
                       weekly plan.
Acceptance criteria:
- BR-001: one list per week — a second generation for the same week replaces, not duplicates.
- Ingredient lines from all planned meals are consolidated into shopping-list items.
- Only the owner's recipes and plans are read (BR-002, SEC-Z-001).

## 4. Technical Decisions
Architecture rule: ShoppingList list-generation is a core module separate from recipe
                   storage and Account/Auth; it must not import UI or store-specific code
                   (ADR-001, REQ-NF-005, FF-001).
Data rule:         Use only portable SQL and types; every migration is reversible (ADR-002).
API rule:          Follow the contract in api-specification.md; do not rename fields.
Security rule:     Scope every read/write by account_id; another account returns not-found.

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
Current goal: Consolidate ingredient lines from a weekly plan into one shopping list.
Relevant requirement: REQ-F-004 — generate ONE shopping list from a plan.
Acceptance criteria:
- BR-001: exactly one list per week; regenerating replaces the previous list.
- Duplicate ingredients across meals are merged into single items.
- Only the owner's plan and recipes are read.
Technical rule: The list-generation core must not import UI or store-specific code (ADR-001).
Restriction: Do not change the database schema or the Account/Auth module in this task.
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
    02-requirements/requirements.md      # REQ-F-004 and acceptance criteria
    04-technical-spec/technical-spec.md
    06-api-and-data-design/database-design.md
  06-agent/
    02-context/context-pack.md           # compact agent context for current work
  04-src/
    modules/shopping-list/               # core list-generation logic (no UI, no store code)
    modules/planning/                    # weekly plan the generator reads
    api/                                 # API route handlers
    data/                                # data access and schema helpers
  03-tests/
    unit/                                # small behavior tests
    integration/                         # API and workflow tests
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
