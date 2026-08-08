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
| STEST-001 | SEC-Z-001, REQ-R-001 | Unauthorized access | A cook requests another account's recipe, week, or list by id | Safe not-found; no data returned (BR-002) | Planned |
| STEST-002 | SEC-A-001 | Unauthenticated access | A protected data route is opened without a session | 401 / redirect to sign in | Planned |
| STEST-003 | SEC-A-002 | Credential exposure | Inspect storage and logs after sign-in | Only a password hash stored; no password in any log line | Planned |
| STEST-004 | SEC-Z-002 | Private file leakage | Another account or an unauthenticated request fetches a recipe photo | Denied; the photo is not returned | Planned |
| STEST-005 | SEC-A-003 | Account enumeration | Request a password reset for an unknown vs a known email | Identical response; existence not revealed | Planned |

---

## Security risk → test question (Ch. 17 §17.5)

| Security risk | Test planning question |
|---|---|
| Unauthorized access | What happens when a cook tries to access data they do not own? |
| Broken validation | What happens when the request contains unexpected fields or dangerous input? |
| Information leakage | Does an error message reveal private data or system details? |
| Weak authorization | Can a request reach a resource the account does not own? |

---

## Per-role negative matrix

Version one has one role, so the denial cases are another account and signed out. For each
protected action, the deny cell cites the test that proves the server refuses it.

| Action | Home cook (own data) | Another account | Signed out |
|---|---|---|---|
| Read / write a recipe, plan, or list | allow | **deny → STEST-001** | **deny → STEST-002** |
| View a recipe photo | allow | **deny → STEST-004** | **deny → STEST-002** |

> **Default access is deny unless explicitly allowed** (Appendix M).

---

## Rules

- Security tests must include **negative cases**, not only happy paths.
- Every rule in [`../../01-docs/07-security-and-reliability/security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md)
  needs at least one test.
- Hiding a control in the UI is not a passing security test — assert the **server**
  rejects the request.

Full review pass → [`../../05-review/02-checklists/security-review.md`](../../05-review/02-checklists/security-review.md)

---

> Blueprint: blueprints/03-tests/03-non-functional/security-tests.md
