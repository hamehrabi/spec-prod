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
| CHG-001 | | | v1.0 → v1.1 | | | | | proposed |
| CHG-002 | | | | | | | | |

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
| YYYY-MM-DD | Round 1 — the idea | — | *Accepted by whom.* |
| YYYY-MM-DD | Skipped | *blueprint path* | *Why this project does not need it.* |

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

## Prompt — update the spec after production feedback (Ch. 24 §24.7)

```
You are helping me update a software specification after production feedback. Use the
current requirement, the observed production behavior, and the proposed change.
Return: updated requirement text, affected acceptance criteria, affected tests, affected
code areas, and a short change note. Do not add unrelated features.
```

> **Spec drift warning (Ch. 15 §15.8):** spec drift happens when the code changes but the
> specification stays behind. The longer you allow drift, the harder it becomes to trust
> the source of truth for your project.

---

# WORKED EXAMPLE — ProjectBoard

## Current versions

| Artifact | Version | Last changed | By |
|---|---|---|---|
| PRD | PRD v1.2 | 2026-04-02 | Product owner |
| Technical spec | TECH v1.4 | 2026-04-02 | Tech lead |
| Test spec | TEST v1.3 | 2026-04-03 | Developer |
| Agent rules | AGENT v1.1 | 2026-03-28 | Team lead |
| Release plan | REL v1.0 | 2026-04-05 | Release owner |

## Change entries

| Change ID | Date | Artifact | Old → New | Reason | Affected REQ | Affected TEST | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| CHG-001 | 2026-03-20 | Requirements | v1.0 → v1.1 | Login lockout added after a security review finding. | REQ-AUTH-006 | TEST-AUTH-010 | Tech lead | accepted |
| CHG-002 | 2026-03-28 | Agent rules | AGENT v1.0 → v1.1 | Agent modified `users` schema during an unrelated task. | — | — | Team lead | accepted |
| CHG-003 | 2026-04-02 | PRD + Tech spec | v1.1 → v1.2 / v1.3 → v1.4 | CSV export accepted into scope after SC-001. | REQ-F-007 | FTEST-010 | Product owner | accepted |
| CHG-004 | 2026-04-03 | Test spec | v1.2 → v1.3 | Dashboard slow for large projects; pagination requirement added. | REQ-NF-001 | PTEST-003 | Developer | accepted |
| CHG-005 | 2026-04-04 | Requirements | v1.1 → v1.2 | Session expiry was never specified (Q-004). | SEC-A-002 | FTEST-007 | Tech lead | accepted |

## Change entry detail — CHG-005

```
Change ID:      CHG-005
Date:           2026-04-04
Changed artifact: docs/requirements.md
Old version:    v1.1
New version:    v1.2
Reason for change:
  Debugging BUG-002 showed the code assumed a token was always valid. The requirement
  never said what happens when a session expires, so the agent had no target.
Affected requirements: SEC-A-002 (new)
Affected tests:        FTEST-007 (expired session redirects, does not crash)
Affected tasks/code:   auth/session.py, api/middleware/auth.py
Decision owner:        Tech lead
Reviewer:              Product owner
Status:                accepted
Notes:
  The fix is not complete until code, test, and requirement agree. AGENT.md also gained
  a "lessons from past mistakes" row so the assumption cannot silently return.
```

> **Why this log exists:** CHG-003 is the moment the project nearly drifted. The code for
> CSV export already existed before any requirement did. The change log is what forced the
> question "was this approved?" instead of letting the code define the product.
