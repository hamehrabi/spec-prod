# API Specification

> Source: Ch. 7 §7.7, Ch. 9 §9.4–9.8, Appendix D.
> An API contract stops the agent from inventing endpoint names, request formats,
> response formats, or ownership behavior while coding.

**Base path:** *(none — there is no HTTP surface)*
**Auth model:** None. The kit runs as the developer, with the developer's own permissions.
**Version:** Contract v1.0

---

## Adaptation note — three contracts, no endpoints

There is no HTTP API, no request, and no status code. There are three real contracts, and
naming them as contracts is what stops them drifting. Each has the same property an endpoint
has: **two sides depend on it, and one side can break the other without noticing.**

| # | Contract | Between | Broken by |
|---|---|---|---|
| **C1** | Command contract | Developer ↔ the kit | Renaming the command, adding a required argument, changing what a run does |
| **C2** | Blueprint contract | Blueprint library ↔ generated artifact | Renaming or moving a blueprint, restructuring its sections |
| **C3** | Workspace contract | Generated workspace ↔ the build agent | Changing the entry point's location, shape, or guarantees |

**C3 is the one that matters most and is easiest to overlook.** The build agent is a consumer
with no memory of the interview, opening a ~90-file workspace produced by a different session
possibly weeks earlier. Everything it relies on is a promise this system makes, and every
clause below is a test.

---

## Contract index

| # | Contract | Purpose | Requirement | Permission |
|---|---|---|---|---|
| C1 | Intake command | Start or resume an intake in the current repository | REQ-F-002, REQ-F-028, REQ-F-033 | Developer only |
| C2 | Blueprint → artifact | Turn one template into one filled specification file | REQ-F-016, REQ-F-027 | Intake agent; blueprint side read-only |
| C3 | Workspace → build agent | Let a fresh session work the project correctly | REQ-F-020, REQ-R-005 | Build agent reads; writes only what a task allows |

---

## C1 — Command contract

```
Contract name:        Intake command
Invocation:           A single slash command registered by the plugin manifest.
                      [TODO: the exact command name — kit author to choose before build.]
Purpose:              Conduct the interview and produce or continue a specification
                      workspace at <repo>/spec/.
Requirement:          REQ-F-002, REQ-F-004, REQ-F-028, REQ-F-033, REQ-F-034
Authentication:       None.
Authorization rules:  Runs as the developer. Writes under spec/ only; anything else stops
                      and asks, naming the file (BR-008).

Arguments:
  depth: "default" | "express" — optional — defaults to "default".
         This is the ONLY argument. It selects depth, never a different flow (ADR-004,
         DD-006, FF-001).

Preconditions:
  - The repository is writable. If not, fail BEFORE the first question, naming the path.
  - The blueprint library is present in the installed plugin. A missing blueprint is a
    named gap, never an improvisation.

Behaviour — no existing workspace:
  Preamble (what happens, how many rounds) -> Round 1 ... Round N -> validation ->
  entry point written last -> closing report -> hand-off block.

Behaviour — existing workspace:
  Read it. Report which stages are complete. Resume at the first incomplete stage.
  Never re-ask a completed round. Never overwrite the developer's hand-edits silently.

Outputs:
  - Files under <repo>/spec/ only.
  - One RoundSummary line per round: "Round N — wrote X files".
  - A closing report: file count, remaining [TODO]s, blocking open questions,
    assumptions made rather than asked.
  - A hand-off block, copy-pasteable with no placeholder left in it.

Side effects:
  - NONE outside <repo>/spec/.
  - No state file, no cache, no log, no network call, no telemetry.
  - The developer's existing root CLAUDE.md is never modified (REQ-F-026).

Failure behaviour:      See technical-spec.md §9.3 — six named failure states.
Tests required:         ATEST-001..016, ETEST-001..003, FTEST-001..006, STEST-001..005
```

### Compatibility rules for C1

| Change | Safe? | Why |
|---|---|---|
| Add an optional argument | Usually safe | Existing invocations keep working. **But** each new argument is a branch, and FF-001 counts branches — expect resistance. |
| Reword the preamble or a question | Safe | No caller depends on the wording. |
| Rename the command | **Breaking** | Every instruction, README, and hand-off block naming it is now wrong. |
| Make an argument required | **Breaking** | Bare invocation stops working. |
| Change the workspace location from `spec/` | **Breaking** | Every relative link in every existing workspace, plus every build-agent instruction. Requires superseding ADR-004. |

---

## C2 — Blueprint contract

