# Test Plan

> Source: Ch. 4 §4.6, Ch. 17.
> **Beginner rule:** do not ask an AI agent to build a feature until you can write at
> least three checks for it — one normal case, one edge case, one failure case.

**Feature / release:** spec-driven-devkit v1.0 — the intake command end to end
**Requirements covered:** REQ-F-001…037, REQ-NF-001…009, REQ-R-001…005, BR-001…014, SEC-A/SEC-Z
**Version:** TEST v1.0
**Depth:** **Thorough — all six levels**, including performance and full negative RBAC (Round 7)

---

## Why tests come first (Ch. 17 §17.1)

| Without test planning | With test planning |
|---|---|
| The agent decides what "done" means. | You define what "done" means before implementation. |
| Bugs are found late, often during manual review. | Expected behavior is checked early and repeatedly. |
| The code may satisfy the prompt but not the requirement. | The code must satisfy visible acceptance criteria. |
| You approve features based on appearance. | You approve features based on **evidence**. |

---

## The constraint that shapes every test here

**ADR-002 means the system is non-deterministic.** The same answers may not produce
byte-identical files. Three consequences bind every level below:

1. **Assert structure, never prose.** Headings present and in order · identifiers resolve ·
   back-links resolve · no surviving placeholder · no worked-example content · no blank
   decision rows. All computable; none a judgement.
2. **Golden workspaces are fixtures, not expected outputs.** They are checked *against the
   structural rules*, never diffed byte-for-byte. A byte diff would be permanently red and
   therefore permanently ignored.
3. **Where a threshold is genuinely a judgement** — is this specification deep enough? — say
   so and score it against a floor. That is [`ai-evals.md`](../03-non-functional/ai-evals.md),
   and pretending it can be an equality assertion produces a suite that measures nothing.

**And the weakness to state plainly:** the validation the developer runs is itself
instruction-driven, so it shares the failure mode of the thing it checks. The CI fitness
functions are the independent check. Neither replaces the other.

---

## Test strategy by level

| Level | What it checks | Where it lives | File |
|---|---|---|---|
| Unit | One rule of the intake behaves correctly — an inference rule, a depth rule, one step of the fill procedure. | `05-executable/unit/` | [unit-tests.md](../02-functional/unit-tests.md) |
| Integration | Blueprint → generated artifact: structure preserved, example stripped, placeholders gone, back-link resolves. | `05-executable/integration/` | [integration-tests.md](../02-functional/integration-tests.md) |
| End-to-end | A full intake from fixed answers, plus the eight resume runs. | `05-executable/end-to-end/` | [end-to-end-tests.md](../02-functional/end-to-end-tests.md) |
| Acceptance | Each acceptance criterion in `requirements.md` §6, as Given–When–Then. | — | [acceptance-tests.md](../02-functional/acceptance-tests.md) |
| Security | Every **No** in the §7.2 actor matrix, as a denial. | `05-executable/integration/` | [security-tests.md](../03-non-functional/security-tests.md) |
| Performance | The one rule that binds: no stretch longer than one round without output. | — | [performance-tests.md](../03-non-functional/performance-tests.md) |
| Failure / edge | The nine named failure states, plus the seven-questions worksheet. | `05-executable/` | [edge-cases-and-failures.md](../04-failure/edge-cases-and-failures.md) · [failure-tests.md](../04-failure/failure-tests.md) |
| **Eval** | Whether a change to a question or an instruction **helped**. | kit repo | [ai-evals.md](../03-non-functional/ai-evals.md) |
| Regression | A fixed defect does not return. | matching level | tracked in [debugging-specification.md](../../05-review/04-debugging/debugging-specification.md) |

### Test shape weighted by subdomain (BR-013)

The subdomain map sets test depth, and applying one shape everywhere is the failure this
method exists to avoid.

| Area | Subdomain | Test shape |
|---|---|---|
| **Intake: questions, inference, synthesis** | **Core** | **Pyramid — mostly unit.** Every inference rule and every depth rule gets a normal, edge, and failure case. This is where the density goes. |
| Blueprint library (packaged) | Supporting | **Reversed — acceptance only.** Every blueprint present, readable, reachable. No unit tests for a Markdown file. |
| Agent governance generation | Supporting | Acceptance, plus **one** end-to-end proving a generated `AGENT.md` names real identifiers from its own workspace. |
| Workspace validation | Supporting | One case per check, each proving the check **fails** on a deliberately broken workspace. A check that has never failed has never been tested. |
| Resume | Supporting | Reversed — mostly end-to-end. Eight runs, one per stage (FF-003). |
| Plugin packaging / distribution / file writing | **Generic** | **Contract + failure only.** Installs cleanly on three platforms; fails loudly rather than half-installing. No unit tests around adopted mechanisms. |

