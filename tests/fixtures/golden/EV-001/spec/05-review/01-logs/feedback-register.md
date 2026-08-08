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

No entries yet — the first piece of feedback adds the first row.

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
| Clarification | "The recipe search labels are unclear." | Feedback register + product spec. | Owner. | Define label meanings; update acceptance criteria (REQ-F-002). |
| Bug | "The generated list left out a planned meal's ingredients." | Issue list, test plan, review log. | Owner. | Fix the list-build logic (REQ-F-004 / BR-001); add regression test. |
| Design concern | "The failure message after a save error is confusing." | Reliability specification. | Owner. | Add graceful-failure wording and test (REQ-NF-003 / FF-002). |
| Scope request | "I want to share my plan with a housemate." | Scope change log. | Owner. | Decide now, later, or reject (v1 is one account, no sharing). |
| Operational concern | "When a save fails I can't tell why." | Reliability specification and monitoring plan. | Owner. | Add structured logs and error surfacing. |

---

## Turning user feedback into engineering input (Ch. 24 §24.6)

Monitoring tells you what the system **is doing**. Feedback tells you how the system
**feels** and where it fails real expectations. You need both — a system can have no
errors and still be confusing.

| Feedback type | Example | Spec action |
|---|---|---|
| Confusion | "I do not know which button saves my recipe." | Update user flow and UI requirement (REQ-F-001 / REQ-NF-004). |
| Missing behavior | "I want to tick items off as I shop from my phone." | Add or **explicitly reject** a requirement (REQ-F-006). |
| Wrong expectation | "I expected deleting a recipe to just work." | Clarify the delete-guard rule (BR-004). |
| Performance complaint | "Generating the list feels slow." | Confirm the performance target and monitoring signal (REQ-NF-001, Q-010). |

> Treat feedback as **engineering input, not casual opinion**. Map every report to a
> requirement, user flow, design decision, or missing acceptance criterion.

> Blueprint: blueprints/05-review/01-logs/feedback-register.md
