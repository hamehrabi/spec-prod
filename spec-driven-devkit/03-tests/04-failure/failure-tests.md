# failure-tests.md — Failure Test Cases

> **Purpose (Ch. 4 §4.6):** Checks invalid inputs, permissions, missing data, and error
> paths.
> **Sources:** Ch. 4 §4.6, Ch. 17 §17.7, Ch. 22.

Planning worksheet for discovering these cases →
[`edge-cases-and-failures.md`](edge-cases-and-failures.md).
This file holds the resulting **test cases**.

> **Beginner rule (Ch. 17 §17.1):** do not ask an AI agent to build a feature until you
> can write at least three checks for it — one normal case, one **edge case**, and one
> **failure case**.

---

## Failure test cases

There is no status code and no log event. The two columns that replace them are the ones
that matter more here: **what must NOT be in the output**, and **what must NOT be on disk**.

| Test ID | Requirement | Failure condition | Input / trigger | Expected result | Must NOT happen | Status |
|---|---|---|---|---|---|---|
| FTEST-001 | REQ-F-028, REQ-NF-003 | Session ends mid-stage | Terminate during stage *N* (×8) | Resume reports 1…*N*−1 complete; redoes *N* from its start; completes | No re-asking of a completed round · no state file read or written · no file appended to | Planned |
| FTEST-002 | REQ-R-004 | Developer declines a write | Refuse one file at the host prompt | File recorded as skipped; round continues; run stays resumable | **No run failure** · no retry loop · no silent substitution of the skipped content | Planned |
| FTEST-002b | REQ-F-019 | A later file needs the declined one | Decline an early file, continue | Dependent content marked `[TODO]` naming the dependency; report lists it | **No silent workaround** · no invented stand-in content | Planned |
| FTEST-003 | REQ-F-024, BR-008 | Write outside `spec/` | Destination `<repo>/README.md` | Stops, names the path, shows the change, asks | **No write before approval** · no contents of the target file echoed in the message | Planned |
| FTEST-004 | REQ-F-003 | Blueprint missing | Remove one template from the installed plugin | Stops at that file; names the missing blueprint; prior rounds intact | **No improvised structure** · no file produced without a blueprint behind it | Planned |
| FTEST-005 | REQ-F-029, BR-009 | A check cannot run | Make one validation check unrunnable | Reported as **not run**, by name; overall result is not "passed" | **No success claim** · not-run never rendered as passed · not-run never omitted | Planned |
| FTEST-006 | REQ-F-037, ADR-003 | Fill leaves template text | Blueprint crafted so a placeholder survives | Re-filled once; on second failure `[TODO]` + `Q-###` + report line | **No third attempt** · no file accepted with a surviving placeholder | Planned |
| FTEST-007 | REQ-F-036 | `spec/` is not a kit workspace | Pre-populate `spec/` with unrelated files | Stops before any write; explains; offers an alternative name | **Nothing written** · `spec/` byte-for-byte unchanged · no merge into it | Planned |
| FTEST-008 | REQ-NF-003 | Repository not writable | Remove write permission on the repo root | Fails **before** question one, naming the path | **No questions asked first** · no partial workspace left behind | Planned |
| FTEST-009 | REQ-NF-008 | Platform assumption | Run the same script on Windows, macOS, Linux | Identical workspaces except line endings; every link resolves | No POSIX-only path · no `/`-hardcoded link · no case-sensitivity assumption | Planned |
| FTEST-010 | REQ-F-010, BR-012 | Contradictory answers | Answer "no network calls", then request a hosted component | Stops; quotes **both** verbatim; asks which holds | **Neither answer chosen** · no ranking · no hint at a preferred resolution | Planned |
| FTEST-011 | REQ-NF-003 | Interrupt during the entry-point write | Terminate at the last file of the last stage | Resume writes the entry point and validates | **No re-run of the interview** · no re-asking of any round | Planned |
| FTEST-012 | BR-007 | Identifier reuse | Delete `REQ-F-007`, then add a requirement | Next ID is `REQ-F-008`; the hole is permanent | **No reuse of a retired ID** · no silent re-pointing of a test or task | Planned |
| FTEST-013 | REQ-F-008, BR-003 | Near-empty free text | Answer the problem statement with one word | Accepted; becomes an open question with an owner | **No re-ask loop** · no rejection · no invented problem statement | Planned |
| FTEST-014 | REQ-F-009 | A whole round is inferable | Answer so that every question in a round is derivable | Round skipped **with** an inference notice per conclusion | **Not rendered as an empty or failed round** · no silent skip | Planned |
| FTEST-015 | REQ-F-007 | Very long free text | Paste 5,000 words as the problem statement | Used in full; summarised where a summary is needed | **Nothing discarded silently** · no truncation without saying so | Planned |
| FTEST-016 | REQ-F-028 | Re-run on a complete workspace | Run intake twice | Reports complete; changes nothing | **No re-asking** · no file rewritten · no duplicate identifiers minted | Planned |
| FTEST-017 | ADR-005 | Version skew | Workspace stamped `v1.0.0`, plugin at `v2.0.0` with moved blueprints | Mismatch named explicitly | Broken back-links **not** reported as a generation bug | Planned |
| FTEST-018 | `ai-boundary-spec.md` §4 | Host model refuses | Force a refusal mid-generation | Refusal surfaced **verbatim**, with the file it concerned | **No paraphrase into a generic error** · no silent workaround · no retry of the refused thing | Planned |
| FTEST-019 | REQ-F-038, REQ-F-041 | Interrupted between write and acceptance | Kill the session after round *N*'s files exist, before acceptance | Resume re-presents round *N*'s gate | **Does not re-ask round *N*'s questions** · does not advance to *N+1* · no acceptance file created | Planned |
| FTEST-020 | REQ-F-042 | Blueprint altered or missing from the manifest | Change one byte in a shipped blueprint | Stops **before the first write**, naming the blueprint | **No file written** · no "close enough" match · no silent re-copy from elsewhere | Planned |
| FTEST-021 | REQ-F-040 | A blueprint is never reached by any round | Add a blueprint the round map does not cover | Coverage check **fails**, naming the unused blueprint | **Not silently skipped** · not recorded as a skip without a reason | Planned |
| FTEST-022 | REQ-F-039 | Revise chosen repeatedly | Choose **revise** at the same gate three times | Each time re-asks that round only and rewrites its files | **No later round's files touched** · no accumulation · no duplicate identifiers minted | Planned |

