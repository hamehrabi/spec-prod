# product-spec.md — Product Requirements Document (PRD)

> **Purpose (Ch. 4 §4.4):** Explains user flows, feature scope, and user experience.
> **When you use it:** Before design and implementation.
> **Sources:** Ch. 6, Appendix B.

> **Beginner rule (Ch. 6):** do not describe database tables, frameworks, endpoints, or
> file structure here. Those decisions belong in [`technical-spec.md`](../04-technical-spec/technical-spec.md).

**Product name:** spec-driven-devkit
**Version:** PRD v1.0
**Owner:** Kit author — `[TODO: name the person who decides product scope disputes]`
**Date:** 2026-08-03

---

## 1. Product summary

A Claude Code plugin that installs a spec-driven development kit into a developer's own
repository. Running one command starts a guided interview; answering it produces a complete,
traceable specification workspace in a `spec/` folder — intent, requirements, architecture
decisions, tests, tasks, and the contract a coding agent works under. From then on, the
developer instructs a coding agent against specifications they set in advance rather than
hoping the output matches what they meant. The kit produces specifications and never writes
the developer's application code.

## 2. Problem statement

Developers building production-intended applications with an AI coding assistant have no
predefined specification for the assistant to work inside. The assistant produces plausible
code quickly, but there is no standard to check it against, so the developer cannot
confidently accept or reject what it built, and cannot tell what it changed without being
asked. The cost is rework, code nobody reviews with confidence, and projects that stall
before reaching production. It matters most at the start, which is exactly when adding
structure is cheapest and when almost nobody does it.

## 3. Product goal

> **This product helps a developer using an AI coding assistant turn a raw idea into a
> traceable specification their assistant must build to — in one session, inside their own
> repository, without writing a specification file by hand.**

| Weak goal | Stronger goal |
|---|---|
| Build a spec template. | Help a developer turn a raw idea into a specification a coding agent can be held to. |
| Make AI coding more reliable. | Give the developer a written standard, set before any code exists, that every later change must trace back to. |

## 4. Success metrics

| # | Metric | Type |
|---|---|---|
| 1 | Developers who start the interview reach a finished workspace, rather than abandoning it partway. | Measurable user result — **and currently unmeasurable, see below** |
| 2 | A finished workspace has **zero** dangling identifiers, **zero** unresolved blueprint links, and **zero** `[TODO]` markers without a matching open question. | Quality signal — computed locally by the validation step |
| 3 | The proportion of `[TODO]` markers per finished workspace stays low. A high proportion means the interview is producing structure without substance. | Failure / risk signal — the detector for RSK-2 |

> **Metric 1 has no observation method.** Measuring starts-versus-finishes requires
> telemetry, and CON-007 and BR-014 forbid it absolutely. This is logged as **Q-002** and it
> is a real hole, not a formality: the kit author's stated first-month definition of success
> is the one metric the product is built to be unable to see. The options are to observe it
> by asking users directly, to replace it with something local, or to drop it. It has not
> been decided, and it is not silently assumed away here.

## 5. Goals / Non-goals

**Goals**
- A developer finishes the interview instead of abandoning it — the primary success signal.
- The generated workspace is deep enough to use as-is, with no hand-written spec files.
- A fresh agent session becomes productive from one short instruction.
- Nothing in the developer's existing repository is modified without them seeing it first.
- The interview runs to a fixed, visible end — never open-ended.

**Non-goals** → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md)

## 6. Primary users (personas)

A persona reminds you that software is built for people with goals, frustrations, limits,
and responsibilities — not for an abstract crowd. The third persona is not a person, and is
included anyway, because it is the main *reader* of what this product makes.

**Persona 1 — The developer starting something new**
- **Role:** Solo developer or small-team lead, opening a fresh or near-fresh repository.
- **Goal:** Get from an idea in their head to a project an agent can build correctly, without spending the first two days writing documents.
- **Frustration:** They know unstructured AI-assisted building goes wrong, and they know writing a full spec by hand is what they will not actually do. Both options are bad, so they proceed without one.
- **Main use cases:** Install the kit · run the interview end to end · hand off to a build session · come back and resume when interrupted.
- **Success condition:** They finish the interview in one sitting and start building the same day, from specifications they did not have to author.

