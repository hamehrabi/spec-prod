# Acceptance Tests

> Source: Ch. 4 §4.6, Ch. 3 §3.6.
> Checks whether requirements work **from the user or business view**.

Written in Given–When–Then, derived directly from the acceptance criteria in
[`requirements.md`](../../01-docs/02-requirements/requirements.md) §6.

> **Derived from acceptance criteria, never from code.** There is no code yet, which makes
> that guarantee unusually easy to keep — and worth keeping deliberately once there is.

---

| Test ID | Requirement | AC | Scenario | Expected result | Status |
|---|---|---|---|---|---|
| ATEST-001 | REQ-F-001 | AC-001 | Install into a clean repository with no prior setup and no network beyond the host | Kit is available; no account, key, or download was needed | Planned |
| ATEST-002 | REQ-F-002 | AC-002 | Run the intake command on a fresh repository | Interview begins with no configuration step in between | Planned |
| ATEST-003 | REQ-F-003 | — | Run a full intake with the network blocked at the OS | Every blueprint was read from local disk; intake completes | Planned |
| ATEST-004 | REQ-F-004 | AC-003 | Start a fresh intake | Developer is told what happens and roughly how many rounds, **before** question one | Planned |
| ATEST-005 | REQ-F-005 | AC-004 | Inspect every question round | No round contains more than four questions | Planned |
| ATEST-006 | REQ-F-006 | AC-004 | Inspect every multiple-choice question | Recommended option is first, marked, and carries a one-line reason | Planned |
| ATEST-007 | REQ-F-007 | AC-005 | Answer a question with text that matches no option | The typed answer is used verbatim; no option is substituted | Planned |
| ATEST-008 | REQ-F-008 | — | Complete Round 1 | At least one free-text question was asked, and it asked for the problem, not features | Planned |
| ATEST-009 | REQ-F-009 | AC-006 | Answer something that determines a later question | That question is not asked, and the inference is stated to the developer | Planned |
| ATEST-010 | REQ-F-010 | AC-007 | Give two answers that cannot both hold | Intake stops, quotes **both** verbatim, asks which holds, picks neither | Planned |
| ATEST-011 | REQ-F-011 | AC-008 | Reach round eight with unknowns remaining | No ninth round; every unknown appears in the generated open-questions file | Planned |
| ATEST-012 | REQ-F-012 | — | Complete Round 2 | The developer was asked to name the one capability they compete on | Planned |
| ATEST-013 | REQ-F-013 | AC-009 | Select four driving characteristics | Push-back **once** with the reason; at most three accepted; rejected ones recorded | Planned |
| ATEST-014 | REQ-F-033 | AC-031 | Run at express depth | Workspace is thinner, fewer rounds, **every structural rule still holds** | Planned |
| ATEST-015 | REQ-F-014 | AC-010 | Complete an intake in any repository | Workspace is at `spec/` at the repository root | Planned |
| ATEST-016 | REQ-F-015 | AC-011 | Interrupt immediately after Round 3 | Rounds 1–3 files exist on disk and are readable | Planned |
| ATEST-017 | REQ-F-016 | AC-012 | Open any generated file | Headings match its blueprint in order; final line is a back-link that resolves | Planned |
| ATEST-018 | REQ-F-017 | AC-030 | Inspect a supporting-subdomain spec | One page with acceptance-level tests — not the core area's full chain | Planned |
| ATEST-019 | REQ-F-018 | AC-013 | Look up every identifier referenced in a task or test | Each resolves to a definition in the same workspace | Planned |
| ATEST-020 | REQ-F-019 | AC-014 | Withhold a fact the intake needs | File carries `[TODO: <exact question>]`; open-questions lists it; **no value was substituted** | Planned |
| ATEST-021 | REQ-F-020, REQ-NF-009 | AC-015 | Check the entry-point file on a complete workspace | Under 100 lines; every path in it resolves | Planned |
| ATEST-022 | REQ-F-021 | AC-016 | Find a permission rule in a generated workspace | At least one **deny** test exists for it | Planned |
| ATEST-023 | REQ-F-022 | AC-017 | Find a driving characteristic in a generated workspace | At least one fitness function with a build-failing threshold exists for it | Planned |
| ATEST-024 | REQ-F-037 | AC-035 | Force a generated file to fail its structural check twice | File carries `[TODO]`, a `Q-###` exists, the report names it, **no third attempt** | Planned |
| ATEST-025 | REQ-F-023 | AC-018 | Inspect every file of a complete intake | None contains application source code, in any language | Planned |
| ATEST-026 | REQ-F-024 | AC-019 | Trigger a write outside `spec/` | Intake stops and asks, naming the file and what would change | Planned |
| ATEST-027 | REQ-F-025 | AC-020 | Run a first intake | Developer was prompted per file; no blanket write permission was requested | Planned |
| ATEST-028 | REQ-F-026 | AC-021 | Complete an intake in a repository with a root `CLAUDE.md` | That file is byte-for-byte unchanged; the exact line to add was printed | Planned |
| ATEST-029 | REQ-F-027 | AC-022 | Search a complete workspace for the blueprint example's product name | Zero matches | Planned |
| ATEST-030 | REQ-F-035 | AC-033 | Complete an intake in a repository with a `.gitignore` | That file is byte-for-byte unchanged; no rule ignoring `spec/` was added | Planned |
| ATEST-031 | REQ-F-036 | AC-034 | Start an intake where `spec/` holds unrelated files | Stops before writing; explains; offers an alternative; `spec/` unchanged | Planned |
| ATEST-032 | REQ-F-028 | AC-023 | Re-run intake on a workspace complete through Round 4 | Reports 1–4 complete, asks Round 5, **does not re-ask Round 1** | Planned |
| ATEST-033 | REQ-F-029 | AC-024 | Validate a workspace with a dangling identifier | Reports that failure; does **not** claim success | Planned |
| ATEST-034 | REQ-F-030 | AC-025 | Finish an intake | Report states file count, every `[TODO]`, every blocking question, every assumption | Planned |
| ATEST-035 | REQ-F-031 | — | Finish an intake | A copy-pasteable hand-off instruction is printed with no placeholder left in it | Planned |
| ATEST-036 | REQ-F-032 | — | Answer any round | The developer can see which round they are on and how many remain | Planned |
| ATEST-037 | REQ-NF-004 | — | Give the kit to someone who has read no documentation | They install and answer Round 1 using only the command's own output | Planned |
| ATEST-038 | REQ-NF-006 | — | Read all output with colour stripped | No meaning is lost; no status depends on colour or symbol alone | Planned |
| ATEST-039 | REQ-R-004 | AC-029 | Decline one file write | Intake continues; the run completes; the workspace stays resumable | Planned |
| ATEST-040 | REQ-R-005 | — | Open any generated task file | It names the files the agent may change **and** the files it must not | Planned |
| ATEST-041 | REQ-F-038 | AC-036 | Complete a round | The gate presents files, decisions, inferences, and `[TODO]`s — and **the next round's questions are not asked** until the developer responds | Planned |
| ATEST-042 | REQ-F-039 | AC-037 | Choose **revise** at a gate | That round's questions are re-asked, its files rewritten in place, the gate shown again; no other round affected | Planned |
| ATEST-043 | REQ-F-039 | AC-038 | Choose **stop** at a gate | Session ends; accepted rounds' files remain; re-running resumes at the unaccepted round | Planned |
| ATEST-044 | REQ-F-040 | AC-039 | Complete an intake, then check every blueprint in the library | Each produced a file or is recorded as skipped with a reason. Silently unused = **0** | Planned |
| ATEST-045 | REQ-F-041 | AC-040 | Accept rounds 1–4, then list every file | Four dated acceptance rows exist in the change-control artifact; **no acceptance/progress/approval file anywhere** | Planned |
| ATEST-046 | REQ-F-042 | AC-042 | Alter one shipped blueprint by a single byte, then start intake | Stops **before writing anything**, names the altered blueprint, does not proceed on a near match | Planned |
| ATEST-047 | REQ-F-043 | AC-044 | Add a blueprint + manifest entry, change nothing else, run intake | It produces a file or a recorded skip, with **zero** changes to the intake instruction set | Planned |

