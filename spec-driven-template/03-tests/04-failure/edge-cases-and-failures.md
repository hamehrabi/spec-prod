# Edge Cases and Failure Conditions

> Source: Ch. 17 §17.7, Ch. 4 §4.6 (`failure-tests.md`), Ch. 30 §30.2.
> An **edge case** is an unusual but possible situation. A **failure condition** is a
> situation where the system cannot complete the request safely. Both must be planned
> before implementation — they are easy for AI agents to miss.

**Method:** start with the normal case, then ask what could be *empty, too long,
duplicated, expired, unavailable, unauthorized, or invalid*.

---

## Case table

| Case ID | Requirement | Case type | Input / condition | Expected result | Risk covered | Status |
|---|---|---|---|---|---|---|
| | REQ-### | Edge | Empty value | | | Planned |
| | | Edge | Value too long | | | |
| | | Failure | Dependency unavailable | | | |
| | | Failure | Unauthorized actor | | | |
| | | Edge | Duplicate submission | | | |

> **"Case ID" CITES the test that covers the case — it does not mint a new identifier.**
> A case found here becomes a test somewhere: a failure case is an `FTEST-###` in
> [`failure-tests.md`](failure-tests.md), a boundary case is a `UTEST-###` in
> [`unit-tests.md`](../02-functional/unit-tests.md). Write that id here once it exists, and
> `[TODO: which test covers this?]` until it does.
>
> This table used to arrive numbered `FTEST-001`…`FTEST-005` — **the same identifiers
> `failure-tests.md` mints, for different conditions.** `FTEST-002` was "Invalid format" there
> and "Value too long" here, so every workspace carried both and neither knew about the other.
>
> The worked example below already did it the right way: its discovery table cites `FTEST-001`
> and `UTEST-005` side by side, because a discovery table's job is to point at coverage, not to
> create a second numbering of it.

**Case types:** Normal · Edge · Failure · Security · Boundary

---

## The seven questions (Ch. 17 §17.7)

| Question to ask | Example |
|---|---|
| What if the value is empty? | A task title is blank. |
| What if the value is too long? | A project name has 500 characters. |
| What if the value is duplicated? | A user clicks submit twice. |
| What if the value is expired? | A reset token is used after expiry. |
| What if the user is not allowed? | A team member edits an owner-only setting. |
| What if the dependency fails? | An email service cannot send an invitation. |
| What if the action is repeated? | The same request arrives twice. |

---

## Failure sources checklist (Ch. 22 §22.2)

- [ ] User input — missing, invalid, unexpected
- [ ] Database — write failure, timeout, constraint violation
- [ ] Network — request timeout, connection reset
- [ ] External service — unavailable, rate-limited, unexpected response shape
- [ ] Background job — fails after the user has left the page
- [ ] Concurrency — two users edit the same record
- [ ] Authorization — role changes mid-session

Each failure state must have a **recovery path, user message, log event, and test case** →
[`../docs/reliability-specification.md`](../../01-docs/07-security-and-reliability/reliability-specification.md)

---

## Prompt — edge and failure test generation (Ch. 17 §17.7)

```
Using the requirement below, list the normal case, edge cases, and failure cases.
Do not write implementation code yet.

Requirement: [paste requirement]

Return the answer as a test planning table with: case type, input, expected result, and
risk covered.
```

---

# WORKED EXAMPLE — ProjectBoard, "create a task"

## The seven questions, answered

| Question | ProjectBoard case | Case type | Expected result | Test |
|---|---|---|---|---|
| What if the value is empty? | Title is `""` or only spaces | Failure | 400, nothing saved | FTEST-001 |
| What if the value is too long? | Title is 121 characters | Edge | 400 naming the limit | UTEST-005 |
| What if the value is duplicated? | User double-clicks Save | Edge | One task created, not two | FTEST-006 |
| What if the value is expired? | Session token expired mid-form | Failure | Redirect to login; typed values preserved | FTEST-007 |
| What if the user is not allowed? | Viewer submits the form via API | Security | 403; nothing saved | STEST-002 |
| What if the dependency fails? | Notification email provider is down | Failure | Task **still saved**; email marked pending | FTEST-009 |
| What if the action is repeated? | Same request retried by the client | Edge | No duplicate row | FTEST-006 |

## Discovery table

| Case ID | Requirement | Case type | Input / condition | Expected result | Risk covered | Status |
|---|---|---|---|---|---|---|
| FTEST-001 | REQ-F-001 | Failure | Title missing | 400 + field name; no row written | Bad data enters the database | Passing |
| UTEST-005 | REQ-F-001 | Edge | Title = 120 chars / 121 chars | accept / reject | Off-by-one at the boundary | Passing |
| FTEST-002 | BR-003 | Failure | Due date = yesterday | 400; typed values kept | Invalid planning data | Passing |
| FTEST-006 | REQ-F-001 | Edge | Two identical creates in 500 ms | One row only | Duplicate work items | Passing |
| FTEST-009 | REQ-F-009 | Failure | Email provider returns 503 | Task saved; email `pending_review` | A dependency taking down core function | Passing |
| FTEST-011 | BR-004 | Failure | Delete a project with 3 open tasks | 409; nothing deleted | Silent data loss | Passing |

## Failure sources checked

- [x] User input — missing title, past due date, oversized description
- [x] Database — write timeout during create
- [x] Network — client retry after a dropped response
- [x] External service — email provider unavailable
- [x] Background job — export worker crash
- [x] Concurrency — two members editing the same task status
- [x] Authorization — role changed from Member to Viewer mid-session

## The one that was nearly missed

> **Concurrency.** Two members both open task_501 at status `todo`. One sets `in_progress`,
> the other sets `done` two seconds later. There was no rule for this — the last write
> silently won. Raised as Q-006; the decision was last-write-wins **with** `updated_at`
> shown in the UI, and it is now written in the spec instead of being an accident.
