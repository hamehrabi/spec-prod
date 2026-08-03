# Open Questions

> Source: Appendix A, Ch. 7 §7.11, Appendix C.
> Open questions must be **captured**, not hidden. An unresolved question that reaches an
> AI agent becomes a silent assumption — and silent assumptions become defects.

> **Technical spec guardrail (Appendix C):** open questions must not be treated as
> assumptions.

**Every `[TODO]` marker in this workspace has a row here.** That pairing is validation check
6 and FF-012 — the kit enforces it on its output, so this workspace holds itself to it.

---

## Open

| ID | Question | Why it matters | Owner | Must be answered before | Status |
|---|---|---|---|---|---|
| **Q-002** | **Conflict.** SM-2 (intake completion rate) requires knowing how many intakes start versus finish. CON-003 and CON-007 forbid telemetry. Drop SM-2, replace it, or qualify the privacy promise? | An unmeasurable success measure is not a success measure. The kit author's own definition of first-month success is invisible to the product | Kit author | **Release** | Open |
| **Q-007** | **Licence and attribution** for a blueprint library implementing a published method (*Spec-Driven AI Engineering*, plus four architecture texts). | **Release blocker.** Nothing in the build will ever fail because of it, which is exactly why it will be forgotten (RISK-013) | Kit author | **Release** | Open |
| Q-003 | Is the blueprint library really **supporting**, or is it core? | If core, its thin specs and acceptance-only tests are the wrong strategy, and effort is going to the wrong place | Kit author | After ten real intakes | Open |
| Q-006 | Does the kit's own governance apply to itself — is the kit used to maintain its own specs? | Its own first user would be the strongest possible test. Either way it should be a **decision**, not a drift | Kit author | Implementation | Open |
| Q-008 | How familiar is the developer with Claude Code plugin internals? | Decides whether TASK-001 needs a spike first. Fills the remaining half of CON-008 | Kit author | **TASK-001** | Open |
| Q-009 | The **intake command name** has not been chosen. | Referenced across the whole workspace; renaming it later is a major version (`api-specification.md` C1) | Kit author | **TASK-001** | Open |
| Q-010 | Which **CI provider**, at what monthly ceiling, with what alert threshold? | The only thing in the project that costs money. `runtime-and-scale.md` §4 leaves the number blank | Kit author | **TASK-002** | Open |
| Q-011 | Which **test runner and language** for the executable tests? | Nothing ships, so it must be something the kit author already has. Does not affect the plugin | Kit author | TASK-002 | Open |
| Q-012 | What **cadence** for the scheduled install test? | It is RISK-004's only detector. Weekly is likely enough at under 50 users | Kit author | TASK-002 | Open |
| Q-013 | Do **resume, contradiction detection, inference, and depth scaling** move from `Should` to `Must`? | Three of the four defend RSK-1, the primary risk, and inference is what reconciles depth with finishing. A v1 with all the Musts and none of these would be testable and would still fail | Kit author | **Design** | Open |
| Q-014 | What **threshold** for `todo_density`? | It is the RSK-2 detector and success metric 3. Without a number, "hollow" has no definition | Kit author | After ten real runs | Open |
| Q-015 | **Two Claude Code sessions in one repository** would both write to `spec/`. No lock, and ADR-004 forbids a state file. What happens? | Unknown and unmeasured. Found by the seven-questions worksheet, not by design review | Kit author | Before release | Open — **SC-008 / TASK-019 blocked** |
| Q-016 | Where do users **report problems**? | Every runbook entry assumes a report arrives somehow. During an incident is the wrong time to find out | Kit author | **Release** | Open |
| Q-017 | Is a **daily `git push`** realistic? | The stated RPO is one day. A weekly habit makes the real RPO a week — then the number is decoration | Kit author | Before release | Open |
| Q-018 | Has a **second person scored the risk grid**, cold? | A solo assessment structurally cannot produce a single-observer finding, which is the most valuable kind | Kit author | Before release | Open |
| Q-019 | Targets for **SM-4** (over what window do specs survive coding?) and **SM-5** (intake duration)? | Both are stated as measures with no number. SM-5 also has no baseline until the first full run | Kit author | Release | Open |
| Q-020 | Who is the **named decision owner** for product scope disputes? | Currently "kit author". With one person it is moot; it stops being moot the moment anyone else contributes | Kit author | Before a second contributor | Open |
| Q-021 | Which **two of the three platforms** are practical to smoke-test manually each release? | ETEST-012 automates all three; the manual install check cannot realistically cover all three every time | Kit author | Before release | Open |
| Q-022 | Has a **secret scan** been run over the kit's own git history? | The kit holds no secrets, but a stray committed file does not care about that | Kit author | **Release** | Open |
| Q-023 | Is the **per-file confirmation volume** (~90 prompts) actually tolerable on a full run? | RISK-007. Unmeasured. If it is not, confirmation fatigue becomes blanket approval — worse than a stated rule | Kit author | Before release | Open |