---

## Format

```
ATEST-001
Requirement: REQ-F-001
Acceptance criterion: AC-001

Given  [starting condition]
When   [user action or system event]
Then   [expected result]

Evidence to capture:
Status: Planned / Written / Passing / Failing / Blocked
```

---

## Written out — the five that carry the most weight

```
ATEST-020
Requirement: REQ-F-019
Acceptance criterion: AC-014

Given  an intake where the developer has not supplied a fact the spec needs
       (for example, no target number for a success measure)
When   the file needing that fact is written
Then   the file contains "[TODO: <the exact question>]" naming the question
And    the generated open-questions file has a matching Q-### row with a decision owner
And    NO plausible-looking value was substituted anywhere in that file
And    the closing report names it among the remaining [TODO]s

Evidence to capture: the [TODO] line, the Q-### row, the report line
Status: Planned

Why this one matters: an invented metric is indistinguishable from a real one once
written down. This is the test that separates a spec from a plausible-looking document.
```

```
ATEST-024
Requirement: REQ-F-037
Acceptance criterion: AC-035

Given  a blueprint crafted so the fill step leaves a placeholder behind
When   intake generates that file and validation detects the surviving placeholder
Then   the file is re-filled exactly ONCE, silently
And    if it fails again the file carries [TODO] with the reason
And    a matching Q-### row exists
And    the closing report names the file
And    NO third attempt is made

Evidence to capture: attempt count, the [TODO], the Q-### row, the report line
Status: Planned

Why this one matters: it tests the bound, not the retry. An unbounded retry against a
non-deterministic generator burns a session on one file and hides the evidence that the
instruction is wrong.
```

