# Requirements Traceability Matrix (RTM)

> Source: Ch. 10 + Appendix F.
> Traceability is a **chain of evidence**. A requirement is a promise; traceability is how
> you prove the promise did not disappear while the software was being built.

Keep this file next to the requirements. If it lives in another tool, you will not
maintain it.

> **Code links are blank throughout, and that is correct.** No code exists — this workspace
> was produced before implementation, which is the whole point. Every code cell fills in as
> its task completes. **Blank cells are the point of this document.**

---

## The matrix

### Functional — installation and entry

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-F-001 | Install via the plugin mechanism | ADR-002, tech §1 | TASK-001 ✅ | ATEST-001, TEST-001 | `plugin/.claude-plugin/plugin.json` | **Approved** |
| REQ-F-002 | One command starts intake | API C1 | TASK-001 ✅ | ATEST-002, TEST-002 | `plugin/commands/spec-intake.md` (DD-014) | **Approved** |
| REQ-F-003 | Library ships inside the plugin | ADR-001, tech §2 | TASK-003 | ATEST-003, TEST-003, FTEST-004 | — | Ready |
| REQ-F-004 | Preamble states the round count | `frontend-component-spec` | TASK-001 ✅ | ATEST-004, UTEST-001 | `plugin/instructions/intake.md` | **Approved** |

### Functional — the interview (core subdomain)

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-F-005 | ≤ 4 questions per round | `frontend-component-spec` | TASK-006 ✅ | ATEST-005, UTEST-002 | `plugin/instructions/questions.md` | **Approved** |
| REQ-F-006 | Recommended first, marked, with a reason | `frontend-component-spec` | TASK-006 ✅ | ATEST-006, UTEST-003 | `plugin/instructions/questions.md` | **Approved** |
| REQ-F-007 | Free text always accepted | `frontend-component-spec` | TASK-006 ✅ | ATEST-007, UTEST-004, FTEST-015 | `plugin/instructions/questions.md` | **Approved** |
| REQ-F-008 | One non-MCQ question | `frontend-component-spec` | TASK-006 ✅ | ATEST-008, UTEST-005, FTEST-013 | `plugin/instructions/questions.md` | **Approved** |
| REQ-F-009 | Never ask the derivable | **DD-007** | TASK-011 ✅ | ATEST-009, UTEST-006/007, ETEST-005 | `plugin/instructions/inference.md` — 5 derivation rules | **Approved** — *notice names conclusion **and** source; partial narrows rather than skips* |
| REQ-F-010 | Contradiction stops, quotes both | BR-012 | TASK-011 ✅ | ATEST-010, UTEST-008, FTEST-010 | `plugin/instructions/inference.md` — contradiction rule | **Approved** — *both quoted verbatim, no default offered* |
| REQ-F-011 | Eight-round hard stop | BR-004 | TASK-011 ✅ | ATEST-011, UTEST-009, ETEST-006 | `plugin/instructions/inference.md` — the ceiling | **Approved** — *no ninth round; unknowns become open questions* |
| REQ-F-012 | Name the core subdomain | `subdomain-map` | TASK-008 ✅ | ATEST-012, UTEST-010 | `plugin/instructions/questions.md` Round 2 Q4 | **Approved** — *asked every time, even with one capability* |
| REQ-F-013 | Refuse > 3 drivers, push back once | BR-011 | TASK-008 ✅ | ATEST-013, UTEST-011 | `plugin/instructions/questions.md` Round 4 Q3 | **Approved** — *one push-back, then accept; rejects recorded* |
| REQ-F-033 | Express depth | **DD-006** | TASK-015 ✅ | ATEST-014, UTEST-012, ETEST-007 | `plugin/instructions/depth.md` — express reductions | **Approved** — *fewer questions per round; no stage deleted* |
| REQ-F-034 | Depth is a parameter, not a flow | DD-006, FF-001 | TASK-015 ✅ | UTEST-013 | `plugin/instructions/intake.md` step 0a · `commands/spec-intake.md` | **Approved** — *one command, one path; FF-001 still counts 1* |

