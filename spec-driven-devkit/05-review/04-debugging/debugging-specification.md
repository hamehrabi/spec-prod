# Debugging Specification

> Source: Ch. 19 §19.6.
> The bug log. Every entry separates **root cause from symptom**, names the regression test,
> and names **the specification that should have prevented it**.

---

## Bug log

| ID | Date | Symptom | **Root cause** (≠ symptom) | Regression test | **Spec that should have prevented it** | Status |
|---|---|---|---|---|---|---|
| **BUG-001** | 2026-08-03 | FF-001 passed a payload containing a second command that routed to a second orchestration module. | **The check counted its two thresholds over the same set.** It derived entry paths from the *user-invocable* commands only, so `user-invocable: false` removed a command from the command count **and** hid its path. `fitness-functions.md` FF-001 states two independent counts; the implementation collapsed them into one. | UTEST-013, third case — **seen to fail** against the unfixed check | `fitness-functions.md` FF-001. The register was correct and unambiguous; the implementation narrowed it. Nothing needed changing in the spec | **Fixed** |

| **BUG-002** | 2026-08-03 | FF-002 failed a TASK-003 commit correctly, then failed it again after the commit was split — the fix the check itself recommends had no effect. | **The check's unit was a branch, not a commit.** It diffed `origin/main...HEAD` in one go, so two deliberately separated commits and one coupled commit produced an identical file set. `fitness-functions.md` FF-002 says "For a **commit** touching the question set…"; the implementation aggregated. | TEST-017, "split into two commits, pass" — **seen to fail** against the unfixed check | `fitness-functions.md` FF-002. As with BUG-001 the register was right and the implementation was narrower. Unlike BUG-001, this one **also made the remedy message a lie** | **Fixed** |

### BUG-002 in full — the more interesting of the two

```
Bug ID:        BUG-002
Date:          2026-08-03
Reported by:   TASK-003, by being blocked by it
Version:       ci/ff-002-module-independence.mjs at TASK-002

SYMPTOM
  TASK-003 must change plugin/blueprints/** and plugin/instructions/intake.md --
  its own task file lists both. FF-002 failed the commit, which is correct. The
  commit was split in two, each half clean. FF-002 failed again, identically.

ROOT CAUSE
  FF-002 computed one file set for the whole branch (origin/main...HEAD). Under
  that reading a split commit is indistinguishable from a coupled one, because
  the aggregate diff is the same either way. The unit of REQ-NF-005 is whether
  two changes COULD have been made separately, and the only evidence for that is
  them having been -- which lives in commit boundaries, exactly the information
  the aggregate threw away.

WHY IT WAS MISSED
  Which test should have caught it?  TEST-017.
  Did that test exist?               Yes, and it PASSED.
  Why did it pass?  It asserted the failure case only. Every case it contained
  broke the rule, so aggregating and not aggregating gave the same verdict. Worse,
  one assertion actively encoded the defect: "a range spanning both is coupled
  again, and must fail" -- it had been written to match the behaviour rather than
  the rule, and it had to be deleted, not adjusted.

  This is the "why did the test pass?" table's first row, and it cost a real
  blocked task to find. A check whose remedy does not work is worse than no
  check: it fails you, tells you what to do, and fails you again for doing it.

REGRESSION TEST
  Test ID:                                    TEST-017, "split into two commits, pass"
  Seen to FAIL against the unfixed version:   yes
  Plus: one bad commit inside an otherwise clean range still fails, and a merge
  commit -- whose combined diff always looks coupled -- is not judged at all.

THE SPECIFICATION THAT SHOULD HAVE PREVENTED IT
  fitness-functions.md FF-002 says "For a COMMIT touching the question set".
  Singular, and it was there from Round 6. Nothing needed changing in the spec.

REPEATABLE MISTAKE?
  Yes. Row added to AGENT.md "Lessons from past mistakes".

Artifacts updated:
  ci/ff-002-module-independence.mjs
  tests/integration/test_TEST-017_commit_touching_both_modules_fails_ff002.mjs
```

| **BUG-003** | 2026-08-04 | Three blueprints carried 224 lines of real template guidance **after** their `# WORKED EXAMPLE` heading. ADR-003 step 2 deletes from that heading to end of file, so every workspace generated from them would have silently lost a whole section. | **A blueprint-side contract guarantee was never checked.** `api-specification.md` C2 states *"a `# WORKED EXAMPLE` section, **always last**, always removable as a whole"* — and nothing verified it. The fill procedure was correct given the guarantee; the guarantee was false for 3 of 54 blueprints, and no test asserted the precondition the algorithm depends on. | `tests/integration/test_C2_worked_example_is_always_last.mjs` — **seen to fail**, naming all three | `api-specification.md` C2. The rule existed and was precise. What was missing was any check that the *library* honoured it — a contract asserted only on the side that consumes it | **Fixed** — addenda moved above the worked example; content byte-preserved (316/357/328 lines before and after) |

