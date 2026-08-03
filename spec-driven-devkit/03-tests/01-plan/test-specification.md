# Test Specification

> Source: Ch. 17 §17.8 + Appendix G.
> Explains **how a requirement will be verified**, clearly enough that you, another
> developer, or an AI agent can later create the actual tests from it.

---

## Per-test fields (Appendix G)

| Field | What to write |
|---|---|
| Test ID | Unique identifier such as `TEST-001`. |
| Related requirement | Requirement ID this test verifies. |
| Test level | Unit, integration, end-to-end, security, performance, failure, eval, or regression. |
| Scenario | Plain-language behavior being tested. |
| Preconditions | Repository state, answer script, and depth argument. |
| Input data | The answer script; valid, minimal, oversized, contradictory, or adversarial. |
| Expected result | Observable outcome — **a count, a checksum, a path, or a present/absent string.** Never a judgement about prose. |
| **Must not happen** | What must be absent from the output and from disk. In this project this field carries more weight than the expected result. |
| Failure meaning | What it means if this test fails. |
| Automation status | Manual, planned, automated, or blocked. |
| Owner | Person or role responsible for maintaining the test. |

> **One field added to the blueprint's list, deliberately:** *Must not happen*. In a system
> whose output is documents, the dangerous defects are all things that quietly happened —
> a file touched outside `spec/`, an invented metric, a success claim on an unrun check.
> Asserting only the expected result would miss every one of them.

## Test case template

```
Test ID:
Requirement covered:
Test level:
Actor:                      developer / intake agent / build agent
Preconditions:              [repository state, answer script, depth]
Input or action:
Expected result:            [countable / checkable]
Boundary expectation:       [what may be written, and where]
Error or empty-state expectation:
Must NOT happen:            [absent from output; absent from disk]
Evidence to capture:        [file listing, checksums, report text, workspace state]
Failure meaning:
Automation status:          Manual / Planned / Automated / Blocked
Owner:
Status:                     Not run / Pass / Fail / Needs review
```

---

## Test specification matrix

Full per-test detail lives in the level files; this matrix is the index across all of them.
ID prefixes: `ATEST` acceptance · `UTEST` unit · `TEST` integration · `ETEST` end-to-end ·
`STEST` security · `PTEST` performance · `FTEST` failure · `EV` eval.

| Test ID | Req | Level | Scenario | Preconditions | Input | Expected result | Risk covered | Status |
|---|---|---|---|---|---|---|---|---|
| ATEST-001…040 | REQ-F-001…037, REQ-NF-004/006, REQ-R-004/005 | Acceptance | One per acceptance criterion in `requirements.md` §6 | Varies per case | Answer scripts | Given–When–Then outcome | Requirement not met from the developer's view | Planned |
| UTEST-001…025 | Core-subdomain rules | Unit | One rule in isolation: an inference rule, a depth rule, one fill step | Fixed prior-answer state | One rule's input | Normal / edge / failure per rule | The interview behaving differently than specified | Planned |
| TEST-001…018 | Contracts C1, C2, C3 | Integration | Blueprint → artifact; command → workspace; workspace → build agent | A repository and a blueprint | One generation | Structure preserved, side effects absent | The pieces working alone but not together | Planned |
| ETEST-001…012 | Whole-run properties | End-to-end | Full intake, resume ×8, platforms ×3, offline, hand-off | Clean or seeded repository | Answer script | Whole-workspace outcome | The product not working as a product | Planned |
| STEST-001…014 | Every **No** in the actor matrix | Security | One denial per forbidden action | Seeded repository | Boundary-crossing attempt | Refusal + nothing written | A boundary that is an intention rather than a rule | Planned |
| PTEST-001…004 | REQ-NF-001 | Performance | Progress visibility; validation cost; blueprint read count | Full run | Answer script | Ordering assertions, not durations | The developer left waiting with no output | Planned |
| FTEST-001…018 | Nine failure states | Failure | One per named failure state, plus edge cases | Fault injected | Trigger condition | Named message + what survived | A failure that corrupts, hides, or lies | Planned |
| EV-001…036 | The whole instruction set | Eval | 36 answer scripts scored on 13 scorers | Clean repository | Answer script | 11 deterministic scores + 2 human | **A change to a question that reads better and works worse** | Planned |

**Status values:** Planned · Written · Passing · Failing · Blocked

---

## Test levels (Appendix G)

| Test type | Question it answers | Example here |
|---|---|---|
| Unit | Does one rule behave correctly? | The path check rejects `spec/../../etc` after normalisation. |
| Integration | Do connected parts work together? | A blueprint becomes an artifact with its structure intact and its example gone. |
| End-to-end | Can a user complete the workflow? | A full intake, then a fresh session works TASK-001 from one instruction. |
| Security | Can rules be bypassed? | The kit is asked politely, mid-interview, to write some code. |
| Performance | Does the system respond under expected load? | No stretch longer than one round passes with no output. |
| Failure | Does it fail safely? | A missing blueprint stops that file and leaves prior rounds intact. |
| **Eval** | **Did a change help?** | 36 answer scripts scored before and after a question is reworded. |

---

## Reviewing AI-generated tests (Ch. 18 §18.2)

Never accept generated tests just because they look professional. A test can be
well-formatted and still be weak.

| Review area | Question to ask | How to fix weakness |
|---|---|---|
| Requirement link | Does this test prove a specific requirement or acceptance criterion? | Add the requirement ID beside the test. |
| Clear assertion | Does the test check a real expected result? | Replace vague checks with exact counts, checksums, paths, or present/absent strings. |
| Failure path | Does it cover what happens when something goes wrong? | Add the interrupt, the decline, the missing blueprint, the traversal path. |
| No invented behavior | Did the AI add behavior not in the spec? | Remove it — or update the spec first. |
| Stable data | Can the test run repeatedly with predictable results? | Use a named answer script and a clean repository fixture. |
| **Must-not clause** | Does it assert what must *not* have happened? | Add the checksum of every file outside `spec/`. Half the real defects live here. |

**Shallow vs. useful:** a shallow test gives you confidence without proof.

### The three shallow tests this project will produce if nobody watches

Named specifically, because they are the ones that look right:

| Shallow version | Why it proves nothing | Useful version |
|---|---|---|
| `assert "REQ-F-001" in requirements.md` | Proves a string exists. A file of nothing but IDs would pass. | Assert every ID **referenced anywhere** resolves to a definition, and none is defined twice. |
| `assert workspace has 87 files` | A count says nothing about content. 87 empty files pass. | Assert each file's headings match its blueprint, no placeholder survives, and the back-link resolves. |
| `assert "never write outside spec/" in instructions.md` | **Asserts that a rule was written down.** The rule being present is not the rule being followed. | Run a full intake and assert the checksum of every file outside `spec/` is unchanged. |

> The third is the one to watch for. In a project whose source *is* prose, "grep for the
> rule" feels like a test and is only a spell-check.

---

## The specification-level rule this project runs on

> **Every test asserts something countable, checkable, or byte-comparable.**
>
> ADR-002 makes the output non-deterministic, so any assertion about generated *prose* is
> either flaky or vacuous. Quality that genuinely requires judgement is not asserted here at
> all — it is scored against a floor in
> [`ai-evals.md`](../03-non-functional/ai-evals.md), by 11 deterministic scorers and 2
> human ones, and the human ones are honest about being human.

> Blueprint: ../../../spec-driven-template/03-tests/01-plan/test-specification.md