### Functional — generating the workspace

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-F-014 | Fixed `spec/` at repo root | **ADR-004** | TASK-004 ✅ | ATEST-015, TEST-004, STEST-004 | `plugin/instructions/boundary.md` · `ci/boundary.mjs` | **Approved** — *STEST-004 now run: 0 files outside `spec/`, developer's files unchanged by checksum. It failed first (BUG-004)* |
| REQ-F-015 | Write after each round | BR-005 | TASK-006 ✅ | ATEST-016, ETEST-008, PTEST-001 | `plugin/instructions/intake.md` step 2b | **Approved** — *3 files written on a real run; PTEST-001 unmet, see BUG-005* |
| REQ-F-016 | Blueprint structure + back-link | **ADR-003**, DD-022 | TASK-005 ✅ | ATEST-017, UTEST-014, TEST-005/006 | `plugin/instructions/fill.md` steps 1–2, 6 · `ci/fill.mjs` | **Approved** |
| REQ-F-017 | Depth scaled by subdomain | BR-013 | TASK-008 ✅ | ATEST-018, UTEST-015 | `plugin/instructions/depth.md` | **Approved** — *class decides depth, never the filename* |
| REQ-F-018 | Stable, consistent identifiers | BR-007 | TASK-005 ✅ | ATEST-019, UTEST-016, TEST-007, ETEST-002 | `plugin/instructions/fill.md` step 5 · `ci/fill.mjs` `mint()` | **Approved** — *a deleted ID leaves a permanent hole* |
| REQ-F-019 | `[TODO]`, never invention | BR-003 | TASK-005 ✅ | ATEST-020, UTEST-017, TEST-008 | `plugin/instructions/fill.md` step 4 · `ci/fill.mjs` `placeholders()` | **Approved** — *TEST-008's matching `Q-###` needs TASK-012* |
| REQ-F-020 | Entry point written last | BR-006, ADR-005 | TASK-013 ✅ | ATEST-021, TEST-009, ETEST-001 | `plugin/instructions/entrypoint.md` | **Approved** — *written last; not written at all if validation did not pass* |
| REQ-F-021 | Deny test per permission rule | BR-010 | TASK-009 ✅ | ATEST-022, TEST-010 | `plugin/instructions/governance.md` — deny-test rule | **Approved** — *allow-only tests named as the characteristic failure* |
| REQ-F-022 | Fitness function per driver | BR-010 | TASK-009 ✅ | ATEST-023, TEST-011 | `plugin/instructions/governance.md` — fitness-function rule | **Approved** — *a warning is a decoration; the build must fail* |
| REQ-F-037 | Retry once, then flag | `ai-boundary-spec` §5 | TASK-012 ✅ | ATEST-024, UTEST-018, FTEST-006 | `plugin/instructions/validation.md` — retry once | **Approved** — *no third attempt; a second failure is evidence about the instruction* |

### Functional — boundaries and safety

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-F-023 | Never write application code | BR-001 | TASK-004 | ATEST-025, TEST-012, STEST-001 | — | Ready |
| REQ-F-024 | Nothing outside `spec/` unasked | BR-008, SEC-Z-001 | TASK-004 ✅ | ATEST-026, UTEST-019, STEST-002/003 | `plugin/instructions/boundary.md` (rule) · `ci/boundary.mjs` (executable check) | **Approved** — *17 path cases; the prefix check seen to fail 13 of 22* |
| REQ-F-025 | No blanket write permission | SEC-Z-002 | TASK-004 ✅ | ATEST-027, STEST-006 | `plugin/instructions/boundary.md` — stated rule only | **Needs update** — *still unevidenced. Every run so far used `--permission-mode acceptEdits`, which removes the very prompt STEST-006 exists to observe. Needs an interactive run* |
| REQ-F-026 | Existing `CLAUDE.md` untouched | **DD-011** | TASK-004 ✅, TASK-013 | ATEST-028, TEST-013, STEST-007 | `plugin/instructions/boundary.md` · `entrypoint.md` | **Approved** — *never proposed, even if offered; the exact line to add is printed instead* |
| REQ-F-027 | No worked-example content | BR-002 | TASK-005 ✅ | ATEST-029, UTEST-020, TEST-014 | `plugin/instructions/fill.md` step 2 · `ci/fill.mjs` `stripWorkedExample()` | **Approved** — *C2's "always last" now enforced by test, after BUG-003* |
| REQ-F-035 | `.gitignore` untouched | Round 6 | TASK-004 ✅ | ATEST-030, STEST-008 | `plugin/instructions/boundary.md` — protected, never proposed | **Approved** |
| REQ-F-036 | Non-kit `spec/` → stop and ask | Round 6 | TASK-004 ✅ | ATEST-031, STEST-005, FTEST-007 | `plugin/instructions/boundary.md` · `ci/boundary.mjs` — recognised by artifacts, never a marker file | **Approved** |

