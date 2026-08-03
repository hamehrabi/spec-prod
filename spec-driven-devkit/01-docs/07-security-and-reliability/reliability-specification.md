# Reliability Specification

> Source: Ch. 22 — Reliability and Error Handling.
> Reliable software is not software that never fails. It fails in **controlled,
> understandable, and recoverable** ways.

> **Spec rule:** do not describe reliability as a general wish. Write it as a specific
> rule: *"If X fails, the system must do Y, record Z, and show message M."*

**Feature name:** The intake run — start, write, interrupt, resume, validate, report
**Requirement ID:** REQ-F-015, REQ-F-028, REQ-F-029, REQ-F-037, REQ-NF-003, REQ-R-004

> **Reliability / graceful failure is one of the three driving characteristics.** Its
> measure is exact: *for every stage 1–8, interrupt mid-stage, re-run, and intake resumes at
> that stage and completes — 8/8.* That is FF-003, and it blocks the merge. This file is
> where the behaviour behind that number is specified.

---

## 1. Normal behavior

The developer runs the intake command. The kit states what will happen and roughly how many
rounds there will be, then asks Round 1. After each round it writes that round's files —
each proposed individually to the host's permission prompt — and prints one line:
`Round N — wrote X files`. It repeats to at most eight rounds, walks the twelve validation
checks over the finished workspace, writes the entry-point file last, and prints a closing
report naming the file count, every remaining `[TODO]`, every blocking open question, every
assumption made rather than asked, and the single instruction that starts the build session.

**Nothing about that flow is atomic.** Ninety independent file writes, any of which the
developer may decline, spread across a session that may end at any moment. The design
assumption is therefore that **interruption is normal, not exceptional** — which is why the
whole of §3 exists and why resume is a driver-level obligation rather than a convenience.

---

## 2. Failure sources to consider (Ch. 22 §22.2)

| Failure source | Question to ask | Recovery rule here |
|---|---|---|
| **Developer input** | Ambiguous, contradictory, or absent? | Contradiction: stop and quote **both** (BR-012). Absent: `[TODO]` plus a matching open question (BR-003). Ambiguous: proceed on a **stated** assumption, recorded. Never a silent pick. |
| **Filesystem** | Write refused, path unwritable, permission denied? | Stop at that file, name the path, keep every prior write. Unwritable repository fails **before** round 1, not after round 8. |
| **The host** | Session closed, context lost, tool unavailable? | The workspace on disk is the recovery point. Resume derives its position by inspection (ADR-004). Nothing else is needed because nothing else is remembered. |
| **The blueprint library** | A template missing, moved, or restructured by a version change? | Named gap, never an improvisation. The version stamp (ADR-005) is what makes a stale back-link diagnosable rather than mysterious. |
| **The agent itself** | Filled a file partially, or drifted from the blueprint? | **This is the failure mode a model-driven system has and a program does not.** Detected by validation, re-filled once, then named as a gap (REQ-F-037). |
| Database · Network · External service · Background job | — | **n/a — none exist.** No database (`database-design.md` §0), no network (CON-003), no external service, no job or queue. Four whole categories of failure are absent by construction rather than handled. |

---

## 3. Important failure states

