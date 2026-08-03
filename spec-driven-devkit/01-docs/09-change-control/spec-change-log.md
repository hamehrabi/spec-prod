# Specification Change Log

> Source: Ch. 30.
> Version history of the **specifications themselves** — distinct from `change-log.md`
> (what changed in the product) and `maintenance-log.md` (what was done to keep it healthy).

---

## Artifact versions

All at **v1.0**, created 2026-08-03 by the eight-round intake.

| Artifact | Version | Last changed | Changed by |
|---|---|---|---|
| `intent.md`, `project-brief.md`, `constraints-and-non-goals.md`, `subdomain-map.md`, `open-questions.md` | v1.0 | 2026-08-03 | Intake R1–R2 |
| `requirements.md` | **v1.3** | 2026-08-03 | R3 created; R4 added REQ-F-033/034; R6 added REQ-F-035/036/037 |
| `driving-characteristics.md` | v1.0 | 2026-08-03 | R4, after one push-back |
| `product-spec.md`, `frontend-component-spec.md` | v1.0 | 2026-08-03 | R4 |
| `technical-spec.md`, `fitness-functions.md`, `runtime-and-scale.md` | v1.0 | 2026-08-03 | R5–R6 |
| `ADR-001` … `ADR-005`, `adr-index.md`, `decisions.md` | v1.0 | 2026-08-03 | R5 |
| `database-design.md` | **v1.2** | 2026-08-03 | R3 created; R4 fixed the folder name; R5 closed the version-stamp `[TODO]` |
| `api-specification.md`, `data-and-integration-spec.md` | v1.0 | 2026-08-03 | R5–R6 |
| `security-specification.md`, `reliability-specification.md`, `ai-boundary-spec.md` | v1.0 | 2026-08-03 | R6 |
| All of `03-tests/` | v1.0 | 2026-08-03 | R7 |
| All of `02-tasks/` | v1.0 | 2026-08-03 | R7 |
| `traceability.md` | v1.0 | 2026-08-03 | R7 |
| All of `05-review/`, `06-agent/`, `07-ops/` | v1.0 | 2026-08-03 | R8 |
| `CLAUDE.md` | v1.0 | 2026-08-03 | Written last |

---

## What changes each artifact, who approves, what evidence is needed

| Artifact | Changed by | Approved by | Evidence required |
|---|---|---|---|
| `intent.md` | A change in who this is for or what problem it solves | Kit author | The old statement and why it no longer holds |
| `constraints-and-non-goals.md` | A constraint being lifted or added | Kit author | **Which ADRs the change invalidates.** CON-003 and CON-006 each hold up several |
| `subdomain-map.md` | Evidence about where effort actually went | Kit author | Real intakes, not a hunch — this is Q-003 |
| `requirements.md` | A new requirement, or one proven untestable | Kit author | The acceptance criterion, and the test that will prove it |
| `driving-characteristics.md` | A driver being swapped | Kit author | **The rejected list, updated.** Three in, one out; never four |
| ADRs | **Never edited.** Superseded only | Kit author | A new ADR naming what it supersedes and what changed |
| `fitness-functions.md` | A new driver, or a measure proven uncomputable | Kit author | The threshold, and a demonstration that the check **fails** on a broken input |
| `security-specification.md` | A new actor or a new boundary | Kit author | A **deny** test per new **No**, seen to fail |
| Test files | A new requirement, or a defect | Kit author | For a defect: a test that failed against the unfixed version |
| Task files | A new task, or a boundary correction | Kit author | Both file lists, and a stop condition |
| `traceability.md` | Any of the above | Kit author | Blank cells still deliberate and named |
| `CLAUDE.md` | Structure or stage changing | Kit author | Every path re-verified; still under 100 lines |

---

## Change entries

| Date | Artifact | Change | Reason | Version |
|---|---|---|---|---|
| 2026-08-03 | All | Created by the eight-round intake | New project | v1.0 |
| 2026-08-03 | `requirements.md` | +REQ-F-033/034, +AC-031/032 | Express mode accepted as a **parameter** (SC-001) | v1.1 |
| 2026-08-03 | `requirements.md` | +REQ-F-035/036/037, +AC-033/034/035 | Round 6: `spec/` committed · folder collision · retry-once | v1.2 |
| 2026-08-03 | `database-design.md` | Folder name fixed from `[TODO]` to `spec/` | Round 4 closed it | v1.1 |
| 2026-08-03 | `database-design.md` | Version-stamp `[TODO]` closed | ADR-005 | v1.2 |
| 2026-08-03 | `constraints-and-non-goals.md` | CON-008 filled | Round 7 settled who builds it | v1.1 |
| 2026-08-03 | `requirements.md` | CON-008 row updated | As above | v1.3 |
| 2026-08-03 | `requirements.md` | +REQ-F-038…043, +AC-036…044 | **Acceptance gate (SC-009), blueprint coverage (SC-010), blueprint integrity (SC-011)** | **v1.4** |
| 2026-08-03 | `architecture-decisions/` | **+ADR-006** — acceptance recorded in the workspace, not a state file | The gate introduced real state; ADR-004 forbids state files. ADR-006 **extends** ADR-004 rather than superseding it | v1.1 |
| 2026-08-03 | `fitness-functions.md` | +FF-015, FF-016, FF-017, FF-018 | Coverage · acceptance rows · library integrity · library-driven outputs | v1.1 |
| 2026-08-03 | `technical-spec.md` | +checks 13, 14, 15; data-flow and progress-model rows | The validation list grew from 12 to 15 | v1.1 |
| 2026-08-03 | `frontend-component-spec.md` | +`StageReview` interaction unit, fully specified | The gate is an interface, and its empty state is the one most likely to be got wrong | v1.1 |
| 2026-08-03 | `product-spec.md` | +2 scope rows, +Flow 9, +Flow 10 | As above | v1.1 |
| 2026-08-03 | `database-design.md` | +2 entities (stage acceptance, manifest entry); §0 note on how the no-state-file rule held | The gate tested ADR-004 and it bent without breaking | **v1.3** |
| 2026-08-03 | `reliability-specification.md` | +2 failure states (`WRITTEN_BUT_UNACCEPTED`, `LIBRARY_INTEGRITY_FAILED`) | Nine named states became eleven | v1.1 |
| 2026-08-03 | All of `03-tests/` | +24 test IDs | Every new requirement got tests **before** any task was written | v1.1 |
| 2026-08-03 | `task-index.md` | +TASK-020 (P0), TASK-021 (P0), TASK-022 (P1) | Two are P0: the gate changes what a round means; integrity must precede the fill procedure | v1.1 |

---

## The rule that matters most

> **When reality changes, the specification changes first — then the tests, then the code.**

The reverse order is drift, and in this project it has a specific shape worth naming: **`spec/`
in this repository is never edited to make a task pass.** If the implementation cannot satisfy
the specification, either the specification is wrong (change it deliberately, and record it
here) or the implementation is wrong (fix it). Silently adjusting the spec to match what was
built is the failure the whole method exists to prevent — and it would be a particularly
embarrassing one for a product that sells the discipline.

> Blueprint: ../../../spec-driven-template/01-docs/09-change-control/spec-change-log.md
