# Frontend Component Specification

> Source: Ch. 7 §7.4 + Ch. 27 §27.6.
> Tells the agent what components to create, what data they receive, what states they must
> handle, and how they behave when filters or permissions change.

---

## Adaptation note — read first

There is no graphical interface. The blueprint says to skip this file for API-only products,
and this product is not API-only: it has a real, and quite large, **conversational interface**
made of question rounds, progress reports, confirmations, and a closing hand-off. That
interface is where RSK-1 lives — a developer abandons the interview because of how it *reads*,
not because of what it writes.

So the file is kept, with its structure intact and its vocabulary translated:

| Blueprint term | Meaning here |
|---|---|
| Component | An **interaction unit** — one distinct thing the developer reads or answers |
| Props / inputs | What the unit needs to know before it can be shown |
| Internal state | What the intake tracks while the unit is live |
| Rendering | Emitting text to the terminal, or invoking the host's question tool |
| Accessibility | Plain text, no meaning carried by colour or symbol alone (REQ-NF-006) |

The five-states rule survives translation unchanged, and is the most valuable part of this
file. A conversational interface fails in exactly the same five ways a screen does.

---

## Component table

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| `Preamble` | Tell the developer what is about to happen and how many rounds, before question one. | Depth setting; the round count (eight, at both depths) | ready, error | Never asks a question. Two sentences (REQ-F-004). Must state the round count, because a visible end is what makes an interview finishable. |
| `QuestionRound` | Ask up to four grouped questions. | Round number; question set; prior answers | ready, awaiting-answer, blocked | At most four questions (REQ-F-005). Recommended option first with a one-line reason (REQ-F-006). Free text always available (REQ-F-007). Never asks what a prior answer settled (REQ-F-009). |
| `FreeTextPrompt` | Ask the one question that cannot be multiple choice — the problem statement. | Round 1 answers | awaiting-answer, error | Must state the shape of a good answer and explicitly ask **not** for features. Rejects nothing; a poor answer becomes an open question, not a re-ask loop. |
| `InferenceNotice` | State a question that was *not* asked and the inference drawn instead. | The skipped question; the answer it was derived from | ready | Always names both the inference and its source, so the developer can challenge it. Silence here turns an inference into a hidden assumption. |
| `ContradictionStop` | Halt and quote two answers that cannot both hold. | Both statements, verbatim | blocked | Quotes **both**, verbatim, and offers no default (REQ-F-010, BR-012). Must not resolve, rank, or hint at a preferred answer. |
| `RoundSummary` | Report what a round wrote. | File paths written; round number | success, partial, permission-denied | One line: `Round N — wrote X files`. A declined write makes this **partial**, and it must say which file was skipped. |
| **`StageReview`** | **Present what a round produced and wait for the developer to accept it.** | Files written; decisions recorded; inferences drawn; `[TODO]`s created; skipped blueprints | awaiting-decision, accepted, revising, stopped | **Blocks the next round** (REQ-F-038). Must show *decisions*, not just filenames — a list of paths proves nothing was read. Offers exactly three choices: **accept · revise · stop** (REQ-F-039). Records acceptance as a dated row in the generated change-control artifact — **never a state file** (ADR-006). |
| `FileWriteProposal` | Propose one file write for approval. | Target path; content | awaiting-approval, approved, denied | Owned by the **host's** permission prompt, not built by the kit (REQ-F-025). The kit's obligation is to never request blanket permission and never build a bypass. |
| `ResumeReport` | On a re-run, report which stages exist and where the interview continues. | Workspace contents | success, empty, error | Derived by inspecting files, never from a state file (`database-design.md` §0). Must distinguish *complete*, *partial*, and *absent*. |
| `ValidationReport` | Report each check run over the finished workspace. | Check list; results | success, error, **not-run** | **not-run is a distinct state and must never render as passed** (BR-009). Every failure names the file and the identifier. |
| `ClosingReport` | The final summary. | File count; `[TODO]`s; open questions; assumptions | success, partial | Must list assumptions made rather than asked — the one section a developer cannot reconstruct themselves. |
| `HandoffBlock` | Print the single instruction that starts the build session. | Workspace root; first task ID | success | Printed only after validation. Must be copy-pasteable verbatim, with no placeholder left in it. |

---

## Per-component template

```
Component name:
Purpose:
Supports requirement: REQ-###

Props / inputs:
  - name: type — required/optional — meaning

Internal state:

States to handle:
  - Loading:            [what the developer sees]
  - Success:            [what the developer sees]
  - Empty:              [what the developer sees — must not look like an error or a zero]
  - Error:              [safe message + recovery action]
  - Disabled:           [when and why]
  - Permission denied:  [what is hidden vs. what is explained]

User actions:

Validation shown inline:

Accessibility notes:
  - Labels:
  - Keyboard navigation:
  - Error announcement:

Out of scope for this component:
```

---

