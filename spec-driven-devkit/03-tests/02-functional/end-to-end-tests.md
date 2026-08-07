# End-to-End Test Plan

> Source: Front Matter workspace (`03-tests/end-to-end/`), Ch. 17 §17.4, Ch. 18 §18.7.
> E2E tests prove the system works **from the user's point of view**, not only from the
> code's point of view.

> **Practical rule (Ch. 17 §17.4):** if a user would complain loudly when a flow breaks,
> that flow deserves an end-to-end test plan.

Keep E2E tests focused. Do not try to cover every tiny rule with them — use them for the
flows that decide whether the product is usable.

---

## Which flows earned one

| Flow | Earned an E2E test? | Reasoning |
|---|---|---|
| A complete intake in a clean repository | **Yes** | If this breaks, the product does not exist. |
| **Resume after interruption, at every stage** | **Yes — eight of them** | Reliability is a driving characteristic and its measure is literally *8/8*. One happy-path resume test would satisfy the word "reliable" and miss the stage where it actually breaks. |
| The build agent reading the finished workspace | **Yes** | This is the C3 contract and the product's whole proposition. A workspace that no fresh session can use is a failed intake, however well-formed. |
| Express depth | **Yes** | A second depth that nobody exercises end to end will rot — which is exactly what DD-006 was written to prevent. |
| Zero network calls | **Yes** | Only observable across a whole run. A per-file assertion cannot prove it. |
| Three platforms | **Yes** | REQ-NF-008 is about the whole run, not any one write. |
| Round-count limit, and inference across rounds | **Yes** | Both are emergent over a full interview and invisible in any single round. |
| A single question's option ordering | **No** | Unit test (UTEST-003). |
| Back-link depth arithmetic | **No** | Unit test (UTEST-014). |
| The path boundary check | **No** | Unit (UTEST-019) plus security denial (STEST-002). An E2E test here would be slower and prove less. |

---

| Test ID | Requirement | User flow | Goal | Expected result | Status |
|---|---|---|---|---|---|
| ETEST-001 | REQ-F-020, REQ-NF-009 | Entry point is usable | A fresh session can orient from one file | Entry point under 100 lines; every path resolves; written last | Planned |
| ETEST-002 | REQ-F-018 | Identifiers resolve across the workspace | A build agent can find the requirement behind any task | Zero dangling references in a complete workspace | Planned |
| ETEST-003 | REQ-R-005 | **Hand-off to a build session** | One instruction produces correct, in-scope work | Agent restates the task, names its requirement, lists files — **before editing** | Planned |
| ETEST-004 | REQ-F-001, REQ-F-002, REQ-F-014 | **A complete intake, clean repository** | The product works | `spec/` exists, all stages complete, validation passes, hand-off printed | Planned |
| ETEST-005 | REQ-F-007, REQ-F-009 | Free text and inference over a whole interview | The interview adapts to what it was told | Typed answers used verbatim; derivable questions suppressed with stated inferences | Planned |
| ETEST-006 | REQ-F-011, BR-004 | The eight-round ceiling | The interview ends | No ninth round; remaining unknowns are open questions | Planned |
| ETEST-007 | REQ-F-033, REQ-F-017 | **Express depth, end to end** | A thinner workspace, not a weaker one | Two questions a round instead of four, thinner files, the same eight rounds, **every structural rule still holds, no stage skipped** | Planned |
| ETEST-008 | REQ-F-015, BR-005 | Write-after-each-round | Stopping early still leaves value | After each round *N*, that round's files are on disk before round *N+1* is asked | Planned |
| **ETEST-009** | REQ-F-028, REQ-NF-003 | **Interrupt and resume — ×8, one per stage** | Reliability driver, measured | For every stage 1–8: interrupt mid-stage, re-run, resume at that stage, complete | Planned |
| ETEST-010 | REQ-F-030, REQ-F-031 | Closing report and hand-off | The developer knows what to do next | Report names count, `[TODO]`s, blocking questions, assumptions; instruction is copy-pasteable | Planned |
| ETEST-011 | REQ-NF-007, BR-014 | **Offline run** | The privacy promise holds | Full intake completes with the network blocked at the OS; zero outbound requests | Planned |
| **ETEST-012** | REQ-NF-008 | **Same answers on Windows, macOS, Linux — ×3** | Portability | Workspaces differ only in line endings; every relative link resolves on all three | Planned |
| **ETEST-013** | REQ-F-038, REQ-F-039 | **Accept · revise · stop, across a whole intake** | The gate governs progress | Every round gates; revise re-runs one round only; stop leaves a resumable workspace | Planned |
| **ETEST-014** | REQ-F-041, REQ-NF-003 | **Interrupt between writing and accepting — ×8** | Acceptance survives interruption | For each stage: kill after the files are written but before acceptance → resume re-presents **that gate**, does not re-ask its questions, does not advance | Planned |
| **ETEST-015** | REQ-F-040, REQ-F-042 | **Library integrity and coverage over a full run** | The blueprint is authoritative and untouched | Every blueprint filled or recorded-skipped; every checksum identical before and after | Planned |

---

## Flow test template

```
Test ID:
Requirement:
Flow name:

Preconditions:      [repository state, depth argument, seeded files]

Steps:
1.
2.
3.

Expected visible result:
Failure path tested:
Expected error result:
Evidence to capture:   [file listing, checksums, report text, workspace state]
Status:
```

