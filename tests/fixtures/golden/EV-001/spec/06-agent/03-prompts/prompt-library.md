# Prompt Library for Spec-Driven AI Engineering — Pantry

> Source: Appendix J + Ch. 13.
> Replace bracketed sections with your project details. The strongest prompts connect the
> agent to **requirements, specs, tests, and review expectations**.

> **Prompt safety rule (Appendix J):** never ask an AI agent to "just fix everything."
> Ask it to work from one requirement, one task, one failing test, or one review checklist
> at a time.

---

## Quick index (Appendix J)

| Purpose | Prompt |
|---|---|
| Clarify intent | Review this project idea and identify missing business goals, user goals, constraints, risks, and open questions. Do not propose implementation yet. |
| Create PRD | Turn this engineering intent into a PRD with goals, non-goals, user stories, functional requirements, non-functional requirements, and acceptance criteria. |
| Improve requirements | Review these requirements for ambiguity, missing acceptance criteria, hidden assumptions, and testability problems. |
| Create technical spec | Convert this PRD into a technical specification with architecture, modules, data flow, API needs, error handling, security rules, and test strategy. |
| Create task list | Break this technical specification into small implementation tasks. Each task must map to a requirement and include acceptance criteria. |
| Create test plan | Generate unit, integration, end-to-end, security, and edge-case tests from these acceptance criteria. Avoid shallow tests. |
| Review generated tests | Review these tests against the requirements. Identify shallow tests, missing edge cases, and tests that assert implementation details instead of behavior. |
| Implement one task | Implement only TASK-[ID]. Follow the specs, preserve existing behavior, add tests first, and report changed files and assumptions. |
| Code review | Review this code against requirements, architecture, security, validation, performance, and maintainability. Do not rewrite yet; provide findings first. |
| Debug | Use the logs, stack trace, failing tests, and expected behavior to identify the likely root cause. Explain evidence before suggesting a fix. |
| Security review | Review this feature for authentication, authorization, input validation, data protection, secrets exposure, and secure error handling. |
| Deployment review | Review this deployment plan for environment setup, configuration, migrations, rollback, monitoring, and production readiness. |
| Spec drift review | Compare current behavior with the original specs. Identify drift, undocumented changes, and specs that need updating. |

---

## Core four (Ch. 13 §13.8)

### Template 1 — Clarify before building
```
Before writing code, review the specification below.
List any missing details, contradictions, risky assumptions, or unclear requirements.
Do not implement anything yet.

Specification: [PASTE SPEC]

Return:
- Missing details
- Contradictions
- Questions I should answer
- Safe assumptions, if any
```

### Template 2 — Generate implementation plan
```
Using the approved specification below, create a step-by-step implementation plan.
Do not write code yet.

Specification: [PASTE SPEC]

Return:
- Files or modules likely involved
- Tasks in the correct order
- Tests to write before or during implementation
- Risks to review before coding
```

### Template 3 — Implement one task
```
Implement this one task only:
[TASK ID AND TASK DESCRIPTION]

Source of truth:
[PASTE REQUIREMENT / TECHNICAL SPEC / API CONTRACT]

Boundaries:
- Do not work on other tasks.
- Do not change unrelated files.
- Do not add features outside the specification.

Return:
- Code changes
- Short explanation
- Requirement IDs covered
- Suggested tests
```

### Template 4 — Review against the spec
```
Review the output below against the approved specification.
Do not rewrite the whole solution unless necessary.

Approved specification: [PASTE SPEC]
Output to review: [PASTE CODE OR PLAN]

Return:
- What matches the spec
- What is missing
- What is extra or out of scope
- What should be corrected first
```

---

## Prompting from each artifact type (Ch. 13)

### From a requirement (§13.2)
```
You are working from this approved requirement:
[PASTE REQUIREMENT]

Your task:
[STATE ONE SMALL TASK]

Boundaries:
- Do not change: [LIST FILES OR FEATURES]
- Do not add: [LIST OUT-OF-SCOPE ITEMS]

Acceptance criteria:
[PASTE ACCEPTANCE CRITERIA]

Output required:
- Implementation steps
- Code or structured draft
- A short traceability note showing how the output satisfies the requirement
```

### From a product spec (§13.3)
```
Using the product requirements below, create a feature plan for [FEATURE NAME].

Product goal:  [PASTE PRODUCT GOAL]
Target user:   [PASTE USER PERSONA]
In scope:      [PASTE FEATURE SCOPE]
Out of scope:  [PASTE OUT-OF-SCOPE ITEMS]

Return:
1. The feature behavior in simple steps
2. The screens or endpoints needed
3. The main user flow
4. Risks or unclear points that must be clarified before coding
```

### From a technical spec (§13.4)
```
Use the technical specification below as the source of truth.

Technical area to work on: [FRONTEND / BACKEND / DATABASE / API / SECURITY]
Approved technical decisions: [PASTE RELEVANT EXCERPT]
Task: [STATE ONE SMALL IMPLEMENTATION TASK]

Constraints:
- Follow the existing folder structure.
- Use the existing naming style.
- Do not change unrelated modules.
- Do not introduce a new library unless the spec says so.

Return:
- The proposed files to create or edit
- The implementation
- A short explanation of how the code follows the technical spec
```

### From an API contract (§13.5)
```
Implement the API endpoint using this contract only:

Endpoint:          [PASTE ENDPOINT AND METHOD]
Request contract:  [PASTE REQUEST BODY]
Response contract: [PASTE RESPONSE BODY]
Validation rules:  [PASTE VALIDATION RULES]
Error behavior:    [PASTE ERROR RESPONSES]

Important boundaries:
- Do not change the contract.
- Do not rename fields.
- Do not add extra response fields.
- If something is unclear, list the question before writing code.

Return:
- Endpoint logic
- Validation logic
- Example success response
- Example error response
```