## Per-component detail — `StageReview`

The gate that makes the developer read the output. Its whole value is in **what it shows** —
a list of filenames can be skimmed in a second and proves nothing.

```
Component name:       StageReview
Purpose:              Present what a round produced and obtain an explicit decision
                      before the next round begins.
Supports requirement: REQ-F-038, REQ-F-039, REQ-F-041, AC-036..038, AC-040, AC-041

Props / inputs:
  - roundNumber: int             — required
  - filesWritten: Path[]         — required
  - decisions: Decision[]        — required — what this round DECIDED, in one line each
  - inferences: Inference[]      — required — questions not asked, and what was inferred
  - todos: Todo[]                — required — gaps created this round, with their Q-###
  - skippedBlueprints: Skip[]    — required — blueprints not used, with reasons
  - declinedWrites: Path[]       — required — files the developer refused

Internal state:
  - decision: awaiting | accepted | revising | stopped

States to handle:
  - Loading:           Not applicable — everything shown was produced before the gate.
  - Success:           The four sections above, then the three choices.
  - Empty:             A round that recorded no decision, drew no inference, and created
                       no [TODO] is SUSPICIOUS, not clean. Say so plainly:
                       "Round N produced files but recorded no decisions. That may mean
                       the questions did not extract anything — worth checking."
                       NEVER render an empty review as a clean bill of health.
  - Error:             A file this round should have produced is missing. Name it and
                       present the gate anyway — the developer decides whether to revise.
  - Disabled:          Not applicable. The gate is never skippable, at any depth.
  - Permission denied: A declined write appears in its own section. The gate still runs.

User actions:         accept · revise · stop

Validation shown inline:
  - "revise" re-asks THIS round only. Later rounds are untouched — there are none yet.
  - "stop" leaves every accepted round on disk and the workspace resumable.

Accessibility notes:
  - Labels:            The three choices are named in words. No single-key shortcuts,
                       no colour-coded options (REQ-NF-006).
  - Announcement:      Counts are stated ("4 decisions, 2 inferences, 1 [TODO]"), because
                       a reader skimming needs the shape before the detail.

Out of scope for this component:
  - Showing full file CONTENTS — ~90 files cannot be read in a gate, and pretending
    otherwise produces scrolling rather than reading.
  - Partial acceptance (accept the requirements, not the data model). Different feature,
    different shape — ADR-006 "Revisit when".
  - Editing anything. The gate presents and asks; revise re-runs the round.
```

> **Why decisions rather than filenames.** The gate exists to attack RSK-2 — a workspace
> that is structurally complete and substantively hollow. A developer shown
> `wrote 3 files` learns nothing about whether those files say anything. A developer shown
> *"core subdomain: the interview · 3 drivers chosen, security rejected because it is already
> a hard constraint · 1 inference: hosted components ruled out by your no-network answer"*
> can disagree — and disagreement is the entire point.
>
> **The honest limit:** this raises the cost of not reading. It cannot make reading
> mandatory, and ADR-006 says so rather than claiming otherwise.

## Per-component detail — `QuestionRound`

The core subdomain's interface. Everything the product competes on is visible here.

```
Component name:       QuestionRound
Purpose:              Ask up to four grouped questions for one round of the interview.
Supports requirement: REQ-F-005, REQ-F-006, REQ-F-007, REQ-F-009, REQ-F-011
                      AC-004, AC-005, AC-006, AC-008

Props / inputs:
  - roundNumber: int        — required — 1..8, shown so the end is visible
  - totalRounds: int        — required — reduced when depth is express
  - questions: Question[]   — required — at most 4, each with a recommended option first
  - priorAnswers: Answer[]  — required — used to suppress derivable questions

Internal state:
  - answered: which of this round's questions have come back
  - inferences: questions suppressed this round, and what was inferred instead

States to handle:
  - Loading:           Not applicable — questions are composed before they are shown.
                       The developer never waits inside a round with nothing on screen.
  - Success:           The four questions, each with a recommended option first and a
                       one-line reason for it.
  - Empty:             Every question this round was answerable from prior answers.
                       The round is SKIPPED and an InferenceNotice states what was
                       inferred and from where. It must NOT render as an empty round
                       or as a round that failed — an interview that appears to skip
                       a stage reads as a bug.
  - Error:             A question cannot be composed (missing prior answer it depended
                       on). Say which question and which dependency, ask the dependency
                       directly, and continue. Never drop the question silently.
  - Disabled:          Round 9 and beyond. The eight-round limit is hard (BR-004);
                       remaining unknowns become open questions, not a ninth round.
  - Permission denied: Not applicable — asking a question writes nothing.

User actions:         select an option · select several (multi-select rounds) ·
                      type a free-text answer instead · decline to answer

Validation shown inline:
  - More than three driving characteristics selected → push back ONCE, with the
    reason, then accept at most three and record the rejected ones (REQ-F-013).
  - An answer contradicting an earlier one → hand off to ContradictionStop.
    Do not resolve it here.

Accessibility notes:
  - Labels:            Every option carries a text label and a text reason. No option
                       is distinguished by colour, position, or symbol alone (REQ-NF-006).
  - Keyboard:          The host's question tool owns input. The kit adds no shortcut
                       and no mouse affordance.
  - Announcement:      The recommendation is stated in words — "(Recommended)" — not
                       implied by ordering alone, because ordering is invisible to a
                       reader who is not comparing.

Out of scope for this component:
  - Asking more than four questions · branching mid-round · re-asking an answered
    round · scoring or validating the free-text answer · writing any file
```

