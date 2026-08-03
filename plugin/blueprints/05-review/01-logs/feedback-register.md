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
| FB-001 | | | | | REQ-### | | New | Yes / No | Yes / No |
| FB-002 | | | | | | | | | |

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

---

# WORKED EXAMPLE — ProjectBoard

| ID | Date | Source | Type | Summary | Affected artifact | Owner | Status | Spec update? | Test update? |
|---|---|---|---|---|---|---|---|---|---|
| FB-001 | 2026-04-08 | Pilot user | Clarification | "I don't know which button saves my changes." | product-spec (task form flow) | Product owner | Accepted | Yes → CHG-006 | No |
| FB-002 | 2026-04-09 | Support | Bug | "A viewer on my team edited a task." | security-specification | Developer | Accepted | No | Yes → FTEST-004 |
| FB-003 | 2026-04-10 | Pilot user | Scope request | "I need to export only completed tasks." | scope-change-log | Product owner | **Deferred** | No | No |
| FB-004 | 2026-04-11 | Monitoring | Performance | Task list p95 is 4.1 s on the largest project. | REQ-NF-001 | Developer | Accepted | Yes → CHG-004 | Yes → PTEST-003 |
| FB-005 | 2026-04-12 | Pilot user | Wrong expectation | "I expected team members to see each other's tasks." | REQ-F-006 / Q-003 | Product owner | Under review | Likely | Likely |
| FB-006 | 2026-04-14 | Team lead | Operational | "When an export fails I can't tell why." | monitoring-plan | Engineering | Accepted | Yes | No |

## Entry detail — FB-005

```
Feedback ID:      FB-005
Date:             2026-04-12
Source:           Pilot user (team lead at a 6-person consultancy)
Affected requirement or artifact: REQ-F-006, open question Q-003
Feedback summary: "I expected to see what everyone on the project is working on, but I
                   only see my own tasks."
Evidence or example: Screen recording; user opened the project three times looking for
                   a team view before asking.
Decision needed:  Should a Member see tasks assigned to other members of the same project?
Owner:            Product owner
Status:           Under review
Spec update required: Likely - REQ-F-006 currently says "tasks belonging to the
                   authenticated user", which was never a deliberate decision.
Test update required: Yes - STEST-001 currently asserts the opposite.
Next action:      Answer Q-003 first. The requirement and the security test disagree
                   with the user's expectation; one of the three must change.
```

## Why FB-005 is the important one

Nothing was broken. No error fired. Every test passed. The system did exactly what the
requirement said — and the requirement was **an accident**, not a decision. It came from
a convenient early implementation that nobody questioned.

> This is what Ch. 24 means by "a system can have no errors and still be confusing."
> Monitoring would never have surfaced it.
