# Debugging Specification

> Source: Ch. 19 §19.7.
> A short record of how a bug was diagnosed, what evidence proved the cause, what changed,
> and how you will prevent the same problem from returning. Not a long report — a clear
> trace from symptom to fix.

---

## Bug log

| Bug ID | Date | Feature | Requirement | Symptom | Root cause | Regression test | Spec updated? | Status |
|---|---|---|---|---|---|---|---|---|

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

> Blueprint: blueprints/05-review/04-debugging/debugging-specification.md