---

## The five states rule

Every data-bound component must handle **all five**. Missing states are where shallow
AI-generated UIs fail (Ch. 27 §27.3) — and a conversational interface fails identically.

| State | Requirement |
|---|---|
| Loading | Show progress; never a blank frame. **Here:** never write ~90 files in silence. `RoundSummary` after every round is the progress indicator (REQ-F-015). |
| Success | Render the data. |
| **Empty** | Explain *why* it is empty and how data appears. Never render an empty result as a zero value. |
| **Error** | Safe message + retry option. Never a stack trace. |
| **Permission denied** | Hide or disable; do not reveal protected resource details. **Here:** a declined write is a normal outcome, not a failure (REQ-R-004). |

### Empty states, filled in — the ones most likely to be got wrong

Empty is the state that reads as breakage when handled carelessly. Each of these is a
*correct* outcome that must not look like a fault:

| Where | Empty means | What the developer must see |
|---|---|---|
| `ResumeReport` | No `spec/` folder exists. | "No workspace found — starting a new intake at Round 1." Not an error, not a warning. |
| `ValidationReport` | Zero failures. | "All 12 checks ran; all passed." — the **count of checks run** is stated, because "no failures" and "nothing was checked" are otherwise indistinguishable (BR-009). |
| `ClosingReport` → `[TODO]` list | Nothing unresolved. | "No open `[TODO]` markers." Stated positively. A blank section reads as a missing section. |
| `ClosingReport` → assumptions | Nothing was assumed. | "No assumptions were made; every fact came from an answer." Silence here would be indistinguishable from forgetting to report. |
| `QuestionRound` | Every question was inferable. | The round is skipped **with** an `InferenceNotice` naming what was inferred and from which answer. |
| Subdomain map, generic rows | Nothing to build. | "Adopt — no work item." Not a blank cell. |

### Permission-denied states, filled in

| Where | Trigger | What the developer sees |
|---|---|---|
| `FileWriteProposal` | Developer declines a write. | The file is named as skipped, the round continues, and the run stays resumable (REQ-R-004, AC-029). |
| A write outside `spec/` | Any path the kit does not own. | It stops and asks, naming the file and what would change (BR-008). It never proceeds on the grounds that the change looked harmless. |
| Existing root `CLAUDE.md` | Present in the repository. | The kit's entry point goes inside `spec/`, and the exact line to add is printed. Their file is never proposed for modification at all (REQ-F-026). |
| A dependent file after a decline | The declined file was needed. | The dependency is reported and the dependent content is marked `[TODO]` with the reason — never silently worked around. |

---

## Frontend requirement areas (Ch. 7 §7.4), translated

| Area | Specify |
|---|---|
| Screens or pages | None. The units are: preamble, eight question rounds, per-round summaries, resume report, validation report, closing report, hand-off block. |
| Components | The eleven interaction units in the table above. |
| Form fields | Question options. Each carries a label and a one-line reason; the first is marked `(Recommended)`. |
| UI states | Loading (progress after each round), success, empty, error, disabled (round 9+), permission-denied (declined write). |
| User actions | Select · multi-select · type a free-text answer · decline a write · interrupt · resume. |
| Accessibility basics | Plain text only. No colour-carried meaning, no symbol-only status, no reliance on ordering to convey a recommendation (REQ-NF-006). |

---

> **Security rule (Ch. 27 §27.7):** hiding a button in the frontend is helpful for the
> user interface, but it is **not security by itself**. Enforce permissions on the server.
>
> **Translated:** the kit's own promise not to write outside `spec/` is a *rule it follows*,
> not a boundary something else imposes. There is no server here and no sandbox — the kit
> runs with the developer's own filesystem permissions. The independent enforcement is the
> host's per-file permission prompt, which is exactly why REQ-F-025 forbids requesting
> blanket write access. Removing that prompt would leave the boundary as an intention.

---

## Out of scope for this specification

- Any graphical interface, web view, or TUI.
- Styling, colour schemes, spinners, or progress bars — plain text lines only.
- The wording of individual questions. That is the core subdomain's content and lives in
  the interview design, not in this interface spec.

> Blueprint: ../../../spec-driven-template/01-docs/04-technical-spec/frontend-component-spec.md
