# Production Readiness Checklist

> Source: Ch. 28 §28.12.
> Run once, before the **first** published release. Not per release — that is
> [`deployment-checklist.md`](deployment-checklist.md).

**Target release:** v1.0 · **Status:** Not started

---

## Governance is real, not documented

- [ ] All 14 fitness functions run in CI and **block the merge**
- [ ] Each has been **seen to fail** against a deliberately broken input
- [ ] FF-009 excludes `ci/`, `.github/`, `03-tests/` by path — and that exclusion is deliberate, not accidental
- [ ] Every ADR's Compliance field names a fitness function or a named human reviewer
- [ ] Every rule in `adr-index.md` appears verbatim in `AGENT.md`

> **Until a fitness function actually runs and fails a build, it is a document.** This block
> is the difference between the workspace being governance and being paperwork.

## The product does what it claims

- [ ] A full intake completes on a clean repository, on **each** supported platform
- [ ] Resume works at **all eight** stages (FF-003 — 8/8, not a sample)
- [ ] Validation reports **12 of 12 ran**, and a broken workspace reports **failed**
- [ ] Express depth produces a thinner workspace with every structural rule intact
- [ ] **ETEST-003 passes** — a fresh session given the hand-off restates the task, lists files, and waits
- [ ] The 36 eval scripts pass their deterministic floors
- [ ] All 4 must-refuse and 6 adversarial cases behave as specified — including **EV-027**, where the intake proceeds normally

## The boundary holds

- [ ] All 12 denial tests pass, and each was seen to fail without the boundary layer
- [ ] Path traversal rejected after normalisation; `specimen/` rejected as a prefix collision
- [ ] A full run leaves every file outside `spec/` byte-identical
- [ ] An existing root `CLAUDE.md` is unchanged **and was never proposed for modification**
- [ ] An existing `.gitignore` is unchanged
- [ ] No blanket write permission requested at any point
- [ ] No `.env` or secret file read
- [ ] Zero outbound network requests during a full intake (ETEST-011)

## Recovery

- [ ] **A restore has been performed from a clean machine, and timed** — [`backup-and-recovery.md`](backup-and-recovery.md) §5
- [ ] The restore-test log has its first dated row
- [ ] The repository is pushed to a remote, and the push cadence matches the stated RPO of ~1 day

> **A backup nobody has restored is not a backup.** This is one of the three things in the
> hand-off that only a human can do, and it is the one most often deferred past launch.

## Release mechanics

- [ ] The scheduled CI install test runs against the **published** artifact and alerts on failure
- [ ] Rollback triggers and thresholds reviewed; owner named
- [ ] **An announcement channel exists** — currently `[TODO]` in `rollback-plan.md`, and needed *before* the first incident
- [ ] Version numbering agreed against the semver table
- [ ] The migration-note procedure is written down where a releaser will actually see it

## Open questions that must close first

- [ ] **Q-007 — licence and attribution** for blueprints derived from a published method. **This is a release blocker, not a formality**, and nothing in the build will ever fail because of it (RISK-013)
- [ ] **Q-002 — SM-2 is unmeasurable under CON-007.** Drop it, replace it, or qualify the privacy promise. It cannot stay as an unmeasurable success metric
- [ ] The `todo_density` threshold — set from the first ten real runs, not guessed
- [ ] CI provider chosen, with a cost ceiling and alert threshold
- [ ] The intake command name is final and consistent across every document

## Deliberately not on this list

| Usual item | Why |
|---|---|
| Load test passed | Nothing serves load. |
| Monitoring and alerting configured | None possible (CON-007). The scheduled install test is the only detector that exists. |
| Runbook for on-call | Nothing runs; nobody is on call. |
| Secrets rotated and stored | The kit holds none. |
| Health checks and dashboards | No process. |
| Capacity planning | One machine per run, under 50 users. |

---

## The three that will actually decide whether v1 is ready

1. **ETEST-003.** Everything else proves the kit produces a well-formed workspace. This is the
   only test that proves the workspace *works* — that a session which was never present for
   the interview acts on it correctly. If it fails, the product is a document generator.
2. **The manual smoke test, answered cold.** Step 3 of the smoke procedure — a person who does
   not know the answers, answering the interview honestly. The only detector for RSK-1, and
   the only test in this entire workspace that cannot be automated.
3. **Q-007.** A legal question on a technical checklist, which is exactly why it will be
   forgotten. No build will ever fail because of it.

> Blueprint: ../../../spec-driven-template/07-ops/01-deployment/production-readiness-checklist.md
