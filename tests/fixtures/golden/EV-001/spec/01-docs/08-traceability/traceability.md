# Requirements Traceability Matrix (RTM)

> Source: Ch. 10 + Appendix F.
> Traceability is a **chain of evidence**. A requirement is a promise; traceability is how
> you prove the promise did not disappear while the software was being built.

Keep this file next to the requirements. If it lives in another tool, you will not
maintain it.

---

## The matrix

Project: Pantry. No application code exists yet, so every row is **Specified** and every
task is **Not started**. The "Module" column names the owning module (Account/Auth,
Recipes, Planning, ShoppingList) or "—" where nothing is built yet.

| Req ID | Design / ADR | Task ID | Test ID | Module | Status |
|---|---|---|---|---|---|
| REQ-F-001 | ADR-002 | TASK-002 | ATEST-001, UTEST-001, ITEST-001, FTEST-001, FTEST-003 | Recipes | Specified · Not started |
| REQ-F-002 | — | TASK-003 | ATEST-005, UTEST-002, ITEST-002, PTEST-002 | Recipes | Specified · Not started |
| REQ-F-003 | — | TASK-004 | ATEST-006, UTEST-005, ITEST-003, FTEST-005 | Planning | Specified · Not started |
| REQ-F-004 | ADR-001, FF-001 | TASK-005 | ATEST-002, ATEST-003, UTEST-003, UTEST-004, ITEST-004, STEST-001, PTEST-001, ETEST-001, FTEST-002 | ShoppingList | Specified · Not started |
| REQ-F-005 | — | TASK-001 | ATEST-007, STEST-002, STEST-003, STEST-005, FTEST-004, ETEST-002 | Account/Auth | Specified · Not started |
| REQ-F-006 | — | TASK-006 | ATEST-008, ITEST-005 | ShoppingList | Specified · Not started |
| REQ-NF-001 | — | TASK-005 | PTEST-001 (target deferred, Q-010) | ShoppingList | Specified · Not started |
| REQ-NF-002 | ADR-001 | TASK-001, TASK-005 | ATEST-004, STEST-001, STEST-004 | Account/Auth, ShoppingList | Specified · Not started |
| REQ-NF-003 | FF-002 | TASK-002, TASK-005 | FTEST-001, FTEST-002 | Recipes, ShoppingList | Specified · Not started |
| REQ-NF-004 | — | TASK-005 | ETEST-001 | ShoppingList | Specified · Not started |
| REQ-NF-005 | ADR-001, FF-001 | TASK-005 | UTEST-003 | ShoppingList | Specified · Not started |
| REQ-NF-006 | FF-003 | (cross-cutting) | governed by FF-003 (a11y scan + keyboard) | — | Specified · Not started |
| REQ-NF-007 | — | TASK-001, TASK-002 | STEST-003, STEST-004 | Account/Auth, Recipes | Specified · Not started |
| REQ-R-001 | — | TASK-001 | STEST-001, STEST-002 | Account/Auth | Specified · Not started |
| BR-001 | — | TASK-005 | ATEST-002, UTEST-003, ITEST-004 | ShoppingList | Specified · Not started |
| BR-002 | — | TASK-002, TASK-005 | STEST-001, ATEST-004 | Recipes, ShoppingList | Specified · Not started |
| BR-003 | — | TASK-004 | UTEST-005, ITEST-003, FTEST-005 | Planning | Specified · Not started |
| BR-004 | — | TASK-004 | ITEST-006, FTEST-006 | Planning | Specified · Not started |

**Status values:** Draft · Ready · In review · Approved · Needs update · Released
(Pantry v1 pre-implementation: all rows Specified · Not started.)

---

## The chain (Ch. 10 §10.1)

| Item | Simple question it answers |
|---|---|
| Requirement | What must the system do? |
| Design decision | How will the system support it? |
| Task | What work must be completed? |
| Test | How will you verify it? |
| Code reference | Where is it implemented? |
| Review status | Is the chain complete and approved? |

### Linking pattern (Ch. 10 §10.3)

```
Requirement ID: REQ-F-004
Requirement:    Turn a chosen week of meals into ONE consolidated shopping list.

Design Decision ID: ADR-001
Decision: Modular monolith; the ShoppingList module owns list generation and
          ingredient consolidation, driven by fitness function FF-001 (simplicity).
```

```
Test ID:         ATEST-002
Test:            One week of planned meals produces a single de-duplicated list (BR-001).
Code link:       [not implemented yet — ShoppingList module]
Supporting code: [not implemented yet]
Status:          Specified · Not started
```

---

## Gap analysis (Ch. 10 §10.8)

A **gap is any missing link**. Blank cells are the point of this document.

| Gap found | What it may mean | What you should do |
|---|---|---|
| Requirement has no design link. | The implementation approach is unclear. | Write or confirm the design decision. |
| Design has no task. | The work has not been planned. | Create a small agent-friendly task. |
| Task has no test. | You cannot verify completion. | Write at least one test case. |
| Test has no code link. | Implementation may be missing or hard to locate. | Add file/function reference after implementation. |
| **Code has no requirement.** | The agent may have added unapproved behavior. | Remove it, or document and approve it. |

> Treat code with no requirement as **suspicious until approved**.

### Coverage summary — Pantry v1 (pre-implementation)

| Check | Status |
|---|---|
| Every requirement has ≥ 1 task or is marked cross-cutting. | Met — REQ-NF-006 is cross-cutting, governed by FF-003. |
| Every requirement has ≥ 1 test. | Met — REQ-NF-006 governed by FF-003 (a11y scan + keyboard). |
| Every requirement links to a design decision or approach. | Partial — several core rows use "—" (no ADR needed for a thin slice); acceptable for express depth. |
| Every requirement has a code link. | **Open by design** — no code written yet; all rows Not started. |
| Performance target defined for REQ-NF-001. | **Open (Q-010)** — PTEST-001 exists; concrete target deferred. |

> Honest state: the chain runs requirement → design → task → test today. The **code** and
> **review** links open as each thin vertical slice is built (TASK-001 → TASK-006).

---

## AI-specific risks this catches (Ch. 10 §10.2)

| AI risk | Traceability response |
|---|---|
| The agent builds a related but wrong feature. | Check whether the task links back to the exact requirement. |
| The agent skips an edge case. | Check whether the acceptance criteria produced a test case. |
| Code passes basic tests but breaks a rule. | Check whether business rules appear in the test links. |
| The implementation changes architecture silently. | Check whether the code still follows the design decision. |

> **AI control point:** never ask an agent to "just build the feature" when the
> requirement has not been linked to a task and a test.

---

## Traceability review checklist (Ch. 10 + Appendix F)

- [ ] Every important requirement has a unique ID.
- [ ] Every Must requirement has at least one task.
- [ ] Every Must requirement has at least one test.
- [ ] Every requirement links to at least one design decision or implementation approach.
- [ ] Every design decision links to one or more small tasks.
- [ ] Every implemented feature has a code link.
- [ ] Every security rule maps to validation or authorization code.
- [ ] Every released feature maps back to a PRD requirement.
- [ ] Any code without a requirement has been removed, documented, or approved.
- [ ] Any blank matrix cell has been reviewed before moving forward.
- [ ] Every changed behavior is reflected in updated specs.

> Blueprint: blueprints/01-docs/08-traceability/traceability.md