### Functional — acceptance gate and library authority *(added after the first complete draft)*

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-F-038 | Gate presents and blocks the next round | **ADR-006**, `StageReview` | TASK-020 ✅ | ATEST-041, UTEST-026/027, **ETEST-013** | `plugin/instructions/review.md` · `plugin/instructions/intake.md` 2d | **Approved** — *gate specified and blocking; ETEST-013 needs a multi-round run* |
| REQ-F-039 | Accept · revise · stop | `StageReview` | TASK-020 ✅ | ATEST-042/043, FTEST-022 | `plugin/instructions/review.md` — accept · revise · stop | **Approved** |
| REQ-F-040 | Blueprint coverage | FF-015, check 13 | TASK-022 ✅ | ATEST-044, UTEST-031, FTEST-021 | `plugin/instructions/coverage.md` · `ci/validation.mjs` check 13 | **Approved** — *a skip without a reason does not satisfy it* |
| REQ-F-041 | Acceptance recorded in the workspace | **ADR-006** | TASK-020 ✅ | ATEST-045, UTEST-028/029, **ETEST-014 ×8** | `plugin/instructions/review.md` · `ci/acceptance.mjs` | **Approved** — *rows, never a file; FF-016 checkable* |
| REQ-F-042 | Blueprint integrity manifest | FF-017, check 15 | TASK-021 ✅ | ATEST-046, UTEST-030, FTEST-020, **STEST-015** | `plugin/blueprints/MANIFEST.md`, `plugin/instructions/integrity.md` (DD-021) | **Approved** — *pre-write check only; the end-of-run re-check needs TASK-012* |
| REQ-F-043 | Stage outputs derived from the library | FF-018 | TASK-022 ✅ | ATEST-047, UTEST-031, TEST-019 | `plugin/instructions/coverage.md` — rounds own directories | **Approved** — *the hardcoded list is gone from `intake.md`* |

### Functional — resuming and finishing

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-F-028 | Resume from first incomplete stage | **ADR-004** | TASK-007 ✅ | ATEST-032, UTEST-021, **ETEST-009 ×8** | `plugin/instructions/resume.md` · `ci/resume.mjs` | **Approved** — *8/8 interrupt cases; the two-state check seen to fail 17 of 24* |
| REQ-F-029 | Validate before reporting success | BR-009 | TASK-012 ✅ | ATEST-033, UTEST-022, TEST-015, FTEST-005 | `plugin/instructions/validation.md` · `ci/validation.mjs` | **Approved** — *three states; all twelve seen to fail on a broken workspace* |
| REQ-F-030 | Closing report contents | `frontend-component-spec` | TASK-014 ✅ | ATEST-034, ETEST-010 | `plugin/instructions/report.md` | **Approved** — *five sections, each with a positively-stated empty case* |
| REQ-F-031 | Hand-off instruction | API C3 | TASK-014 ✅ | ATEST-035, **ETEST-003** | `plugin/instructions/report.md` — the hand-off block | **Approved** — *withheld unless validation fully passed; ETEST-003 needs a live run* |
| REQ-F-032 | Round progress visible *(Should)* | `frontend-component-spec` | TASK-017 (P2) | ATEST-036 | — | **Draft — P2, may be cut** |

