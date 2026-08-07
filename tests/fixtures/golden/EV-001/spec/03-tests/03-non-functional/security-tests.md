# Security Test Plan

> Source: Ch. 17 §17.5, Ch. 21, Ch. 27 §27.8.
> Security tests are **especially important** with AI-generated software, because an agent
> may implement the happy path and forget the denial path.

For every important feature ask:
1. Who is **allowed** to do this?
2. Who is **not allowed** to do this?
3. What input must be **rejected**?
4. What information must **never** be exposed?

---

| Test ID | Requirement | Risk | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| STEST-001 | SEC-Z-001 / REQ-NF-002 / REQ-R-001 | Unauthorized access | Account A requests account B's recipe by changing the ID. | Safe 404; no data returned. | Planned |
| STEST-002 | SEC-A-001 | Unauthenticated access | Open a protected route without signing in. | 401 or redirect to sign-in. | Planned |
| STEST-003 | — | Broken validation | Request body carries unexpected fields. | Extra fields ignored; nothing bad stored. | Planned |
| STEST-004 | — | Information leakage | Force a server error. | Generic 500; no stack trace, path, token, or private data. | Planned |

---

## Security risk → test question (Ch. 17 §17.5)

| Security risk | Test planning question |
|---|---|
| Unauthorized access | What happens when a cook tries to access data they do not own? |
| Broken validation | What happens when the request contains unexpected fields or dangerous input? |
| Information leakage | Does an error message reveal private data or system details? |
| Weak authorization | Can a request reach another account's data at all? |

---

## Per-role negative matrix

For each protected action, add one test per actor that **must not** be able to perform it.
Pantry is single-user, so the boundaries are "another account" and "signed out".

| Action | Account owner | Another account | Signed out |
|---|---|---|---|
| Read/write own recipes, plans, lists, photos | allow | **deny → STEST-001** | **deny → STEST-002** |

> **Default access is deny unless explicitly allowed** (Appendix M).

---

## Rules

- Security tests must include **negative cases**, not only happy paths.
- Every rule in [`../docs/security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md)
  needs at least one test.
- Hiding a control in the UI is not a passing security test — assert the **server**
  rejects the request.

Full review pass → [`../review/security-review.md`](../../05-review/02-checklists/security-review.md)

---

> Blueprint: blueprints/03-tests/03-non-functional/security-tests.md