---

## Case template

```
Test ID:
Requirement:
Failure condition:
Preconditions:
Trigger / input:

Expected user-facing result:
Expected system state:      [what must NOT be on disk]
Expected recovery path:
Expected report line:       [what the closing report must say about it]

Must NOT happen:
  - No file written outside spec/.
  - No content from outside spec/ echoed in any message.
  - No partial file presenting itself as complete.
  - No silent success.

Status: Planned / Written / Passing / Failing / Blocked
```

---

## Written out — the three whose "must not" clause is the whole test

```
Test ID:            FTEST-005
Requirement:        REQ-F-029, BR-009
Failure condition:  A validation check cannot run
Preconditions:      A complete workspace; one check made unrunnable
Trigger / input:    Run the validation step

Expected user-facing result:
  "11 of 12 checks ran. Check 7 (no blank decision rows) could not run: <reason>.
   Of the 11 that ran, all passed. This workspace is NOT fully validated."

Expected system state:  workspace unchanged; still resumable
Expected recovery path: the developer can fix the cause and re-run
Expected report line:   the closing report repeats the not-run check by name

Must NOT happen:
  - The check is reported as PASSED
  - The check is OMITTED from the report entirely
  - The overall result reads "validation passed"
  - The hand-off instruction is printed as though the workspace were complete

Status: Planned

Why the "must not" list IS the test: a validation report that lists only failures makes
"everything passed" and "nothing was checked" produce identical output. That is the
single most dangerous silent failure in the product, because it ships a workspace that
LOOKS verified. The assertion is the count of checks RUN, not the count of failures.
```

