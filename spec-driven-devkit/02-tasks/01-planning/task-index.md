# Task Index

> Source: Ch. 4 §4.9 (Step 5) — "Create `task-index.md` so every future task has a record."
> Keeping tasks as separate files creates a useful history of what the project attempted.
> It makes review easier and prevents the same unclear request from being repeated.

**Sequencing:** thin vertical slices (Round 7). **Owner:** an AI coding agent, one task at
a time, directed by one developer (CON-008).

> **What "vertical slice" means in a project with no runtime.** Every task below leaves the
> kit **installable and runnable** at the end of it. TASK-001 produces a plugin that installs,
> runs, and prints one thing. Each later task widens what that same command does. There is no
> point at which the kit exists but does not work — which is what makes each task reviewable
> by *using* it, not only by reading it.

---

| Task ID | Title | Requirement | Priority | Depends on | Status | Owner | Test IDs |
|---|---|---|---|---|---|---|---|
| TASK-001 | Plugin skeleton: manifest, one command, preamble | REQ-F-001, REQ-F-002, REQ-F-004 | **P0** | — | **Done** | agent | ATEST-001, ATEST-002, ATEST-004, UTEST-001, TEST-001, TEST-002 |
| TASK-002 | CI gate skeleton — FF-001, FF-002, FF-009 | ADR-001, ADR-002, REQ-NF-005 | **P0** | TASK-001 | **Done** | agent | UTEST-013, UTEST-024, TEST-017 |
| TASK-003 | Package the blueprint library, read-only | REQ-F-003, REQ-NF-008 | **P0** | TASK-001 | **Done** | agent | ATEST-003, TEST-003, FTEST-004, STEST-012 |
| TASK-004 | **The boundary layer** — path check, collisions, protected files | REQ-F-014, REQ-F-024, REQ-F-026, REQ-F-035, REQ-F-036, SEC-Z-001 | **P0** | TASK-001 | **Done** — *rule verified; run-level denials landed with TASK-006* | agent | UTEST-019, STEST-002…008, STEST-013, FTEST-003, FTEST-007, FTEST-008 |
| TASK-005 | The fill procedure — copy, strip, fill, mint, back-link | REQ-F-016, REQ-F-018, REQ-F-019, REQ-F-027, ADR-003 | **P0** | TASK-003 | **Done** | agent | UTEST-014, UTEST-016, UTEST-017, UTEST-020, TEST-005…008, TEST-014 |
| TASK-006 | **Round 1 end to end** — ask, write three files, summarise | REQ-F-005…008, REQ-F-015 | **P0** | TASK-004, TASK-005 | **Done** — *verified on a real repository* | agent | ATEST-005…008, ATEST-016, UTEST-002…005, ETEST-008, PTEST-001 |
| TASK-007 | Resume — derive stage by inspection | REQ-F-028, REQ-NF-003 | **P1** | TASK-006 | **Done** | agent | ATEST-032, UTEST-021, **ETEST-009 (×8)**, FTEST-001, FTEST-011, FTEST-016 |
| TASK-008 | Rounds 2–4 — scope, roles and data, product shape | REQ-F-012, REQ-F-013, REQ-F-017 | **P1** | TASK-006 | **Done** | agent | ATEST-012, ATEST-013, ATEST-018, UTEST-010, UTEST-011, UTEST-015 |
| TASK-009 | Rounds 5–6 — architecture, security and reliability | REQ-F-021, REQ-F-022 | **P1** | TASK-008 | **Done** | agent | ATEST-022, ATEST-023, TEST-010, TEST-011 |
| TASK-010 | Rounds 7–8 — tasks, tests, operations | REQ-R-005 | **P1** | TASK-009 | **Done** | agent | ATEST-040, TEST-018 |
| TASK-011 | Inference and contradiction detection | REQ-F-009, REQ-F-010, REQ-F-011 | **P1** | TASK-008 | **Done** | agent | ATEST-009…011, UTEST-006…009, ETEST-005, ETEST-006, FTEST-010, FTEST-014 |
| TASK-012 | Validation — twelve checks, retry once, not-run reporting | REQ-F-029, REQ-F-037 | **P1** | TASK-010 | **Done** | agent | ATEST-024, ATEST-033, UTEST-018, UTEST-022, TEST-015, FTEST-005, FTEST-006 |
| TASK-013 | Entry point written last, under 100 lines, version stamped | REQ-F-020, REQ-NF-009, ADR-005 | **P1** | TASK-012 | **Done** | agent | ATEST-021, TEST-009, ETEST-001, FTEST-017 |
| TASK-014 | Closing report and hand-off block | REQ-F-030, REQ-F-031 | **P1** | TASK-013 | **Done** | agent | ATEST-034, ATEST-035, ETEST-010, **ETEST-003** |
| TASK-015 | Express depth as a parameter on the one flow | REQ-F-033, REQ-F-034 | **P1** | TASK-011 | **Done** | agent | ATEST-014, UTEST-012, UTEST-013, ETEST-007 |
| TASK-016 | Golden fixtures and the eval harness | `ai-evals.md` | **P1** | TASK-014 | **Partly done** — *harness built; EV-001 produced by a real eight-round run; 35 cases enumerated and deliberately not built* | agent | **EV-001**, ETEST-011, ETEST-012 |
| TASK-017 | Round progress indicator | REQ-F-032 | P2 | TASK-011 | **Done** | agent | ATEST-036 |
| TASK-018 | Cross-platform verification on all three OSes | REQ-NF-008 | P2 | TASK-016 | **Partly done** — *Step 0 runs on all three in CI; FTEST-009 written; ETEST-012 blocked on hardware, not on work* | agent | ETEST-012 (×3), **FTEST-009** |
| **TASK-020** | **The stage acceptance gate** — present, then accept / revise / stop | REQ-F-038, REQ-F-039, REQ-F-041, ADR-006 | **P0** | TASK-006 | **Done** — *resume half landed with TASK-007 (ETEST-009 x8)* | agent | ATEST-041…043, ATEST-045, UTEST-026…029, **ETEST-013**, **ETEST-014 (×8)**, FTEST-019, FTEST-022, STEST-016 |
| **TASK-021** | **Blueprint integrity manifest and verification** | REQ-F-042 | **P0** | TASK-003 | **Done** | agent | ATEST-046, UTEST-030, FTEST-020, STEST-015, ETEST-015 |
| **TASK-022** | **Blueprint coverage — every template used or recorded as skipped** | REQ-F-040, REQ-F-043 | **P1** | TASK-012, TASK-021 | **Done** | agent | ATEST-044, ATEST-047, UTEST-031, TEST-019, FTEST-021, ETEST-015 |
| TASK-019 | Two-sessions-in-one-repo concurrency | — | **P3 — blocked** | — | **Blocked** | — | — |