```
Contract name:        Blueprint -> generated artifact
Purpose:              Produce one filled specification file from one template, preserving
                      the template's structure and stripping everything that is scaffolding.
Requirement:          REQ-F-016, REQ-F-027, BR-002
Method:               Copy the file, then fill it in (ADR-003).

The blueprint side guarantees:
  - A stable path inside the plugin. Renaming or moving it is a BREAKING change
    (ADR-005) and requires a migration note naming old and new paths.
  - A section structure: headings, tables, and checklists in a fixed order.
  - A "# WORKED EXAMPLE" section, always last, always removable as a whole.
  - Read-only at run time. The kit never writes to a blueprint (ADR-001).

The generated artifact guarantees:
  - Section headings match the blueprint's, in order.                    -> FF-007
  - No worked-example content survives.                                  -> FF-006
  - No placeholder token, instructional italic, or generic prompt box
    survives. Anything unanswered is "[TODO: <exact question>]" with a
    matching Q-### row.                                                  -> FF-005, FF-012
  - Every identifier it defines is unique in the workspace.              -> FF-008
  - Its final line is a blueprint back-link that resolves at the correct
    relative depth.                                                      -> FF-007

Business rules:       BR-002 (no example content), BR-003 (no invention),
                      BR-007 (no identifier reuse), BR-013 (depth by subdomain class)
Side effects:         One file written under spec/. Nothing else.
Tests required:       TEST-001..006 (integration), UTEST-001..00N (fill procedure steps)
```

---

## C3 — Workspace contract

What the build agent may rely on, without being told, in a session that knows nothing about
the interview. **This is the promise the whole product rests on.**

```
Contract name:        Generated workspace -> build agent
Purpose:              Let a fresh session do one task correctly without reading everything.
Requirement:          REQ-F-018, REQ-F-020, REQ-F-021, REQ-R-005, REQ-NF-009

The workspace guarantees:
  1. An entry-point file exists at the workspace root.
  2. It is under 100 lines and every path in it resolves.          -> FF-013
  3. Every identifier referenced anywhere resolves to a definition
     in the same workspace.                                        -> FF-008
  4. No identifier is defined twice or reused after deletion.      -> FF-008
  5. Every task file names the files it may change AND the files
     it must not.                                                  -> REQ-R-005
  6. Every permission rule has at least one DENY test.             -> FF-014
  7. Every driving characteristic has at least one fitness
     function with a build-failing threshold.                      -> FF-014
  8. Every [TODO] has a matching Q-### row with a decision owner.  -> FF-012
  9. It records the plugin version that produced it.               -> FF-011
 10. It contains no application source code.                       -> BR-001

The build agent's obligations in return:
  - Read the entry point first. Read ONLY the specs its task names.
  - Restate the task, list the files it will touch, name any assumption — and wait.
  - Change only files the task allows. If it needs one that is not listed, STOP and say so
    BEFORE editing.
  - Derive tests from acceptance criteria, never from the code it just wrote.
  - Never weaken or delete a test to make something pass.
  - Never reverse an ADR silently — supersede it with a new one.
  - Report: files changed and why, requirement covered, tests added, risks, and any file it
    touched that the task did not list.

Failure behaviour:    A guarantee that does not hold is a validation failure, reported by
                      name and file. The intake does not claim success (BR-009).
Tests required:       ETEST-001..003
```

---

## Contract rules

| Rule | Specification |
|---|---|
| Response consistency | Every round produces the same shape of output: files written, then a one-line summary. |
| Error consistency | Every failure names **what** failed, **where**, and **what survived** — see `technical-spec.md` §9.7. |
| Permission check | Every write checks its destination is inside `spec/` before proposing it. |
| Validation timing | Validation runs **before** any success claim, never after (BR-009). |
| Audit trail | The workspace **is** the audit trail. There is no separate log, and none is possible under CON-007. |

---

## Validation rules

| Rule type | Rule |
|---|---|
| Required argument | None. A bare invocation is valid and is the common case. |
| Allowed value | `depth` must be `default` or `express`. Anything else is rejected with the two valid values named. |
| **Path rule** | A destination path must normalise to inside `spec/`. Reject `..` segments and absolute prefixes **after** normalisation — `spec/../../etc` starts with `spec/` and is not inside it. |
| Relationship rule | Every referenced identifier must resolve within the same workspace. Cross-workspace references are meaningless and are rejected. |
| Permission rule | Only the developer may answer questions or decline a write. The intake agent may do neither on their behalf. |
| Existence rule | A required blueprint must exist in the installed plugin. Absence is a named gap, never an improvisation. |

---

## Versioning and compatibility

**Current version:** Contract v1.0
**Breaking-change policy:** A breaking change to any of C1, C2, or C3 requires a plugin major
version bump **and** a migration note naming exactly what moved. The version stamp in each
generated workspace (ADR-005) is what makes such a note actionable — without it, a broken
back-link is indistinguishable from a generation bug.

| Change type | Usually safe? | Example |
|---|---|---|
| Add a blueprint | Safe | A new optional specification file |
| Add a question, or reword one | Safe | Round 6 gains a fourth question |
| Add an optional command argument | Usually safe | But it is a branch, and FF-001 counts branches |
| Change a blueprint's internal sections | Usually safe | Existing workspaces keep their structure; they are not regenerated |
| **Rename or move a blueprint** | **Breaking** | Every back-link in every workspace ever generated now points at nothing |
| **Rename the command** | **Breaking** | Every hand-off block and every piece of documentation |
| **Change the workspace location** | **Breaking** | Every relative link everywhere; requires superseding ADR-004 |
| **Weaken a C3 guarantee** | **Breaking** | The build agent relies on it without checking. Removing guarantee 5 (allowed-file lists) would silently remove the boundary that stops damage. |

> Blueprint: ../../../spec-driven-template/01-docs/06-api-and-data-design/api-specification.md
