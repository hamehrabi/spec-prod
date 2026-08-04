# Debugging Specification

> Source: Ch. 19 §19.7.
> A short record of how a bug was diagnosed, what evidence proved the cause, what changed,
> and how you will prevent the same problem from returning. Not a long report — a clear
> trace from symptom to fix.

---

## Bug log

| Bug ID | Date | Feature | Requirement | Symptom | Root cause | Regression test | Spec updated? | Status |
|---|---|---|---|---|---|---|---|---|
| BUG-001 | | | REQ-### | | | TEST-### | Yes / No | Open / Fixed / Closed |

---

## Entry template (Ch. 19 §19.7)

```
Bug ID:              BUG-001
Related Requirement: REQ-###
Feature:             [feature name]

Symptom:             [what failed]
Expected Behavior:   [what should have happened]
Actual Behavior:     [what happened instead]

Evidence:            [logs, stack trace, failing test, reproduction steps]
Root Cause:          [the real cause, not just the error message]

Smallest Safe Fix:   [what changed]
Regression Test:     [test name or test case]
Spec Update Needed:  [requirement, technical spec, API contract, or agent instruction]
Prevention Note:     [what you will not repeat]
```

---

## Common AI coding mistake patterns (Ch. 19 §19.2)

Naming the pattern makes debugging faster. The goal is not to blame the agent — it is to
find where the instruction, context, code, or test coverage was incomplete.

| Pattern | First evidence to check |
|---|---|
| Happy path only | Failure-path test coverage |
| Broken assumption (null / missing field) | Stack trace + input payload |
| Wrong data shape | API contract vs. actual response |
| Misunderstood business rule | Requirement wording vs. implementation |
| Skipped validation | Validation layer + boundary tests |
| Silent scope change | Diff against the task's allowed files |
| Weak error handling | Error-path logs and user messages |

---

## Prevention ledger

| Bug ID | Pattern | Guardrail added | Where |
|---|---|---|---|
| BUG-001 | | Regression test | `03-tests/…` |
| BUG-001 | | Requirement clarified | `01-docs/requirements.md` |
| BUG-001 | | Agent rule added | `06-agent/AGENT.md` |

---

# WORKED EXAMPLE (Ch. 19 §19.8)

```
Requirement:       AUTH-REQ-04
Expected:          Invalid credentials return a safe authentication error.
Actual:            Unknown email causes a server error.
Evidence:          user is null before password comparison.
Root cause:        Code assumes the user lookup always returns a user object.
Smallest safe fix: Check for missing user before password comparison.
Regression test:   Unknown email returns 401 with a generic error message.
```

> **The deeper lesson:** the original requirement did not define how the system should
> behave when a login email is unknown. Once you update the requirement and add the
> regression test, the agent has less room to repeat the mistake.
>
> A fix is complete only when the **code, tests, and specification agree.**
