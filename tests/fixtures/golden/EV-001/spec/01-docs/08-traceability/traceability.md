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
| REQ-F-001 | Save a recipe with its ingredient lines. | technical-spec §4, database-design (recipes) | TASK-003–006 | ATEST-001, UTEST-001, UTEST-002, ITEST-001, ITEST-005, FTEST-001, FTEST-002, FTEST-008 | — (not yet implemented) | Draft |
| REQ-F-002 | Plan which meals to cook in a week. | technical-spec §4, database-design (plans) | TASK-007–010 | ATEST-002, ITEST-003 | — | Draft |
| REQ-F-003 | Generate one shopping list from a weekly plan — **the core**. | BR-001, technical-spec §4, api-specification | TASK-011–014 | ATEST-003, ATEST-005, UTEST-003, UTEST-005, ITEST-004, FTEST-005, FTEST-006, PTEST-001, ETEST-003 | — | Draft — ATEST-005/UTEST-003 blocked on Q-011 |
| REQ-F-004 | Search saved recipes. | technical-spec §4 | TASK-015–016 | ATEST-004, UTEST-004, ITEST-006, PTEST-002 | — | Draft |
| REQ-NF-001 | Generation ≤ 2 s / 21 meals; search ≤ 1 s / 500 recipes. | runtime-and-scale, FF-002 | TASK-012, TASK-015 | PTEST-001, PTEST-002 | — | Draft |
| REQ-NF-002 / SEC-A-001 | Only the authenticated account holder reaches their data. | security-specification §1 | TASK-002 | ITEST-002, STEST-002, FTEST-003 | — | Draft — TASK-002 blocked on Q-009 |
| REQ-NF-003 | Failures say so plainly, keep typed input, never report false success. | reliability-specification | TASK-006, TASK-014 | FTEST-005, FTEST-008, ETEST-004, STEST-004 | — | Draft |
| REQ-NF-004 | Core flow completable without training. | product-spec, frontend-component-spec | TASK-005, TASK-009, TASK-013 | ETEST-002, ETEST-003 | — | Draft |
| REQ-NF-005 | Module boundaries, no import cycles. | ADR-001, FF-001 | TASK-001 | — (checked by FF-001) | — | Draft |
| REQ-NF-006 | Keyboard-complete core flow; zero critical scan violations. | FF-003 | TASK-005, TASK-009, TASK-013 | — (checked by FF-003) | — | Draft |
| REQ-NF-007 | Privacy — what must never leak or be logged. | security-specification §4 | — | — | — | Draft — blocked on Q-012 |
| REQ-R-001 / SEC-Z-001 | An account reaches only its own data. | security-specification §2 | TASK-004, TASK-008, TASK-013, TASK-015 | STEST-001, FTEST-004 | — | Draft |
| SEC-Z-002 | Dish photos are owner-only, never public. | security-specification §7 | TASK-017 | STEST-003, FTEST-007 | — | Draft — TASK-017 blocked on Q-023 |
| BR-001 | One list covers every ingredient line of the week. | requirements §4 | TASK-012 | ATEST-003, UTEST-003, ITEST-004 | — | Draft |
| BR-002 | A planned meal references a same-account recipe. | requirements §4 | TASK-008 | ITEST-003, STEST-006 | — | Draft |
| BR-003 | Every entity belongs to one account; never shared. | requirements §4 | TASK-004, TASK-008, TASK-013 | STEST-001 | — | Draft |

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
Requirement ID: REQ-AUTH-001
Requirement:    A registered user must be able to sign in with an email and password.

Design Decision ID: DD-AUTH-001
Decision: Use server-side authentication with hashed passwords and a short-lived
          session token.
```

```
Test ID:         TEST-AUTH-02
Test:            Valid credentials return a session token.
Code link:       auth/login.py -> login_user()
Supporting code: auth/passwords.py -> verify_password_hash()
Status:          Passing
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

The known gaps today: every Code link is empty (nothing is implemented), REQ-NF-007 waits
on Q-012, and three task chains are blocked on Q-009, Q-011, and Q-023. Each is recorded
where it lives rather than smoothed over here.

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

- [x] Every important requirement has a unique ID.
- [x] Every Must requirement has at least one task.
- [x] Every Must requirement has at least one test.
- [x] Every requirement links to at least one design decision or implementation approach.
- [x] Every design decision links to one or more small tasks.
- [ ] Every implemented feature has a code link — nothing is implemented yet.
- [x] Every security rule maps to validation or authorization coverage.
- [ ] Every released feature maps back to a PRD requirement — nothing is released yet.
- [ ] Any code without a requirement has been removed, documented, or approved — no code exists yet.
- [x] Any blank matrix cell has been reviewed before moving forward.
- [ ] Every changed behavior is reflected in updated specs — applies once behavior exists.

> Blueprint: blueprints/01-docs/08-traceability/traceability.md
