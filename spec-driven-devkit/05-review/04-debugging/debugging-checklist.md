# Debugging Checklist

> Source: Ch. 19.
> **Evidence first.** State expected, actual, the failing test, and the output **before**
> asking an agent for a fix. An agent given a symptom will produce a plausible fix for a
> problem you have not yet identified.

---

## Before asking anyone — human or agent — for a fix

- [ ] **Expected:** what should have happened, quoted from the requirement or acceptance criterion
- [ ] **Actual:** what did happen, quoted from the output — not paraphrased
- [ ] **The failing test:** which test ID fails? If none does, **write it first**
- [ ] **The evidence:** the report text, the file listing, the checksums — whatever the assertion is about
- [ ] **Reproduction:** version, platform, answer script, repository fixture
- [ ] **Scope:** which files are actually implicated?

> If you cannot fill in the first four, you do not have a defect yet. You have a symptom, and
> asking for a fix will get you a change rather than a correction.

## Reproduce before diagnosing

- [ ] Reproduced with a **fixed answer script**, not an ad-hoc run
- [ ] Reproduced at least twice — **ADR-002 makes the system non-deterministic**, so a
      one-off may be variance rather than a defect
- [ ] Identified whether it reproduces on the **published** version, the branch, or both
- [ ] If it reproduces intermittently: **that is itself the finding.** Record the frequency

**The non-determinism trap:** in a system with no compiler, a failure that occurs once looks
identical to a failure that occurs always. Running it three times costs a minute and changes
the diagnosis completely.

## Localise

- [ ] Which module? Manifest · intake instructions · question set · blueprint library · validation
- [ ] Which of the six fill steps, if it is a generation defect?
- [ ] Which of the twelve checks, if validation missed it?
- [ ] Is it a **rule that is wrong**, or a **rule that is right and was not followed**?

> That last question is the one that matters most in this product. A wrong rule is a
> specification defect. A right rule that was not followed is an **instruction clarity**
> defect — and the fix is different: clearer prose, not different behaviour.

## Root cause, not symptom

- [ ] Stated the root cause in one sentence
- [ ] It explains **all** the observed evidence, not just the first symptom
- [ ] Confirmed it is not just the first plausible explanation
- [ ] Asked: **could this class of defect exist elsewhere?** Prose defects rarely occur alone

## Before the fix

- [ ] A test exists that **FAILS** against the current version
- [ ] It asserts structure, never generated prose
- [ ] It would have caught this defect originally

## After the fix

- [ ] The test passes
- [ ] The full gate passes — not just the new test
- [ ] The evals still pass; **the fix did not shift quality elsewhere**
- [ ] Row added to [`debugging-specification.md`](debugging-specification.md), with root cause separated from symptom
- [ ] **If it reveals a repeatable mistake: a row in `AGENT.md` "Lessons from past mistakes"**
- [ ] The specification that *should* have prevented it was updated, or its absence recorded

---

## The four defect classes in this project, and where to look first

| Symptom | Most likely cause | Look at |
|---|---|---|
| A generated file is hollow or malformed | **Fill step 4** — the placeholder inventory is incomplete | `fill.md`; FF-005; FTEST-006 |
| A workspace passed validation but is wrong | A check that did not run, reported as passed | `validation.md`; BR-009; UTEST-022 |
| A file appeared outside `spec/` | The path check ran **before** normalisation, or a prefix match | `boundary.md`; UTEST-019; STEST-003 |
| Resume re-asked a completed round | Stage derivation misread the artifacts | `resume.md`; UTEST-021; ETEST-009 |

## Never do these while debugging

- Never weaken or delete a test to make something pass
- Never fix by adding a script or a state file — that is superseding an ADR, not debugging
- Never fix a blueprint to match a wrong output; fix the fill step
- Never edit `spec/` in this repository to make a defect go away
- Never ship a fix without a test that failed against the unfixed version

> Blueprint: ../../../spec-driven-template/05-review/04-debugging/debugging-checklist.md
