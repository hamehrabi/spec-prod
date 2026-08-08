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
| Service name | Pantry |
| Environments | local; test and production open (Q-019, Q-018) |
| Health endpoint | `/health` |
| Log location | Decided with the deployment target (Q-018) |
| Metrics dashboard | None until Q-020 sets the appetite |
| Error tracker | Same |
| On-call owner | The developer |
| Rollback approver | The developer |
| Backup schedule / restore procedure | Nightly, once running; restore per `backup-and-recovery.md` §4 — untested until the first restore test |

---

## Known issues and limitations

| ID | Issue | Impact | Workaround | Planned fix | Documented for support |
|---|---|---|---|---|---|

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | Volume unknown (Q-001); the stated limits are REQ-NF-001's — 21 meals, 500 recipes. |
| Recurring manual steps | None planned; backups must be automatic with a failure alert. |
| Seasonal / traffic patterns | Unknown until real use. |
| Dependencies with known instability | None — no external dependencies in version one (Round 6). |
| Data retention jobs | None defined — retention rules are open (Q-013, Q-023). |

---

## Maintenance checklist (Ch. 24 §24.9)

Run after each release, after each serious production issue, and before asking an AI agent
to make a major change to an existing system.

| Maintenance check | Done? |
|---|---|
| Key workflows have monitoring requirements. | Yes — monitoring-plan.md, pending the Q-020 appetite |
| Errors are grouped and reviewed by severity. | No — begins with the first release |
| Logs include request IDs and useful context. | Yes — specified in reliability §7 |
| Performance targets exist for important workflows. | Yes — REQ-NF-001 |
| User feedback is mapped to requirements or decisions. | No — the register is empty until there are users |
| Specs are updated after production behavior changes. | No behavior exists yet |
| New or changed behavior has matching tests. | Yes — by the Round 7 plan |
| AI agent instructions use the current spec, not outdated context. | Yes — AGENT.md written this run |
| Spec drift review is completed before major changes. | No — first one is due after the first release |

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

> Blueprint: blueprints/07-ops/03-maintenance/maintenance-notes.md