**Persona 2 — The developer with a project already underway**
- **Role:** Developer several weeks into an AI-assisted build that has started to sprawl.
- **Goal:** Impose structure on work that already exists, without the kit trampling their repository.
- **Frustration:** Every tool that wants to "set up your project" wants to rewrite their files. They have a `CLAUDE.md` already, and it took them a while to get right.
- **Main use cases:** Install into a repository with existing files and existing agent instructions · run the interview about a partly-built product · get a `spec/` folder that sits alongside their code rather than replacing anything.
- **Success condition:** Nothing they wrote was touched, and they were shown exactly what to add and where — as a suggestion they could decline.

**Persona 3 — The build agent** *(not a person; the main consumer of the output)*
- **Role:** A Claude Code session opened later, in a fresh context, with no memory of the interview.
- **Goal:** Understand a ~90-file workspace well enough to do one task correctly, without reading all of it.
- **Frustration:** Ambiguous requirements that read fine but permit two different implementations. Tasks with no stated file boundary, where any edit might be out of scope.
- **Main use cases:** Read the entry-point map · read only the specs its task names · restate the task and name its requirement before editing · report what it touched.
- **Success condition:** It does the task, cites `REQ-F-###`, changes only listed files, and flags anything it touched that the task did not list.

**Persona 4 — The kit author**
- **Role:** Maintains the blueprint library and the interview.
- **Goal:** Improve the questions as real intakes reveal which ones were wrong, without breaking workspaces already generated in other people's repositories.
- **Frustration:** A blueprint rename silently breaks the back-link at the foot of every file in every workspace ever produced.
- **Main use cases:** Edit a blueprint without touching interview logic · add a question without touching a blueprint · release a version.
- **Success condition:** Both edits are possible independently — which is exactly the observable measure of the Simplicity driver.

## 7. Feature scope

**In scope for this version**

| Feature | In-scope behavior | Why it belongs now |
|---|---|---|
| Plugin installation | The kit installs through Claude Code's own plugin mechanism. No script, no account, no key, no download at run time. | Anything else is a barrier before the product has shown value — and CON-004 rules out an install script outright. |
| Guided intake interview | Up to eight rounds of at most four grouped questions, recommended option first, free text accepted anywhere, a hard stop at eight. | It **is** the product and the single core subdomain. |
| Depth parameter (default / express) | One flow, one command; depth is an argument that reduces the questions asked per round and the target depth, never the eight-round count. | The kit author asked for express mode; Simplicity requires it be a parameter rather than a second path. |
| Workspace generation into `spec/` | Files written after each round into a fixed folder at the repository root, each matching its blueprint's structure and linking back to it. | Writing as you go is what makes an interrupted intake still worth something. |
| Depth scaling by subdomain | Core areas get the full chain; supporting areas get one page; generic areas get an integration contract. | Uniform depth is the specific failure that makes the method feel like paperwork (RSK-1). |
| **Stage acceptance gate** | After each round's files are written, the developer is shown the decisions recorded, the inferences drawn, and the `[TODO]`s created — and must **accept, revise, or stop** before the next round. | RSK-2 previously had no detector *inside a run*. A developer could answer eight rounds and receive ninety files they had never looked at. |
| **Blueprint integrity and coverage** | The library ships with a checksum manifest, is verified before the first write, and drives what each stage must produce. Every blueprint is filled or recorded as skipped with a reason. | An altered blueprint produces a plausible, subtly wrong specification. And nothing previously checked that every template was *used*. |
| Contradiction detection | Two answers that cannot both be true stop the interview and are quoted back. | The developer owns the contradiction. Resolving it silently hands a product decision to the agent. |
| Inference instead of asking | A question whose answer follows from an earlier one is not asked; the inference is stated. | The only way to reconcile "finish the intake" with "deep documents" without a longer interview. |
| Resume | An existing workspace is read, completed stages reported, and the interview continues from the first incomplete one. | An intake that must be finished in one sitting will be abandoned in the middle. |
| Validation before success | Identifier resolution, blueprint links, `[TODO]`/open-question pairing, blank rows, deny tests, fitness functions. | Reporting success on unverified work is how a hollow workspace ships. |
| Hand-off report | File count, remaining `[TODO]`s, blocking open questions, assumptions made, and the one instruction to start building. | Without it the developer has ~90 files and no idea what to do next. |

