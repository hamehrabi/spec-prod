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
| Clarification | "The task status labels are unclear." | Feedback register + product spec. | Product manager. | Define label meanings; update acceptance criteria. |
| Bug | "A viewer can access an edit-only screen." | Issue list, test plan, security checklist. | Developer. | Fix permission logic; add regression test. |
| Design concern | "The AI answer appears too confident." | AI behavior spec and prompt rules. | Product + developer. | Add unsupported-answer rule and test. |
| Scope request | "Stakeholders want team notifications." | Scope change log. | Product manager. | Decide now, later, or reject. |
| Operational concern | "Errors are hard to diagnose in production." | Reliability spec and monitoring plan. | Engineering. | Add structured logs and error tracking. |

---

## Turning user feedback into engineering input (Ch. 24 §24.6)

Monitoring tells you what the system **is doing**. Feedback tells you how the system
**feels** and where it fails real expectations. You need both — a system can have no
errors and still be confusing.

| Feedback type | Example | Spec action |
|---|---|---|
| Confusion | "I do not know which button saves my changes." | Update user flow and UI requirement. |
| Missing behavior | "I need to export only completed tasks." | Add or **explicitly reject** a new requirement. |
| Wrong expectation | "I expected project members to see shared reports." | Clarify role permissions and access rules. |
| Performance complaint | "The dashboard is slow every morning." | Add a performance requirement and monitoring signal. |

> Treat feedback as **engineering input, not casual opinion**. Map every report to a
> requirement, user flow, design decision, or missing acceptance criterion.

> Blueprint: blueprints/05-review/01-logs/feedback-register.md
