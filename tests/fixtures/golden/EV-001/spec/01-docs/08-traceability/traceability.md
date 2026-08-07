# Requirements Traceability Matrix (RTM)

> Source: Ch. 10 + Appendix F.
> Traceability is a **chain of evidence**. A requirement is a promise; traceability is how
> you prove the promise did not disappear while the software was being built.

Keep this file next to the requirements. If it lives in another tool, you will not
maintain it.

---

## The matrix

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-F-001 | Account and sign-in | security-spec §7.1 (auth open, Q-006) | TASK-002 | STEST-002 | — (not implemented) | Draft — blocked on Q-006 |
| REQ-F-002 | Save a recipe with ingredients | technical-spec §4; api-spec; BR-002 | TASK-003, TASK-004, TASK-005 | UTEST-001, ITEST-001, E2E-001 | — | Ready |
| REQ-F-003 | Search recipes | api-spec | TASK-006 | ITEST-002 | — | Ready |
| REQ-F-004 | Plan a week | database-design; api-spec | TASK-007 | ITEST-003 | — | Ready |
| REQ-F-005 | Generate one shopping list | BR-001; ADR-001; Q-009 | TASK-008 | ATEST-001, UTEST-003, E2E-002, FTEST-001 | — | Draft — blocked on Q-009 |
| REQ-NF-002 | Account isolation | security-spec §2; FF-005 | (cross-cutting) | STEST-001, ATEST-003 | — | Ready |
| REQ-NF-003 | Reliability / graceful failure | reliability-spec | (cross-cutting) | FTEST-001, FTEST-003 | — | Ready |
| BR-001 | A list covers every planned ingredient | requirements §4 | TASK-008 | ATEST-001, UTEST-003 | — | Draft — blocked on Q-009 |
| BR-002 | A recipe needs a title and ≥1 line | requirements §4 | TASK-003 | UTEST-001, FTEST-002 | — | Ready |

**Status values:** Draft · Ready · In review · Approved · Needs update · Released

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
Requirement ID: REQ-F-005
Requirement:    A cook can generate one shopping list from a weekly plan.

Design Decision: BR-001 (the list covers every planned ingredient); ADR-001 (list
                 generation lives in a domain module). Open: Q-009 (combine rule).
```

```
Test ID:         ATEST-001
Test:            A plan with meals produces a list with every planned ingredient.
Code link:       — (not yet implemented; TASK-008 blocked on Q-009)
Status:          Planned
```

---

## Gap analysis (Ch. 10 §10.8)

A **gap is any missing link**. Blank cells are the point of this document.

| Gap found | What it may mean | What you should do |
|---|---|---|
| REQ-F-001 has no code and its task is blocked. | The auth model is undecided (Q-006). | Decide Q-006, then unblock TASK-002. |
| REQ-F-005 / BR-001 tasks are blocked. | The combine rule is undecided (Q-009). | Decide Q-009, then unblock TASK-008. |
| No requirement has a code link yet. | The build has not started. | Add file/function references as tasks are completed. |
| **Code has no requirement.** | The agent may have added unapproved behavior. | Remove it, or document and approve it. |

> Treat code with no requirement as **suspicious until approved**.

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

---

> Blueprint: blueprints/01-docs/08-traceability/traceability.md
