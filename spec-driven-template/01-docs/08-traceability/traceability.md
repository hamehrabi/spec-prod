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
| REQ-001 | | PRD §4.1 / API §2.1 | TASK-004 | TEST-012 | `module -> function()` | Draft / Ready / Done |
| REQ-002 | | Security §3.2 | TASK-006 | TEST-021 | | Needs review |
| REQ-003 | | Validation §5.1 | TASK-007 | TEST-030 | | Approved |

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

## Prompt — generate a first traceability matrix (Ch. 10 §10.7)

```
Using the requirements and technical specification below, create a Requirements
Traceability Matrix. For each requirement, include a requirement ID, linked design
decision, suggested engineering task, suggested test case, likely code area, and status.
Do not invent features outside the provided specification.
```

---

# WORKED EXAMPLE — ProjectBoard

## The matrix, filled in

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-AUTH-001 | A registered user can sign in with email and password. | DD-AUTH-001 / API §6.1 | TASK-AUTH-001…004 | TEST-AUTH-001…003 | `auth/login.py -> login_user()` | Ready for review |
| REQ-F-001 | A team member can create a task with title, description, due date, status. | Tech spec §4, API §6.2 | TASK-004 | TEST-006, TEST-012 | `services/tasks/create_task.py` | Approved |
| REQ-F-005 | A user can update task status. | ADR-002 | TASK-006 | TEST-007 | `services/tasks/update_status.py` | Approved |
| REQ-F-006 | A user can list tasks by project. | ADR-003 (pagination) | TASK-005 | TEST-008, STEST-007 | `api/tasks/list_handler.py` | Approved |
| REQ-NF-001 | Task list loads within 2 s for up to 500 tasks. | Tech spec §8 | TASK-011 | PTEST-003 | `data/tasks_repo.py` (index) | **Needs update** |
| BR-004 | A project cannot be deleted while it has open tasks. | DD-004 | TASK-009 | FTEST-006 | `services/projects/delete.py` | Approved |

## Gap analysis — what this matrix caught

| Gap found | What it meant | Action taken |
|---|---|---|
| REQ-NF-001 had a task and code link but **no passing test**. | Performance was assumed, never proven. | PTEST-003 written; index added; status moved to Needs update until it passes. |
| `services/exports/csv.py` existed with **no requirement**. | The agent added CSV export while working on TASK-005 — never approved. | Escalated as SC-001; accepted, then REQ-F-007 written **before** the code was kept. |
| REQ-AUTH-001 had no test for session expiry. | The requirement never defined expiry — a hidden assumption. | Raised as Q-004; new requirement SEC-A-002 created rather than patching silently. |

## Traced chain — REQ-AUTH-001 end to end

```
REQ-AUTH-001  A registered user must be able to sign in using email and password.
     ↓
DD-AUTH-001   Server-side auth, hashed passwords, short-lived session token.
     ↓
TASK-AUTH-001 Create the login request contract with email and password fields.
TASK-AUTH-002 Validate email and password input before checking credentials.
TASK-AUTH-003 Verify the password hash and create a session token.
TASK-AUTH-004 Return a safe error message for invalid credentials.
     ↓
TEST-AUTH-001 Missing password           -> 400 with validation error.
TEST-AUTH-002 Valid email and password   -> 200 with session token.
TEST-AUTH-003 Wrong password             -> 401 with generic error.
     ↓
auth/login.py -> login_user()
auth/passwords.py -> verify_password_hash()
     ↓
Review: Ready for review
```

> **What is still missing from this row?** Session expiry. It matters, so it became a new
> requirement (SEC-A-002) instead of a hidden assumption inside the same row.
