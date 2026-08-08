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
| STEST-001 | SEC-Z-001 | Unauthorized access | An account holder requests another account's recipe, plan, or list by guessing an ID. | Safe 404; existence not confirmed; no data returned. | Planned |
| STEST-002 | SEC-A-001 | Unauthenticated access | Open any data route without signing in. | 401 and the sign-in prompt. | Planned |
| STEST-003 | SEC-Z-002 | Private file exposure | Request another account's dish photo by URL. | Safe 404; a signed-out request gets 401; photo never served. | Planned |
| STEST-004 | REQ-NF-003 | Information leakage | Force a server error. | No stack trace, path, token, or private data in the response. | Planned |
| STEST-005 | REQ-F-001 | Broken validation | A save request carries unexpected fields (for example `account_id`). | Extra fields ignored or rejected; ownership never reassigned. | Planned |
| STEST-006 | BR-002 | Cross-account reference | Add a planned meal referencing another account's recipe ID. | Safe rejection; no planned-meal row written. | Planned |

---

## Security risk → test question (Ch. 17 §17.5)

| Security risk | Test planning question |
|---|---|
| Unauthorized access | What happens when a user tries to access data they do not own? |
| Broken validation | What happens when the request contains unexpected fields or dangerous input? |
| Information leakage | Does an error message reveal private data or system details? |
| Weak authorization | Pantry has one role, so the question becomes: can any route reach another account's data? |

---

## Per-role negative matrix

Pantry has **one role** — the account holder — so the matrix has two columns: the owner
and everyone else.

| Action | Account holder (owner) | Another account | Signed out |
|---|---|---|---|
| Read or write a recipe, plan, or list | allow | **deny → STEST-001** | **deny → STEST-002** |
| View a dish photo | allow | **deny → STEST-003** | **deny → STEST-003** |
| Plan a meal from a recipe | allow (own recipes) | **deny → STEST-006** | **deny → STEST-002** |

> **Default access is deny unless explicitly allowed** (Appendix M).

---

## Rules

- Security tests must include **negative cases**, not only happy paths.
- Every rule in [`../docs/security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md)
  needs at least one test.
- Hiding a control in the UI is not a passing security test — assert the **server**
  rejects the request.
- Session-expiry and credential tests are written once Q-009 chooses the
  authentication model; SEC-A-002's test arrives with it.

Full review pass → [`../review/security-review.md`](../../05-review/02-checklists/security-review.md)

> Blueprint: blueprints/03-tests/03-non-functional/security-tests.md