## Closed during intake

| ID | Question | Answer | Closed in |
|---|---|---|---|
| Q-001 | Is validation a step inside intake, or also a separate command? | **Inside intake only for v1.** A standalone command must handle workspaces it did not generate — materially harder (DD-010) | Round 3 |
| Q-004 | What happens when an existing root `CLAUDE.md` is found? | **Never touched.** The kit writes its entry point inside `spec/` and prints the exact line to add (DD-011) | Round 3 |
| Q-005 | Where does the generated workspace go, and is it configurable? | **Fixed `spec/` at the repository root**, not configurable — a setting is a branch (ADR-004) | Round 3 / 4 |
| — | Does RSK-3 have a detector? | **Yes, from Round 8** — a scheduled CI job installs the *published* plugin into a clean repo and alerts on failure | Round 8 |

**Status values:** Open · Answered · Deferred · Rejected

---

## The four that block release

Everything else can be carried. These cannot:

| ID | Why it blocks |
|---|---|
| **Q-007** | Legal, not technical. No build will ever fail because of it |
| **Q-002** | Shipping a stated success measure the product cannot observe is dishonest to the next reader |
| **Q-016** | Every runbook entry silently depends on a channel that does not exist |
| **Q-022** | Cheap, mechanical, and irreversible if missed |

---

## The ambiguity test (Ch. 2 §2.6)

Before moving forward, ask: *Could two competent developers build two different things
from this instruction?* If yes, it belongs in this table.

| Ambiguous statement | Why it is dangerous | Clarified version |
|---|---|---|
| "The plugin generates a spec workspace." | Does not say where, from what input, or what happens when the target exists. One developer builds an interview, another builds a scaffolding command. | "A slash command runs an interactive interview of up to eight rounds and writes a filled workspace into `spec/`, writing files after each round rather than at the end." |
| "The kit helps developers control what the AI builds." | *Control* is not testable. Documentation the agent may read, or boundaries it cannot cross? | "Every generated task file names the files the agent may change and the files it must not; the agent restates the task and names its requirement before editing anything." |
| "Specs should be thorough." | Thorough for a core subdomain and for a supporting one are different documents. Treating them alike is the failure this method exists to avoid. | "Spec depth is set per area by `subdomain-map.md`: core gets the full chain, supporting one page, generic an integration contract only." |
| "It should work offline." | Does not separate the kit's behaviour from Claude Code's, which plainly needs a network. | "The kit itself makes no network calls; it adds no network dependency beyond what Claude Code already requires." |
| "Don't overwrite the user's files." | Does not define *overwrite*, *the user's files*, or what to do instead. | "The kit creates files only under `spec/`. Any write that would replace an existing file stops and asks, naming the file and showing what would change." |
| "Express mode." | Could be a second command, a second flow, or an argument. Two of the three spend a driver. | "Depth is a parameter on the single flow. Reduce depth **within** a stage; never skip a stage." |

---

## How this table is used

An entry here is a **blocker with a name**, not a note. Before the first coding task, every
question marked `Must be answered before: Design` or naming a task must be closed —
**Q-008, Q-009, Q-013** for TASK-001, and **Q-010, Q-011, Q-012** for TASK-002.

Q-002 is different in kind from the rest: it is a contradiction between two documents that
are both currently authoritative, and closing it means changing one of them.

> Blueprint: ../../../spec-driven-template/01-docs/01-intent/open-questions.md
