# Review Log

> Source: Ch. 4 §4.3 — `/review` folder: "Stores review notes and decision records."
> A running record of what was **accepted, rejected, or changed**, and why.

---

| Date | Item reviewed | Task / Req | Reviewer | Layers checked | Findings | Decision | Follow-up |
|---|---|---|---|---|---|---|---|
| | TASK-001 output | REQ-F-001 | | Req / Arch / Sec / Test / Scope | | Accept / Revise / Reject | |
| | | | | | | | |

**Decision values:** Accept · Accept with follow-up · Revise · Reject · Block

---

## Entry template

```
Date:
Item reviewed:        [task output, PR, generated tests, spec draft]
Requirement / Task:   REQ-### / TASK-###
Reviewer:

Layers checked:
[ ] Requirement fit   [ ] Architecture fit   [ ] Security & validation
[ ] Performance       [ ] Test evidence      [ ] Change scope
[ ] Maintainability

Findings:
1. [severity] [layer] — [finding] → [action]

Accepted because / Rejected because:

Decision:             Accept / Accept with follow-up / Revise / Reject / Block
Follow-up tasks:      TASK-###
Spec updates needed:  Yes / No → CHG-###
```

---

## Team review layers (Ch. 29 §29.4)

| Review layer | Main question | Evidence needed | Who helps | Decision |
|---|---|---|---|---|
| Requirement fit | Does this solve the user need? | Requirement ID and acceptance criteria. | Product manager, developer. | Accept / revise. |
| Architecture fit | Does this follow the agreed design? | Technical spec, ADRs, module boundaries. | Developer, architect. | Accept / refactor. |
| Security and privacy | Does this expose data or weaken controls? | Security checklist, permission tests. | Developer, reviewer. | **Block if unsafe.** |
| Test evidence | Do tests prove expected behavior and failure paths? | Unit, integration, UI, edge-case tests. | Developer, QA. | Accept / add tests. |
| Maintainability | Can the next developer understand this? | Clear naming, useful comments, updated specs. | Team reviewer. | Accept / simplify. |

> Review should not ask only "does this look good?" It asks whether the output satisfies
> requirements, respects architecture, passes tests, protects users, and keeps future
> maintenance clear.

---

## Prompt — team review of AI output (Ch. 29 §29.4)

```
Review this output against the linked requirement and technical specification.
Do not rewrite yet.

Report:
1. Requirement gaps
2. Architecture mismatches
3. Security or privacy concerns
4. Missing tests
5. Overbuilt or out-of-scope changes
6. Questions for the product manager
7. Safe refactoring suggestions
```

---

# WORKED EXAMPLE — ProjectBoard

| Date | Item reviewed | Task / Req | Reviewer | Layers checked | Findings | Decision | Follow-up |
|---|---|---|---|---|---|---|---|
| 2026-03-12 | TASK-006 output | REQ-F-001 | Tech lead | Req / Arch / Sec / Test / Scope | 3 (1 major) | **Revise** | Agent re-ran with narrowed scope |
| 2026-03-13 | TASK-006 output (2nd) | REQ-F-001 | Tech lead | all | 0 | Accept | — |
| 2026-03-27 | TASK-007 output | REQ-F-006 | Tech lead | all | 2 (1 blocker) | **Block** | PTEST-003 written first |
| 2026-04-01 | BUG-003 fix | REQ-R-002 | Reviewer | Req / Sec / Test | 0 | Accept | FTEST-004 added |
| 2026-04-03 | Generated tests for REQ-F-005 | REQ-F-005 | Developer | Test evidence | 4 shallow | **Revise** | Assertions strengthened |

## Review detail — TASK-006, first pass

```
Date:               2026-03-12
Item reviewed:      Agent output for TASK-006 (task creation)
Requirement / Task: REQ-F-001 / TASK-006
Reviewer:           Tech lead

Layers checked:
[x] Requirement fit   [x] Architecture fit   [x] Security & validation
[x] Performance       [x] Test evidence      [x] Change scope
[x] Maintainability

Findings:
1. [MAJOR] [scope]    The agent also modified src/05-data/users_repo.py to add a
                      helper it wanted. Not in the task's allowed files.
                      -> Revert; if the helper is needed, it gets its own task.
2. [MINOR] [req]      BR-003 (no past due dates) not implemented. The agent flagged
                      the ambiguity in its report rather than guessing - correct
                      behaviour, but the task is not done.
                      -> Answer Q-005, then finish.
3. [NIT]   [quality]  validate_task_input() returns a dict; the rest of the codebase
                      returns a dataclass.
                      -> Align for consistency.

Accepted because / Rejected because:
  Rejected on finding 1. An unrelated file changed silently is the exact failure mode
  the task boundary exists to prevent, regardless of whether the helper was useful.

Decision:            Revise
Follow-up tasks:     TASK-014 (edit-path validation, pending Q-005)
Spec updates needed: Yes -> CHG-004 (BR-003 scope clarified to creation only)
```

## Review detail — the generated tests

| Generated test | Verdict | Why |
|---|---|---|
| `test_update_status_works()` asserts `response.status_code == 200` | **Shallow** | Proves the request succeeded, not that the status changed. Added an assertion on the stored row. |
| `test_invalid_status()` asserts `!= 200` | **Weak** | 500 would also pass. Pinned to 400 and the exact message. |
| `test_status_history()` | **Invented** | No requirement mentions history. Removed — the spec was not changed to accommodate it. |
| `test_viewer_cannot_update()` | **Missing** | The denial path was absent entirely. Added as STEST-002. |

> **What the review process caught that tests alone did not:** finding 1 was invisible to
> every test — the suite was green. Only reading the changed-file list against the task
> boundary surfaced it.