```
Test ID:            FTEST-004
Requirement:        REQ-F-003
Failure condition:  A required blueprint is missing from the installed plugin
Preconditions:      Intake has completed rounds 1-4; one template deleted from the plugin
Trigger / input:    Reach the round that needs the missing blueprint

Expected user-facing result:
  "Blueprint 01-docs/04-technical-spec/technical-spec.md is missing from the installed
   plugin. Rounds 1-4 are complete and intact. Stopping here."

Expected system state:  every file from rounds 1-4 present and unchanged
Expected recovery path: reinstall or repair the plugin, then re-run; resume continues
Expected report line:   the missing blueprint is named as the reason for stopping

Must NOT happen:
  - A file is produced at that path anyway, structured from memory or from a similar
    blueprint
  - The stage is marked complete
  - Prior rounds are rolled back or rewritten
  - The failure is reported vaguely as "an error occurred"

Status: Planned

Why the "must not" list IS the test: an improvised specification file is INDISTINGUISHABLE
from a real one once written. It has plausible headings, plausible content, and a back-link
to a blueprint that does not exist. It would pass a human skim and be acted on by a build
agent. Stopping is the correct behaviour and improvising is the tempting one.
```

```
Test ID:            FTEST-003
Requirement:        REQ-F-024, BR-008, SEC-A-002
Failure condition:  A write outside spec/ is required
Preconditions:      A repository with a root README.md containing text
Trigger / input:    Intake determines it should write <repo>/README.md

Expected user-facing result:
  "<repo>/README.md is outside spec/. Writing it would replace lines 1-12. May I?"

Expected system state:  README.md unchanged unless and until approved
Expected recovery path: the developer approves, declines, or asks for it inside spec/
Expected report line:   if declined, listed among skipped files

Must NOT happen:
  - The file is written before the question is answered
  - The MESSAGE QUOTES THE CONTENTS of README.md
  - The change is described as harmless to encourage approval
  - A "yes" here is treated as consent for other files outside spec/

Status: Planned

Why the second "must not" is not obvious: the natural way to show what would change is a
diff, and a diff of a file outside the workspace echoes content the kit was never
supposed to surface. Name the path and the line range. Never the text.
```

---

## Error state → recovery path (Ch. 22 §22.3)

Every error state needs a recovery path, a user message, and a test. The nine named states
in [`reliability-specification.md`](../../01-docs/07-security-and-reliability/reliability-specification.md) §3
map one-to-one onto the cases above:

| Error state | Recovery path | What to test |
|---|---|---|
| `PARTIAL_STAGE` | Redo the incomplete stage from its start | Eight interrupts, eight resumes → FTEST-001 |
| `DECLINED_WRITE` | Record and continue | The run does not fail → FTEST-002 |
| `DEPENDENT_ON_DECLINED` | Mark `[TODO]`, name the dependency | No silent workaround → FTEST-002b |
| `BOUNDARY_BLOCKED` | Stop, name the path, ask | Content never echoed → FTEST-003 |
| `MISSING_BLUEPRINT` | Stop at that file; prior rounds intact | Nothing improvised → FTEST-004 |
| `LEFTOVER_TEMPLATE` | Re-fill once, then name the gap | No third attempt → FTEST-006 |
| `VALIDATION_FAILED` | Report by name; no success claim | Not-run ≠ passed → FTEST-005 |
| `FOLDER_COLLISION` | Stop before any write; offer a name | `spec/` untouched → FTEST-007 |
| `REPO_NOT_WRITABLE` | Fail before question one | No questions asked first → FTEST-008 |

---

## Regression failures

Every fixed defect adds a case here that **fails before** the fix and **passes after**
(Ch. 19 §19.6).

| Test ID | Bug ID | Failure it prevents | Added on |
|---|---|---|---|
| *(empty — nothing has been built yet)* | | | |

> A regression test that has never failed is not evidence of anything. When the first defect
> is fixed, the test goes here **only after it has been seen to fail against the unfixed
> version.**

---

## Rules

- A failure test asserts the **safe** outcome, not just "an error happened."
- Assert what must **not** be in the output: content from outside the workspace, invented
  values, a success claim, a paraphrased refusal.
- Assert system state: a failed run must leave **no file that presents itself as complete
  while being partial**, and no file outside `spec/`.
- Never delete or weaken a failure test to make something pass.

### The rule this project needs that the blueprint does not state

> **Assert the count of things that ran, not only the count of things that failed.**
>
> In a system whose output is documents, "nothing went wrong" and "nothing was checked"
> produce identical text unless the number of checks *run* is stated explicitly. Half the
> cases above have a "must not" clause that exists solely to close that gap.

> Blueprint: ../../../spec-driven-template/03-tests/04-failure/failure-tests.md
