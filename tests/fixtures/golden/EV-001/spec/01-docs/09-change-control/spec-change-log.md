# Specification Change Log

> Source: Ch. 30 §30.3 (Versioning Requirements and Specs) + Ch. 24 §24.7.
> **The rule:** code must not quietly move ahead of the specification. When behavior
> changes, the requirement, test, task, and review evidence change with it.

---

## Current versions

| Artifact | Version | What changes it | Who approves | Evidence needed |
|---|---|---|---|---|
| PRD | PRD v1.0 | New requirement, changed priority, clarified non-goal. | Product owner | Change note and affected requirement IDs. |
| Technical spec | TECH v1.0 | Architecture, API, data model, or integration decision. | Technical lead or reviewer | ADR or design note. |
| Test spec | TEST v1.0 | New behavior, bug fix, edge case, failure path. | Developer and reviewer | New or updated test cases. |
| Agent rules | AGENT v1.0 | Repeated AI mistake or new coding boundary. | Team lead | Reason and example. |
| Release plan | REL v1.0 | Deployment target, rollback strategy, monitoring rule. | Release owner | Checklist update. |

---

## Change entries

```
Change ID:
Date:
Changed artifact:
Old version:
New version:
Reason for change:
Affected requirements:
Affected tests:
Affected tasks or code areas:
Decision owner:
Reviewer:
Status: proposed / accepted / rejected / deferred
Notes:
```

| Change ID | Date | Artifact | Old → New | Reason | Affected REQ | Affected TEST | Owner | Status |
|---|---|---|---|---|---|---|---|---|

---

## Stage acceptance and skips

Two things are recorded here as **dated rows**, and neither is ever a file of its own: the
acceptance of each round's gate, and any blueprint deliberately skipped with its reason.

A separate acceptance file would be a second place to look for the same fact, and the two
would disagree within a week. A row in the log that already exists cannot.

**The date is the first column.** That is what makes a row findable — an acceptance buried
in a nine-column change entry is not a record anyone can check, and the change-entries table
above starts with an identifier rather than a date, so it cannot serve.

| Date | Stage or type | Artifact | Note or reason |
|---|---|---|---|
| 2026-08-07 | Round 1 — the idea | — | Accepted by Developer. 4 decisions, 1 inference, 2 TODOs. |
| 2026-08-07 | Round 2 — scope boundaries | — | Accepted by Developer. 3 decisions, 0 inferences, 2 TODOs. |
| 2026-08-07 | Round 3 — users, roles, and data | — | Accepted by Developer. 4 decisions, 0 inferences, 5 TODOs. |
| 2026-08-07 | Round 4 — product shape | — | Accepted by Developer. 5 decisions, 0 inferences, 3 TODOs. |
| 2026-08-07 | Round 5 — architecture and stack | — | Accepted by Developer. 3 decisions, 0 inferences, 1 TODO; resolved Q-011. |
| 2026-08-07 | Skipped | 01-docs/07-security-and-reliability/ai-boundary-spec.md | Pantry neither calls nor is driven by a model; there is no AI boundary to specify. |
| 2026-08-07 | Round 6 — security, reliability, integrations | — | Accepted by Developer. 4 decisions, 1 inference, 2 TODOs; resolved Q-007, Q-008; skipped ai-boundary-spec.md. |
| 2026-08-07 | Skipped | 03-tests/03-non-functional/ai-evals.md | Pantry has no model to evaluate; there are no AI evals to write. |
| 2026-08-07 | Round 7 — tasks and tests | — | Accepted by Developer. 4 decisions, 0 inferences, 1 TODO; skipped ai-evals.md. |
| 2026-08-07 | Round 8 — operations | — | Accepted by Developer. 6 decisions, 0 inferences, 2 TODOs; resolved Q-012. |

**A skip with no reason is a silent skip wearing a label.** The reason is what lets a later
reader tell a decision from an omission.

---

## When implementation reveals something the spec missed (Ch. 15 §15.8)

| When this happens | Update this document |
|---|---|
| A rule becomes clearer during implementation | Requirements document |
| A design decision changes | Technical specification or ADR |
| A new test case is discovered | Test plan |
| A task produces extra work | Task plan and traceability matrix |
| A behavior is removed or postponed | Scope and out-of-scope notes |

## When production teaches you something (Ch. 3 §3.9)

| Change type | Artifact to update |
|---|---|
| A new user behavior is added. | Requirements and product specification. |
| A data field or relationship changes. | Technical specification and data model. |
| A new security rule is added. | Requirements, technical specification, test plan. |
| A bug reveals missing expected behavior. | Requirement, test plan, task history. |
| Deployment process changes. | Deployment checklist and maintenance notes. |

---

## Spec update fields (Ch. 24 §24.7)

| Field | What to write |
|---|---|
| Change date | When the spec was updated. |
| Reason | Bug fix, user feedback, performance issue, security finding, product decision. |
| Affected requirement | The requirement ID or section that changed. |
| Affected tests | Which tests need to be added or changed. |
| Affected code area | The module, endpoint, page, job, or service connected to the change. |
| Review status | Draft, reviewed, approved, implemented, or released. |

---

> **Spec drift warning (Ch. 15 §15.8):** spec drift happens when the code changes but the
> specification stays behind. The longer you allow drift, the harder it becomes to trust
> the source of truth for your project.

> Blueprint: blueprints/01-docs/09-change-control/spec-change-log.md
