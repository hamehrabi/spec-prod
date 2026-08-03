# technical-spec.md — Technical Specification

> **Purpose (Ch. 4 §4.4):** Defines architecture, data, APIs, security, and errors.
> **When you use it:** Before task planning and coding.
> **Sources:** Ch. 7 (10-section template), Ch. 8 (architecture), Ch. 9 (data/API/integration),
> Ch. 21 (security), Ch. 22 (reliability), Ch. 27 §27.6 (frontend components),
> Appendices C, D, E.

A PRD says *what product you want*. This says *how the system should be structured so that
product can be built safely and consistently*.

**Version:** TECH v1.0 · **Owner:** Kit author · **Date:** 2026-08-03

---

## Contents

1. [System Overview](#1-system-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Requirements](#3-frontend-requirements)
4. [Backend Requirements](#4-backend-requirements)
5. [Database Requirements](#5-database-requirements)
6. [API Requirements](#6-api-requirements)
7. [Security Requirements](#7-security-requirements)
8. [Performance Requirements](#8-performance-requirements)
9. [Error Handling & Reliability Requirements](#9-error-handling--reliability-requirements)
10. [Integration & Versioning Requirements](#10-integration--versioning-requirements)
11. [Testing Approach](#11-testing-approach)
12. [Deployment Approach](#12-deployment-approach)
13. [Open Decisions](#13-open-decisions)
14. [Guardrail Checklist](#14-guardrail-checklist)

---

## 1. System Overview

| Field | Value |
|---|---|
| System name | spec-driven-devkit |
| Purpose | A Claude Code plugin whose executable content is **Markdown instructions**. It conducts a bounded interview, copies blueprint templates from its own library into a `spec/` folder in the developer's repository, fills them with the developer's answers, validates the result, and reports. It has no runtime, no process, and no code of its own that executes. |
| Primary users | Developer (answers the interview) · Intake agent (executes the instructions) · Build agent (later consumer of the output) · Kit author (maintains blueprints and questions) |
| Core capabilities | Bounded interview · blueprint copy-and-fill · workspace generation into `spec/` · resume from partial · validation before success · hand-off report |
| System boundary | **Includes:** the plugin manifest, the intake instruction set, the question set, the blueprint library, the validation checklist, and the procedure that turns answers into a filled workspace. **Does not include:** the developer's application code, any executable program, any server, any database, any network client, any credential store, or the contents of the developer's repository outside `spec/`. |
| External dependencies | Claude Code only — for the command mechanism, the question tool, the file tools, and the per-file permission prompt. **No other dependency of any kind**: no language runtime, no package manager, no service, no model API beyond the host's own. |
| Assumptions | The host provides a question-asking mechanism and file read/write tools. The host prompts the developer before each file write, and that prompt is the independent enforcement of the boundary rules (§7.2). The developer's repository is writable. |

> A good system overview prevents a common AI coding problem: the assistant builds more
> than you asked for because the system boundary was unclear.

**The most important line above** is *no executable program*. The natural instinct, on a
project about generating files, is to write a generator. This system does not have one. The
agent is the runtime; the instructions are the program; the host's file tools are the I/O.
Every proposal to add a script, a CLI, or a templating engine is rejected by **ADR-002**.

---

## 2. Architecture Overview

| Item | Decision |
|---|---|
| Architecture style | **Modular monolith** — one plugin, one deployable unit, four internally separated modules with enforced boundaries. Not distributed, because nothing here is distributable: it is a folder of Markdown. |
| Main components | Plugin manifest · Intake instruction set · Question set · Blueprint library · Validation checklist. The **generated workspace** is output, not a component. |
| Responsibility of each component | See the boundary table below. |
| Data flow | **Verify library integrity** → developer answer → intake instructions → agent composes next round (suppressing derivable questions) → agent copies blueprint file → strips worked example → fills placeholders with answers → host prompts → file written to `spec/` → round summary → **acceptance gate: present what was produced and wait** → accept / revise / stop → repeat → validation walk → hand-off report. |
| Progress model | **Derived from the blueprint library** (REQ-F-043). The library is the authoritative list of what a stage must produce; the instruction set holds no hardcoded file list. Adding a blueprint adds a required output with no orchestration change (FF-018). |
| State ownership | **The generated workspace owns all state.** Stage completeness is derived by inspecting which artifacts exist. There is no state file, no session store, and no answer log — see [`database-design.md`](../06-api-and-data-design/database-design.md) §0. |
| Trade-offs | Instructions-only buys cross-platform portability for free (CON-004), zero install, and no runtime that can be missing — at the cost of **non-determinism**. The same answers may not produce byte-identical files. That cost is real and is what §11 has to solve. |

### Choosing the style

| Style | Considered because | Rejected/kept |
|---|---|---|
| **Modular monolith** | Four genuinely distinct concerns (orchestration, questions, blueprints, checks) that must stay independently changeable for REQ-NF-005. | **Kept.** Boundaries are enforceable by inspection: a blueprint containing interview logic is visibly wrong. |
| Simple monolith | One big instruction file — which is what `MASTER-PROMPT.md` is today. | Rejected. It couples the question set to the blueprint library, and REQ-NF-005 requires each to change without the other. This is FF-002. |
| Service-based / microservices | — | Rejected without analysis. There is no service; there is nothing to distribute. Naming it here only to record that it was not overlooked. |
| Serverless functions | — | Rejected. CON-003 forbids the network; there is nothing to invoke. |

> **Practical guidance (Ch. 8 §8.7):** for most beginner-to-intermediate projects, start
> with a **modular monolith** — structure without premature deployment complexity.

### Component boundaries (Ch. 8 §8.4)

Three questions per component: *What does it own? What does it need from others? What is it
forbidden to do?*

| Component | Owns | Needs | Must **not** do |
|---|---|---|---|
| **Plugin manifest** | Registration with the host: the command name, the plugin's identity and version. | Nothing. | Contain interview content, blueprint content, or any logic. It is a declaration. |
| **Intake instruction set** | Orchestration: round sequencing, the eight-round limit, the write-after-each-round rule, inference and contradiction handling, depth scaling, resume, and the closing report. | The question set; the blueprint library's file paths; the validation checklist. | **Contain blueprint content.** **Contain the literal text of questions.** Write anything itself — it directs; the agent writes. |
| **Question set** | The questions, their options, their recommended-first ordering, their one-line reasons, and which answers make which later questions derivable. | Nothing. | Reference a blueprint's internal structure. Contain orchestration rules. |
| **Blueprint library** | The ~90 templates: section structure, tables, checklists, guidance prose, and worked examples. | Nothing. | Contain interview logic, question text, or orchestration. Be written to at runtime. |
| **Validation checklist** | The fixed list of checks, what each proves, and what a failure reads like. | The identifier scheme; the workspace layout. | Grow into a rules engine, a schema language, or a configurable policy. It is a list. |
| **Generated workspace** *(output)* | All state: stage progress, identifiers, answers-as-consequences, open questions. | — | Contain kit source. Contain application code (BR-001). |

> **Architecture rule:** a boundary is useful only when you can tell whether a piece of
> code belongs inside or outside it.

Each boundary above is decidable by looking: a question inside a blueprint is wrong, a
blueprint heading inside the instruction set is wrong. That is what makes FF-001 and FF-002
computable rather than aspirational.

### Text architecture diagram

```
[ Developer ]
      |  answers
      v
[ Claude Code host ]  --- question tool, file tools, per-file permission prompt
      |
      v
[ Intake instruction set ]  --- orchestration: rounds, limits, inference, resume
      |         |
      |         +--> [ Question set ]        --- what to ask, recommended-first
      |
      +--> reads  [ Blueprint library ]      --- READ-ONLY, ships in the plugin
      |                  |
      |                  |  copy → strip worked example → fill placeholders
      |                  v
      +--> writes [ Generated workspace: <repo>/spec/ ]   --- the only writable target
      |                  ^
      |                  |  walked by
      +--> runs   [ Validation checklist ]
      |
      v
[ Hand-off report ]  --->  a later, separate session: the build agent
```

Everything outside `<repo>/spec/` is unreachable by design, and the host's permission prompt
is what makes that claim testable rather than merely stated.

### Architecture decisions

Record every significant choice as an ADR →
[`decisions.md`](../05-architecture/decisions.md) ·
[`adr-index.md`](../05-architecture/architecture-decisions/adr-index.md)

---

## 3. Frontend Requirements

There is no graphical interface. The conversational interface — eleven interaction units,
the five-states rule, and the empty states that would otherwise read as breakage — is
specified in full in
[`frontend-component-spec.md`](frontend-component-spec.md).

**Summary of what that file binds:**

| Area | Specification |
|---|---|
| Interaction units | Preamble · QuestionRound · FreeTextPrompt · InferenceNotice · ContradictionStop · RoundSummary · FileWriteProposal · ResumeReport · ValidationReport · ClosingReport · HandoffBlock |
| States | Loading (progress after each round) · success · **empty** · error · disabled (round 9+) · **permission-denied** (declined write) |
| Accessibility | Plain text only. No meaning carried by colour, symbol, or ordering alone (REQ-NF-006). `(Recommended)` is stated in words. |
| Hard rule | `ValidationReport` must distinguish **passed** from **not run**. Reporting only failures makes those two states identical, which is BR-009's exact failure mode. |

---

## 4. Backend Requirements

There is no backend process. What this section covers is the **intake procedure** — the
rules the instruction set enforces while running.

| Area | Decision |
|---|---|
| Business logic | Round sequencing with a hard stop at eight (BR-004). Files written after every round (BR-005). Depth scaled by subdomain class (BR-013). Entry point written last (BR-006). Identifiers minted uniquely and never reused (BR-007). |
| Authorization | Writes are permitted under `spec/` and nowhere else. Any other path stops and asks, naming the file (BR-008). The `.env` file and secret files are never read at all. |
| Validation | Twelve checks over the finished workspace, listed in §11 and specified in [`test-plan.md`](../../03-tests/01-plan/test-plan.md). Run before any success claim; results reported as passed / failed / **not run**. |
| Service layer | The instruction set is the only orchestrator. Blueprints do not orchestrate; the question set does not orchestrate. This separation is the observable measure of the Simplicity driver. |
| Background jobs | **None.** There is no scheduler, no queue, no deferred work, nothing that outlives the session. |
| Integrations | **None** (CON-003). See §10. |

### The fill procedure — the one algorithm in this system

Chosen in Round 5 over authoring fresh. It makes AC-012 (structure matches blueprint) nearly
free and makes BR-002 (no worked-example content) the sharp risk.

| Step | Action | Failure mode it must avoid |
|---|---|---|
| 1 | Copy the blueprint file to its destination path under `spec/`. | Copying to the wrong depth, breaking the relative back-link. |
| 2 | **Delete the `# WORKED EXAMPLE` section and everything after it**, up to any trailing blueprint-source line. | The developer inheriting requirements about a product that is not theirs (BR-002, AC-022). |
| 3 | Delete the generic prompt boxes — they are instructions for producing the file, not content of it. Prompts adapted to this developer belong in `06-agent/03-prompts/`. | A finished spec containing "paste your idea here". |
| 4 | Replace every placeholder, empty table row, and instructional italic with the developer's content, or with `[TODO: <exact question>]`. | **The defining failure of this method: leftover template text reads exactly like a filled answer.** |
| 5 | Mint and record any identifiers this file defines. | Duplicate or reused IDs (BR-007). |
| 6 | Append the blueprint back-link at the correct relative depth. | A broken link, which is a driver-level failure (Auditability). |

> **Backend discipline:** the backend must never simply accept what the frontend sends. It
> enforces the rules.
>
> **Translated:** the instruction set must never accept that a file *looks* filled. Step 4
> is the one an agent will do partially and believe it did fully — which is precisely why
> the validation checklist searches for surviving placeholder tokens rather than trusting
> the fill.

---

## 5. Database Requirements

There is no database. The filesystem is the store, the generated workspace is the record,
and the full entity model, ownership rules, sensitive-data rules, retention, and the
"no transactions" consequence are specified in
[`database-design.md`](../06-api-and-data-design/database-design.md).

**The two rules from that file that bind everything here:**

1. **State is derived, never stored.** Stage completeness comes from inspecting which
   artifacts exist. A state file is forbidden — it would be a second source of truth that
   immediately begins to disagree with the specs.
2. **There are no transactions.** Each write is independent and whole-file. A partially
   written stage is a normal outcome handled by resume, not an error to prevent.

---

## 6. API Requirements

There is no HTTP API, no endpoint, no request, and no status code. There are, however,
three real **contracts**, and treating them as contracts is what stops them drifting:

| Contract | Between | Specified in |
|---|---|---|
| **Command contract** | Developer ↔ the kit | [`api-specification.md`](../06-api-and-data-design/api-specification.md) |
| **Blueprint contract** | Blueprint library ↔ generated artifact | `api-specification.md` |
| **Workspace contract** | Generated workspace ↔ the build agent | `api-specification.md` |

The third is the one that matters most and is easiest to overlook. The build agent is a
consumer with no memory of the interview, reading a ~90-file workspace produced by a
different session. Everything it can rely on — the entry point exists, is under 100 lines,
its paths resolve, identifiers resolve, task files name their allowed and forbidden files —
is a contract this system must honour, and each clause is a test.

---

## 7. Security Requirements

> **Beginner rule (Ch. 21):** do not write "make it secure." Write the exact security
> behavior you expect.
>
> **You decide the security policy in the specification. The agent does not.**

Security was **considered and deliberately not made a driving characteristic** — see
[`driving-characteristics.md`](../02-requirements/driving-characteristics.md) Step 2. That
is not a downgrade: it stays a hard constraint (CON-005), a business rule (BR-008), four
requirements, and a denial test each. The reasoning was that it cannot be under-served
without first breaking a constraint that stops the build.

### 7.1 Authentication (*who are you?*)

| Area | Requirement |
|---|---|
| Account access | **None.** There is no account, no sign-in, no session, and no identity. The kit runs as the developer, with the developer's own filesystem permissions. |
| Session lifetime | n/a — a session is a Claude Code conversation, owned by the host. |
| Password handling | n/a — no password is ever collected, stored, or transmitted. |
| Account recovery | n/a. |
| Multi-factor | n/a. |

| ID | Authentication requirement | Acceptance criteria |
|---|---|---|
| SEC-A-001 | The kit must never prompt for, collect, store, or transmit a credential of any kind. | Given a complete intake, when every generated file and every prompt is inspected, then no credential field, token, or key was requested or written. |
| SEC-A-002 | The kit must never read the developer's `.env` file or any file matching a secret-file pattern — not to inspect, not to template from, not to list. | Given a repository containing `.env`, when intake completes, then that file was never read. |

### 7.2 Authorization / RBAC (*what are you allowed to do?*)

The actors are not users of a system with logins; they are boundaries the kit enforces on
itself. Every **Yes** below carries an obligation to write a **deny** test for every **No**
in the same row — that is BR-010, and it is the point of the table.

| Action | Developer | Intake agent | Build agent | Kit author |
|---|---|---|---|---|
| Answer or skip an interview question | Yes | No | No | No |
| Decline a proposed file write | Yes | No | No | No |
| Create/update a file under `spec/` | Yes | **Yes** | Only files the task lists | Yes |
| Create/update a file outside `spec/` | Yes | **No — must stop and ask, naming the file** | **No — must stop and ask** | Yes |
| Modify the developer's existing root `CLAUDE.md` | Yes | **No — never, under any circumstance** | No | No |
| Read `.env` or a secret file | Yes | **No** | **No** | No |
| Write application source code | Yes | **No (BR-001)** | Yes, within its task | Yes |
| Ask a ninth interview round | — | **No (BR-004)** | — | — |
| Report success on an unrun check | — | **No (BR-009)** | — | — |
| Invent a fact instead of writing `[TODO]` | — | **No (BR-003)** | **No** | — |
| Write to the blueprint library at runtime | — | **No — read-only** | No | Yes, at authoring time |
| Reverse an ADR without superseding it | — | No | **No** | No |

> A role table gives the agent a precise boundary. It does not need to guess whether it may
> touch a file — the table already says no.

**The independent enforcement.** Everything above is a rule the kit follows, not a sandbox
imposed on it. The kit runs with the developer's own permissions and could write anywhere.
The one enforcement that does not depend on the kit's own good behaviour is **the host's
per-file permission prompt** — which is exactly why REQ-F-025 forbids requesting blanket
write access. Removing that prompt would reduce every row above to an intention.

### 7.3 Input validation

| Input | Validation rule | Error behavior |
|---|---|---|
| Free-text problem statement | Accepted as given. Never rejected, never re-asked in a loop. | If it is too vague to build requirements from, that becomes an open question with a decision owner — not a rejection. |
| Driving-characteristic selection | At most three (BR-011). | Push back **once** with the reason; then accept three and record the rejected ones. Not an error state. |
| A developer-supplied product/folder name | Must be a path-safe segment; must not traverse (`..`), must not be absolute. | Reject and ask again, naming the problem. A traversal here would write outside `spec/`. |
| An existing workspace being resumed | Must be readable; stage derived by inspection. | If it cannot be reconciled, report what was found and ask — never overwrite the developer's hand-edits. |

### 7.4 Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | The kit collects only interview answers. It does not read the developer's source code, dependencies, or git history. |
| Storage | How should data be stored? | Plain Markdown in the developer's own repository, under their own version control. Nowhere else. |
| Transport | How does data move? | **It does not.** Zero network calls (CON-003, REQ-NF-007). |
| Logging | What must **not** be logged? | There is no log. No telemetry, no error reporting, no analytics (CON-007, BR-014). |
| Retention | How long is data kept? | Indefinitely, by the developer, in their repository. The kit never deletes. |

### 7.5 Secrets management

The kit has **no secrets of its own** — no key, no token, no signing material, nothing to
configure. That is a consequence of CON-003 and CON-006, and it removes an entire class of
risk rather than managing it.

| Secret | Where configured | Must never appear in | Reference |
|---|---|---|---|
| *(none — the kit has no secret)* | — | — | — |
| The **developer's** secrets | Their own `.env`, outside the kit's reach | Any generated file, any report | Never read (SEC-A-002) |

Two obligations remain, both about the workspace the kit *generates*:

- The generated `.gitignore` must exclude `.env` and secret files, and must be **written
  before** `.env.example` (REQ-NF-002) — so that the ignore rule exists before the file that
  invites a developer to copy it.
- No generated file may contain a credential, including in an example.

### 7.6 Secure error handling

| Problem | Unsafe response | Safer response |
|---|---|---|
| A blueprint is missing from the plugin | Improvise a structure and continue. | "Blueprint `<path>` is missing from the installed plugin. Rounds 1–N are intact. Stopping here." — a named gap, not an invented file. |
| A path outside `spec/` must be written | Write it, because it looked harmless. | Stop, name the file, show what would change, ask. |
| Validation finds a dangling identifier | Report "complete" with a warning. | Report the check as **failed**, name the file and the identifier, and do not claim success. |
| The developer's workspace is inconsistent | Silently re-derive and overwrite their edits. | Report what was found and what cannot be reconciled; ask. |
| An answer is ambiguous | Pick the likelier reading. | Record it as an open question with a decision owner, and state the assumption made in the meantime. |

### 7.7 Per-feature security specification

```
Feature:        Writing into the developer's repository
Requirement ID: SEC-A-003

Authentication:  None — the kit runs as the developer.
Authorization:   Writes permitted under <repo>/spec/ only.
Validation:      Destination path must resolve inside spec/ after normalisation.
                 Reject any path containing .. or an absolute prefix.
Data protection: .env and secret files are never read. No generated file holds a credential.
Secure errors:   A blocked write names the file and what would change, and asks.
Testing:         Allowed actor (write under spec/) · disallowed actor (write outside) ·
                 traversal attempt (spec/../../etc) · existing-CLAUDE.md case ·
                 declined write leaves a resumable run

Acceptance criteria:
1. A write inside spec/ proceeds after the host's per-file prompt.
2. A write outside spec/ stops and asks, naming the file.
3. A path that normalises to outside spec/ is rejected even if it begins with spec/.
4. An existing root CLAUDE.md is byte-for-byte unchanged after a complete intake.
5. Declining any single write leaves the run resumable, not failed.
6. No .env file is read at any point.
```

### 7.8 Security review checklist (Ch. 21 §21.8)

- [x] Every protected action has an authorization rule — §7.2.
- [x] Role permissions are documented in a table — §7.2.
- [x] Input rules are specific and testable — §7.3, including path traversal.
- [x] Enforcement does not rely only on the kit's own good behaviour — the host's per-file prompt, §7.2.
- [x] Sensitive data is not logged or transmitted — there is no log and no network.
- [x] Secrets are not stored in source or examples — the kit has none; §7.5 covers the generated ones.
- [x] Error messages are safe and give a next action — §7.6.
- [x] Security requirements are linked to tests — SEC-A-001 to SEC-A-003.
- [x] The agent has explicit instructions not to add unapproved access paths — §7.2 and `AGENT.md`.

---

## 8. Performance Requirements

Performance was **explicitly rejected as a driving characteristic** — no contended resource,
no query, no network, under 50 users. Targets are recorded so that "we never thought about
it" is not confused with "we decided it did not matter".

| Workflow | Metric | Target | Expected data size |
|---|---|---|---|
| One question round | Developer-visible wait with nothing on screen | None — questions are composed before being shown | ≤ 4 questions |
| Writing one round's files | Time before the developer sees progress | **At most one round** — round *N*'s files exist before round *N+1* is asked (REQ-NF-001) | ~5–15 files per round |
| Full intake | Wall-clock duration | `[TODO: the kit author has not set a target — see SM-5 in intent.md]` | ~90 files |
| Validation walk | Duration | Not specified. Bounded by ~90 files; a full read is trivially fast at this size. | ~90 files |

**The honest limit:** the dominant cost in every row is the *model's* thinking and writing
time, which the kit does not control and cannot optimise. Setting a latency target for a
model-driven interview would be setting a target for someone else's system. That is why
REQ-NF-001 measures *progress visibility* rather than speed — it is the part the kit owns.

| Risk | What to check |
|---|---|
| Silent stretches | Is any period longer than one round passing with no output? That is REQ-NF-001, and it is the only performance rule that binds. |
| Re-reading blueprints | Is a blueprint being read more than once per generated file? Wasteful, not harmful. |
| Workspace growth | Does a generated workspace ever get large enough that the validation walk is perceptible? That is the reopening trigger for performance as a driver. |

---

## 9. Error Handling & Reliability Requirements

> Reliable software is not software that never fails. It fails in **controlled,
> understandable, and recoverable** ways.

**Reliability is a driving characteristic here.** Its measure is: for every stage 1–8,
interrupt mid-stage, re-run, and intake resumes at that stage and completes — **8/8**.
Full detail in [`reliability-specification.md`](../07-security-and-reliability/reliability-specification.md).

### 9.1 Error handling table

| Error situation | Expected behavior |
|---|---|
| A blueprint is missing from the plugin | Stop at that file. Name the missing blueprint. Leave prior rounds intact. Never improvise a structure. |
| A write is declined by the developer | Note the file as skipped, continue the round, keep the run resumable. Report it in the closing summary. |
| A write outside `spec/` is required | Stop, name the file, show what would change, ask. |
| The repository is not writable | Fail **before** the first question, naming the path — not on round one after the developer has answered. |
| Two answers contradict | Stop, quote both verbatim, ask which holds. Offer no default. |
| The workspace is hand-edited into an inconsistent state | Report what was found and what cannot be reconciled. Ask. Never silently overwrite. |
| A stage is half-written | Identify it, redo it from its start, replace rather than append. |
| Validation fails | Report which check failed, name the file and identifier, do **not** claim success, leave the workspace resumable. |
| A fact is missing after eight rounds | Write `[TODO: <exact question>]`, add the matching open question. Never guess. |

### 9.2 Failure sources

| Failure source | Question to ask | Recovery rule |
|---|---|---|
| Developer input | Ambiguous, contradictory, or absent? | Open question with an owner, plus a stated assumption. Never a silent pick. |
| Filesystem | Write refused, path unwritable, permission denied? | Stop at that file, report the path, keep prior work. |
| The host | Session closed, context lost, tool unavailable? | The workspace on disk is the recovery point. Resume derives its position from it. |
| The blueprint library | A template missing or restructured by a version change? | Named gap, not an improvisation. Version stamp (§10) is what makes this diagnosable. |
| The agent itself | Filled a file only partially, or drifted from the blueprint structure? | **The validation walk is the detector.** This is the failure mode a model-driven system has that a program does not. |

### 9.3 Failure states

```
- Failure state: PARTIAL_STAGE
  - Trigger:        Session ended mid-round; some of the round's files written.
  - Recovery path:  Resume derives the incomplete stage and redoes it from its start.
  - User message:   "Rounds 1-N complete. Round N+1 was partially written; redoing it."
  - Test case:      FTEST-001 (per stage, 8 cases)

- Failure state: DECLINED_WRITE
  - Trigger:        Developer declines a proposed file at the host's prompt.
  - Recovery path:  Continue the round; record the file as skipped.
  - User message:   "Skipped <path>. Continuing; resume will offer it again."
  - Test case:      FTEST-002

- Failure state: BOUNDARY_BLOCKED
  - Trigger:        A write outside spec/ is required.
  - Recovery path:  Stop, name the file, show the change, ask.
  - User message:   "<path> is outside spec/. Here is what would change. May I?"
  - Test case:      FTEST-003, STEST-002

- Failure state: MISSING_BLUEPRINT
  - Trigger:        A required template is absent from the installed plugin.
  - Recovery path:  Stop at that file; prior rounds intact.
  - User message:   "Blueprint <path> is missing from the installed plugin."
  - Test case:      FTEST-004

- Failure state: VALIDATION_FAILED
  - Trigger:        Any check fails on the finished workspace.
  - Recovery path:  Report the failing check, file, and identifier. No success claim.
  - User message:   "Check <name> failed: <identifier> in <file> does not resolve."
  - Test case:      FTEST-005

- Failure state: LEFTOVER_TEMPLATE
  - Trigger:        A generated file still contains a placeholder or worked-example text.
  - Recovery path:  Fill it, or convert it to [TODO] with a matching open question.
  - User message:   "<file> still contains unfilled template text at <location>."
  - Test case:      FTEST-006  -- the copy-then-fill method's characteristic failure
```

### 9.4 Timeout and retry rules

| Decision | Rule |
|---|---|
| Timeout | **None.** Nothing waits on anything — no network, no process, no lock. |
| Retry count | **None automatic.** A failed write is reported, not retried in a loop. |
| Retry delay | n/a |
| Idempotency | **Re-running intake on a complete stage must be safe.** Resume derives position and redoes only what is incomplete. Whole-file writes make a redone stage idempotent by construction. |
| Stop condition | Eight rounds, hard (BR-004). A failed write stops that file, not the run. |

### 9.5 Background jobs and queues

**None.** No scheduler, no queue, no deferred work, nothing outliving the session. Recorded
because its absence is a decision: a "clean up orphaned partial workspaces" job would be a
plausible proposal, and it is rejected — the kit never deletes the developer's files.

### 9.6 Logging requirements

**There is no log.** No file, no telemetry, no error reporting (CON-007, BR-014). The
developer-visible output *is* the record, and the workspace on disk is the audit trail.

| Requirement | Applied here |
|---|---|
| Event name | The round summary line: `Round N — wrote X files`. |
| Severity | Carried in words, never colour alone (REQ-NF-006). |
| Correlation | The workspace path. There is one run, one workspace, one developer. |
| Safe context | File paths and identifiers only. |
| **Must never appear** | The contents of `.env`, any credential, anything read from outside `spec/`. |

### 9.7 User-facing error messages

| Weak message | Better message | Why |
|---|---|---|
| "Intake failed." | "Round 5 stopped: blueprint `technical-spec.md` is missing from the installed plugin. Rounds 1–4 are complete and intact." | Names the failure, the cause, and what survived. |
| "Validation error." | "Check 3 (identifiers resolve) failed: `REQ-F-<nnn>` is referenced in `TASK-<nnn>.md` but not defined in `requirements.md`." | Names the check, the file, and the identifier. |
| "Cannot write file." | "`README.md` is outside `spec/`. Here is what would change. May I write it?" | Turns a refusal into a decision the developer can make. |
| "Done." | "Wrote 87 files. 4 `[TODO]`s remain, 3 open questions block coding, 2 assumptions were made — all listed below." | The closing report a developer cannot reconstruct themselves. |

### 9.8 Reliability definition of done

- [x] All expected failure states are handled — six named in §9.3.
- [x] Output is safe and useful — no log exists to leak.
- [x] User-facing errors are clear and give a next action.
- [ ] Tests cover normal **and** failure behavior — written in Round 7.

---

## 10. Integration & Versioning Requirements

### 10.1 Integration specification

**There are no external integrations.** No payments, no email, no storage, no identity, no
analytics, no AI model API beyond the host's own. This follows from CON-003 and CON-006 and
is not a gap.

The single external dependency is the **host platform**, and it deserves the integration
treatment even though it is not a service:

| Item | Definition |
|---|---|
| Provider | Claude Code |
| Purpose | Command registration, the question mechanism, file read/write tools, and the per-file permission prompt |
| Data sent | Nothing leaves the machine |
| Failure behavior | If the plugin mechanism changes, installation breaks for everyone at once (RSK-3) |
| Mitigation | Depend only on documented mechanisms. Keep the output plain Markdown, so a generated workspace survives even if the intake mechanism breaks. |
| **Detector** | **None.** `[TODO: does the kit author track Claude Code plugin releases? Without it, RSK-3 has no early warning — only a support report.]` |

### 10.2 Versioning and compatibility

Two things version independently, and confusing them is how back-links break.

| What | Versioned how | Breaking change means |
|---|---|---|
| **The plugin** (instructions, questions, blueprints) | Semantic version in the manifest | A blueprint moved, renamed, or restructured |
| **A generated workspace** | **Stamped with the plugin version that produced it** (Round 5 decision) | Nothing — a workspace is Markdown and stays readable forever |

| Change type | Safe? | Example |
|---|---|---|
| Add a blueprint | Safe | A new optional spec file |
| Add a question | Safe | Round 6 gains a fourth question |
| Reword a question or an option | Safe | Clearer reason text |
| Change a blueprint's internal section | Usually safe | Existing workspaces keep the old structure; they are not regenerated |
| **Rename or move a blueprint file** | **Breaking** | Every back-link in every workspace ever generated now points at nothing |
| **Remove a blueprint** | **Breaking** | Same, plus resume cannot complete a stage that expects it |

**The version stamp exists for exactly this.** A workspace stamped `produced by v1.2.0`
can be diagnosed against an installed `v2.0.0` and told plainly that its back-links refer
to a library that has moved. Without the stamp, a broken link is indistinguishable from a
generation bug. **Rule:** any release that renames, moves, or removes a blueprint must ship
a migration note naming the old and new paths.

---

## 11. Testing Approach

| Level | Strategy |
|---|---|
| Unit | The smallest testable units are the **inference rules**, the **depth rules**, and the **fill procedure's six steps** — each with a normal, edge, and failure case. |
| Integration | Blueprint → generated artifact: structure preserved, worked example removed, placeholders gone, back-link resolves at the right depth. |
| End-to-end | A full intake from fixed answers, producing a **golden workspace** asserted structurally. Plus the eight resume cases. |
| Security | One **deny** test per **No** in the §7.2 matrix, plus path traversal and the existing-`CLAUDE.md` case. |
| Performance | One check only: no stretch longer than one round without output (REQ-NF-001). |
| Regression | The golden workspaces. Any blueprint or question change that alters them must alter them *deliberately*. |

→ [`test-plan.md`](../../03-tests/01-plan/test-plan.md)

### The problem this section has to solve

**The system is non-deterministic.** Instructions-only (ADR-002) means the same answers may
not produce byte-identical files, so `assertEqual` on a generated workspace is the wrong
tool and would produce a permanently red, permanently ignored suite.

The resolution, stated here because it shapes every test written in Round 7:

- **Assert structure, never prose.** Section headings present and in order · identifiers
  resolve · back-links resolve · no surviving placeholder tokens · no worked-example
  content · no blank rows requiring a decision. All computable, none subjective.
- **Golden workspaces are fixtures, not expected outputs.** They are checked against the
  structural rules, not diffed byte-for-byte.
- **Where a threshold is genuinely a judgement** — is this specification *deep* enough? —
  say so plainly and score it against a floor rather than asserting equality. That is the
  same discipline model output requires, and pretending otherwise produces a suite that
  measures nothing.

### The twelve validation checks

Run at the end of every intake (REQ-F-029), and the same list runs in CI over golden
workspaces as the fitness functions of §12.

| # | Check | Proves |
|---|---|---|
| 1 | Every referenced identifier resolves to a definition in the same workspace | Auditability · AC-013 |
| 2 | No identifier is defined twice | BR-007 |
| 3 | Every generated file ends with a blueprint back-link that resolves | Auditability · AC-012 |
| 4 | No generated file contains worked-example content | BR-002 · AC-022 |
| 5 | **No generated file contains a surviving placeholder token or instructional italic** | The copy-then-fill failure mode |
| 6 | Every `[TODO]` has a matching `Q-###` row | BR-003 · AC-014 |
| 7 | No table row requiring a decision is blank — each is specified or marked *not needed, because…* | Auditability |
| 8 | Every permission rule has at least one deny test | BR-010 · AC-016 |
| 9 | Every driving characteristic has at least one fitness function | BR-010 · AC-017 |
| 10 | The entry-point file is under 100 lines and all its paths resolve | REQ-NF-009 · AC-015 |
| 11 | No generated file contains application source code | BR-001 · AC-018 |
| 12 | No generated file contains a credential; `.gitignore` excludes `.env` | REQ-NF-002 |
| **13** | **Every blueprint in the library produced a file, or is recorded as skipped with a reason** | REQ-F-040 · FF-015 |
| **14** | **Every completed stage has a dated acceptance row, and no acceptance/progress file exists** | REQ-F-041 · ADR-006 · FF-016 |
| **15** | **Blueprint integrity: every checksum matches the manifest, and no blueprint was modified by this run** | REQ-F-042 · FF-017 |

Each check reports **passed**, **failed**, or **not run** — never inferring one from another.

**Check 15 runs twice** — once before the first write, as a precondition, and once at the end.
The first run stops a corrupted library from producing subtly wrong specifications; the second
proves the run did not modify what it read.

---

## 12. Deployment Approach

| Area | Summary |
|---|---|
| Environments | The developer's machine. There is no test environment and no production environment for the kit itself, because nothing is hosted. **The kit author's CI is the only build**, and it is where fitness functions run. |
| Configuration | None. No config file, no environment variable, no setting. The absence is deliberate — a setting is a branch, and Simplicity's measure counts branches. |
| Migrations | Blueprint renames only. See §10.2. |
| Rollback | The host's plugin mechanism (install a previous version). Generated workspaces are unaffected by a rollback — they are the developer's files. |
| Monitoring | **None is possible** under CON-007. This is the same hole as Q-002 and is stated rather than papered over. |

→ [`deployment-checklist.md`](../../07-ops/01-deployment/deployment-checklist.md)

**Where fitness functions actually run.** With no runtime on the developer's machine,
"fails the build" cannot mean their build — they have none. It means the **kit author's CI**:
the twelve checks of §11 run over golden workspaces on every change to the plugin, and block
the merge. Detail in [`fitness-functions.md`](fitness-functions.md).

---

## 13. Open Decisions

*Unresolved choices that must **not** be guessed by the AI agent.*

→ [`open-questions.md`](../01-intent/open-questions.md)

| ID | Decision needed | Owner | Must be resolved before |
|---|---|---|---|
| Q-002 | SM-2 (intake completion rate) is unmeasurable under CON-007. Drop it, replace it, or qualify the privacy promise. | Kit author | Release |
| Q-003 | Is the blueprint library really supporting, or is it core? | Kit author | Implementation |
| Q-006 | Is the kit built from this workspace, using its own method? | Kit author | Implementation |
| Q-007 | Licence and attribution for blueprints derived from a published method. | Kit author | Release |
| ~~Q-008~~ | ~~Team size and plugin-internals experience — fills CON-008.~~ **Closed at TASK-001**: no spike needed; CON-008 filled. | Kit author | ~~Design~~ — done |
| — | Does the kit author track Claude Code plugin releases? RSK-3 currently has no detector. | Kit author | Release |
| — | Do resume, contradiction detection, inference, and depth scaling move from Should to Must, given CON-002? | Kit author | Design |

---

## 14. Guardrail Checklist

**Before generating code, verify (Appendix C):**

- [x] Requirements are mapped to modules — §2 component boundaries.
- [x] Data models are named — §5 and `database-design.md`.
- [x] Contracts are defined — §6 and `api-specification.md`.
- [x] Error states are documented — §9.3, six named states.
- [ ] Tests exist before implementation — Round 7.
- [x] Security rules are explicit — §7.2 matrix with a deny obligation per row.
- [x] Open questions are not treated as assumptions — §13.

**Architecture checklist (Ch. 8)**

- [x] Architecture style chosen on real project needs.
- [x] Main components defined.
- [x] What each component owns is described.
- [x] What each component must **not** do is identified.
- [x] Trade-offs compared before deciding — including the non-determinism cost of ADR-002.
- [x] At least one ADR written for the main architecture decision — five written.
- [x] Rules an AI assistant can follow during implementation — `adr-index.md`, mirrored into `AGENT.md`.

---

**Next:** [`traceability.md`](../08-traceability/traceability.md) ·
[`decisions.md`](../05-architecture/decisions.md) ·
[`task-index.md`](../../02-tasks/01-planning/task-index.md)

> Blueprint: ../../../spec-driven-template/01-docs/04-technical-spec/technical-spec.md