**Status values:** Not started · In progress · Blocked · In review · Done · Rejected

**Priority (Ch. 14 §14.5):**

| Priority | Meaning | Applied here |
|---|---|---|
| P0 | Must exist before related work can begin. | Nothing can be written safely until the boundary layer and the fill procedure exist. |
| P1 | Required for the feature to be usable. | The remaining rounds, resume, validation, and the hand-off. |
| P2 | Useful improvement after core behavior works. | Progress indicator; the three-platform matrix run. |
| P3 | Future or polish item. | The concurrency question, which has no requirement yet. |

> When using an AI agent, start with P0 and P1. Do not give it P2 or P3 work until the
> foundation is implemented, tested, and reviewed.

**TASK-019 is blocked and deliberately visible.** Two Claude Code sessions open on the same
repository would both write to `spec/`, with no lock and no state file to hold one (ADR-004
forbids it). Nobody has checked what happens. It has **no requirement**, so it stays P3 and
unassigned until it passes through
[`scope-change-log.md`](../03-control/scope-change-log.md). Recorded in
[`edge-cases-and-failures.md`](../../03-tests/04-failure/edge-cases-and-failures.md) as
*"the one that was nearly missed"*.

---

## Dependency map

Draw the build order. If a task cannot be *tested correctly* without an earlier task,
there is a dependency (Ch. 14 §14.4).

