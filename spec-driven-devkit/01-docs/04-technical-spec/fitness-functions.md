# fitness-functions.md — Automated Architecture Governance

> **Purpose:** stop your architecture decisions from decaying silently.
> **When you use it:** one per driving characteristic, wired into the CI gate.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 6.

> A fitness function is **any mechanism that objectively assesses an architectural
> characteristic**: a test, a metric, a monitor, a CI script, a chaos experiment.
>
> **"High performance" is not a fitness function. A measurable threshold is.**

A test proves the feature does what was asked. A fitness function proves the **system
still has the shape you decided on**. They are different jobs; you need both.

---

## Where these run, and why that needed deciding

ADR-002 says the kit ships no executable code and requires no runtime. That creates an
obvious problem for a page whose central rule is *it must fail the build*: **the developer's
machine has no build.** There is nothing to compile, nothing to install, nothing that could
fail.

The resolution, and it is a real distinction rather than a word game:

| | The **published plugin** | The **kit's own repository** |
|---|---|---|
| Contains | Markdown and a plugin manifest, nothing else | The above, **plus** CI workflow files and the check scripts these fitness functions are |
| Ships to developers | Yes | **No** — CI files are not part of the plugin payload |
| Governed by ADR-002 | **Yes — zero executable files** | No. ADR-002 governs what is *shipped*, not what checks it |

So: fitness functions run in **the kit author's CI, on every change to the plugin, blocking
the merge.** They run over **golden workspaces** — full intakes generated from fixed answers
and kept as fixtures. FF-009 is the check that keeps this distinction honest by asserting the
published payload stays code-free.