> **Scope control habit (Ch. 6 §6.4):** for every feature you include, write one sentence
> explaining why it belongs in this version. If you cannot explain the value, move it to
> out of scope.

## 8. Out of scope

**Not included in this version**

| Feature | Reason | Future status |
|---|---|---|
| Writing the developer's application code | The defining boundary of the product. | Rejected permanently |
| Support for other AI assistants | Doubles the surface before the first host is proven. The generated Markdown is portable already; only the interview mechanism is host-specific. | Deferred |
| Non-interactive intake from a config file | The interview is the core subdomain; a config file removes the part carrying the value. | Deferred |
| Automatic spec-drift detection from code | Requires understanding an arbitrary codebase, not filling a template. Out of reach in four weeks. | Deferred |
| Hosted or team component | CON-003 makes it impossible, not merely unwanted. | Rejected for v1 |
| Telemetry or usage analytics | CON-007. Costs the product its metric #1 — see Q-002. | Rejected for v1 |
| A separate re-runnable validation command | Validation is a step inside intake for v1 (Round 3). | Deferred |
| Rewriting the blueprint library | The ~90 templates exist; v1 packages and versions them. | Deferred |

Full non-goals list → [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md)

## 9. User stories

Format: `US-###: As a [specific role], I want [one clear capability], so that [benefit].`

| ID | Story | Supports | Produces task | Produces test |
|---|---|---|---|---|
| US-001 | As a developer, I want to install the kit with the plugin mechanism I already use, so that nothing stands between deciding to try it and using it. | REQ-F-001 | → Round 7 | ATEST-001 |
| US-002 | As a developer, I want to start the interview with one command, so that there is no setup step to get wrong. | REQ-F-002 | → Round 7 | ATEST-002 |
| US-003 | As a developer, I want to be told up front how many rounds there are, so that I can decide whether to start now or later. | REQ-F-004 | → Round 7 | ATEST-003 |
| US-004 | As a developer who does not know the answer, I want a recommended option with a reason, so that I can proceed without guessing blindly. | REQ-F-006 | → Round 7 | ATEST-004 |
| US-005 | As a developer whose situation is not on the list, I want to type my own answer, so that I am not forced into a wrong option. | REQ-F-007 | → Round 7 | ATEST-005 |
| US-006 | As a developer, I want the interview not to ask me things it could work out, so that it stays short enough to finish. | REQ-F-009 | → Round 7 | ATEST-006 |
| US-007 | As a developer who has answered inconsistently, I want to be shown both statements, so that I decide which one holds rather than the agent deciding for me. | REQ-F-010 | → Round 7 | ATEST-007 |
| US-008 | As a developer in a hurry, I want an express depth, so that a small project is not made to carry full depth. | REQ-F-033 | → Round 7 | ATEST-008 |
| US-009 | As a developer, I want files written after every round, so that stopping halfway still leaves me something. | REQ-F-015 | → Round 7 | ATEST-009 |
| US-010 | As a developer who stopped yesterday, I want to resume where I left off, so that I never re-answer a round I already finished. | REQ-F-028 | → Round 7 | ATEST-010 |
| US-011 | As a developer with an existing `CLAUDE.md`, I want my file left alone, so that installing the kit cannot cost me work I already did. | REQ-F-026 | → Round 7 | ATEST-011 |
| US-012 | As a developer, I want to approve each file before it is written, so that I can see what is being added to my repository. | REQ-F-025 | → Round 7 | ATEST-012 |
| US-013 | As a developer, I want a declined write not to fail the run, so that saying no to one file does not cost me the session. | REQ-R-004 | → Round 7 | ATEST-013 |
| US-014 | As a developer, I want unknown facts marked as gaps rather than filled with guesses, so that I can tell what was decided from what was invented. | REQ-F-019 | → Round 7 | ATEST-014 |
| US-015 | As a developer, I want the workspace checked before I am told it is done, so that "complete" means something. | REQ-F-029 | → Round 7 | ATEST-015 |
| US-016 | As a developer, I want a closing report naming what is unresolved, so that I know what to answer before coding starts. | REQ-F-030 | → Round 7 | ATEST-016 |
| US-017 | As a build agent, I want one small entry-point file that maps the workspace, so that I can start work without reading ninety files. | REQ-F-020 | → Round 7 | ETEST-001 |
| US-018 | As a build agent, I want every referenced identifier to resolve, so that I can find the requirement behind the task I was given. | REQ-F-018 | → Round 7 | ETEST-002 |
| US-019 | As a build agent, I want my task to name the files I may change and the files I must not, so that I cannot cause damage while believing I am in scope. | REQ-R-005 | → Round 7 | ETEST-003 |
| US-020 | As the kit author, I want to edit a blueprint without touching interview logic, so that improving a template is not a code change. | REQ-NF-005 | → Round 7 | UTEST-001 |