---

## Coverage matrix

Every requirement × every level. **Blank cells are the point — they are the deliberate
decisions, not the oversights.** A dash means *no test at this level, on purpose*.

### Functional — installation and entry

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-001 install via plugin mechanism | ATEST-001 | — | TEST-001 | ETEST-004 | — | — | FTEST-009 |
| REQ-F-002 one command starts intake | ATEST-002 | — | TEST-002 | ETEST-004 | — | — | — |
| REQ-F-003 library ships inside plugin | ATEST-003 | — | TEST-003 | — | — | — | FTEST-004 |
| REQ-F-004 preamble states round count | ATEST-004 | UTEST-001 | — | — | — | — | — |

### Functional — the interview (core subdomain: unit-heavy)

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-005 ≤4 questions per round | ATEST-005 | UTEST-002 | — | — | — | — | — |
| REQ-F-006 recommended first + reason | ATEST-006 | UTEST-003 | — | — | — | — | — |
| REQ-F-007 free text always accepted | ATEST-007 | UTEST-004 | — | ETEST-005 | — | — | — |
| REQ-F-008 one non-MCQ question | ATEST-008 | UTEST-005 | — | — | — | — | — |
| REQ-F-009 never ask the derivable | ATEST-009 | UTEST-006, UTEST-007 | — | ETEST-005 | — | — | — |
| REQ-F-010 contradiction stops + quotes both | ATEST-010 | UTEST-008 | — | — | — | — | FTEST-010 |
| REQ-F-011 hard stop at eight rounds | ATEST-011 | UTEST-009 | — | ETEST-006 | — | — | — |
| REQ-F-012 name the core subdomain | ATEST-012 | UTEST-010 | — | — | — | — | — |
| REQ-F-013 refuse >3 drivers, push back once | ATEST-013 | UTEST-011 | — | — | — | — | — |
| REQ-F-033 express depth | ATEST-014 | UTEST-012 | — | ETEST-007 | — | — | — |
| REQ-F-034 depth is a parameter, not a flow | — | UTEST-013 | — | — | — | — | — |

### Functional — generating the workspace

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-014 fixed `spec/` at repo root | ATEST-015 | — | TEST-004 | ETEST-004 | STEST-004 | — | FTEST-007 |
| REQ-F-015 write after each round | ATEST-016 | — | — | ETEST-008 | — | **PTEST-001** | FTEST-001 |
| REQ-F-016 blueprint structure + back-link | ATEST-017 | UTEST-014 | TEST-005, TEST-006 | — | — | — | FTEST-006 |
| REQ-F-017 depth scaled by subdomain | ATEST-018 | UTEST-015 | — | ETEST-007 | — | — | — |
| REQ-F-018 stable, consistent identifiers | ATEST-019 | UTEST-016 | TEST-007 | ETEST-002 | — | — | — |
| REQ-F-019 `[TODO]` never invention | ATEST-020 | UTEST-017 | TEST-008 | — | — | — | — |
| REQ-F-020 entry point written last | ATEST-021 | — | TEST-009 | ETEST-001 | — | — | — |
| REQ-F-021 deny test per permission rule | ATEST-022 | — | TEST-010 | — | — | — | — |
| REQ-F-022 fitness function per driver | ATEST-023 | — | TEST-011 | — | — | — | — |
| REQ-F-037 retry once, then flag | ATEST-024 | UTEST-018 | — | — | — | — | FTEST-006 |

### Functional — boundaries and safety (security-heavy)

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-023 never write application code | ATEST-025 | — | TEST-012 | — | STEST-001 | — | — |
| REQ-F-024 nothing outside `spec/` unasked | ATEST-026 | UTEST-019 | — | — | **STEST-002, STEST-003** | — | FTEST-003 |
| REQ-F-025 no blanket write permission | ATEST-027 | — | — | — | STEST-006 | — | — |
| REQ-F-026 existing `CLAUDE.md` untouched | ATEST-028 | — | TEST-013 | — | **STEST-007** | — | — |
| REQ-F-027 no worked-example content | ATEST-029 | UTEST-020 | TEST-014 | — | — | — | — |
| REQ-F-035 `.gitignore` untouched | ATEST-030 | — | — | — | **STEST-008** | — | — |
| REQ-F-036 non-kit `spec/` → stop and ask | ATEST-031 | — | — | — | **STEST-005** | — | FTEST-007 |