### Non-functional

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-NF-001 | Output within one round | tech §8 | TASK-006 | **PTEST-001** | — | Ready |
| REQ-NF-002 | No credential; `.gitignore` first | security §5 | TASK-010 | UTEST-023, TEST-016, STEST-009 | `plugin/blueprints/gitignore.md`, `env-example.md` (DD-023) | **Ready** — *implementable at last; the ordering rule travels with the blueprint* |
| REQ-NF-003 | Interrupted run resumable | reliability §3 | TASK-007 ✅ | **ETEST-009 ×8**, FTEST-001/011 | `plugin/instructions/resume.md` — whole-file redo | **Approved** |
| REQ-NF-004 | Usable without documentation | product §6 | TASK-001, TASK-006 | ATEST-037 | — | **Needs update — see gaps** |
| REQ-NF-005 | Blueprint/flow swap cost = 0 | **ADR-001** | TASK-002 ✅ | UTEST-024, TEST-017 | `ci/ff-002-module-independence.mjs` | **Approved** |
| REQ-NF-006 | Plain text, no colour-only meaning | `frontend-component-spec` | TASK-001 ✅, TASK-006 | ATEST-038, UTEST-025 | `plugin/instructions/intake.md` *(preamble only)* | Ready |
| REQ-NF-007 | Zero network calls | CON-003 | TASK-016 | ETEST-011, STEST-010 | — | Ready |
| REQ-NF-008 | Identical on three platforms | CON-004 | TASK-003, TASK-018 | ETEST-012 ×3, FTEST-009 | — | Ready — **Step 0 verified on all three in CI; a full intake run is Windows-only so far; see gaps** |
| REQ-NF-009 | Entry point under 100 lines | BR-006 | TASK-013 ✅ | ATEST-021, TEST-009 | `plugin/instructions/entrypoint.md` · `ci/validation.mjs` check 10 | **Approved** — *the cap is a signal about layout, not an obstacle to route around* |

### Roles and business rules

| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Code link | Review status |
|---|---|---|---|---|---|---|
| REQ-R-001 | Four actor boundaries enforced | security §2 | TASK-004 | STEST-001…014 | — | Ready |
| REQ-R-002 | No write outside `spec/` unasked | BR-008 | TASK-004 ✅ | STEST-002/003, FTEST-003 | `plugin/instructions/boundary.md` | **Approved** — *see REQ-F-024* |
| REQ-R-003 | No application source code | BR-001 | TASK-004 | TEST-012, STEST-001 | — | Ready |
| REQ-R-004 | Declined write → resumable | reliability §3 | TASK-006 | ATEST-039, FTEST-002, STEST-011 | — | Ready |
| REQ-R-005 | Task files name allowed + forbidden | API C3 | TASK-010 ✅ | ATEST-040, TEST-018, **ETEST-003** | `plugin/instructions/governance.md` rule 5 | **Approved** — *both lists, always; the allowed-only shape named as the more dangerous one* |
| BR-001…BR-014 | *(all fourteen)* | See `requirements.md` §4 | TASK-004…012 | See `test-plan.md` coverage matrix | — | Ready |
| SEC-A-001…003 | Authentication rules | security §1 | TASK-004 | STEST-009/010, FTEST-003 | — | Ready |
| SEC-Z-001…004 | Authorization rules | security §2 | TASK-004 | STEST-002/003/006, TEST-003 | — | Ready |

**Status values:** Draft · Ready · In review · Approved · Needs update · Released

---

## The chain (Ch. 10 §10.1)

| Item | Simple question it answers |
|---|---|
| Requirement | What must the system do? |
| Design decision | How will the system support it? |
| Task | What work must be completed? |
| Test | How will you verify it? |
| Code reference | Where is it implemented? |
| Review status | Is the chain complete and approved? |

### Traced chain — REQ-F-024 end to end