> Task IDs resolve in Round 7. The blanks are deliberate and visible — the traceability
> matrix is where they are closed, not hidden.

## 10. User flows

A good flow includes the start point, user action, system response, success path, and
**at least one failure path**. Failure paths matter because real users make mistakes, lose
connection, forget fields, or lack permission.

**Flow 1 — Install and start**
- **Start:** Developer has Claude Code and a repository, and has decided to try the kit.
- **Action:** Installs the plugin, runs the intake command.
- **Input:** None.
- **System response:** States what will happen and roughly how many rounds; asks Round 1.
- **Success path:** The interview begins with no configuration step in between.
- **Failure path — plugin not fully installed:** The command is unavailable. The developer sees the host's own "unknown command" response, not a partial run. Nothing is written.
- **Failure path — repository is not writable:** Intake stops before the first question with a message naming the path it could not write, rather than failing on round one after the developer has answered.

**Flow 2 — A full interview in a clean repository**
- **Start:** Fresh repository, no `spec/` folder.
- **Action:** Developer answers eight rounds.
- **Input:** Multiple-choice selections plus at least one free-text problem statement.
- **System response:** After each round, writes that round's files and reports `Round N — wrote X files`.
- **Success path:** Validation passes, the entry-point file is written last, and the closing report names the file count, remaining `[TODO]`s, blocking questions, and the hand-off instruction.
- **Failure path — validation fails:** Intake reports which check failed and what is unresolved. It does **not** claim success. The workspace is left in place and resumable.
- **Failure path — a blueprint is missing from the plugin:** Intake stops at that file, names the missing blueprint, and leaves prior rounds intact. It does not improvise a structure.

**Flow 3 — Resume after interruption**
- **Start:** A `spec/` folder exists, complete through round four.
- **Action:** Developer runs the intake command again.
- **Input:** None initially.
- **System response:** Reads the workspace, reports rounds one to four complete, asks round five.
- **Success path:** The interview continues; no completed round is re-asked.
- **Failure path — the workspace was hand-edited into an inconsistent state:** Intake reports what it found and what it cannot reconcile, and asks — rather than overwriting the developer's edits or silently re-deriving them.
- **Failure path — a stage is half-written:** The incomplete stage is identified and redone from its start. Files it already wrote are replaced, not appended to.

**Flow 4 — A repository that already has `CLAUDE.md`**
- **Start:** Existing repository with a root `CLAUDE.md` the developer has tuned.
- **Action:** Developer runs the intake to completion.
- **Input:** Their answers.
- **System response:** Writes the workspace's entry point **inside** `spec/`, and prints the exact line the developer may add to their own file.
- **Success path:** Their `CLAUDE.md` is byte-for-byte unchanged, and they have a one-line change they can make themselves.
- **Failure path — the developer never adds the line:** The kit does not add it for them, and does not nag. The workspace still works when an agent is pointed at it directly, and the closing report says so.

**Flow 5 — Declining a write**
- **Start:** Mid-round, a file write is proposed.
- **Action:** Developer declines it.
- **Input:** A refusal at the host's permission prompt.
- **System response:** Notes the file was not written and continues the round.
- **Success path:** The run completes; the closing report lists the declined file as a gap, and resume will offer it again.
- **Failure path — a later file depends on the declined one:** The dependency is reported rather than silently working around it, and the affected content is marked `[TODO]` with the reason.

