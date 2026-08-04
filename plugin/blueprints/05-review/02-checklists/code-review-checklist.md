# Code Review Checklist

> Source: Ch. 20 + Appendix P.
> **Beginner rule:** do not review AI code by asking "does it look okay?" Review it by
> asking **"which requirement, design decision, and test does this code satisfy?"**

**Feature or module:**
**Requirement IDs:**
**Task IDs:**
**Reviewer:**
**Date:**

---

## Review layers, in order (Ch. 20)

Review in this order. Reviewing randomly means you miss hidden scope changes.

| Layer | Main question |
|---|---|
| 1. Requirement fit | Does this solve the stated user need? |
| 2. Architecture fit | Does it follow the agreed design and layer boundaries? |
| 3. Security and validation | Does it protect users, data, and permissions? |
| 4. Performance | Are there obvious slow patterns under normal use? |
| 5. Test evidence | Do tests prove expected behavior **and** failure paths? |
| 6. Change scope | Did the agent modify only what it was allowed to modify? |
| 7. Maintainability | Can the next developer understand this? |

---

## 1. Specification alignment (Appendix P)

- [ ] The code implements only approved requirements.
- [ ] Every behavior change maps to a requirement or task.
- [ ] Each acceptance criterion has a matching test or manual check.
- [ ] The code respects who is allowed to perform the action.
- [ ] Failure paths described in the requirement are handled.
- [ ] The code does not introduce hidden product decisions.
- [ ] Specs are updated if the accepted behavior changed.
- [ ] The change is traceable to a requirement ID / task ID.

## 2. Architecture

- [ ] Responsibilities are placed in the correct module or layer.
- [ ] Endpoint/controller only receives input, calls the service layer, returns the response.
- [ ] Validation runs **before** business logic.
- [ ] Business rules live in the service/domain layer, not in route handlers or UI components.
- [ ] Data access goes through a clear boundary.
- [ ] No new coupling across boundaries that the ADRs forbid.

| Layer | Main responsibility |
|---|---|
| Endpoint / controller | Receive input, call the service layer, return the response. |
| Validation layer | Reject invalid input before business logic runs. |
| Service layer | Apply business rules and coordinate the use case. |
| Data access layer | Read and write data through a clear boundary. |
| Error handling layer | Turn expected failures into safe, clear responses. |

## 3. Security and validation

- [ ] The code confirms **who** the user is (authentication).
- [ ] The code confirms **what** the user is allowed to do (authorization).
- [ ] Missing, malformed, or dangerous values are rejected early.
- [ ] Tokens, keys, and credentials are kept out of source code and logs.
- [ ] Errors are safe for users and useful for internal logs.
- [ ] Ownership/tenant scoping is enforced on every query.

→ full pass: [`security-review.md`](security-review.md)

## 4. Performance

- [ ] No database queries inside loops.
- [ ] No overfetching of fields or records.
- [ ] No unbounded result sets — pagination or limits exist.
- [ ] One request does not depend on many sequential network calls.
- [ ] Heavy work is moved to a background job where appropriate.

## 5. Testing and safety

- [ ] Tests cover happy paths, failures, edge cases, and permissions.
- [ ] Tests verify business behavior, not only implementation details.
- [ ] Security-sensitive paths have **negative** tests.
- [ ] Tests were not weakened or deleted to make the code pass.
- [ ] Refactoring does not change behavior unless the spec approves it.

## 6. Change scope

- [ ] Only files listed in the task were changed.
- [ ] No unrelated formatting or dependency changes are mixed in.
- [ ] No public interface renamed without an explicit requirement.
- [ ] Deletions are intentional and explained.

## 7. Code quality

- [ ] Names are clear and consistent.
- [ ] Functions are focused and not overloaded with unrelated behavior.
- [ ] Duplicated logic is removed when safe.
- [ ] Error handling is explicit and tested.
- [ ] Logs are useful without exposing sensitive data.
- [ ] Comments explain non-obvious decisions only.

---

## Refactoring rules (Ch. 20 §20.6)

Refactoring means improving structure **without changing what the code does**.

1. Start with a passing test or a clear expected-behavior statement.
2. Choose **one** refactoring goal (e.g. separate validation from business logic).
3. Ask the agent to modify only the selected file or function.
4. Run the relevant checks and compare behavior before and after.
5. Accept the change only if the behavior remains correct.