---

## Written out — the two that carry the drivers

```
Test ID:      ETEST-009  (eight cases: one per stage)
Requirement:  REQ-F-028, REQ-NF-003
Flow name:    Interrupt and resume

Preconditions: a clean repository; the fixed answer script "solo-web-app"

Steps, repeated for N = 1..8:
1. Run intake with the answer script.
2. Terminate the session mid-way through stage N, after some but not all of that
   stage's files have been written.
3. Record the full file listing and every file's contents.
4. Re-run the intake command.
5. Let it run to completion.

Expected visible result:
  - The resume report names stages 1..N-1 as complete
  - It identifies stage N as incomplete and redoes it FROM ITS START
  - No question from stages 1..N-1 is re-asked
  - The run completes and validation passes

Failure path tested:
  Terminate during the entry-point write (the last file of the last stage).

Expected error result:
  - Resume detects the workspace as complete-but-for-the-entry-point
  - It writes the entry point and validates
  - It does NOT re-run the interview

Evidence to capture: file listing at interruption, the resume report, the final
                     validation report, and a check that NO state/progress/cache
                     file exists at any point
Status: Planned

Why eight and not one: the measure in driving-characteristics.md is "8/8". A single
happy-path resume proves resume exists; it does not prove it works at the stage where
the workspace is most ambiguous. The last clause - no state file - is ADR-004 holding
under the one condition that would most tempt a shortcut.
```

```
Test ID:      ETEST-003
Requirement:  REQ-R-005, and the whole C3 contract
Flow name:    Hand-off to a build session

Preconditions: a complete golden workspace; a FRESH session with no memory of the
               interview; no other instruction given

Steps:
1. Open a new session in the repository.
2. Give exactly the instruction the closing report printed, verbatim.
3. Observe what happens BEFORE any file is edited.

Expected visible result:
  - The agent reads the entry-point file first
  - It reads ONLY the specs its task names - not the whole workspace
  - It restates the task, lists the files it will touch, and names any assumption
  - IT WAITS

Failure path tested:
  Give it a task whose work genuinely requires a file the task does not list.

Expected error result:
  - It STOPS and says so BEFORE editing
  - It does not decide the boundary was probably fine

Evidence to capture: the files it read, its restatement, the file list it proposed,
                     and - for the failure path - the fact that nothing was edited
Status: Planned

Why this one matters most: every other test proves the kit produced a well-formed
workspace. This is the only test that proves the workspace WORKS - that a session
which was never present for the interview can act on it correctly. If this fails,
the product is a document generator, not a governance tool.
```

---

## Test inputs (Ch. 18 §18.7), translated

The blueprint asks for screen, action, and visible result, to stop an agent writing tests
against imaginary buttons. There is no screen; the equivalent inputs are:

| Input | Example |
|---|---|
| **Starting state** | A clean repository · a repository with `CLAUDE.md` and `.gitignore` · a workspace complete through Round 4 · a `spec/` holding unrelated files |
| **Answer script** | A fixed, named set of answers replayed identically every run — the fixture that replaces "user clicks" |
| **Invocation** | The intake command, with or without `depth=express` |
| **Expected visible result** | The exact round-summary lines, the validation report, and the closing report — asserted **structurally**, never as prose |
| **Failure path** | Interrupt · decline a write · contradict an earlier answer · remove a blueprint · point at a non-kit `spec/` |
| **Expected error result** | The named failure state from `reliability-specification.md` §3, with its message shape and its "what survived" clause |

> **The named answer scripts are the fixtures.** Each is a complete set of answers for one
> shape of project — one instruction-only tool, one web app, one API service, one AI product.
> They are shared with [`ai-evals.md`](../03-non-functional/ai-evals.md), which scores the
> same runs on quality rather than structure. One fixture set, two purposes.

---

## Production smoke test (Ch. 28 §28.12)

**There is no production and no deploy** (`technical-spec.md` §12), so "after release" means
**after the plugin is published**. The smoke test is run by the kit author against a genuinely
fresh installation, on a real machine, not in CI:

1. Install the published plugin into an empty repository, from the marketplace, as a user would.
2. Run the intake command with no arguments.
3. Answer Round 1 honestly, without consulting the specs.
4. Confirm files appear after the round and the summary line prints.
5. Close the session mid-Round 2. Re-open and re-run. **Confirm it resumes.**
6. Complete the intake; confirm validation reports **12 of 12 ran**.
7. Open a fresh session, give the printed hand-off instruction, and confirm the agent
   restates the task and waits.
8. Confirm the repository outside `spec/` is untouched — checksums, not eyeballs.

→ [`production-readiness-checklist.md`](../../07-ops/01-deployment/production-readiness-checklist.md)

Executable tests live in [`../05-executable/end-to-end/`](../05-executable/end-to-end).

> **Step 3 is the only test in this entire workspace that cannot be automated, and it is
> the one most likely to catch RSK-1.** Everything else measures whether the output is
> well-formed. Answering the interview cold, without knowing the answers, is the only way to
> find out whether a developer would actually finish it.

> Blueprint: ../../../spec-driven-template/03-tests/02-functional/end-to-end-tests.md
