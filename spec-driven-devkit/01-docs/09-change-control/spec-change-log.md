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

### After implementation began — authorised by the kit author, 2026-08-03

*The first spec change not made by the intake. Every row below records something the
implementation **learned**, not something it wished the specification said.*

| Date | Artifact | Change | Reason | Version |
|---|---|---|---|---|
| 2026-08-03 | `decisions.md` | +DD-014…DD-019 | Six decisions the tasks could not proceed without: command name, payload location, test location, CI provider, test runner, install-test cadence | **v1.1** |
| 2026-08-03 | `open-questions.md` | Q-008, Q-009, Q-010, Q-011, Q-012, Q-022 closed; **Q-007 escalated**; "four that block release" → three | Five were answered by the kit author when the tasks stopped and asked; Q-022 was answered by running the scan. Q-007 stopped being pending the moment the repository went public | **v1.1** |
| 2026-08-03 | `traceability.md` | Four code links filled; three gap rows added | First implemented requirements. The new gaps are the spec's self-contradiction on payload location, the Windows-only platform evidence, and the do-not-change catch-22 | **v1.1** |
| 2026-08-03 | `debugging-specification.md` | **+BUG-001**, in full | FF-001 computed two independent thresholds over one filtered set. Found by UTEST-013 while it was being written | **v1.1** |
| 2026-08-03 | `AGENT.md` | +3 rows in "Lessons from past mistakes" | The table was empty because nothing had been built. It is not any more | **v1.1** |
| 2026-08-03 | `fitness-functions.md` | CI provider and command filled; "What the register caught" gains 3 rows | Q-010 closed. The register's first entry is it catching **itself** being narrower than its written threshold | **v1.1** |
| 2026-08-03 | `cicd-pipeline.md`, `runtime-and-scale.md` §4, `executable-tests.md` | Five `[TODO]` markers closed | Each was waiting on Q-010, Q-011, or Q-012. A closed decision contradicted by an open `[TODO]` elsewhere is drift of exactly the kind this file exists to catch | **v1.1** |
| 2026-08-03 | `task-index.md`, `CLAUDE.md`, `context-pack.md` | TASK-001/002 marked Done; entry point's stage, version, and commands filled; context pack moved to TASK-003 | Stage changed, so the map has to | **v1.2** / **v1.1** |
| 2026-08-03 | `decisions.md` | **+DD-021** — checksums over raw bytes, with the payload pinned to LF | TASK-021's stop condition requires a *stated* rule about what is checksummed. The problem was live: the working tree held CRLF while Git stored LF, so FF-017 would have passed locally and failed on its first push | **v1.3** |
| 2026-08-03 | `traceability.md`, `task-index.md` | REQ-F-042 linked to `MANIFEST.md` and `integrity.md`; TASK-021 marked Done | TASK-021 landed. The row records that only the **pre-write** half is reachable — the end-of-run re-check needs something to have been written first | **v1.3** |
| 2026-08-03 | `fitness-functions.md` | "What the register caught" gains 2 FF-017 rows | The first is a genuine catch, not a drill: the line-ending defect would have shipped a check that was red everywhere and meaningful nowhere | **v1.2** |
| 2026-08-04 | **`api-specification.md` C2**, `unit-tests.md` UTEST-014 | The back-link **names** a blueprint instead of linking to it relatively (**DD-022**) | **A contract clause changed, so it is recorded first.** C2 promised a link that "resolves at the correct relative depth". In a developer's repository it cannot: the library is in the version-stamped plugin cache, so the link resolved nowhere on every machine but the kit author's. C2 now describes what the back-link can actually guarantee. UTEST-014's miscount became impossible by construction rather than tested for | **v1.1** / **v1.2** |
| 2026-08-04 | `decisions.md` | **+DD-022** | The back-link is written once into every generated file and never updated, so getting it wrong is permanent and breaking to change | **v1.4** |
| 2026-08-04 | `debugging-specification.md`, `AGENT.md` | **+BUG-003**, +1 lesson row | Three blueprints had broken C2's "always last" guarantee, and ADR-003 would have silently deleted 224 lines of real guidance. The lesson is general: **a contract needs a test on the side that promises, not only the side that relies** | **v1.2** |
| 2026-08-04 | `traceability.md`, `task-index.md` | REQ-F-016/018/019/027 linked; TASK-005 marked Done | The fill procedure landed | **v1.5** |
| 2026-08-04 | `debugging-specification.md`, `AGENT.md` | **+BUG-004**, +1 lesson row | **The first end-to-end run wrote two shell scripts into a developer's repository, before the preamble.** Not because the boundary was ignored — because `integrity.md` demanded a check it supplied no means for, and nothing forbade the kit creating working files of its own. The general lesson: an instruction that specifies only an outcome will be satisfied by whatever the reader can reach for | **v1.3** |
| 2026-08-04 | `traceability.md`, `task-index.md` | REQ-F-038/039/041 linked; TASK-020 marked Done | The acceptance gate landed. Recorded with its limit: the gate is specified and blocking, but **ETEST-013 and ETEST-014 ×8 need a multi-round run and a resume path**, and neither exists before TASK-007/TASK-008 | **v1.7** |
| 2026-08-04 | `traceability.md` | The rule-versus-run gap row rewritten; **+1 row for STEST-006** | The gap predicted at TASK-004 came true at the first opportunity. Recording that it was *correctly named and not closed in time* is more useful than recording that it is now fixed | **v1.6** |
| 2026-08-03 | `traceability.md`, `task-index.md` | Six REQ rows linked to `boundary.md`; TASK-004 marked Done; **+1 gap row** | TASK-004 landed. The gap row is the important half: six denials are verified against the *rule*, three against a *run* that does not exist yet. REQ-F-025 is marked **Needs update** rather than Approved for exactly that reason | **v1.4** |
| 2026-08-03 | `decisions.md` | **+DD-020** — the library ships 79 Markdown blueprints; six non-Markdown artifacts are dropped | TASK-003 hit a real conflict: ADR-002/FF-009 require a Markdown-only payload, and six genuine blueprints are not Markdown. Kit author chose to drop them | **v1.2** |
| 2026-08-03 | `open-questions.md` | **+Q-024**, blocking TASK-005 | DD-020 leaves **REQ-NF-002 with no implementation path**. Recorded as a live conflict rather than a quiet exception | **v1.2** |
| 2026-08-03 | `traceability.md` | REQ-NF-002 → **Needs update**; +2 gap rows | A requirement whose tests will now fail. They keep their tests deliberately — a passing suite would mean the gap had been papered over | **v1.2** |

**What was NOT changed, deliberately:** no requirement, no acceptance criterion, no ADR, and
no threshold. Nothing above weakens a rule to match what was built — the one spec change the
implementation *would* have benefited from (loosening TASK-001's "nothing else" so the
preamble could explain that this version stops there) was left alone, and recorded as a risk
in the report instead.

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