```
- Failure state: PARTIAL_STAGE
  - Trigger:        The session ends mid-round; some of that round's files were written.
  - Recovery path:  Resume derives the incomplete stage by inspection and redoes it from
                    its start. Files it already wrote are REPLACED whole, never appended to.
  - User message:   "Rounds 1-N are complete. Round N+1 was partially written; redoing it."
  - Log event:      None - there is no log (CON-007). The developer-visible line is the record.
  - Test case:      FTEST-001 (eight cases, one per stage)

- Failure state: WRITTEN_BUT_UNACCEPTED
  - Trigger:        The session ends after a round's files are written but BEFORE the
                    developer accepted them at the gate (REQ-F-038).
  - Recovery path:  Resume finds files with no matching acceptance row and RE-PRESENTS
                    that gate. It does not re-ask the round's questions, and it does not
                    advance to the next round.
  - User message:   "Round N's files exist but were not accepted. Here they are again."
  - Test case:      FTEST-019, ETEST-014 (eight cases, one per stage)

- Failure state: LIBRARY_INTEGRITY_FAILED
  - Trigger:        A blueprint is altered, missing, or absent from the integrity manifest.
  - Recovery path:  STOP BEFORE THE FIRST WRITE. Name the file and which of the three
                    problems it is. Never proceed on a near match; never regenerate the
                    manifest to make the check pass.
  - User message:   "Blueprint <path> does not match the manifest (altered). Nothing has
                    been written. Reinstall the plugin."
  - Test case:      FTEST-020, STEST-015

- Failure state: DECLINED_WRITE
  - Trigger:        The developer declines a proposed file at the host's permission prompt.
  - Recovery path:  Record the file as skipped. CONTINUE the round. Do not fail the run.
  - User message:   "Skipped <path>. Continuing; resume will offer it again."
  - Test case:      FTEST-002

- Failure state: DEPENDENT_ON_DECLINED
  - Trigger:        A later file needs content from one the developer declined.
  - Recovery path:  Do NOT silently work around it. Mark the dependent content [TODO] with
                    the reason, and name the dependency in the closing report.
  - User message:   "<file> depends on <declined file>, which was skipped. Marked as [TODO]."
  - Test case:      FTEST-002b

- Failure state: BOUNDARY_BLOCKED
  - Trigger:        A write outside spec/ is required, or a path normalises outside it.
  - Recovery path:  Stop. Name the PATH - never echo content from outside the workspace.
                    Show what would change. Ask.
  - User message:   "<path> is outside spec/. Here is what would change. May I?"
  - Test case:      FTEST-003, STEST-002, STEST-003

- Failure state: MISSING_BLUEPRINT
  - Trigger:        A required template is absent from the installed plugin.
  - Recovery path:  Stop at that file. Prior rounds intact. NEVER improvise a structure -
                    an invented specification file is indistinguishable from a real one.
  - User message:   "Blueprint <path> is missing from the installed plugin. Rounds 1-N intact."
  - Test case:      FTEST-004

- Failure state: LEFTOVER_TEMPLATE
  - Trigger:        A generated file still holds a placeholder, an instructional italic,
                    or worked-example text after the fill step.
  - Recovery path:  Re-fill that ONE file, once, silently. If it fails again, mark the gap
                    [TODO], add the matching Q-###, and name it in the closing report.
  - User message:   (first attempt: silent) / "<file> still had unfilled template text after
                    a retry. Marked as [TODO] and listed below."
  - Test case:      FTEST-006  -- the characteristic failure of ADR-003

- Failure state: VALIDATION_FAILED
  - Trigger:        Any of the twelve checks fails on the finished workspace.
  - Recovery path:  Report the failing check by name, with file and identifier. Do NOT claim
                    success. Leave the workspace in place and resumable.
  - User message:   "Check 1 (identifiers resolve) failed: REQ-F-<nnn> is referenced in
                    TASK-007.md but not defined in requirements.md."
  - Test case:      FTEST-005

- Failure state: FOLDER_COLLISION
  - Trigger:        spec/ exists and is not a kit workspace.
  - Recovery path:  Stop BEFORE any write. Explain. Offer an alternative folder name.
                    Never write into a folder the kit did not create.
  - User message:   "spec/ already exists and does not look like a kit workspace. I have not
                    written anything. Shall I use <alternative>/ instead?"
  - Test case:      FTEST-007, STEST-005

- Failure state: REPO_NOT_WRITABLE
  - Trigger:        The repository cannot be written to.
  - Recovery path:  Fail BEFORE the first question, naming the path.
  - User message:   "Cannot write to <path>. Stopping before the interview begins."
  - Test case:      FTEST-008
```

| Error state | Recovery path | What to test |
|---|---|---|
| Session ends mid-round | Resume redoes the incomplete stage from its start. | Interrupt at each of the eight stages; each resumes and completes (FF-003). |
| A file write is declined | Continue; record it as skipped; offer it again on resume. | The run completes and stays resumable — it does not fail. |
| A path resolves outside `spec/` | Stop and ask, naming the path only. | `spec/../../etc/hosts` is rejected despite beginning with `spec/`. |
| A generated file is hollow | Re-fill once; then name the gap. | A file failing twice carries `[TODO]`, a `Q-###`, and a report line — and no third attempt. |
| The workspace was hand-edited | Report what cannot be reconciled; ask. | Hand-edits survive; nothing is silently overwritten. |

---

## 4. Timeout rules

| Operation | Maximum wait |
|---|---|
| Every operation | **No timeout, and none possible.** Nothing here waits on anything: no network call (CON-003), no process, no lock, no external service. The only elapsed time is the host model's own thinking, which the kit neither controls nor can interrupt. |

Recorded as an explicit *no* rather than left blank: the absence of timeouts is a
consequence of having nothing to wait for, and it stops being true the moment ADR-002 is
superseded.

## 5. Retry rules