**Flow 6 — Contradictory answers**
- **Start:** Round 4; the developer's answers cannot both hold.
- **Action:** They submit the second of the two.
- **Input:** The conflicting selection.
- **System response:** Stops, quotes **both** statements verbatim, and asks which holds.
- **Success path:** The developer resolves it; the resolution and the rejected alternative are recorded.
- **Failure path — the developer declines to choose:** Both are recorded as an open question with a decision owner, and intake proceeds on a stated assumption rather than a hidden one.

**Flow 7 — Express depth**
- **Start:** Developer runs intake asking for express depth.
- **Action:** Answers the same eight rounds, with at most two questions in each.
- **Input:** Fewer questions, same question flow.
- **System response:** Produces a thinner workspace, with the same structural guarantees.
- **Success path:** Identifiers resolve, blueprint links resolve, `[TODO]`s are paired with open questions — the workspace is smaller, not weaker.
- **Failure path — express depth would drop a stage entirely:** It does not. Depth within a stage is reduced; a stage is never skipped. The closing report names which stages were written thin.

**Flow 9 — The acceptance gate**
- **Start:** Round *N*'s files have just been written.
- **Action:** Developer reads the review.
- **Input:** One of three choices.
- **System response:** Shows the files written, the **decisions recorded**, every inference drawn instead of asking, and every `[TODO]` created — then waits.
- **Success path — accept:** A dated acceptance row is appended to the generated change-control artifact; round *N+1* begins.
- **Success path — revise:** That round's questions are re-asked and its files rewritten in place. No other round is touched. The gate is shown again.
- **Success path — stop:** The session ends. Every accepted round's files remain. Re-running resumes at the unaccepted round.
- **Failure path — no answer:** It **keeps waiting**. It never proceeds on silence.
- **Failure path — the round recorded no decisions:** The review says so plainly — *"Round N produced files but recorded no decisions"* — rather than presenting an empty review as a clean bill of health.
- **Failure path — the session dies between writing and accepting:** Resume re-presents **that gate**. It does not re-ask the round's questions and does not advance.

**Flow 10 — A tampered or incomplete blueprint library**
- **Start:** Developer runs the intake.
- **Action:** None yet — this happens before question one.
- **System response:** Verifies every blueprint against the integrity manifest.
- **Success path:** All checksums match; the interview begins.
- **Failure path — altered, missing, or unlisted blueprint:** Stops **before writing anything**, names the file and which of the three problems it is. It does not proceed on a near match, and it does not regenerate the manifest to make the check pass.
- **Failure path — a blueprint no round reaches:** Detected at validation as a **coverage failure**, naming the path. It is not silently skipped, and a skip without a reason is not accepted.

**Flow 8 — Hand-off to a build session**
- **Start:** Intake is complete.
- **Action:** Developer opens a fresh session and gives the printed instruction.
- **Input:** One sentence.
- **System response:** The build agent reads the entry point, reads only the specs its task names, restates the task and names its requirement, and waits.
- **Success path:** It edits only listed files and reports what it touched.
- **Failure path — the task needs a file it was not allowed:** It stops and says so before editing, rather than deciding the boundary was probably fine.

## 11. Feature priorities

| Priority | Meaning | Features |
|---|---|---|
| Must-have | The first useful version fails without it. | Plugin installation · guided interview (rounds, recommended-first, free text, eight-round stop) · workspace generation into `spec/` after each round · blueprint structure and back-links · stable identifiers · `[TODO]` instead of invention · never write outside `spec/` unasked · existing `CLAUDE.md` untouched · validation before success · closing report and hand-off instruction |
| Should-have | Important, but the product can still be tested without it. | Resume from a partial workspace · contradiction detection · inference instead of asking · depth scaling by subdomain · express depth |
| Could-have | Useful improvement if time allows. | Round progress indicator (REQ-F-032) · richer hand-off summarising which stages were written thin |
| Later / Won't | Not needed for the first version. | Everything in §8 |

> **Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
> main product idea? If yes, it may not be a must-have for the first version.

**A caution on that table.** Resume, contradiction detection, inference, and depth scaling
are marked *Should* by the strict reading of the prioritization test — the product is
demonstrable without them. But three of the four are the mechanisms that defend against
RSK-1, the primary risk, and inference is the only thing reconciling "finish the interview"
with "deep documents". A v1 that ships all the *Musts* and none of these would be
testable and would still fail. `[TODO: kit author to confirm whether these four move to
Must, given the two-to-four-week budget in CON-002.]`

