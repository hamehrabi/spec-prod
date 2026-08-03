# Maintenance and Spec Drift Checklist

> Source: Appendix Q + Ch. 24 §24.8–24.9.
> **Spec drift** happens when production behavior changes but the specification does not.
> It is dangerous because your next change, your next prompt, and your next AI-assisted
> task will be based on outdated truth.

---

## After every release (Appendix Q)

- [ ] Update requirements to reflect accepted changes.
- [ ] Update API, database, and technical specs if contracts changed.
- [ ] Update the traceability matrix with released test evidence.
- [ ] Record architecture decisions that changed the design direction.
- [ ] Add monitoring observations or known limits to the maintenance notes.

## Monthly maintenance review (Appendix Q)

- [ ] Compare top user feedback with current requirements.
- [ ] Review frequent errors and decide whether specs or code need updates.
- [ ] Review performance trends and capacity assumptions.
- [ ] Remove obsolete tasks and mark superseded decisions.
- [ ] **Refresh the project context pack before giving it to an AI agent.**

## Maintenance checklist (Ch. 24 §24.9)

| Maintenance check | Done? |
|---|---|
| Key workflows have monitoring requirements. | Yes / No |
| Errors are grouped and reviewed by severity. | Yes / No |
| Logs include request IDs and useful context. | Yes / No |
| Performance targets exist for important workflows. | Yes / No |
| User feedback is mapped to requirements or decisions. | Yes / No |
| Specs are updated after production behavior changes. | Yes / No |
| New or changed behavior has matching tests. | Yes / No |
| AI agent instructions use the current spec, not outdated context. | Yes / No |
| Spec drift review is completed before major changes. | Yes / No |

---

## Drift signals (Ch. 24 §24.8)

| Drift signal | What it may mean | What you should do |
|---|---|---|
| Code behavior does not match acceptance criteria. | The code changed without a spec update, or the requirement was wrong. | Compare production behavior with the requirement and choose the correct source of truth. |
| Tests pass but users complain. | The tests may not cover the real user expectation. | Update acceptance criteria and add tests for the missing behavior. |
| AI agent suggests changes outside scope. | The context or task instruction may be too broad. | Narrow the task and restate the boundaries. |
| A bug fix creates new workflow behavior. | The fix changed product behavior, not just code. | Update the product spec, technical spec, and tests. |

---

## Drift audit

| # | Behavior in production | What the spec says | Which is correct? | Action | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | | | Production / Spec | Update spec / Fix code / Both | | |

---

## Maintenance areas to watch (Ch. 27 §27.10)

| Area | What to watch | Action | Spec update required? |
|---|---|---|---|
| Correctness | Impossible values, mismatch with source data. | Investigate ingestion and calculation rules. | Yes, if meaning changes. |
| Performance | Slow endpoints. | Review queries, indexes, cache rules, ranges. | Yes, if limits or targets change. |
| Error tracking | API failures, failed jobs, permission errors. | Classify cause and create fix tasks. | Yes, if new error states appear. |
| User feedback | Confusing UI, missing filters, new requests. | Convert repeated feedback into requirements. | Yes, when accepted into the roadmap. |
| **Spec drift** | Code behavior no longer matches requirements. | Update specs or refactor code to match approved behavior. | **Always.** |

---

## The production rule (Ch. 24 §24.1)

> Every meaningful production lesson should answer one question:
> **does the spec still describe the system you need to maintain?**

A code fix without a spec update solves today's bug and creates tomorrow's confusion.

---

## Prompts

**Spec drift review (Appendix Q)**
```
Compare the current behavior, tests, user feedback, and monitoring notes against the
approved specs. Identify drift, missing documentation, obsolete assumptions, and specs
that need revision before the next release.
```

**Classify production notes (Ch. 27 §27.10)**
```
Review the production notes below.
Identify whether each item is a bug, missing requirement, performance issue, security
issue, or spec drift.
For each item, propose: affected requirement, evidence needed, fix task, test update, and
specification update.
```

---

# WORKED EXAMPLE — ProjectBoard, April review

## After every release — v1.0.0

- [x] Update requirements to reflect accepted changes — REQ-F-007 (CSV), SEC-A-002 (expiry)
- [x] Update API, database, and technical specs — `export_jobs` table, index, pagination
- [x] Update the traceability matrix with released test evidence — 11 rows
- [x] Record architecture decisions — ADR-003 (pagination), ADR-005 (email as a job)
- [x] Add monitoring observations and known limits — KI-001…003

## Monthly maintenance review — 2026-04-30

- [x] Compare top user feedback with current requirements — FB-005 contradicts REQ-F-006
- [x] Review frequent errors — 214 title validation failures → product problem, not a bug
- [x] Review performance trends — p95 stable at 0.34 s after MIG-003
- [x] Remove obsolete tasks; mark superseded decisions — ADR-004 marked Superseded
- [x] **Refresh the project context pack** before the next agent task

## Drift audit

| # | Behavior in production | What the spec says | Which is correct? | Action | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | CSV export exists and works | Nothing — no requirement | **Production** (it is wanted) | Wrote REQ-F-007 retroactively via SC-001 | Product owner | Closed |
| 2 | Members see only their own tasks | REQ-F-006 says "tasks belonging to the authenticated user" | **Neither** — the spec was an accident, users expect otherwise | Answer Q-003, then change spec + STEST-001 | Product owner | **Open** |
| 3 | Session never expired | No requirement existed | **Spec** (must expire) | Wrote SEC-A-002; built TASK-015 | Tech lead | Closed |
| 4 | Task list paginates at 50 | Nothing in the spec until ADR-003 | **Production** | ADR-003 written | Tech lead | Closed |
| 5 | Viewer could edit via API | RBAC table says deny | **Spec** — code was wrong | Fixed; STEST-002 added | Developer | Closed |

## Drift signals observed

| Drift signal | What it meant here | What was done |
|---|---|---|
| Code behavior does not match acceptance criteria | Viewer edit (row 5) | Fixed the code; the spec was right |
| Tests pass but users complain | Members cannot see teammates' tasks (row 2) | Acceptance criteria under revision |
| AI agent suggests changes outside scope | Agent proposed auto-assignment | Task narrowed; proposal rejected and logged |
| A bug fix creates new workflow behavior | Session expiry now redirects mid-form | Product spec updated with the redirect behavior |

## The most important row

> **Row 2.** Nothing was broken. No error fired. Every test passed. The system did exactly
> what the requirement said — and the requirement was written by accident, from a
> convenient early implementation nobody questioned.
>
> Drift is not only "code moved away from the spec." It is also **"the spec was never a
> decision in the first place."** Only a user telling you what they expected can catch it.