> If behavior changes, it is not refactoring. It is a requirement or design change, and it
> must be documented.

---

## Findings log

| # | Severity | Layer | Finding | Affected requirement / artifact | Risk | Recommended fix | Changes the spec? | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Blocker / Major / Minor / Nit | | | | | | Yes / No | Open |

---

## Decision

- [ ] **Accept** — merge as is.
- [ ] **Accept with follow-up** — merge; follow-up tasks created: ______
- [ ] **Revise** — return to the agent with specific findings.
- [ ] **Block** — security or requirement failure.

---

## Prompts

**Requirement review (Ch. 20 §20.2)**
```
Review this code only against the listed requirements. Identify each requirement that is
fully satisfied, partially satisfied, missing, or implemented with extra behavior that was
not requested.
```

**Review against the spec (Appendix J, Template 4)**
```
Review the output below against the approved specification.
Do not rewrite the whole solution unless necessary.

Approved specification: [PASTE SPEC]
Output to review:       [PASTE CODE OR PLAN]

Return:
- What matches the spec
- What is missing
- What is extra or out of scope
- What should be corrected first
```

**Full-project review (Ch. 25 §25.10)**
```
Review the implementation against the specs.
Use these review categories:
1. requirements coverage   2. architecture match   3. data integrity
4. authentication and ownership   5. validation and error handling
6. test coverage   7. refactoring opportunities

For every issue, provide:
- the affected requirement or artifact
- the risk
- the recommended fix
- whether the fix changes the spec
```

