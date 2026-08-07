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
| Environments | local / test / production (Q-017) |
| Health endpoint | `/health` |
| Log location | structured logs (destination set at deploy) |
| Metrics dashboard | — (Q-018) |
| Error tracker | grouped by `event` + reason |
| On-call owner | Developer |
| Rollback approver | Developer |
| Backup schedule / restore procedure | Nightly; restore per backup-and-recovery.md |

---

## Known issues and limitations

| ID | Issue | Impact | Workaround | Planned fix | Documented for support |
|---|---|---|---|---|---|

No known issues yet.

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | Single user, small dataset. |
| Recurring manual steps | Photo orphan cleanup, if photos are stored. |
| Seasonal / traffic patterns | Around weekly meal planning. |
| Dependencies with known instability | None — no external services (Q-007). |
| Data retention jobs | Deleted data removed with its parent; orphan photo cleanup. |

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
| Correctness | A shopping list missing an ingredient. | Investigate the generation rule (Q-009). | Yes, if meaning changes. |
| Performance | Slow list generation or search. | Review queries and indexes. | Yes, if limits or targets change. |
| Error tracking | Failed generations, failed saves. | Classify cause and create fix tasks. | Yes, if new error states appear. |
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

> Blueprint: blueprints/07-ops/03-maintenance/maintenance-notes.md
