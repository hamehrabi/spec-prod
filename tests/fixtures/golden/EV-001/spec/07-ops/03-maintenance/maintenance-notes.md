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
| Service name | Pantry (recipe and shopping-list web app for one home cook) |
| Environments | `[TODO: environments — (Q-015)]` |
| Health endpoint | `/health` |
| Log location | Structured application logs (baseline monitoring; Q-016) |
| Metrics dashboard | None at baseline — `[TODO: monitoring appetite — (Q-016)]` |
| Error tracker | Error alerts on the log events (grouped by `event`) |
| On-call owner | The owner (single-user project) |
| Rollback approver | The owner |
| Backup schedule / restore procedure | Nightly off-box backup; restore procedure in [`backup-and-recovery.md`](../01-deployment/backup-and-recovery.md) (restore not yet tested — first test before production deploy). |

---

## Routine maintenance tasks

The whole routine, thin, for a single-user container app:

| Task | Cadence | Note |
|---|---|---|
| Verify the nightly backup ran and is off-box | Nightly (alert on failure) | The recipe library is the irreplaceable asset — a silent backup job is the top durability risk (see [`backup-and-recovery.md`](../01-deployment/backup-and-recovery.md)). |
| Apply dependency updates | Periodic | Keep the modular monolith (ADR-001) and its store (ADR-002) patched; re-run the tests before release. |
| Perform and time a restore test | Periodic | A backup that has never been restored is a hope — restore the recipe library into a scratch location and confirm Recipe/IngredientLine counts. |

---

## Known issues and limitations

| ID | Issue | Impact | Workaround | Planned fix | Documented for support |
|---|---|---|---|---|---|

No entries yet — no known issues recorded before first production use.

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | Single B2C user, one account, no sharing. |
| Recurring manual steps | Nightly backup verification; periodic dependency updates and restore test (above). |
| Seasonal / traffic patterns | Evening use (meal planning); no 24/7 demand. |
| Dependencies with known instability | None — no external services in v1 (Q-007). |
| Data retention jobs | None needed in v1 — private recipe photos (Q-008) are kept with the account, not purged. |

---

## Maintenance checklist (Ch. 24 §24.9)

Run after each release, after each serious production issue, and before asking an AI agent
to make a major change to an existing system.

| Maintenance check | Done? |
|---|---|
| Key workflows have monitoring requirements. | Yes — plan → one list (REQ-F-004), recipe save, sign-in |
| Errors are grouped and reviewed by severity. | Yes — error alerts on the log events |
| Logs include request IDs and useful context. | Yes — and never the leak-list fields (REQ-NF-007; Q-012) |
| Performance targets exist for important workflows. | Owner-perceived responsiveness (no metrics dashboard — Q-016) |
| User feedback is mapped to requirements or decisions. | Not yet — no production use before first release |
| Specs are updated after production behavior changes. | Yes — via the spec-change-log |
| New or changed behavior has matching tests. | Yes — ATEST/UTEST/ITEST/STEST/PTEST/ETEST/FTEST |
| AI agent instructions use the current spec, not outdated context. | Yes — refresh the context pack before each agent task |
| Spec drift review is completed before major changes. | Yes — see [`spec-drift-checklist.md`](spec-drift-checklist.md) |

---

## What to update when behavior changes (Ch. 3 §3.9)

| Change type | Artifact to update |
|---|---|
| A new user behavior is added. | `01-docs/02-requirements/requirements.md` and `01-docs/03-product-spec/product-spec.md` |
| A data field or relationship changes. | `01-docs/04-technical-spec/technical-spec.md` and `01-docs/06-api-and-data-design/database-design.md` |
| A new security rule is added. | `01-docs/02-requirements/requirements.md`, `01-docs/07-security-and-reliability/security-specification.md`, test plan |
| A bug reveals missing expected behavior. | Requirement, test plan, `05-review/debugging-specification.md` |
| Deployment process changes. | `deployment-checklist.md` and this file |

> **Maintenance rule:** when behavior changes, update the spec. If the spec does not change
> with the system, it slowly stops being useful.

---

## Areas to watch (Ch. 27 §27.10)

| Area | What to watch | Action | Spec update required? |
|---|---|---|---|
| Correctness | The plan → one-list result is wrong or incomplete. | Investigate the aggregation rules (REQ-F-004). | Yes, if meaning changes. |
| Performance | A slow save or slow list. | Review only the slow action. | Yes, if limits or targets change. |
| Error tracking | `RECIPE_SAVE_FAILED`, `LIST_GENERATION_FAILED`, `AUTH_REQUIRED`, backup failure. | Classify cause and create fix tasks. | Yes, if new error states appear. |
| User feedback | Confusing UI, missing steps. | Convert repeated feedback into requirements. | Yes, when accepted into the roadmap. |
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
