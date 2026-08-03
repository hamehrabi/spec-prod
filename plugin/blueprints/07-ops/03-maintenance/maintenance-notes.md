# maintenance-notes.md — Maintenance Notes

> **Purpose (Ch. 4 §4.3):** The `/ops` folder stores deployment and **maintenance** notes.
> **Sources:** Ch. 24, Ch. 30 §30.7, Appendix Q.

**Detail documents in this folder**

| Document | Covers |
|---|---|
| [`monitoring-plan.md`](../02-monitoring/monitoring-plan.md) | What to observe: availability, correctness, performance, errors, usage, security. |
| [`spec-drift-checklist.md`](spec-drift-checklist.md) | Appendix Q — after every release and monthly. |
| [`maintenance-log.md`](maintenance-log.md) | Dated production-learning entries. |
| [`release-notes.md`](../04-release/release-notes.md) | What shipped, when, and which requirements. |
| [`engineering-quality-review.md`](../04-release/engineering-quality-review.md) | Quality metrics and the improvement loop. |
| [`runbook.md`](../02-monitoring/runbook.md) | Incident procedure and failure playbooks. |

> **The production rule (Ch. 24 §24.1):** every meaningful production lesson should answer
> one question — **does the spec still describe the system you need to maintain?**
>
> A code fix without a spec update solves today's bug and creates tomorrow's confusion.

---

## Operational facts

| Item | Value |
|---|---|
| Service name | |
| Environments | local / test / production |
| Health endpoint | `/health` |
| Log location | |
| Metrics dashboard | |
| Error tracker | |
| On-call owner | |
| Rollback approver | |
| Backup schedule / restore procedure | |

---

## Known issues and limitations

| ID | Issue | Impact | Workaround | Planned fix | Documented for support |
|---|---|---|---|---|---|
| KI-001 | | | | | Yes / No |

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | |
| Recurring manual steps | |
| Seasonal / traffic patterns | |
| Dependencies with known instability | |
| Data retention jobs | |

---

## Maintenance checklist (Ch. 24 §24.9)

Run after each release, after each serious production issue, and before asking an AI agent
to make a major change to an existing system.

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

## What to update when behavior changes (Ch. 3 §3.9)

| Change type | Artifact to update |
|---|---|
| A new user behavior is added. | `01-docs/requirements.md` and `01-docs/product-spec.md` |
| A data field or relationship changes. | `01-docs/technical-spec.md` and `01-docs/database-design.md` |
| A new security rule is added. | `01-docs/requirements.md`, `01-docs/security-specification.md`, test plan |
| A bug reveals missing expected behavior. | Requirement, test plan, `05-review/debugging-specification.md` |
| Deployment process changes. | `deployment-checklist.md` and this file |

> **Maintenance rule:** when behavior changes, update the spec. If the spec does not change
> with the system, it slowly stops being useful.

---

## Areas to watch (Ch. 27 §27.10)

| Area | What to watch | Action | Spec update required? |
|---|---|---|---|
| Correctness | Impossible values, mismatch with source data. | Investigate ingestion and calculation rules. | Yes, if meaning changes. |
| Performance | Slow endpoints. | Review queries, indexes, cache rules, ranges. | Yes, if limits or targets change. |
| Error tracking | API failures, failed jobs, permission errors. | Classify cause and create fix tasks. | Yes, if new error states appear. |
| User feedback | Confusing UI, missing filters, new requests. | Convert repeated feedback into requirements. | Yes, when accepted into the roadmap. |
| **Spec drift** | Code behavior no longer matches requirements. | Update specs or refactor code to match approved behavior. | **Always.** |

---

## Monthly maintenance review (Appendix Q)

- [ ] Compare top user feedback with current requirements.
- [ ] Review frequent errors and decide whether specs or code need updates.
- [ ] Review performance trends and capacity assumptions.
- [ ] Remove obsolete tasks and mark superseded decisions.
- [ ] **Refresh the project context pack before giving it to an AI agent.**

---

## Prompt — narrow maintenance change (Ch. 24)

```
Use the current technical specification and [performance/security/behavior] requirement.
Refactor only the [specific endpoint or module].
Do not change authentication, authorization, or unrelated responses.
Goal: [specific measurable improvement].
Also update or add tests for the new behavior.
```

## Prompt — classify production notes (Ch. 27 §27.10)

```
Review the production notes below.
Identify whether each item is a bug, missing requirement, performance issue, security
issue, or spec drift.
For each item, propose: affected requirement, evidence needed, fix task, test update, and
specification update.
```

---

# WORKED EXAMPLE — ProjectBoard

## Operational facts

| Item | Value |
|---|---|
| Service name | ProjectBoard |
| Environments | local / test / production |
| Health endpoint | `GET /health` |
| Log location | stdout → aggregated store, 14-day retention |
| Metrics dashboard | "ProjectBoard — core" |
| Error tracker | grouped by `event` + `error_code` |
| On-call owner | Developer |
| Rollback approver | Tech lead |
| Backup schedule | Nightly 02:00 UTC; restore tested 2026-03-30 |

## Known issues and limitations

| ID | Issue | Impact | Workaround | Planned fix | Documented for support |
|---|---|---|---|---|---|
| KI-001 | CSV export excludes the description field | Client reports need manual edits | Copy descriptions manually | v1.1 (pending Q-007) | Yes |
| KI-002 | Task list sorts by created date only | Users cannot sort by due date | Use the overdue filter | v1.1 | Yes |
| KI-003 | 312 legacy tasks have no assignee | Dashboard "unassigned" count is inflated | None | MIG-005 backfill | Yes |

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | Sized for 50 active users, ~2,000 tasks. PTEST-003 validated 500 tasks in one project. |
| Recurring manual steps | None. Export cleanup runs nightly. |
| Seasonal / traffic patterns | Load peaks Monday 09:00–11:00 UTC (weekly planning). |
| Dependencies with known instability | Email provider — 1 outage in 6 weeks; invites queue and retry (ADR-005). |
| Data retention jobs | `export_jobs` rows and files purged after 7 days. |

## Maintenance checklist — April review

| Maintenance check | Done? |
|---|---|
| Key workflows have monitoring requirements. | Yes — 8 signals |
| Errors are grouped and reviewed by severity. | Yes |
| Logs include request IDs and useful context. | Yes |
| Performance targets exist for important workflows. | Yes — REQ-NF-001 |
| User feedback is mapped to requirements or decisions. | Yes — FB-001…006 |
| Specs are updated after production behavior changes. | Yes — CHG-003…005 |
| New or changed behavior has matching tests. | Yes |
| AI agent instructions use the current spec. | Yes — context pack refreshed 2026-04-12 |
| Spec drift review completed before major changes. | Yes — 2026-04-04 |

## The maintenance loop, run once

> **Signal:** p95 on the task list hit 4.1 s for the largest pilot project (FB-004).
> **Compare with spec:** REQ-NF-001 says 2 s for up to 500 tasks. Production disagreed.
> **Cause:** no pagination and no index — two problems, not one.
> **Spec updated:** ADR-003 written (pagination is now mandatory on every list endpoint).
> **Tests added:** PTEST-003.
> **Narrow fix requested:** only the task list endpoint; authorization untouched.
> **Result:** 0.34 s. REQ-NF-001 kept unchanged — the target was right, the build was wrong.

That is the whole loop: signal → spec comparison → cause → spec update → test → narrow
fix → verify. The code change was the smallest part of it.