**Safe refactoring (Ch. 13 §13.7 / Ch. 20 §20.6)**
```
Refactor the code below without changing its approved behavior.

Current behavior that must remain true: [PASTE REQUIREMENTS OR ACCEPTANCE CRITERIA]
Reason for refactoring: [SIMPLIFY / REMOVE DUPLICATION / IMPROVE NAMING / IMPROVE ERRORS]

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

**Agent self-review before merge (Ch. 15 §15.7)**
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

# ADDENDUM — The 12 Design Red Flags

> Added from the architecture review. Source: Ousterhout, *A Philosophy of Software Design*.
> The checklist above verifies **the code does what was asked**. This one verifies **the
> design will survive the next six months**. Scan the diff against these and nothing else —
> twenty minutes.

| Signal | What you are seeing | First move |
|---|---|---|
| **Shallow module** | Interface nearly as complex as the implementation | Merge it, absorb it into the caller, or delete it |
| **Information leakage** | One design decision reflected in several modules | Merge them, or extract a module that owns the decision — only if that module gets a *simpler* interface |
| **Temporal decomposition** | Structure follows execution order rather than knowledge | Ask *"what does this module **know**"*, not *"when does it run"*. Redraw the boundaries |
| **Overexposure** | Using a common feature forces you to learn rare ones | Add defaults; move the rare feature to a separate method |
| **Pass-through method** | A method that just forwards, same signature | Expose the lower class, redistribute responsibility, or merge |
| **Repetition** | The same nontrivial code, again and again | You have not found the abstraction yet |
| **Special-general mixture** | Specialised code tangled into a general mechanism | Push the specialisation up or down; leave the mechanism clean |
| **Conjoined methods** | You cannot understand one without reading the other | Undo the split, or move the boundary to a real seam |
| **Comment repeats code** | The comment reuses the identifier's own words | Change altitude: units and invariants below, purpose above |
| **Impl. doc in the interface** | Interface comment describes internals | Cut it, or move it inside the body |
| **Vague / hard-to-pick name** | Too broad, or you cannot find a good one | Rename. If naming stays hard, the entity does two jobs — split it |
| **Hard to describe** | Docs must be long to be complete | Fix the abstraction, not the prose. **Long comment = wrong abstraction** |

## Two questions to add to every review

1. **For each new abstraction:** does it hide more than it exposes?
2. **For each new configuration parameter:** *can the caller genuinely determine a better
   value than you can here?* If no — **compute it**, do not export it.

> **Complexity is measured by readers, not writers.** If a reviewer says your code is not
> obvious, it is not obvious — regardless of how clear it looks to you. You are the one
> person who already holds the missing context in your head.

---

## WORKED EXAMPLE — ProjectBoard

### Flags that fired in real reviews

| Date | Flag | What it was | Fix |
|---|---|---|---|
| 2026-03-12 | **Pass-through method** | `TaskService.getTask(id)` did nothing but call `TaskRepo.getTask(id)` | Deleted; handler calls the repo through the service's real operations |
| 2026-03-19 | **Information leakage** | Both `create_task()` and `csv_export()` knew the status enum's display strings | Extracted `TaskStatus` value object owning the strings — a *simpler* interface, so the extraction was justified |
| 2026-04-02 | **Overexposure** | Every caller of `list_tasks()` had to pass `page_size`, though 9 of 10 wanted the default | Defaulted to 50 (ADR-003); rare callers override |
| 2026-04-22 | **Temporal decomposition** | The AI summary feature was drafted as `fetch → filter → format → call model → parse`, five modules. Prompt format was known by **three** of them. | Redrawn around knowledge: one module owns *prompt construction and parsing together*, because they share the format. Order still exists at runtime — it just stopped dictating the boundaries. |
| 2026-04-24 | **Configuration knob** | `retrieval_k` exported as a request parameter | Derived from score distribution. Nobody calling the endpoint could have set it better. |

### The one that mattered most

> **2026-04-22 — temporal decomposition.** This is the classic AI-system failure and it
> looked completely reasonable: five clean modules, each doing one step of the pipeline.
> The problem only appears when you change the prompt format — three modules change, and
> the parser breaks *silently* because nothing links them. It is back-door information
> leakage, which behaves exactly like an unknown unknown.
>
> No test would have caught it. Only reading the diff against this list did.

# WORKED EXAMPLE — ProjectBoard, TASK-006 first pass

**Feature or module:** Task creation
**Requirement IDs:** REQ-F-001, BR-003 · **Task IDs:** TASK-006 · **Reviewer:** Tech lead
**Date:** 2026-03-12

## Layers, filled in

| Layer | Result | Note |
|---|---|---|
| 1. Requirement fit | **Partial** | BR-003 (no past due dates) not implemented. |
| 2. Architecture fit | Pass | Validation, service, and handler are correctly separated. |
| 3. Security and validation | Pass | Membership checked before write; no secrets logged. |
| 4. Performance | Pass | Single insert; no loop queries. |
| 5. Test evidence | Partial | Happy path + 2 unit tests. No failure-path test. |
| 6. Change scope | **Fail** | `src/05-data/users_repo.py` changed; not in the allowed files. |
| 7. Maintainability | Pass | Names are clear; functions are small. |

## Findings log

| # | Severity | Layer | Finding | Affected artifact | Risk | Recommended fix | Changes the spec? | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | **Blocker** | Change scope | `users_repo.py` modified to add an unrelated helper. | TASK-006 boundary | Hidden change; not covered by any test or requirement. | Revert. Open a separate task if the helper is needed. | No | Fixed |
| 2 | Major | Requirement fit | BR-003 not implemented. | REQ-F-001 / BR-003 | Invalid planning data can be saved. | Implement for the create path; write FTEST-002. | Yes — BR-003 scoped to creation (CHG-004) | Fixed |
| 3 | Minor | Test evidence | No test for the missing-title path. | FTEST-001 | Regression risk. | Add FTEST-001 before merge. | No | Fixed |
| 4 | Nit | Code quality | `validate_task_input()` returns a dict; codebase uses dataclasses. | — | Inconsistency. | Align. | No | Fixed |

## Decision

- [x] **Revise** — returned to the agent with findings 1–3 as the only scope.

Second pass on 2026-03-13: 0 findings → **Accept**.

## Before and after — finding 2

```python
# BEFORE - accepted any due date
def validate_task_input(data):
    title = data.get('title', '').strip()
    if not title:
        raise ValidationError('Task title is required.')
    return {'title': title, 'due_date': data.get('due_date')}
```

```python
# AFTER - BR-003 enforced, message names the field
def validate_task_input(data, today):
    title = data.get('title', '').strip()
    if not 3 <= len(title) <= 120:
        raise ValidationError('Task title must be between 3 and 120 characters.')

    due_date = data.get('due_date')
    if due_date and due_date < today:
        raise ValidationError('Due date cannot be earlier than today.')

    return TaskInput(title=title, due_date=due_date)
```

> **What only the checklist caught:** finding 1. Every test was green — a test suite
> cannot tell you that a file outside the task boundary was touched. Reading the changed
> file list *before* reading the code is what surfaced it.

---