| **BUG-004** | 2026-08-04 | On the **first end-to-end run**, the intake wrote `_integrity_check.sh` and `_integrity_check.ps1` into the developer's repository root — outside `spec/`, executable, and **before the preamble**. | **An instruction demanded an outcome without supplying a means, and without forbidding the obvious wrong one.** `integrity.md` said "compare MANIFEST.md against the library on disk". Comparing 79 SHA-256 digests is not something an agent can do by reading, so it built the capability it was missing out of files in someone else's repository. Improvising was the rational move given what the instruction said. | Re-run on a seeded repository: **0 files outside `spec/`** | `boundary.md` and `integrity.md`, both of which I wrote. The boundary rule covered *destinations for artifacts* and never contemplated the kit needing a **working file** of its own | **Fixed** |

| **BUG-007** | 2026-08-04 | A full eight-round intake ran for **fifteen minutes and produced zero files**. The boundary held perfectly and the developer's files were untouched — but nothing was written, and a real developer would have killed it. | **The instruction set grew past the point where reading it is free.** Fourteen modules, 2,153 lines, and `intake.md` names eleven siblings without ever saying *when* to open them. Nothing forbade reading all of them, plus 82 blueprints, before acting — so a thorough agent does, and the developer watches an idle screen. Each module added since TASK-006 made it worse, invisibly. | A measured run: 15 min, 0 files. Re-measure after the lazy-read rule | **REQ-NF-001** — *"the developer must never wait more than one question round to see written output"*. The requirement was right and nothing enforced it at the instruction level | **Partly fixed** — lazy-read rule added; needs re-measuring |

### BUG-007 in full

```
Bug ID:        BUG-007
Date:          2026-08-04
Reported by:   A deliberate end-to-end run, after TASK-016

SYMPTOM
  Eight-round express intake, all answers supplied. Fifteen minutes elapsed.
  Zero files in spec/. Zero files anywhere else either -- the boundary held.

ROOT CAUSE
  Not slowness in any one step. The integrity check was already fixed (BUG-005)
  and verified at 0.19s in isolation. The cause is CUMULATIVE: intake.md names
  eleven sibling modules and never says when to open them, so the reasonable
  reading is "read them all first". Fourteen modules and 82 blueprints later,
  that is minutes of work before the first question.

  Every task since TASK-006 added a module and made this worse. No single commit
  was wrong, which is why nothing caught it.

WHY IT WAS MISSED
  Which test should have caught it?  PTEST-001 -- no stretch longer than one
                                     round without output.
  Did that test exist?               No. It was recorded as unmet after BUG-005
                                     and never became a measurement, because
                                     measuring it needs a full run and every
                                     full run is expensive.

  The gap was named twice in traceability and carried forward both times.

THE SPECIFICATION THAT SHOULD HAVE PREVENTED IT
  REQ-NF-001 is correct and was never enforced anywhere in the instruction set.
  A requirement with no instruction behind it is a hope.

REPEATABLE MISTAKE?
  Yes, and structural: an instruction set that grows one module per task will
  cross this line again. Row added to AGENT.md.

Artifacts updated:
  plugin/instructions/intake.md (lazy-read rule)
```

### BUG-004 in full