```
REQ-F-024   The kit must not write outside the generated workspace folder without an
            explicit confirmation naming the file.
     |
DD-004 / ADR-004   A fixed spec/ folder is the only writable target.
BR-008             A write outside spec/ requires confirmation naming the file.
SEC-Z-001          The path check runs AFTER normalisation.
     |
TASK-004    The boundary layer - built BEFORE the first write exists.
     |
UTEST-019   spec/../../etc rejected; specimen/x.md rejected; spec/../spec/x.md allowed
STEST-002   Write to <repo>/README.md stops and asks
STEST-003   Path traversal rejected despite the spec/ prefix
STEST-004   Files outside spec/ identical before and after a full run
STEST-013   The refusal names the path, never the file's contents
FTEST-003   BOUNDARY_BLOCKED failure state
     |
code: plugin/instructions/boundary.md    <- the rule the agent follows
      ci/boundary.mjs                    <- the same rule, executable, so the
                                            denials assert an OUTCOME rather
                                            than assert a sentence exists
     |
Review: Approved -- with one honest gap. UTEST-019, STEST-003, STEST-005,
        STEST-007, STEST-008 and STEST-013 are verified against the RULE.
        STEST-002, STEST-004 and STEST-006 assert what a real run does to a
        real filesystem, and nothing writes until TASK-006. The chain is
        complete in specification and partial in evidence, and saying so is
        the point of this column.
```

---

## Gap analysis (Ch. 10 §10.8)

A **gap is any missing link**. Blank cells are the point of this document.

| Gap found | What it may mean | What is being done |
|---|---|---|
| **Most code links are still blank.** | Implementation has started but is four tasks in. | Expected. TASK-001 and TASK-002 are complete and their four links are filled. Every remaining blank fills in as its task completes. |
| **REQ-NF-008** (identical on three platforms) is now part evidence, part argument, and the halves are worth separating. | **Evidence:** Step 0 runs on `ubuntu-latest`, `macos-latest` and `windows-latest` in CI, each using that platform's own documented command against the real library, and all three must reach the digest the manifest declares. FTEST-009 checks the payload for path, case and separator assumptions — and caught one that only failed on Linux. **Argument:** a full eight-round intake has only ever been *run* on Windows. | Named rather than assumed. **ETEST-012 (×3)** is what closes the second half, and it is blocked on hardware rather than on work: it needs Claude Code running on a real macOS and a real Linux machine. Nothing here claims a pass it did not get (BR-009). |
| **The specification contradicted itself on where the plugin lives.** | `AGENT.md` and `04-src/README.md` place the payload in `04-src/`; the TASK-001 hand-off lists its files unprefixed and marks `spec/**` do-not-change. Both readings cannot hold. | Resolved deliberately by **DD-015** and **DD-016**, not by picking quietly. `04-src/README.md` now documents a layout that lives at `plugin/` — a real inconsistency, and the next task to touch either file should close it. |
| **The rule-versus-run gap was real, and it caught something the moment it closed.** | `ci/boundary.mjs` proved the path rule correct; it could not prove the agent follows it. `security-tests.md`: *"an agent reading them will usually comply. Usually is not a boundary."* | **STEST-004 became reachable at TASK-006 and failed on its first run — BUG-004.** The intake wrote two shell scripts into a developer's repository root before the preamble, because `integrity.md` demanded a check it gave no means to perform. Fixed and re-verified: 0 files outside `spec/`. The gap row that predicted this was correct in every particular except that nobody closed it in time. |
| **STEST-006 (no blanket write permission) is still unevidenced.** | It asserts what a run *requests*, and the only runs so far used `--permission-mode acceptEdits` — which removes the host prompt entirely. | Named. That harness choice is what let BUG-004 through, which is itself the strongest evidence for **REQ-F-025**: with the host's per-file prompt removed, the kit's own rules did not hold. Observing real permission requests needs an interactive run; **REQ-F-025 stays `Needs update` until then.** |
| **Every task forbids editing `spec/`, yet several instruct the agent to record decisions in `decisions.md` and update this matrix.** | A catch-22 that made TASK-001 and TASK-002 both structurally incompletable. | Surfaced rather than resolved by the agent. The kit author authorised this change explicitly; **that is the correct shape** — a spec change made by its owner, not an agent editing `spec/` to make its own task pass. |
| **REQ-NF-002 has no implementation path.** | DD-020 drops `.gitignore` and `.env.example` from the library so the payload stays Markdown-only, and REQ-NF-002 requires both. The requirement is not wrong; it is currently unreachable. | **Q-024, open, blocking TASK-005.** Recorded as a live conflict rather than a quiet exception. The requirement keeps its tests — they will fail, and they should, until the kit author picks one of the three ways out. |
| **The `.gitignore` gap has a safety consequence, not only a traceability one.** | A generated workspace invites a developer to create `.env` (the `.env.example` pattern) with no ignore rule protecting it. Here that risk is nil — this project has no secrets — but the kit generates workspaces for projects that do. | Named in Q-024 and in `instructions/intake.md`, which forbids the intake from improvising either file. **An improvised `.gitignore` would be worse than none**: it would look like protection. |
| **REQ-NF-004** (usable without documentation) has one acceptance test and no automatable one. | It is genuinely a human judgement — *did a person understand it?* | Marked **Needs update**. Covered by the manual smoke test (`end-to-end-tests.md`) step 3, which is explicitly the one step that cannot be automated. |
| **REQ-F-032** (round progress) is P2 with a single acceptance test. | It may be cut under CON-002. | Deliberate. Thin coverage makes it cheap to drop, and the matrix shows exactly what would be lost. |
| **SM-2** (intake completion rate) has no requirement, task, or test. | The kit author's own definition of first-month success is unmeasurable under CON-007. | **Q-002 — open and unresolved.** It appears in `intent.md` §4 and `product-spec.md` §4 rather than being quietly dropped. |
| **TASK-019** (two sessions, one repository) has **no requirement**. | It came from the seven-questions worksheet, not from an answer. | Stayed P3 and blocked until it passed through `scope-change-log.md` — **SC-008, 2026-08-08: rejected for v1**, one session per repository at a time recorded as a non-goal. A task with no requirement is as suspicious as code with none, and this one was never allowed to run without one. |
| **Q-003** — the blueprint library may be core, not supporting. | If wrong, the library's thin specs and acceptance-only tests are the wrong strategy. | Open. Revisit after the first ten real intakes. |
| **RSK-3** (host plugin format changes) has **no detector**. | It would be discovered from a user report. | `[TODO]` in `intent.md` and `data-and-integration-spec.md`. Open. |

