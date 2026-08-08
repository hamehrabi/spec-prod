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
| Key workflows have monitoring requirements. | Yes — pending the Q-020 appetite |
| Errors are grouped and reviewed by severity. | No — begins with the first release |
| Logs include request IDs and useful context. | Yes — specified in reliability §7 |
| Performance targets exist for important workflows. | Yes — REQ-NF-001 |
| User feedback is mapped to requirements or decisions. | No — no users yet |
| Specs are updated after production behavior changes. | No behavior exists yet |
| New or changed behavior has matching tests. | Yes — by the Round 7 plan |
| AI agent instructions use the current spec, not outdated context. | Yes |
| Spec drift review is completed before major changes. | No — first one is due after the first release |

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

> Blueprint: blueprints/07-ops/03-maintenance/spec-drift-checklist.md