### Functional — the acceptance gate and library authority *(added after the first complete draft)*

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-038 gate blocks the next round | ATEST-041 | UTEST-026, UTEST-027 | — | **ETEST-013** | — | — | FTEST-019 |
| REQ-F-039 accept · revise · stop | ATEST-042, ATEST-043 | — | — | ETEST-013 | — | — | FTEST-022 |
| REQ-F-040 blueprint coverage | ATEST-044 | UTEST-031 | — | ETEST-015 | — | — | FTEST-021 |
| REQ-F-041 acceptance recorded in the workspace | ATEST-045 | UTEST-028, UTEST-029 | — | **ETEST-014 (×8)** | STEST-012 | — | FTEST-019 |
| REQ-F-042 blueprint integrity | ATEST-046 | UTEST-030 | — | ETEST-015 | **STEST-015** | — | FTEST-020 |
| REQ-F-043 stage outputs derived from the library | ATEST-047 | UTEST-031 | TEST-019 | — | — | — | — |

### Functional — resuming and finishing

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-F-028 resume from first incomplete stage | ATEST-032 | UTEST-021 | — | **ETEST-009 (×8)** | — | — | FTEST-001 |
| REQ-F-029 validate before reporting success | ATEST-033 | UTEST-022 | TEST-015 | — | — | — | FTEST-005 |
| REQ-F-030 closing report contents | ATEST-034 | — | — | ETEST-010 | — | — | — |
| REQ-F-031 hand-off instruction printed | ATEST-035 | — | — | ETEST-010 | — | — | — |
| REQ-F-032 round progress visible *(Should)* | ATEST-036 | — | — | — | — | — | — |

### Non-functional

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-NF-001 output within one round | — | — | — | — | — | **PTEST-001** | — |
| REQ-NF-002 no credential; `.gitignore` first | — | UTEST-023 | TEST-016 | — | **STEST-009** | — | — |
| REQ-NF-003 interrupted run resumable, not corrupt | — | — | — | **ETEST-009 (×8)** | — | — | FTEST-001, FTEST-011 |
| REQ-NF-004 usable without documentation | ATEST-037 | — | — | — | — | — | — |
| REQ-NF-005 blueprint/flow swap cost = 0 | — | UTEST-024 | TEST-017 | — | — | — | — |
| REQ-NF-006 plain text, no colour-only meaning | ATEST-038 | UTEST-025 | — | — | — | — | — |
| REQ-NF-007 zero network calls | — | — | — | **ETEST-011** | STEST-010 | — | — |
| REQ-NF-008 identical on three platforms | — | — | — | **ETEST-012 (×3)** | — | — | FTEST-009 |
| REQ-NF-009 entry point under 100 lines | ATEST-021 | — | TEST-009 | ETEST-001 | — | — | — |

### Roles and business rules

| Requirement | Acceptance | Unit | Integration | E2E | Security | Perf | Failure |
|---|---|---|---|---|---|---|---|
| REQ-R-001 four actor boundaries enforced | — | — | — | — | **STEST-001…012** | — | — |
| REQ-R-002 no write outside `spec/` unasked | — | — | — | — | **STEST-002, STEST-003** | — | FTEST-003 |
| REQ-R-003 no application source code | — | — | TEST-012 | — | **STEST-001** | — | — |
| REQ-R-004 declined write → resumable, not failed | ATEST-039 | — | — | — | STEST-011 | — | **FTEST-002** |
| REQ-R-005 task files name allowed + forbidden files | ATEST-040 | — | TEST-018 | **ETEST-003** | — | — | — |
| BR-001 never writes application code | — | — | TEST-012 | — | STEST-001 | — | — |
| BR-002 no worked-example content | — | UTEST-020 | TEST-014 | — | — | — | — |
| BR-003 `[TODO]`, never a guess | — | UTEST-017 | TEST-008 | — | — | — | — |
| BR-004 eight-round hard stop | — | UTEST-009 | — | ETEST-006 | — | — | — |
| BR-005 write after each round | — | — | — | ETEST-008 | — | PTEST-001 | FTEST-001 |
| BR-006 entry point last, under 100 lines | — | — | TEST-009 | ETEST-001 | — | — | — |
| BR-007 identifiers unique, never reused | — | UTEST-016 | TEST-007 | — | — | — | FTEST-012 |
| BR-008 write outside `spec/` needs confirmation | — | UTEST-019 | — | — | STEST-002 | — | FTEST-003 |
| BR-009 no success claim on unrun checks | — | UTEST-022 | TEST-015 | — | — | — | **FTEST-005** |
| BR-010 deny test + fitness function per rule/driver | — | — | TEST-010, TEST-011 | — | — | — | — |
| BR-011 at most three drivers | — | UTEST-011 | — | — | — | — | — |
| BR-012 contradiction quotes both | — | UTEST-008 | — | — | — | — | FTEST-010 |
| BR-013 depth by subdomain, not uniform | — | UTEST-015 | — | ETEST-007 | — | — | — |
| BR-014 nothing leaves the machine | — | — | — | ETEST-011 | STEST-010 | — | — |