```
Bug ID:        BUG-004
Date:          2026-08-04
Reported by:   The first real end-to-end run of TASK-006
Version:       plugin 0.1.0, at TASK-006

SYMPTOM
  Two files appeared in the developer's repository root that they never asked for
  and never saw proposed:
      _integrity_check.sh    (executable, chmod 755)
      _integrity_check.ps1
  Written at Step 0, before the preamble and before any question.

ROOT CAUSE
  Not "the agent ignored the boundary". The boundary rule I wrote governs where
  ARTIFACTS go. It never contemplated the kit needing a working file of its own,
  so nothing forbade one -- and integrity.md required a check the agent had no
  sanctioned way to perform. Told to compare 79 digests with no means offered and
  no prohibition stated, writing a script is the reasonable thing to do.

  The gap is a class, not an instance: an instruction that demands a capability
  the kit does not have, and does not say what to do when it is missing.

WHY IT WAS MISSED
  Which test should have caught it?  STEST-004 -- "complete a full intake and diff
                                     the repository; the set of files outside spec/
                                     is identical before and after".
  Did that test exist?               No. It was recorded in TASK-004 as verified
                                     against the RULE and explicitly NOT against a
                                     run, because nothing could write yet. The
                                     traceability gap row said exactly this, and
                                     said it would become reachable at TASK-006.
                                     It did, and the first run it became reachable
                                     on is the run that failed it.

  So the gap was known, named, and correctly predicted. What it was not, was
  closed -- and the thing it was guarding went wrong at the first opportunity.

WHAT HELD
  The developer's own files were byte-for-byte unchanged: CLAUDE.md, .gitignore,
  README.md, src/app.js all verified by checksum after the run. The failure was
  CREATION of new files where the kit had no right to create any, not modification
  of anything the developer owned.

WHAT THIS SAYS ABOUT THE PERMISSION PROMPT
  The run used --permission-mode acceptEdits, which removes the host's per-file
  prompt. That was my harness's choice, and it is exactly the condition
  SEC-Z-002 describes: "the host's per-file prompt is the only enforcement
  independent of the kit's own behaviour". With it removed, the kit's own rules
  did not hold. This is the clearest possible evidence for REQ-F-025 -- the
  requirement that the kit must never ask for that prompt to be lifted.

REGRESSION TEST
  Re-ran on a seeded repository after the fix.
  Seen to FAIL against the unfixed version:   yes -- 2 files, reproducibly

THE SPECIFICATION THAT SHOULD HAVE PREVENTED IT
  boundary.md needed an absolute rule -- the kit creates no working files of any
  kind, anywhere -- and integrity.md needed to name the sanctioned method and say
  what to do when it is unavailable: stop and report, never improvise.
  Both now do.

REPEATABLE MISTAKE?
  Yes, and it is the most general lesson so far. Row added to AGENT.md.

Artifacts updated:
  plugin/instructions/boundary.md, integrity.md, intake.md
```

### BUG-003 in full

```
Bug ID:        BUG-003
Date:          2026-08-04
Reported by:   TASK-005 stop condition 2, before the fill procedure was written
Version:       plugin 0.1.0, blueprint library at TASK-003/TASK-021

SYMPTOM
  Applying ADR-003 step 2 to database-design.md, reliability-specification.md and
  code-review-checklist.md would delete their ADDENDUM sections -- File and Object
  Storage, Transactional Reliability, and The 12 Design Red Flags. 224 lines of
  generic guidance, gone, with no error.

ROOT CAUSE
  Not "step 2 is too aggressive". Step 2 is correct GIVEN contract C2, which
  guarantees the worked example is always last. The defect is that C2 was a
  promise nothing tested, and three blueprints had quietly broken it.

WHY IT WAS MISSED
  Which test should have caught it?  A test of C2's blueprint-side guarantee.
  Did that test exist?               No. C2's guarantees were all asserted on the
                                     GENERATED side -- headings match, back-link
                                     resolves, no example content survives. The
                                     side that PRODUCES those properties was
                                     unchecked, so a library defect could only
                                     ever surface as a mysterious output defect.

  This is the failure mode with the worst signature in the whole product: the
  output would have been structurally valid, internally consistent, and missing a
  section nobody could see was missing. FF-005, FF-006 and FF-007 would all pass.

REGRESSION TEST
  Test ID:                                    C2 worked-example-is-last (2 cases)
  Seen to FAIL against the unfixed version:   yes -- named all three blueprints

THE SPECIFICATION THAT SHOULD HAVE PREVENTED IT
  api-specification.md C2. It was neither unclear nor ignored; it was simply
  never enforced in the direction that mattered. A contract with a guaranteeing
  side and a relying side needs a test on the guaranteeing side, or it is a
  comment.

REPEATABLE MISTAKE?
  Yes. Row added to AGENT.md "Lessons from past mistakes".

Artifacts updated:
  spec-driven-template/ x3, plugin/blueprints/ x3, plugin/blueprints/MANIFEST.md,
  tests/integration/test_C2_worked_example_is_always_last.mjs
```

### BUG-001 in full

