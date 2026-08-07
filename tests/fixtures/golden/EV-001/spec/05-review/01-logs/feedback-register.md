# Feedback Register

> Source: Ch. 29 §29.5 + Ch. 24 §24.6.
> Feedback becomes useful when it is **specific, traceable, and assigned**. "Make this
> better" gives the team and the agent nothing to act on.

Good feedback identifies the affected requirement, explains the gap, proposes a decision,
and states who owns the next action.

---

## Register

| ID | Date | Source | Type | Summary | Affected artifact | Owner | Status | Spec update? | Test update? |
|---|---|---|---|---|---|---|---|---|---|

No feedback recorded yet — the build has not started.

**Status:** New · Under review · Accepted · Rejected · Deferred
**Types:** Clarification · Bug · Design concern · Scope request · Operational concern · Performance

---

## Entry template (Ch. 29 §29.5)

```
Feedback ID:
Date:
Source:                     [user / support / stakeholder / monitoring / QA]
Affected requirement or artifact:
Feedback summary:
Evidence or example:
Decision needed:
Owner:
Status:                     New / Under review / Accepted / Rejected / Deferred
Spec update required:       Yes / No
Test update required:       Yes / No
Next action:
```

---

## Feedback → action mapping (Ch. 29 §29.5)

| Type | Example | Where to record it | Owner | Next action |
|---|---|---|---|---|
| Clarification | "The shopping-list units are unclear." | Feedback register + product spec. | Developer. | Clarify units; update acceptance criteria (Q-009). |
| Bug | "A recipe saved with no title." | Issue list, test plan, security checklist. | Developer. | Fix validation; add regression test. |
| Design concern | "Duplicate ingredients appear twice." | Requirements + reliability spec. | Developer. | Decide the combine rule (Q-009); add a test. |
| Scope request | "I want to share a recipe with a friend." | Scope change log. | Developer. | Decide now, later, or reject (multi-user, Q-005). |
| Operational concern | "I could not tell why a list failed." | Reliability spec and monitoring plan. | Developer. | Add structured logs and error tracking. |

---

## Turning user feedback into engineering input (Ch. 24 §24.6)

Monitoring tells you what the system **is doing**. Feedback tells you how the system
**feels** and where it fails real expectations. You need both — a system can have no
errors and still be confusing.

| Feedback type | Example | Spec action |
|---|---|---|
| Confusion | "I do not know which button generates the list." | Update user flow and UI requirement. |
| Missing behavior | "I want to check off items as I shop." | Add or **explicitly reject** a new requirement. |
| Wrong expectation | "I expected duplicate ingredients to merge." | Clarify the combine rule (Q-009). |
| Performance complaint | "Generating the list feels slow." | Add a performance requirement and monitoring signal. |

> Treat feedback as **engineering input, not casual opinion**. Map every report to a
> requirement, user flow, design decision, or missing acceptance criterion.

---

> Blueprint: blueprints/05-review/01-logs/feedback-register.md
