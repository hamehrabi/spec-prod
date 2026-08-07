# Prompt Library for Spec-Driven AI Engineering

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
| Build the shopping list. | Using REQ-F-005 and BR-001, implement only shopping-list generation from a weekly plan, per the Q-009 combine rule. Add tests before implementation. |
| Make the app better. | Review the save-recipe workflow against REQ-F-002's acceptance criteria. List missing validations first, then propose the smallest changes. |
| Fix the bugs. | Use the failing test output and the requirement to identify the root cause. Explain the mismatch before suggesting a patch. |
| Add accounts. | Implement REQ-F-001 only, once the auth model (Q-006) is decided. Do not add sharing or roles. Add validation and tests. |

---

> Blueprint: blueprints/06-agent/03-prompts/prompt-library.md
