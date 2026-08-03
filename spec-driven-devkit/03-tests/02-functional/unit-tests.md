# Unit Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.2.
> Unit tests check **small pieces of logic** that can be tested without running the entire
> application: calculations, validators, permission checks, formatting rules, helpers.

A good unit test plan names the **rule**, the **input**, the **expected output**, and the
**reason the rule matters**. You do not need final test code here — only behavior clear
enough that code can later be generated against it.

---

## What a "unit" is in a system with no code

ADR-002 means there are no functions to call. The units here are the **rules the intake
enforces**, and each is testable in isolation the same way a validator is: fix the input
state, apply the one rule, assert the output.

| Conventional unit | Unit here |
|---|---|
| A validator function | One inference rule — *given these prior answers, is question X asked?* |
| A business-rule predicate | One depth rule — *given this subdomain class, how deep is this file written?* |
| A parser | One step of the six-step fill procedure (`technical-spec.md` §4) |
| A formatter | One output rule — *is the recommendation stated in words, not by position?* |

**This is where the test density goes.** The interview is the single core subdomain, its
test shape is a pyramid, and 25 of the plan's unit tests sit here. Generic and supporting
areas get none, by design (see the coverage matrix's "deliberately empty cells").

---

| Test ID | Requirement | Rule under test | Normal case | Edge case | Failure case | Status |
|---|---|---|---|---|---|---|
| UTEST-001 | REQ-F-004 | Preamble states the round count before question one | Default depth → "eight rounds" stated | Express depth → the reduced count stated, not eight | Round count absent → fail | Planned |
| UTEST-002 | REQ-F-005 | A round holds at most four questions | 3 questions → accepted | Exactly 4 → accepted | 5 → fail | Planned |
| UTEST-003 | REQ-F-006 | Recommended option is first, marked, and carries a one-line reason | Marked first with reason → pass | Reason present but option second → **fail** (position is not the marking) | No reason text → fail | Planned |
| UTEST-004 | REQ-F-007 | Free text is honoured verbatim | "Claude Code Plugin" typed → used as-is | Text closely resembling an option → still used as typed, **not** snapped to the option | Typed answer replaced by an option → fail | Planned |
| UTEST-005 | REQ-F-008 | At least one question is free-text only | Problem statement asked as free text → pass | — | Every question multiple-choice → fail | Planned |
| UTEST-006 | REQ-F-009 | A derivable question is not asked | "no network calls" answered → hosted-component question suppressed | Partially derivable → asked, narrowed, and the partial inference stated | Derivable question asked anyway → fail | Planned |
| UTEST-007 | REQ-F-009 | A suppressed question produces a stated inference | Suppressed → inference and its source both named | Two questions suppressed → both named | Suppressed silently → **fail** | Planned |
| UTEST-008 | REQ-F-010, BR-012 | Contradictory answers stop and quote both | Two conflicting answers → both quoted verbatim, neither chosen | Answers in tension but reconcilable → proceed on a **stated** assumption | One answer silently chosen → fail | Planned |
| UTEST-009 | REQ-F-011, BR-004 | Hard stop at eight rounds | Round 8 completes → stop | Unknowns remain at round 8 → still stop; unknowns become open questions | A ninth round asked → fail | Planned |
| UTEST-010 | REQ-F-012 | The core-subdomain question is asked | Round 2 asks it → pass | Only one capability in scope → still asked, so the answer is recorded | Never asked → fail | Planned |
| UTEST-011 | REQ-F-013, BR-011 | At most three drivers; push back exactly once | 3 selected → accepted, no push-back | 4 selected → push back **once**, then accept 3, record the rejected one | Push back twice, or accept 4 → fail | Planned |
| UTEST-012 | REQ-F-033 | Express depth reduces rounds and depth | Express → fewer rounds, thinner files | Express → **no stage is skipped entirely**, only written thin | A stage missing under express → fail | Planned |
| UTEST-013 | REQ-F-034 | Depth is a parameter, not a branch | One command, one path, depth as argument | — | A second flow or command exists → fail (mirrors FF-001) | Planned |
| UTEST-014 | REQ-F-016 | Back-link is emitted at the correct relative depth | File at depth 3 → `../../../` prefix | File at repo root of the workspace → `../` prefix | Wrong depth → link does not resolve → fail | Planned |
| UTEST-015 | REQ-F-017, BR-013 | Depth scales by subdomain class | Core area → full chain | Supporting → one page; Generic → integration contract only | Uniform depth applied to all → fail | Planned |
| UTEST-016 | REQ-F-018, BR-007 | Identifiers are unique and never reused | Sequential minting → unique | `REQ-F-007` deleted → next is `REQ-F-008`, the hole is permanent | A deleted ID reused → fail | Planned |
| UTEST-017 | REQ-F-019, BR-003 | Unknown facts become `[TODO]`, never a guess | Fact absent → `[TODO: <exact question>]` | Fact partially known → what is known is written, the gap is `[TODO]` | A plausible value substituted → **fail** | Planned |
| UTEST-018 | REQ-F-037 | A failing file is re-filled exactly once | Fails once → re-filled, passes | Fails twice → `[TODO]` + `Q-###` + report line | A third attempt made → fail | Planned |
| UTEST-019 | REQ-F-024, BR-008, SEC-Z-001 | Path check runs **after** normalisation | `spec/01-docs/x.md` → allowed | `spec/../spec/x.md` → normalises inside → allowed | `spec/../../etc/hosts` → **rejected despite the `spec/` prefix** | Planned |
| UTEST-020 | REQ-F-027, BR-002 | The worked-example section is removed whole | `# WORKED EXAMPLE` and everything after it deleted | A trailing blueprint-source line after it → preserved, example still removed | Any example content surviving → fail | Planned |
| UTEST-021 | REQ-F-028 | Stage completeness is derived, not stored | 4 stages of artifacts present → "complete through 4" | A stage with 7 of 11 files → **incomplete**, redone from its start | A state file read or written → **fail** | Planned |
| UTEST-022 | REQ-F-029, BR-009 | A check that did not run is never reported as passed | 12 ran, 12 passed → "12 of 12 ran; all passed" | 11 ran, 1 skipped → the skipped one reports **not run** | Skipped reported as passed, or only failures reported → fail | Planned |
| UTEST-023 | REQ-NF-002 | `.gitignore` is written before `.env.example` | `.gitignore` first → pass | Both in one round → order still enforced within the round | `.env.example` written first → fail | Planned |
| UTEST-024 | REQ-NF-005 | Question and blueprint content are independently changeable | Question edited → zero blueprint files change | Blueprint edited → zero flow files change | Either edit forces the other → fail (mirrors FF-002) | Planned |
| UTEST-025 | REQ-NF-006 | No meaning is carried by colour or symbol alone | "(Recommended)" stated in words | Status stated in words, not by a tick alone | Meaning lost when colour is stripped → fail | Planned |
| UTEST-026 | REQ-F-038 | The gate blocks the next round | Gate shown → next round waits | Developer gives no answer → **still waits**; never proceeds on silence | Next round asked before a decision → fail | Planned |
| UTEST-027 | REQ-F-038 | The gate shows **decisions**, not just filenames | 4 decisions recorded → all 4 shown | A round with **no** decisions → says so plainly as suspicious | Only a file list shown → fail | Planned |
| UTEST-028 | REQ-F-041, ADR-006 | Acceptance is a row in the workspace, never a file | Accept → dated row appended | Accept twice (re-run) → **no duplicate row** | An acceptance/progress file created → **fail** | Planned |
| UTEST-029 | REQ-F-041, REQ-F-028 | Acceptance state is derived by reading rows | Rows 1–4 present → resume at gate 5 | Round 4 files written, **no row** → re-present round 4's gate, do not re-ask its questions | Advancing past an unaccepted round → fail | Planned |
| UTEST-030 | REQ-F-042 | Integrity is verified before the first write | All checksums match → proceed | One blueprint unlisted in the manifest → **stop** | Altered blueprint accepted as "close enough" → fail | Planned |
| UTEST-031 | REQ-F-043 | The stage's required outputs come from the library | Blueprint added + manifest updated → it becomes required | Blueprint listed but conditionally skippable → recorded skip, not silence | A hardcoded file list in the instruction set → fail | Planned |

---

## Template

```
UNIT TEST PLAN: [rule name]
Requirement ID: REQ-###
Rule: [the rule in one sentence]

Normal case:  [input] -> [expected]
Edge case:    [input] -> [expected]
Failure case: [input] -> [expected, with a clear error]

Why this rule matters:
```

Executable tests live in [`../05-executable/unit/`](../05-executable/unit).

---

## Written out — the four most likely to be got wrong

```
UNIT TEST PLAN: Path boundary check
Test ID: UTEST-019
Requirement ID: REQ-F-024, BR-008, SEC-Z-001
Rule: A destination path must resolve inside spec/ AFTER normalisation.

Normal case:  "spec/01-docs/01-intent/intent.md"  -> allowed
Edge case:    "spec/../spec/01-docs/intent.md"    -> normalises inside spec/ -> allowed
Failure case: "spec/../../etc/hosts"              -> REJECTED, and the message names the
                                                     path only - never the file's contents

Why this rule matters:
  The obvious implementation is a prefix check, and a prefix check passes
  "spec/../../etc/hosts" because it starts with "spec/". Normalise first, then compare.
  This is the single most likely security defect in the whole product, and it is one
  line of ordering.
```

```
UNIT TEST PLAN: Inference must be stated
Test ID: UTEST-007
Requirement ID: REQ-F-009
Rule: A question suppressed because a prior answer settled it must produce a stated
      inference naming both the conclusion and the answer it came from.

Normal case:  question suppressed -> "I inferred X from your answer Y"
Edge case:    two suppressed in one round -> both stated, separately
Failure case: question suppressed with no notice -> FAIL

Why this rule matters:
  DD-007 makes inference the source of depth, which makes silent inference the source of
  hidden assumptions. BR-003 forbids invention in the file; this forbids it in the
  interview. An unstated inference is exactly a guess the developer never got to correct.
```

```
UNIT TEST PLAN: Not-run is not passed
Test ID: UTEST-022
Requirement ID: REQ-F-029, BR-009
Rule: Every validation check reports passed, failed, or NOT RUN - and not-run is never
      inferred to be passed.

Normal case:  12 checks run, all pass -> "All 12 checks ran; all 12 passed."
Edge case:    11 run, 1 could not run -> that one reports NOT RUN, by name
Failure case: report lists only failures, so "no output" reads as success -> FAIL

Why this rule matters:
  "No failures" and "nothing was checked" are indistinguishable to a reader unless the
  count of checks RUN is stated. This is BR-009's exact failure mode, and it is how a
  workspace ships looking validated when it never was.
```

```
UNIT TEST PLAN: Push back exactly once
Test ID: UTEST-011
Requirement ID: REQ-F-013, BR-011
Rule: More than three driving characteristics triggers ONE push-back with the reason;
      then at most three are accepted and the rejected ones are recorded.

Normal case:  3 selected           -> accepted, no push-back
Edge case:    4 selected           -> push back once -> 3 accepted -> rejected one recorded
                                      with its reason
Failure case: 4 selected -> pushed back twice, OR 4 accepted silently -> FAIL

Why this rule matters:
  Both failure directions are real. Never pushing back lets the method fail quietly and
  produces a workspace that prioritises nothing. Pushing back twice is arguing with the
  developer about their own product, which is the fastest route to abandonment (RSK-1).
```

---

## What belongs here vs. elsewhere

| This is a unit test | This is NOT a unit test |
|---|---|
| The path check rejects `spec/../../etc` after normalisation. | A full intake writes nothing outside `spec/` → security (STEST-002). |
| A suppressed question emits an inference notice. | A whole interview stays under eight rounds → end-to-end (ETEST-006). |
| The back-link prefix is correct for depth 3. | A generated file's back-link resolves to a real blueprint → integration (TEST-006). |
| The worked-example section is removed whole. | No workspace anywhere contains example content → integration (TEST-014). |
| Stage completeness is derived from artifacts. | Interrupting each of eight stages resumes correctly → end-to-end (ETEST-009). |

> **What has no unit tests, and why.** Plugin packaging, distribution, and file writing are
> **generic** subdomains — the map says adopt, not build. Unit-testing them would test the
> host's mechanisms rather than the kit's rules. They get contract and failure tests only.
> The blueprint library is **supporting** and is Markdown; "is this heading still present"
> is an integration assertion against a generated artifact, not a unit of logic.

> Blueprint: ../../../spec-driven-template/03-tests/02-functional/unit-tests.md