```
TASK-001 (plugin skeleton: install, invoke, print)
    ├── TASK-002 (CI gate: FF-001, FF-002, FF-009)     <- keeps ADR-002 honest from day one
    ├── TASK-003 (blueprint library, read-only)
    │       └── TASK-005 (fill procedure)
    │                  └── TASK-006 (ROUND 1 END TO END)   [needs 004 + 005]
    └── TASK-004 (boundary layer)                          <- MUST precede any write
                       └── TASK-006
                              ├── TASK-007 (resume)
                              ├── TASK-008 (rounds 2-4)
                              │       ├── TASK-009 (rounds 5-6)
                              │       │       └── TASK-010 (rounds 7-8)
                              │       │              └── TASK-012 (validation)
                              │       │                     └── TASK-013 (entry point)
                              │       │                            └── TASK-014 (report + handoff)
                              │       │                                   └── TASK-016 (evals)
                              │       └── TASK-011 (inference + contradiction)
                              │              ├── TASK-015 (express depth)
                              │              └── TASK-017 (progress indicator)   [P2]
                              └── TASK-018 (three-platform run)                  [P2]
```

### Where the three added tasks slot in

```
TASK-003 (blueprint library)
    └── TASK-021 (INTEGRITY MANIFEST)          P0 - before anything reads a blueprint
              └── TASK-005 (fill procedure)
TASK-006 (Round 1 end to end)
    └── TASK-020 (ACCEPTANCE GATE)             P0 - changes what "a round" means
              └── TASK-008 ... (later rounds inherit the gate)
TASK-012 (validation)
    └── TASK-022 (BLUEPRINT COVERAGE)          P1 - checks 13 and 15
```

**TASK-021 is P0 and sits before TASK-005**, because a fill procedure that reads an
unverified library can produce a specification that is subtly wrong and entirely
plausible — the worst failure this product has.

**TASK-020 is P0 rather than P1** because it changes the definition of a round. Retrofitting
a gate after five rounds already exist means revisiting each of them.

### The one ordering that is not negotiable

**TASK-004 (the boundary layer) precedes TASK-006 (the first write).** Not for tidiness — a
kit that can write before it can refuse to write is a kit that will write in the wrong place
during its own development, on the developer's own repository. The denial tests
(STEST-002…008) exist before the first file is ever created.

The second deliberate ordering is **TASK-002 (CI gate) at position two.** FF-009 asserts the
published payload contains no executable file. Adding it after the plugin has grown means
discovering a violation late; adding it second means ADR-002 is enforced from the first
commit that could break it.

---

## Task breakdown checklist (Ch. 14)

- [x] Each task has one clear outcome.
- [x] Each task points back to a requirement, specification, or design decision — **except TASK-019, which is why it is blocked.**
- [x] Each task has done criteria that can be checked.
- [x] Dependencies are listed before implementation begins.
- [x] P0 and P1 tasks are completed before optional improvements.
- [x] Each task says what is out of scope.
- [x] No task gives the agent permission to rewrite unrelated code — every task file carries a do-not-change list.
- [x] Tests are planned before or alongside implementation — every P0/P1 row above names its test IDs, and they were written in Round 7 before any task existed.

---

## Coverage check — every P0/P1 task has at least one test

| Task | Test count | Task | Test count |
|---|---|---|---|
| TASK-001 | 6 | TASK-009 | 4 |
| TASK-002 | 3 | TASK-010 | 2 |
| TASK-003 | 4 | TASK-011 | 10 |
| TASK-004 | **12** | TASK-012 | 7 |
| TASK-005 | 8 | TASK-013 | 4 |
| TASK-006 | 8 | TASK-014 | 4 |
| TASK-007 | **12** | TASK-015 | 4 |
| TASK-008 | 6 | TASK-016 | 38 |

**TASK-004 and TASK-007 carry the heaviest test loads, and that is correct.** One is the
boundary that everything else writes through; the other is the reliability driver, whose
measure is literally *8/8*.

> Blueprint: ../../../spec-driven-template/02-tasks/01-planning/task-index.md
