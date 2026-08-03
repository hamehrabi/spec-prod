# Debugging Specification

> Source: Ch. 19 §19.6.
> The bug log. Every entry separates **root cause from symptom**, names the regression test,
> and names **the specification that should have prevented it**.

---

## Bug log

| ID | Date | Symptom | **Root cause** (≠ symptom) | Regression test | **Spec that should have prevented it** | Status |
|---|---|---|---|---|---|---|
| **BUG-001** | 2026-08-03 | FF-001 passed a payload containing a second command that routed to a second orchestration module. | **The check counted its two thresholds over the same set.** It derived entry paths from the *user-invocable* commands only, so `user-invocable: false` removed a command from the command count **and** hid its path. `fitness-functions.md` FF-001 states two independent counts; the implementation collapsed them into one. | UTEST-013, third case — **seen to fail** against the unfixed check | `fitness-functions.md` FF-001. The register was correct and unambiguous; the implementation narrowed it. Nothing needed changing in the spec | **Fixed** |

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