### For tests (§13.6)
```
Create tests from the acceptance criteria below.
Do not test behavior that is not listed.

Feature:             [FEATURE NAME]
Acceptance criteria: [PASTE]
Edge cases:          [PASTE]
Error cases:         [PASTE]

Return a table with:
- Test ID
- Scenario
- Input
- Expected result
- Requirement ID covered

Then provide the test code or test pseudocode.
```

### For refactoring (§13.7)
```
Refactor the code below without changing its approved behavior.

Current behavior that must remain true: [PASTE REQUIREMENTS OR ACCEPTANCE CRITERIA]
Reason for refactoring: [SIMPLIFY / REMOVE DUPLICATION / IMPROVE NAMING / IMPROVE ERROR HANDLING]

Boundaries:
- Do not change public function names unless requested.
- Do not change request or response formats.
- Do not remove validation rules.
- Do not introduce unrelated features.

Tests that must still pass: [PASTE TEST LIST]

Return:
1. Refactored code
2. Explanation of what changed
3. Confirmation of what behavior stayed the same
4. Any risk that still needs manual review
```

---

## Lifecycle control prompts

### Stage gate review (§3.4)
```
Act as a spec-driven AI engineering reviewer.

Current stage: [stage name]
Artifact: [paste artifact]

Check whether this artifact is ready for the next stage. Identify missing information,
vague statements, risky assumptions, and the exact corrections needed. Do not move to
implementation.
```

### Implement one controlled task (§3.3 / Ch. 16 §16.7)
```
You are implementing one task from the approved spec-to-code pipeline.

Task ID:
Source requirement:
Technical design reference:
Allowed files to change:
Files not allowed to change:
Expected behavior:
Required tests:
Acceptance criteria:

Instructions:
1. Make the smallest safe change.
2. Do not add unrelated features.
3. Explain changed files after implementation.
4. Show how the tests prove the requirement.
```

### Agent self-review before merge (Ch. 15 §15.7)
```
Review your own changes before I accept them.
Explain:
1. Every file you changed.
2. Which requirement each change supports.
3. Which tests prove the change works.
4. Any assumptions you made.
5. Any files you changed that were not listed in the task plan.
```

---

## Prompt quality checklist (Ch. 13)

- [ ] Have you provided the approved requirement or specification?
- [ ] Have you limited the task to one clear unit of work?
- [ ] Have you stated what the agent must **not** change?
- [ ] Have you included acceptance criteria or review criteria?
- [ ] Have you requested a clear output format?
- [ ] Have you asked the agent to identify unclear details **before** coding?
- [ ] Have you connected the output back to requirement IDs or spec sections?

---

## Weak vs. spec-driven prompts (Ch. 1 §1.4)

| Weak prompt | Spec-driven prompt |
|---|---|
| Build a login system. | Using REQ-F-005 and the security specification, implement only the email/password sign-in endpoint. Do not add social login or account roles. Generate unit tests for the acceptance criteria before implementation (SEC-A-001..004). |
| Make the app better. | Review the shopping-list generation against REQ-F-004 acceptance criteria. List missing validations first. Then propose only the smallest code changes needed to satisfy the requirement. |
| Fix the bugs. | Use the failing test output and REQ-F-004 to identify the root cause. Explain the mismatch between expected behavior and current behavior before suggesting a patch. |
| Add recipe saving. | Implement REQ-F-001 only: save a recipe with its ingredient lines. Use the existing Recipe entity. Do not add nutrition or import. Add validation and tests. |
| Fix the plan screen. | Fix TASK-004: a planned meal must reference an owned recipe (BR-003). Update the service function and its unit test only. |
| Improve the API. | Update the shopping-list endpoint to enforce BR-001 (one list per week). Do not change response fields. Add validation errors for a second generation of the same week. |

---

# Worked example — Pantry prompts

## 1. Clarify before building (used before REQ-F-004 was locked)

```
Before writing code, review the specification below.
List any missing details, contradictions, risky assumptions, or unclear requirements.
Do not implement anything yet.

Specification:
"A signed-in cook can generate ONE consolidated shopping list from their weekly plan."

Return:
- Missing details
- Contradictions
- Questions I should answer
- Safe assumptions, if any
```

## 2. Implement one task (TASK-005 — generate one list)

```
Implement this one task only:
TASK-005 - Generate one consolidated shopping list from a weekly plan.

Source of truth:
REQ-F-004: A signed-in cook can generate ONE shopping list from a weekly plan.
BR-001: one list per week — regenerating replaces the previous list, it does not duplicate.
API contract: see 01-docs/06-api-and-data-design/api-specification.md

Boundaries:
- Do not work on other tasks.
- Allowed files: 04-src/modules/shopping-list/, 03-tests/unit/
- Do not change: Recipes storage, Account/Auth, the database schema.
- The list-generation core must not import UI or store-specific code (ADR-001, FF-001).

Return:
- Code changes
- Short explanation
- Requirement IDs covered
- Suggested tests
```

## 3. Acceptance criteria → tests (REQ-F-006 — tick off items)

```
Create tests from the acceptance criteria below.
Do not test behavior that is not listed.

Feature: Tick off a shopping-list item
Acceptance criteria:
1. Ticking an item marks it done for the owner's list only (SEC-Z-001).
2. Un-ticking returns it to not-done.
3. A request for another account's list item returns a safe not-found (BR-002).

Return a table with Test ID, Scenario, Input, Expected result, Requirement ID covered.
Then provide the test code.
```

---

> Blueprint: blueprints/06-agent/03-prompts/prompt-library.md