### Deliberately empty cells — the decisions behind the dashes

| Pattern | Why no test there |
|---|---|
| **Almost every Performance cell** | Performance was explicitly rejected as a driver. There is no contended resource, no query, and no network. The only performance rule that binds is REQ-NF-001, and it has PTEST-001. Adding more would be measuring the host model's speed, which is not this system's. |
| **No unit tests for generic areas** (packaging, distribution, file writing) | The subdomain map says *adopt*. Unit-testing an adopted host mechanism tests the host, not the kit. Contract and failure tests only. |
| **No unit tests for the blueprint library** | It is Markdown. "Is this heading still here" is an integration concern against a generated artifact, not a unit of logic. |
| **REQ-F-032 (round progress) has acceptance only** | It is a `Should`, and a purely presentational one. If CON-002 bites, it is the first thing to cut, and a thin test row makes that cheap. |
| **REQ-F-034 has no acceptance test** | It is unobservable to a developer — "there is one code path" is a property of the built kit, not of a run. It is verified structurally by UTEST-013 and FF-001. |

---

## Quality gate before implementation (Ch. 16 §16.6)

> Before you implement a task, confirm the test plan answers this question:
> **How will I know this task works without trusting the AI agent blindly?**

- [x] Every Must requirement has at least one acceptance test — 40 acceptance tests over 37 functional requirements.
- [x] Every business rule has a test — all 14 rows above are populated.
- [x] Every role/permission boundary has a negative test — 12 denials, one per **No** in the actor matrix.
- [x] Every validation rule has an invalid-input test — including path traversal after normalisation.
- [x] Every failure state in the reliability spec has a test — nine states, FTEST-001…012.
- [x] Every contract has a shape test — C1, C2, C3 → TEST-002, TEST-005/006, ETEST-001/002/003.
- [x] Tests are written from **requirements**, not from existing code — there is no code yet, which makes this unusually easy to guarantee.

---

## Practical rules

- **End-to-end scope (Ch. 17 §17.4):** if a user would complain loudly when a flow breaks,
  that flow deserves an end-to-end test plan. Do not cover every tiny rule with E2E tests.
- **Security bias (Ch. 17 §17.5):** an agent may implement the happy path and forget the
  denial path. For every feature ask: who is allowed, who is not allowed, what input must
  be rejected, what must never be exposed?
- **Quality rule (Ch. 3 §3.6):** if you cannot describe how to test a requirement, you do
  not understand the requirement well enough yet.

### The three checks to write before TASK-001 is handed over

Per Ch. 17: one normal, one edge, one failure.

| Type | Check |
|---|---|
| **Normal** | A clean repository, default depth → `spec/` is created and Round 1's three files exist, each matching its blueprint's headings and ending in a resolving back-link. |
| **Edge** | A repository whose `spec/` exists and is not a kit workspace → **nothing is written**, `spec/` is byte-for-byte unchanged, and an alternative name is offered. |
| **Failure** | A blueprint missing from the plugin → intake stops at that file, names it, and every file written before it survives. No structure is improvised. |

> Only when these three exist does TASK-001 get handed to the agent. That is what makes the
> output reviewable rather than merely plausible.

> Blueprint: ../../../spec-driven-template/03-tests/01-plan/test-plan.md