```
ATEST-028
Requirement: REQ-F-026
Acceptance criterion: AC-021

Given  a repository containing a root CLAUDE.md the developer has tuned
And    a recorded checksum of that file
When   a complete intake finishes
Then   the checksum is unchanged, byte for byte
And    the kit's own entry point exists INSIDE spec/
And    the exact line the developer may add to their file was printed
And    the kit never proposed a write to their CLAUDE.md at any point

Evidence to capture: before/after checksum, the printed line, the write log
Status: Planned

Why this one matters: it is Persona 2's entire reason for trusting the kit on real work.
```

```
ATEST-032
Requirement: REQ-F-028
Acceptance criterion: AC-023

Given  a workspace complete through Round 4 and no other record of progress
When   the developer runs the intake command again
Then   intake reports Rounds 1-4 complete
And    asks Round 5's questions
And    does NOT re-ask any question from Rounds 1-4
And    no state, progress, or answer file is read or written anywhere

Evidence to capture: the resume report, the first question asked, a file listing
Status: Planned

Why this one matters: the last clause is the real assertion. Resume working is table
stakes; resume working WITHOUT a state file is ADR-004 holding.
```

```
ATEST-013
Requirement: REQ-F-013
Acceptance criterion: AC-009

Given  a developer at the driving-characteristics question
When   they select four
Then   intake pushes back exactly ONCE, stating why more than three prioritises nothing
And    accepts at most three after that
And    records the rejected candidate(s) with the reason in the generated file
And    does NOT push back a second time if they insist

Evidence to capture: the push-back text, the final three, the rejected list
Status: Planned

Why this one matters: "exactly once" is the assertion. Never pushing back lets the method
fail silently; pushing back twice is nagging the developer about their own product.
```

---

## Rule

Every **Must** requirement needs at least one acceptance test. An acceptance test that
cannot fail is not a test — state the exact observable result, not "it works."

**The trap this project is most likely to fall into:** an acceptance test that reads the
generated prose and judges it. That cannot fail reliably, because the prose varies between
runs (ADR-002). Every test above asserts a **countable or checkable** fact — a file exists,
a checksum is unchanged, a count is zero, a specific string is present or absent. Quality
that can only be judged is scored against a floor in
[`ai-evals.md`](../03-non-functional/ai-evals.md), not asserted here.

> Blueprint: ../../../spec-driven-template/03-tests/02-functional/acceptance-tests.md