| Decision | Rule |
|---|---|
| Timeout | n/a — see §4. |
| **Retry count** | **Exactly one**, and only for a generated file that failed a structural check (REQ-F-037). Nothing else retries. |
| Retry delay | None. There is no service to hammer and no transient to wait out. |
| **Idempotency** | **Every write is whole-file, so a redone stage is idempotent by construction.** Nothing is appended to, nothing accumulates, and re-running a complete stage produces the same workspace. This is what makes resume safe without any bookkeeping. |
| **Stop condition** | The interview stops at eight rounds, hard (BR-004). A file re-fill stops after one attempt. A failed write stops that file, not the run. |

| Operation | Safe to retry? | Max retries | Delay | On give-up |
|---|---|---|---|---|
| Re-fill a file that failed a structural check | **Yes** — whole-file write, no accumulation | **1** | none | Mark `[TODO]`, add `Q-###`, name it in the closing report |
| Redo an incomplete stage on resume | **Yes** — replaces, never appends | unbounded across separate runs; **the developer decides** by re-running | none | Nothing to give up on; the workspace stays resumable indefinitely |
| A declined write | **No** — the developer said no | 0 | — | Recorded as skipped; offered again on the next resume |
| A write outside `spec/` | **No** — refusing is the correct behaviour, not a failure | 0 | — | Ask once, name the path, respect the answer |
| Asking a ninth round | **No** — forbidden | 0 | — | The unknown becomes an open question (BR-004) |

> Uncontrolled retry logic creates new problems: duplicate records, hidden failures,
> and hammered dependencies.
>
> **Here the specific danger is different and worth naming:** unbounded retry against a
> *non-deterministic generator* burns a long session on one stubborn file, and hides
> information. A file that fails twice is evidence about the **instruction**, not a transient
> to grind through. The bound of one exists to surface that evidence.

## 6. Background job and queue rules

| Requirement | Definition |
|---|---|
| Job name | **None.** There is no scheduler, no queue, no worker, and nothing that outlives the session. |
| Trigger | n/a |
| Input data | n/a |
| Retry rule | n/a |
| Failure state | n/a |
| User visibility | n/a |

Recorded because the absence is a decision. **The proposal to pre-reject:** a background job
that cleans up abandoned or partial workspaces. It is a reasonable-sounding idea and it is
forbidden — the kit never deletes the developer's files (§7 of `database-design.md`), and a
partial workspace is not garbage, it is a resumable intake.

## 7. Logging requirements

**There is no log.** No file, no telemetry, no error reporting, no analytics (CON-007,
BR-014). The developer-visible output is the record, and the committed workspace is the
durable audit trail.

| Log requirement | Applied here |
|---|---|
| Event name | The round summary line, `Round N — wrote X files`, plus the named failure states of §3. |
| Severity | Carried **in words**, never by colour or symbol alone (REQ-NF-006). |
| Request / correlation ID | Not needed. One run, one workspace, one developer, one machine. The workspace path is the only correlation that exists. |
| Safe context | File paths and identifiers only. |
| Failure reason | The check name, the file, and the identifier — never a dump. |
| Outcome | Every validation check reports **passed**, **failed**, or **not run** — and *not run* is never inferred to be *passed* (BR-009). |

**Must never appear in any output:** the contents of `.env` or any secret file · any
credential · any content read from outside `spec/`, **including in a message explaining why
a write was blocked**. Name the path; never quote the file.

> **What the absence of a log costs, stated plainly.** The kit cannot see its own failure
> rate. If the fill step fails on one file in ten across all users, nobody ever finds out —
> there is no aggregate anywhere and no way to build one under CON-007. `ai-evals.md` is the
> only substitute: a golden set the kit author runs themselves, standing in for field data
> the product is designed to be unable to collect. This is the same hole as **Q-002**.

## 8. Data safety rules

| Rule | Definition |
|---|---|
| **Partial write protection** | **There are no transactions and none are simulated** (`database-design.md` §7). Protection comes from three properties instead: every write is **whole-file**; stage completeness is **derived by inspection**, never recorded by a flag that could be wrong; and **no file is ever written in a state that presents itself as complete while being partial** (REQ-NF-003, FF-004). |
| **Duplicate protection** | Identifiers are **unique within a workspace and never reused, even after the item they named is deleted** (BR-007). A reused ID silently re-points a test, a task, and a traceability row at something else. Validation check 2 enforces it. |
| **Ordering guarantees** | Only two orderings are load-bearing, and both are requirements rather than conventions: **`.gitignore` before `.env.example`** (REQ-NF-002 — the ignore rule must exist before the file that invites copying it), and **the entry-point file last** (BR-006, REQ-F-020 — so every link in it is verifiable on the day it is written). Everything else may be written in any order. |

