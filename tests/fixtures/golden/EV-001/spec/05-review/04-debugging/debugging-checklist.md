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
Requirement ID: REQ-F-005
Expected:  A plan with meals produces a list with every planned ingredient.
Actual:    List generation returns 500 Internal Server Error.
Log:       TypeError: cannot read property "ingredients" of null
Likely area: a planned meal references a recipe that could not be loaded.
```

---

## Broken assumptions (Ch. 19 §19.5)

A broken assumption happens when the code believes something the real system does not
guarantee. Fix **four things together**: the code, the test, the requirement, and the
agent instruction. Patching only the code lets the mistake return.

| Assumption | Risk | Spec update | Test update |
|---|---|---|---|
| A recipe always has ingredients | Null error / empty list | Define the empty-recipe rule (BR-002) | Test a recipe with no lines |
| A planned meal's recipe still exists | Crash on generation | Define missing-recipe behavior | Test a deleted recipe in a plan |
| Every account owns its data | Cross-account access | Define scoping (BR-003) | Test another account's request |
| A duplicate ingredient is fine as-is | Confusing list | Define the combine rule (Q-009) | Test the same ingredient in two meals |

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

> Blueprint: blueprints/05-review/04-debugging/debugging-checklist.md
