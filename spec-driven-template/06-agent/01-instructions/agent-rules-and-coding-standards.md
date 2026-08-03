# Agent Rules and Coding Standards

> Source: Ch. 30 §30.5 + Ch. 12 §12.4.
> AI agents need rules because they are **powerful pattern generators, not responsible
> engineers**. Your standards tell the agent how code should be structured, what it must
> not change, how errors should be handled, how tests should be written, and what must be
> explained before review.

**Version:** AGENT v1.0

---

## Standards summary (Ch. 30 §30.5)

| Standard area | Rule example | Why it matters | Review evidence |
|---|---|---|---|
| Scope control | Do not modify files outside the task scope unless asked first. | Prevents hidden unrelated changes. | File-change summary. |
| Code style | Use clear names, small functions, predictable module boundaries. | Keeps generated code maintainable. | Reviewer readability check. |
| Error handling | Return safe user messages; log technical details internally. | Protects users and helps diagnosis. | Error-path tests. |
| Security | Never hardcode secrets or bypass authorization checks. | Prevents serious production risk. | Security review checklist. |
| Testing | Every behavior change must include relevant tests. | Makes output provable. | Passing test list and coverage notes. |
| Explanation | Summarize assumptions, trade-offs, and files changed. | Makes review faster and safer. | Agent completion note. |

---

## Reusable agent rules template (Ch. 30 §30.5)

```
General behavior:
- Follow the linked requirement and technical specification.
- Ask questions before filling major gaps.
- Do not expand scope without approval.

Coding standards:
- Keep functions small and readable.
- Use clear names and simple control flow.
- Add comments only where they explain non-obvious decisions.

Security rules:
- Do not hardcode secrets.
- Do not weaken authentication or authorization.
- Validate all external input.

Testing rules:
- Add or update tests for every behavior change.
- Include success paths, failure paths, and edge cases.

Completion note:
- List files changed.
- List assumptions.
- List tests added or updated.
- List remaining risks or questions.
```

---

## Coding standards for this project (Ch. 12 §12.4)

| Standard area | Rule |
|---|---|
| Naming | Use clear names such as `createProject`, `validateTaskInput`, `getUserById`. |
| Functions | Prefer small functions that do one job. |
| Validation | Validate inputs before saving or processing data. |
| Errors | Return safe user-facing messages. Do not expose internal details. |
| Tests | Add or update tests for every behavior change. |
| Structure | Keep validation separate from request handling; keep business logic out of route handlers and UI components. |
| Logging | Include a request ID; never log secrets or credentials. |
| Comments | Explain *why*, not *what*. |

*Replace/extend with your project's real conventions. Keep it short — the goal is to
prevent avoidable inconsistency, not to write a style manual.*

---

## Layer responsibilities (Ch. 20 §20.3)

| Layer | Main responsibility | Must not do |
|---|---|---|
| Endpoint / controller | Receive input, call the service layer, return the response. | Contain deep business rules. |
| Validation layer | Reject invalid input before business logic runs. | Perform persistence. |
| Service layer | Apply business rules and coordinate the use case. | Format HTTP responses. |
| Data access layer | Read and write data through a clear boundary. | Decide user-facing business behavior. |
| Error handling layer | Turn expected failures into safe, clear responses. | Leak stack traces to users. |

---

## Rule versioning

Update this file when a **repeated AI mistake** or a **new coding boundary** appears
(Ch. 30 §30.3). Every update needs a reason and an example.

| Version | Date | Change | Reason | Example that triggered it |
|---|---|---|---|---|
| AGENT v1.0 | | Initial rules. | — | — |
| AGENT v1.1 | | | | |

---

# WORKED EXAMPLE — ProjectBoard (AGENT v1.1)

## Coding standards as adopted

| Standard area | ProjectBoard rule |
|---|---|
| Naming | `createTask`, `validateTaskInput`, `getUserById`. No abbreviations except `id`. |
| Functions | One job per function. If it validates **and** persists, split it. |
| Validation | Always at the boundary, before business logic, before any write. |
| Errors | Raise `ValidationError` / `PermissionError`; the handler maps them to 400 / 403. |
| Tests | Every behavior change ships with a test named for its test ID. |
| Structure | Handler → service → data. A handler never imports the data layer directly. |
| Logging | Every log line carries `request_id`. Never `email`, `token`, or `password_hash`. |
| Comments | Explain *why*, never *what*. |

## Layer rules, enforced

```python
# WRONG - handler contains business rules and touches the data layer (breaks ADR-001)
@app.post('/api/v1/projects/{project_id}/tasks')
def create_task(project_id, request):
    data = request.json()
    if not data.get('title'):
        return {'error': 'no title'}, 400
    db.session.add(Task(project_id=project_id, title=data['title']))
    db.session.commit()
```

```python
# RIGHT - handler coordinates; service owns the rules; data layer owns persistence
@app.post('/api/v1/projects/{project_id}/tasks')
def create_task(project_id, request):
    user = get_current_user(request)
    try:
        task = create_task_for_project(project_id, user.id, request.json())
        return serialize(task), 201
    except ValidationError as error:
        return {'error': {'code': 'VALIDATION_ERROR', 'message': str(error)}}, 400
    except PermissionError as error:
        return {'error': {'code': 'FORBIDDEN', 'message': str(error)}}, 403
```

## Rule versioning — the real history

| Version | Date | Change | Reason | Example that triggered it |
|---|---|---|---|---|
| AGENT v1.0 | 2026-03-01 | Initial rules. | Project start. | — |
| AGENT v1.1 | 2026-03-28 | Added: *report any file changed outside the task's allowed list*. | The agent edited `users_repo.py` during TASK-006. Tests stayed green; only the diff review caught it. | TASK-006 review, finding 1 |
| AGENT v1.2 | 2026-04-01 | Added: *for every permission rule, implement and test the denial path in the same task*. | The agent implemented "Member can edit" but never "Viewer cannot". | BUG-003 |
| AGENT v1.3 | 2026-04-04 | Added: *never assume a lookup returns an object; handle the null path and confirm the spec states the behavior*. | Expired session returned 500 instead of 401. | BUG-002 |

## Completion note the agent must produce

```
Files changed:
  - src/04-services/auth/lockout.py       (new: attempt counter + lock window)
  - src/03-api/auth/login.py              (call lockout check before credential check)
  - tests/.../test_TEST-AUTH-010_lockout.py (new)
Assumptions:
  - "5 failed attempts" counts per account, not per IP. The spec did not say. FLAGGED.
Tests added or updated:
  - TEST-AUTH-010 (6th attempt blocked), TEST-AUTH-011 (success resets counter)
Remaining risks or questions:
  - Per-IP throttling is NOT implemented. If that is wanted it needs its own requirement.
Files changed outside the task plan:
  - none
```

> **Why the last line exists.** It was added in v1.1 and it is the single most useful line
> in the report — it makes silent scope expansion self-declared instead of discovered.
