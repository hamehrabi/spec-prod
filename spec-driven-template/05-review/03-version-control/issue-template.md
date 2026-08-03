# Issue / Work Request Template

> Source: Ch. 15 §15.5.
> In spec-driven AI engineering, an issue must not be vague. It points to the requirement,
> the expected behavior, the files likely involved, and the acceptance criteria.

Use this inside a local document, a tracker, or a GitHub issue.

---

```
Issue Title:    [short behavior summary]
Requirement ID: REQ-###
Spec Source:    01-docs/technical-spec.md, [section]
Goal:           [one sentence: what should be true after this is done]

Acceptance Criteria:
- 
- 
- 
- 

Files likely affected:
- 
- 
- 

Out of scope:
- 

Tests required:
- TEST-###

Priority: P0 / P1 / P2 / P3
Owner:
```

---

## Worked example (Ch. 15 §15.5)

```
Issue Title:    Implement failed login lockout
Requirement ID: REQ-AUTH-006
Spec Source:    01-docs/technical-spec.md, Authentication section
Goal:           Lock the account for 10 minutes after 5 failed login attempts.

Acceptance Criteria:
- Failed attempts are counted per user account.
- The sixth attempt within the window is blocked.
- A locked account receives a safe error message.
- A successful login resets the failed-attempt count.

Files likely affected:
- 04-src/auth/login.py
- 04-src/auth/models.py
- 03-tests/test_login_lockout.py
```

> This gives the agent a controlled target. It also gives **you** a clear review checklist
> before you accept the change.

---

## Issue quality check

- [ ] Points to a requirement ID that exists.
- [ ] Acceptance criteria are testable, not aspirational.
- [ ] Likely files are named (so unrelated changes are visible in the diff).
- [ ] Out-of-scope items are stated.
- [ ] Tests are identified before implementation.
