# Maintenance and Spec Drift Checklist

> Source: Appendix Q + Ch. 24 §24.8–24.9.
> **Spec drift** happens when production behavior changes but the specification does not.
> It is dangerous because your next change, your next prompt, and your next AI-assisted
> task will be based on outdated truth.

> **Code must not move ahead of the spec.** When behavior changes, record it in the
> spec-change-log at
> [`../../01-docs/09-change-control/spec-change-log.md`](../../01-docs/09-change-control/spec-change-log.md),
> and keep the trace intact through the REQ / TEST / TASK identifiers.

---

## After every release (Appendix Q)

- [ ] Update requirements to reflect accepted changes (REQ-F-001..006, REQ-NF-001..007, REQ-R-001, BR-001..004).
- [ ] Update API, database, and technical specs if contracts changed.
- [ ] Update the traceability matrix with released test evidence (ATEST/UTEST/ITEST/STEST/PTEST/ETEST/FTEST).
- [ ] Record architecture decisions that changed the design direction (ADR-001/002).
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
| Code behavior does not match acceptance criteria. | The code changed without a spec update, or the requirement was wrong. | Compare production behavior with the requirement (REQ/BR ids) and choose the correct source of truth; log in the spec-change-log. |
| Tests pass but the cook complains. | The tests may not cover the real expectation. | Update acceptance criteria and add a test (ATEST/FTEST/…). |
| AI agent suggests changes outside scope. | The context or task instruction may be too broad. | Narrow the task (cite the TASK-001..006 boundary) and restate the limits. |
| A bug fix creates new workflow behavior. | The fix changed product behavior, not just code. | Update the product spec, technical spec, and tests; record in the spec-change-log. |

---

## Drift audit

| # | Behavior in production | What the spec says | Which is correct? | Action | Owner | Status |
|---|---|---|---|---|---|---|

No entries yet — the first drift audit runs after the first release.

---

## Maintenance areas to watch (Ch. 27 §27.10)

| Area | What to watch | Action | Spec update required? |
|---|---|---|---|
| Correctness | The plan → one-list result is wrong or incomplete (REQ-F-004). | Investigate the aggregation rules. | Yes, if meaning changes. |
| Performance | Slow save or slow list. | Review only the slow action. | Yes, if limits or targets change. |
| Error tracking | `RECIPE_SAVE_FAILED`, `LIST_GENERATION_FAILED`, `AUTH_REQUIRED`, backup failure. | Classify cause and create fix tasks. | Yes, if new error states appear. |
| User feedback | Confusing UI, missing steps, new requests. | Convert repeated feedback into requirements. | Yes, when accepted into the roadmap. |
| **Spec drift** | Code behavior no longer matches requirements. | Update specs or refactor code to match approved behavior. | **Always.** |

---

## The production rule (Ch. 24 §24.1)

> Every meaningful production lesson should answer one question:
> **does the spec still describe the system you need to maintain?**

A code fix without a spec update solves today's bug and creates tomorrow's confusion.

---

> Blueprint: blueprints/07-ops/03-maintenance/spec-drift-checklist.md