```
Bug ID:        BUG-001
Date:          2026-08-03
Reported by:   UTEST-013, while it was being written
Version:       plugin 0.1.0, ci/ff-001-single-command.mjs at TASK-002

SYMPTOM
  A payload with two command files passed FF-001, provided the second carried
  user-invocable: false.

ROOT CAUSE
  FF-001 guards two thresholds: "exactly 1 user-invocable command" AND "exactly 1
  end-to-end path". The check computed both from the same filtered list, so the
  filter that correctly excluded a hidden command from the FIRST count also,
  incorrectly, excluded its orchestration reference from the SECOND.

WHY IT WAS MISSED
  Which test should have caught it?   UTEST-013.
  Did that test exist?                No — it was being written when it caught this.
  The first two cases of UTEST-013 passed against the unfixed check, because both
  broke the command count, which worked. Only the third case separated the two
  thresholds, and it is the one that found the defect.

REGRESSION TEST
  Test ID:                                    UTEST-013, case 3
  Seen to FAIL against the unfixed version:   yes

THE SPECIFICATION THAT SHOULD HAVE PREVENTED IT
  fitness-functions.md FF-001 already says "Count of user-invocable intake commands,
  AND of distinct end-to-end paths". Two counts, stated plainly. The spec was not
  unclear and was not ignored — it was read, and then implemented narrowly. That is a
  third failure mode the entry template does not list, and the more common one for a
  check written by the same session that read the rule.

REPEATABLE MISTAKE?
  Yes. Row added to AGENT.md "Lessons from past mistakes".

Artifacts updated:
  ci/ff-001-single-command.mjs, tests/unit/test_UTEST-013_second_command_fails_ff001.mjs
```

---

## Entry template

```
Bug ID:        BUG-###
Date:
Reported by:
Version / platform / answer script:

SYMPTOM     (what was observed)

ROOT CAUSE  (what was actually wrong - NOT a restatement of the symptom)

WHY IT WAS MISSED
  - Which test should have caught it?
  - Did that test exist? If it existed and passed, WHY did it pass?

REGRESSION TEST
  Test ID:
  Seen to FAIL against the unfixed version:   yes / no
  <!-- "no" means this is not yet a regression test. It is a hope. -->

THE SPECIFICATION THAT SHOULD HAVE PREVENTED IT
  - Which requirement, rule, or ADR covers this?
  - If one exists: was it unclear, or ignored? Those need different fixes.
  - If none exists: WRITE IT. The spec gap is the real defect.

REPEATABLE MISTAKE?
  If an agent would plausibly make this same mistake again:
  add a row to 06-agent/01-instructions/AGENT.md "Lessons from past mistakes".

Artifacts updated:
```

---

## Root cause ≠ symptom

The distinction is the whole point of the file. Worked through with the defects this project
is most likely to produce:

| Symptom | **Not** the root cause | The likely root cause |
|---|---|---|
| A generated file still contains `*Short working name.*` | "The fill step missed a placeholder" | **The placeholder inventory in `fill.md` does not define instructional italics as placeholders.** Step 4 cannot be complete against an undefined list |
| A file was written to `<repo>/README.md` | "The boundary check failed" | **The check compared a string prefix instead of a normalised path.** `specimen/` would also have passed |
| Validation reported success on a broken workspace | "Check 1 has a bug" | **The report lists only failures**, so "everything passed" and "nothing ran" produce identical output. BR-009's exact failure mode |
| Resume re-asked Round 3 | "Resume is broken" | **Stage completeness was derived from file *existence* rather than file *completeness*** — a stage with 7 of 11 files read as done |

> Each right-hand cell points at a **specification** that needs changing, not just a line.
> That is what makes the log worth keeping: the left-hand column tells you what to fix once;
> the right-hand column tells you what to fix so it does not recur.

---

## The rule about "why did the test pass?"

When a defect ships past an existing test, **the test is also a defect**. Three causes, three
different fixes:

| Why it passed | Fix |
|---|---|
| It asserted the happy path only | Add the denial or failure case |
| It asserted a rule **exists** rather than **holds** — e.g. grepping the instructions for "never write outside spec/" | Rewrite it to assert the observable outcome: a checksum, a file listing |
| It asserted generated prose and was quietly loosened until it stopped failing | **The worst case.** Restore the structural assertion and record the loosening as its own defect |

The second row is this project's characteristic version. In a product made of prose,
searching for the rule feels like a test and is only a spell-check.

---

## Feeding defects back

```
BUG-### fixed
   -> regression test added, SEEN TO FAIL against the unfixed version
   -> a row here, with root cause separated from symptom
   -> the specification updated, or its absence recorded as the real defect
   -> if an agent would repeat it: a row in AGENT.md "Lessons from past mistakes"
   -> if it reveals a missing eval case: an answer script added to the golden set
```

**The last two lines are what stop a defect class from recurring.** Fixing one instance is
maintenance; adding the rule and the eval case is the thing that makes the next instance
impossible.

> Blueprint: ../../../spec-driven-template/05-review/04-debugging/debugging-specification.md