> Treat code with no requirement as **suspicious until approved.**

---

## AI-specific risks this catches (Ch. 10 §10.2)

| AI risk | Traceability response |
|---|---|
| The agent builds a related but wrong feature. | Every task names its requirement; TASK-019 had none, stayed blocked for exactly that reason, and was rejected via SC-008 rather than built. |
| The agent skips an edge case. | Every acceptance criterion produced an `ATEST`; the seven-questions worksheet produced eighteen `FTEST`s. |
| Code passes basic tests but breaks a rule. | All fourteen business rules appear in the coverage matrix with named tests. |
| The implementation changes architecture silently. | Every ADR's Compliance field names a fitness function, and `adr-index.md`'s rules are copied into `AGENT.md`. |

---

## Traceability review checklist

- [x] Every important requirement has a unique ID.
- [x] Every Must requirement has at least one task.
- [x] Every Must requirement has at least one test.
- [x] Every requirement links to a design decision or spec section.
- [x] Every design decision links to one or more small tasks.
- [x] Every implemented feature has a code link — **four so far**: REQ-F-001, REQ-F-002, REQ-F-004, REQ-NF-005.
- [x] Every security rule maps to a denial test.
- [ ] Every released feature maps back to a PRD requirement — **nothing released yet.**
- [x] Any code without a requirement has been removed, documented, or approved — **no code yet**; the analogous case, TASK-019, was held blocked and then **rejected via SC-008 (2026-08-08)**, which is this checklist's rule applied to a task.
- [x] Any blank matrix cell has been reviewed — see the gap analysis; every blank is deliberate and named.
- [x] Every changed behavior is reflected in updated specs.

> Blueprint: ../../../spec-driven-template/01-docs/08-traceability/traceability.md