**The developer's machine runs something different and weaker**: the twelve validation checks
of `technical-spec.md` §11, performed by the agent at the end of every intake (REQ-F-029).
They overlap with these fitness functions by design — but validation is instruction-driven
and therefore shares the failure mode of the thing it checks (ADR-002's stated weakness).
The CI versions are the independent ones. **Do not confuse the two:** validation tells a
developer their workspace is sound; fitness functions tell the kit author the kit still works.

---

## The register

| ID | Guards | Type | Check | Threshold | Runs | On failure |
|---|---|---|---|---|---|---|
| FF-001 | **Simplicity** | Structural | Count of user-invocable intake commands, and of distinct end-to-end paths through intake. Depth must be an argument, not a branch. | **exactly 1** command, **exactly 1** path | CI | **Block merge** |
| FF-002 | **Simplicity** | Structural | For a commit touching the question set: count of blueprint files changed. For a commit touching a blueprint: count of instruction-set/question files changed. | **0** in both directions | CI | **Block merge** |
| FF-003 | **Reliability** | Operational | For each stage 1–8: interrupt a golden intake mid-stage, re-run, assert it resumes at that stage and completes. | **8 / 8 pass** | CI | **Block merge** |
| FF-004 | **Reliability** | Structural | Generated files containing an unfilled blueprint placeholder while carrying **no** `[TODO]` marker — i.e. a file that presents as complete while being partial. | **0** | CI | **Block merge** |
| FF-005 | **Auditability** | Structural | Surviving placeholder tokens, instructional italics, and generic prompt boxes in any generated file. | **0** | CI | **Block merge** |
| FF-006 | **Auditability** | Structural | Worked-example content in any generated file — searched by the example product's name and the `# WORKED EXAMPLE` heading. | **0 occurrences** | CI | **Block merge** |
| FF-007 | **Auditability** | Structural | Per generated file: section headings match its blueprint's headings, in order; final blueprint back-link is present and resolves at the correct relative depth. | **100%** match, **0** broken links | CI | **Block merge** |
| FF-008 | **Auditability** | Structural | Identifier integrity: every referenced ID resolves to a definition in the same workspace; no ID defined twice; no ID reused after deletion. | **0** dangling, **0** duplicate | CI | **Block merge** |
| FF-009 | **ADR-002** | Structural | Files in the **published plugin payload** that are not Markdown or the plugin manifest — scripts, package manifests, lockfiles, binaries. | **0** | CI | **Block merge** |
| FF-010 | **ADR-004** | Security | Files created outside `spec/` during a full golden intake, and any state/progress/session/cache/answer file created anywhere. | **0** and **0** | CI | **Block merge** |
| FF-011 | **ADR-005** | Structural | Every golden workspace's entry point contains a plugin version, and it matches the manifest. | **100%** present and matching | CI | **Block merge** |
| FF-012 | **Auditability** | Structural | Every `[TODO]` marker has a matching `Q-###` row; every table row requiring a decision is specified or marked *not needed, because…* — never blank. | **0** orphan TODOs, **0** blank decision rows | CI | **Block merge** |
| FF-013 | **Auditability** | Structural | The generated entry point is under 100 lines and every path in it resolves. | **< 100 lines**, **0** broken paths | CI | **Block merge** |
| FF-014 | **BR-010** | Security | In every golden workspace: each permission rule has ≥ 1 **deny** test, and each driving characteristic has ≥ 1 fitness function. | **100%** on both | CI | **Block merge** |
| **FF-015** | **REQ-F-040** | Structural | **Blueprint coverage.** Every blueprint in the shipped library either produced a generated file or appears in the workspace's skipped-blueprint record with a reason. Silently unused blueprints. | **0 silently unused** | CI | **Block merge** |
| **FF-016** | **ADR-006** | Structural | Every completed stage in a golden workspace has a matching dated acceptance row; and acceptance/progress/approval files anywhere. | **100% rows**, **0 files** | CI | **Block merge** |
| **FF-017** | **REQ-F-042** | Security | **Blueprint integrity.** Every blueprint's checksum matches the integrity manifest; every manifest entry exists; no blueprint is unlisted. Checked before and **after** a full golden run. | **100% match**, **0 unlisted**, **0 modified by a run** | CI | **Block merge** |
| **FF-018** | **REQ-F-043** | Structural | Add a blueprint to the library and the manifest, change nothing else: it must produce an output or a recorded skip. Files changed in the intake instruction set. | **0** | CI | **Block merge** |

**Types**

| Type | Measures | Examples |
|---|---|---|
| **Structural** | Code shape | Dependency cycles, layer rules, cyclomatic complexity |
| **Operational** | Runtime behaviour | p95 latency, throughput, error rate |
| **Security** | Boundaries hold | Isolation, authorization, secret scanning |
| **Process** | Delivery health | Deploy success rate, test-suite duration |

Almost every function here is **Structural**, and that is a consequence of the architecture
rather than an oversight. With no runtime, no network, and no server, there is nearly no
operational behaviour to measure — FF-003 is the exception, because interruption and resume
are genuinely runtime properties. There are no Process functions in v1; deploy health is
meaningless for a plugin with no deploy.

## Rules

- **One per driving characteristic, minimum.** No driver without a fitness function is
  governed — it is only documented.
- It must **fail the build**, not print a warning. A warning is a decoration.
- Every ADR's **Compliance** field names the fitness function that enforces it.
- Measure **tail percentiles**, never averages.
- If a characteristic cannot be measured, its definition is too vague — go fix the
  definition, not the function.

### Coverage against the three drivers

| Driver | Functions | Covered? |
|---|---|---|
| **Simplicity / feasibility** | FF-001, FF-002, **FF-018** | ✅ Both halves of its definition: one command *and* one path; independent modules in both directions. FF-018 extends the swap-cost measure to blueprints — adding one must cost zero flow changes. |
| **Reliability / graceful failure** | FF-003, FF-004, **FF-017** | ✅ Resume across all eight stages, the no-false-completeness rule, and library integrity — a corrupted blueprint must stop the run, not produce a subtly wrong file. |
| **Auditability** | FF-005, FF-006, FF-007, FF-008, FF-012, FF-013, **FF-015**, **FF-016** | ✅ All four measures in `driving-characteristics.md` §3, the two copy-then-fill failure modes ADR-003 introduced, plus **blueprint coverage** and **stage acceptance** — both of which are questions a reader will ask of a finished workspace and could not previously answer. |

Every ADR's Compliance field also resolves: ADR-001 → FF-001/FF-002 · ADR-002 → FF-009 ·
ADR-003 → FF-005/FF-006/FF-007 · ADR-004 → FF-010 · ADR-005 → FF-011 · **ADR-006 → FF-016**.

### The three added after the specification was first complete

**FF-015, FF-017, and FF-018 exist because a question exposed a gap the workspace had not
noticed:** *"will it always follow all the templates?"*

Nothing checked that every blueprint gets **used**. FF-007 verified that a generated file
matches its blueprint — but a blueprint the intake never reached produced no file, no
mismatch, and no complaint. A workspace could be internally consistent and still be missing
a whole specification document, and every check would have passed.

That is the shape of gap that only appears when someone asks what the checks *do not* cover.

---

## The gate

```
gate:
  1. FF-001, FF-002, FF-009      # shape of the plugin itself
  2. generate golden workspaces  # fixed answers -> full intakes, as fixtures
  3. FF-004..FF-008, FF-010..FF-014   # walk the golden workspaces
  4. FF-003                      # 8 interrupt/resume runs (slowest; last)
```

Nothing merges unless every step passes.

**Provider and command (DD-017, closes Q-010):** GitHub Actions on `ubuntu-latest`, defined in
`.github/workflows/gate.yml`, with `gate` set as a **required status check on `main` that
applies to administrators**. Step 1 is implemented; steps 2–4 arrive with the tasks that
create a golden workspace to walk.

```
node ci/ff-001-single-command.mjs
node ci/ff-002-module-independence.mjs
node ci/ff-009-no-executable-payload.mjs
node --test "tests/**/*.mjs"
```

All three checks run even when one fails, so a single log shows every violation rather than
only the first.

---

## Two honest limits of this register

**1. FF-005 and FF-006 are string searches, and string searches under-detect.** FF-006 looks
for the worked example's product name and heading. A worked example that had been *reworded*
into a generated file — the same fictional requirements in different words — would pass.
There is no cheap check for that, and pretending otherwise would be the decoration this page
exists to prevent. The mitigation is ADR-003's rule that the worked-example section is
deleted wholesale rather than edited around.

**2. Everything here runs against golden workspaces built from fixed answers.** Real
developers answer things the fixtures do not contain. A fitness function guards exactly what
it asserts and nothing more — passing is proof of one property, not proof of safety. The
golden set needs to grow whenever a real intake surfaces a shape the fixtures did not have.

---

## What the register caught

| Date | FF | Event |
|---|---|---|
| 2026-08-03 | FF-002 | **Blocked a real task, then found a defect in itself.** TASK-003 must change `blueprints/**` and `instructions/intake.md`; FF-002 failed the commit correctly, and failed the *split* commit identically — it measured a branch where the rule says *commit*. Its own remedy did not work. Fixed; **BUG-002** |
| 2026-08-03 | FF-001 | **Found a defect in itself.** Writing UTEST-013 exposed that FF-001 counted end-to-end paths over the user-invocable commands only, so a command hidden with `user-invocable: false` could add a second orchestration path unseen. Fixed; **BUG-001** in `debugging-specification.md` |
| 2026-08-03 | FF-009 | **Seen to fail in CI**, deliberately. A branch adding `plugin/package.json` turned the gate red — `RESULT: FAIL — FF-009 blocks the merge`, job exit 1 — and FF-001 and FF-002 still reported their own results in the same log. Branch deleted. This is the drill, not a catch |
| 2026-08-03 | FF-001, FF-002 | **Seen to fail locally** against deliberately broken inputs: a second command file, and one commit touching a blueprint and the question set together |
| 2026-08-03 | FF-017 | **Caught a cross-platform defect before it could ship.** The working tree held CRLF while Git stored LF, so every blueprint would have hashed differently on Windows and on CI — the check would have gone red on its first push while detecting nothing real. Fixed at the source by pinning the payload to LF (DD-021) rather than by normalising inside the hasher, which would have hidden real alterations behind encoding changes |
| 2026-08-03 | FF-017 | **Seen to fail** in all four modes: altered (one trailing space), missing (one file deleted), unlisted (one file added), and absent manifest. Each names the file and which of the three problems it is |

> The first row is the one worth reading twice. A fitness function that has never been run
> against a case designed to break it is a claim, and this register's first entry is the
> register catching **itself** being narrower than its own written threshold.

> Blueprint: ../../../spec-driven-template/01-docs/04-technical-spec/fitness-functions.md
