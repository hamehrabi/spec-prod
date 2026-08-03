# Debugging Checklist for AI-Generated Code

> Source: Appendix O + Ch. 19.
> Debugging AI-generated software requires **evidence**. Do not ask the agent to guess.

> **Beginner rule (Ch. 19 §19.1):** never debug from memory alone. Write down the failure,
> the expected behavior, the actual behavior, and the evidence before you change code.

---

## The workflow (Ch. 19)

```
Reproduce → collect evidence → identify cause → fix ONE cause → test → update the spec
```

| Step | Action | Output |
|---|---|---|
| 1 | Reproduce the failure | A clear failure description |
| 2 | Collect logs, traces, and failing tests | Evidence |
| 3 | Compare evidence to the requirement | Gap or contradiction |
| 4 | Ask AI for root-cause analysis **only** | Diagnosis |
| 5 | Patch one cause at a time | Controlled fix |
| 6 | Run old and new tests | Proof |
| 7 | Update spec and prevention note | Future guardrail |

---

## Before asking the AI agent (Appendix O)

- [ ] State the expected behavior from the spec.
- [ ] State the actual behavior observed.
- [ ] Provide the failing test name and output.
- [ ] Provide the relevant stack trace or log excerpt.
- [ ] Identify recent changes that may have introduced the issue.
- [ ] Name files or modules that are likely involved.

## Root cause review

- [ ] The proposed root cause is supported by evidence.
- [ ] The fix addresses the **cause**, not only the symptom.
- [ ] The fix does not weaken validation, tests, or security.
- [ ] A regression test is added or updated.
- [ ] The debugging specification records the lesson learned.

---

## Reading the evidence (Ch. 19 §19.3)

A stack trace tells you **where** the runtime error happened. It does not automatically
tell you the root cause — the true cause may be a missing validation rule or an incorrect
assumption in the specification.

Read the failure bottom to top, then connect it back to the requirement:
1. What did the system **receive**?
2. What did it **expect**?
3. What did it **do**?
4. Where did actual behavior **first** differ from expected behavior?

```
Requirement ID: AUTH-REQ-03
Expected:  A user with a valid email and password receives a session token.
Actual:    Login returns 500 Internal Server Error.
Log:       TypeError: cannot read property "id" of null
Likely area: user lookup, password check, or token creation.
```

---

## Broken assumptions (Ch. 19 §19.5)

A broken assumption happens when the code believes something the real system does not
guarantee. Fix **four things together**: the code, the test, the requirement, and the
agent instruction. Patching only the code lets the mistake return.

| Assumption | Risk | Spec update | Test update |
|---|---|---|---|
| User always exists | Null error | Define missing-user behavior | Test invalid email |
| Token is always valid | Unauthorized access | Define token expiry rule | Test expired token |
| API field is always present | Crash or bad data | Define required fields | Test missing field |
| Password is always supplied | Weak validation | Define empty input rule | Test empty password |

---

## Repeat-error prevention (Ch. 19 §19.6)

After a bug is fixed, confirm that:

- [ ] A test now **fails before** the fix and **passes after** the fix.
- [ ] The requirement explains the expected behavior clearly.
- [ ] The technical spec explains the system rule clearly.
- [ ] The agent instruction warns against the previous mistake.
- [ ] The same bug cannot silently return in a future edit.

> Every serious bug must create at least one new test, one note in the debugging
> specification, and one correction to the requirement, technical spec, or agent
> instruction file.

---

## Prompts

**Root-cause prompt (Ch. 19 §19.4)**
```
You are debugging one feature only.

Feature:                    [feature name]
Requirement ID:             [requirement ID]
Expected behavior:          [what should happen]
Actual behavior:            [what happened]
Evidence:                   [log, stack trace, failing test, or error message]
Relevant files or functions:[list only what matters]

Task:
1. Explain the most likely root cause.
2. List two alternative causes to check.
3. Do not rewrite code yet.
4. Suggest the smallest safe fix.
5. State which test should prove the fix.
```

**Evidence-only debugging prompt (Appendix O)**
```
Here is the expected behavior, actual behavior, failing test output, logs, and relevant
spec. Identify the most likely root cause using evidence only.
Do not edit code yet.

Return:
1. probable root cause,
2. evidence,
3. files to inspect,
4. safest fix plan,
5. regression test to add.
```

---

# WORKED EXAMPLE — ProjectBoard, BUG-002 (expired session causes a 500)

## Before asking the AI agent

- [x] Expected behavior from the spec — an expired session returns 401 and redirects to login (SEC-A-002)
- [x] Actual behavior observed — the request returns 500 and the page shows a blank error
- [x] Failing test name and output — `test_FTEST-007_expired_session` → `AttributeError: 'NoneType' object has no attribute 'user_id'`
- [x] Relevant stack trace or log excerpt — captured below
- [x] Recent changes that may have introduced it — TASK-005 (login endpoint) merged two days earlier
- [x] Files likely involved — `api/middleware/auth.py`, `services/auth/session.py`

## Evidence collected

```
Requirement ID: SEC-A-002
Expected:  A request with an expired token returns 401 and redirects to login.
Actual:    Request returns 500 Internal Server Error.
Log:       AttributeError: 'NoneType' object has no attribute 'user_id'
           at api/middleware/auth.py:23 in load_current_user
Likely area: session lookup returns None for an expired token; the caller assumes an object.
```

## The prompt that was used

```
You are debugging one feature only.

Feature:                     Session handling
Requirement ID:              SEC-A-002
Expected behavior:           An expired session token returns 401 and redirects to login.
Actual behavior:             The request returns 500.
Evidence:                    AttributeError: 'NoneType' object has no attribute 'user_id'
                             at api/middleware/auth.py:23 in load_current_user.
                             Failing test: test_FTEST-007_expired_session
Relevant files or functions: api/middleware/auth.py -> load_current_user()
                             services/auth/session.py -> find_session()

Task:
1. Explain the most likely root cause.
2. List two alternative causes to check.
3. Do not rewrite code yet.
4. Suggest the smallest safe fix.
5. State which test should prove the fix.
```

## Root cause review

- [x] The proposed root cause is supported by evidence — `find_session()` returns `None` for an expired token; `load_current_user()` dereferences it without a check
- [x] The fix addresses the **cause**, not only the symptom — a `try/except AttributeError` was rejected
- [x] The fix does not weaken validation, tests, or security
- [x] A regression test is added — FTEST-007
- [x] The debugging specification records the lesson — BUG-002

## Broken assumption found

| Assumption | Risk | Spec update | Test update |
|---|---|---|---|
| "A session lookup always returns a session." | 500 instead of a controlled 401 | **SEC-A-002 added** — expiry behavior was never specified | FTEST-007 |

## Repeat-error prevention

- [x] FTEST-007 **fails before** the fix and **passes after**
- [x] SEC-A-002 now states the expected behavior explicitly
- [x] The technical spec's error table gained the expired-session row
- [x] `AGENT.md` gained a "lessons" row: *never assume a lookup returns an object; handle the null path and state it in the spec*
- [x] The same bug cannot silently return

> **The deeper lesson (Ch. 19):** the missing null check was the symptom. The real cause
> was that the requirement never said what happens when a session expires — so the agent
> had no target. Patching only the code would have left the next agent equally blind.