### The dual-write problem, and why the outbox does not apply

The template's addendum exists because there is no transaction spanning a database and a
message bus. **Here there is neither**, so the outbox pattern has nothing to coordinate.

The *analogous* problem is present, though, and it is worth naming because the mitigation is
different: **a file write and the identifier it mints are two facts that can disagree.** If
`requirements.md` is written and the session dies before `traceability.md` references
`REQ-F-<nnn>`, the workspace is internally incomplete.

| Approach | Verdict |
|---|---|
| An outbox-equivalent — a pending-identifiers file the next run reconciles | **Rejected.** It is ADR-004's forbidden state file wearing a different hat, and it would be a second source of truth about what exists. |
| **Derive, then verify** | **Chosen.** Identifiers are read from the files that define them, and validation check 1 asserts that every reference resolves. An incomplete workspace is *detected* rather than *prevented* — which is the correct trade when the recovery is simply "resume and finish". |

> **Transaction boundaries (§A2 of the blueprint) translate to one rule:** one file per
> write, whole. Nothing spans two files atomically, nothing needs to, and any design that
> starts to need it is a signal the workspace layout is wrong — not a reason to add
> coordination.

## 9. User-facing error messages

| Weak message | Better message | Why it is better |
|---|---|---|
| "Intake failed." | "Round 5 stopped: blueprint `technical-spec.md` is missing from the installed plugin. Rounds 1–4 are complete and intact." | Names the failure, the cause, **and what survived** — the last part is what stops a developer assuming they lost everything. |
| "Validation error." | "Check 1 (identifiers resolve) failed: `REQ-F-<nnn>` is referenced in `TASK-007.md` but not defined in `requirements.md`." | Names the check, the file, and the identifier. Actionable without further investigation. |
| "Cannot write file." | "`README.md` is outside `spec/`. Here is what would change. May I write it?" | Turns a refusal into a decision the developer is allowed to make. |
| "Skipped some files." | "Skipped `spec/01-docs/03-product-spec/product-spec.md`. Continuing; resume will offer it again." | Names the file and says the consequence is recoverable. |
| "Done." | "Wrote 87 files. 4 `[TODO]`s remain, 3 open questions block coding, 2 assumptions were made — all listed below." | The closing report is the one thing a developer cannot reconstruct for themselves. |
| "All checks passed." | "All 12 checks ran; all 12 passed." | **The count of checks run is the point.** "No failures" and "nothing was checked" are otherwise indistinguishable — BR-009's exact failure mode. |

## 10. Monitoring / alerting notes

→ [`monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)

**There is nothing to monitor at run time**, and no way to monitor it (CON-007). The
substitutes, both owned by the kit author rather than by any running system, are the CI
fitness functions ([`fitness-functions.md`](../04-technical-spec/fitness-functions.md)) and
the eval golden set ([`ai-evals.md`](../../03-tests/03-non-functional/ai-evals.md)).

---

## Definition of done (Ch. 22 §22.8)

- [x] All expected failure states are handled — nine named in §3.
- [x] Logs are safe and useful — there is no log; the output rules in §7 govern instead.
- [x] User-facing errors are clear and give a next action — §9.
- [ ] Tests cover normal behavior **and** failure behavior — written in Round 7.

## Reliability review checklist (Ch. 22)

| Check | Yes / No |
|---|---|
| Each important feature has known failure states. | **Yes** — nine, each with a trigger, recovery path, message, and test ID. |
| Each failure state has a recovery path. | **Yes** — and each says explicitly what survives. |
| Timeouts are defined for slow operations. | **n/a, with the reason recorded** (§4) — nothing waits on anything. |
| Retry rules are limited and safe. | **Yes** — exactly one retry, on exactly one operation, with a named stop condition. |
| Background jobs have status and failure handling. | **n/a, with the reason recorded** (§6) — none exist, and the tempting one is pre-rejected. |
| Logs are useful and do not expose secrets. | **n/a, with the reason recorded** (§7) — no log exists; §7 governs output instead. |
| User-facing error messages are clear and safe. | **Yes** — §9, including the "12 of 12 ran" rule. |
| Tests cover both normal and failure behavior. | **Not yet** — Round 7. |

> Blueprint: ../../../spec-driven-template/01-docs/07-security-and-reliability/reliability-specification.md