## 12. Dependencies

| Dependency | Type | Note |
|---|---|---|
| Claude Code | Host platform | The kit is a plugin; the host supplies the command mechanism, the file tools, and the per-file permission prompt that REQ-F-025 relies on. |
| Claude Code plugin format | Platform contract | Owned by someone else and able to change. This is RSK-3. **Detector added in Round 8:** a scheduled CI job installs the published plugin into a clean repository and alerts on failure ([`cicd-pipeline.md`](../../07-ops/01-deployment/cicd-pipeline.md)). |
| The blueprint library | Internal asset | Exists already in `spec-driven-template/`. Shipped inside the plugin (CON-003). |
| The source method | Attribution | The blueprints implement a published method; the licence position is **Q-007** and is unresolved. |
| External services | — | **None.** No email, no storage, no payments, no model API beyond the host's own. |

## 13. Risks

| Risk | Type | Mitigation |
|---|---|---|
| RSK-1 — The kit is experienced as paperwork and abandoned mid-interview. | Product | Hard eight-round stop; write after every round so stopping still yields value; resume so stopping is not final; depth scaled by subdomain so supporting areas stay thin; express depth. |
| RSK-2 — Generated workspaces are structurally complete and substantively hollow. | Product | `[TODO]` instead of invention (BR-003); validation before success (BR-009); success metric 3 monitors `[TODO]` density as the detector. |
| RSK-3 — The Claude Code plugin surface changes and breaks installation for everyone at once. | Technical | Depend only on documented plugin mechanisms; keep the generated output plain Markdown so a workspace survives even if the intake mechanism breaks. **Detector: the scheduled CI install test** (Round 8) — it tests the *published* artifact, because a branch that passes CI proves nothing about what users have installed. |
| RSK-4 — Recursion confusion between the kit and what the kit generates. | Product | The glossary in [`project-brief.md`](../01-intent/project-brief.md); the convention that "the system" means the kit and output is always "the generated workspace". |
| RSK-5 — The generated workspace is ignored by the build agent, making governance decorative. | Product | Deny tests for every permission rule; fitness functions that fail a build for every driving characteristic; task files that state allowed and forbidden files. |
| RSK-6 — Per-file confirmation across ~90 writes becomes confirmation fatigue, and the developer approves everything without reading. | Product | New, from Round 3. The kit never requests blanket permission, and never builds its own bypass. Whether the host's prompt volume is tolerable is a real open question — `[TODO: measure on a full run before release]`. |
| RSK-7 — Metric 1, the kit author's own definition of first-month success, cannot be observed under CON-007. | Product | Unmitigated. Logged as Q-002 and surfaced in §4 rather than quietly dropped. |

## 14. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

## 15. Links to requirements

- Supports REQ-F-001 through REQ-F-034 (all functional requirements have at least one story or flow)
- Supports REQ-NF-003 (Flow 3, Flow 5), REQ-NF-005 (Persona 4), REQ-NF-007 (§8, §12)
- Supports REQ-R-004 (US-013, Flow 5), REQ-R-005 (US-019, Flow 8)
- Supports BR-003 (US-014), BR-008 (Persona 2, Flow 4), BR-009 (US-015), BR-012 (US-007, Flow 6)

---

## PRD quality checklist (Ch. 6)

| Check | Question | ✔ |
|---|---|---|
| Clear product goal | Can you explain the product outcome in one sentence? | [x] |
| Known users | Have you identified the primary users and their goals? | [x] — four personas, one of them not a person |
| Useful success metrics | Can you tell whether the product is working for users? | [ ] — **metric 1 has no observation method under CON-007. Q-002.** |
| Controlled scope | Does the PRD clearly state what is included now? | [x] |
| Protected focus | Does it clearly state what is out of scope? | [x] |
| User stories | Are the most important features written from the user point of view? | [x] — 20 stories, including the build agent's |
| User flows | Can you follow the user path from start to success or failure? | [x] — 8 flows, each with at least one failure path |
| Ready for technical spec | Can a technical designer use this without guessing the product direction? | [x] |

---

**Next:** [`technical-spec.md`](../04-technical-spec/technical-spec.md)

> Blueprint: ../../../spec-driven-template/01-docs/03-product-spec/product-spec.md
