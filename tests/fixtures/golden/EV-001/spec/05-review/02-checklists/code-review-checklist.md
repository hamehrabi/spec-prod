# Code Review Checklist

> Source: Ch. 20 + Appendix P.
> **Beginner rule:** do not review AI code by asking "does it look okay?" Review it by
> asking **"which requirement, design decision, and test does this code satisfy?"**

**Feature or module:** One pass per agent task output — nothing reviewed yet; TASK-001 will be first.
**Requirement IDs:** Those the task under review cites.
**Task IDs:** The task under review.
**Reviewer:** The developer — Pantry is a one-person project, and every implementation task is agent-written (Round 7).
**Date:** —

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

---

## Decision

- [ ] **Accept** — merge as is.
- [ ] **Accept with follow-up** — merge; follow-up tasks created: ______
- [ ] **Revise** — return to the agent with specific findings.
- [ ] **Block** — security or requirement failure.

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

> Blueprint: blueprints/05-review/02-checklists/code-review-checklist.md
