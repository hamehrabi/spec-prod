# intent.md — Engineering Intent Document

> **Purpose (Ch. 4 §4.4):** Captures problem, users, goals, scope, and constraints.
> **When you use it:** Before writing requirements.
> **Sources:** Appendix A + Ch. 2 §2.7.

One page. Shorter than a PRD, simpler than a technical spec. It is the bridge between a
rough idea and formal requirements — and a strong input for AI, because you can hand the
agent this instead of a vague idea.

**Detail documents in this folder**

| Document | Covers |
|---|---|
| [`project-brief.md`](project-brief.md) | The raw idea, vision vs. implementation, problem-statement formula, and the recursion glossary. |
| [`constraints-and-non-goals.md`](constraints-and-non-goals.md) | Full constraint table and out-of-scope decisions. |
| [`subdomain-map.md`](subdomain-map.md) | Where effort goes — core / generic / supporting, with build-or-buy per area. |
| [`open-questions.md`](open-questions.md) | Unresolved questions and the ambiguity test. |

> **Beginner rule (Ch. 2):** do not ask an AI agent to build from a vague idea. First
> convert the idea into engineering intent.

---

## The document

| Field | Value |
|---|---|
| **Project name** | spec-driven-devkit |
| **Problem statement** | Developers building production-intended applications with an AI coding assistant have no predefined specification for the assistant to work inside, so they cannot tell what was built, whether it matches their intent, or what it changed unasked. This causes rework, unreviewable code, and projects that stall before production. The system should give a developer a ready-made spec-driven kit that turns a raw idea into a traceable specification workspace inside their own repository. |
| **Primary users** | Developers using Claude Code to build an application intended for production — solo or small team, working in their own repository. |
| **Secondary users** | The coding agent that reads the generated workspace and does the building. It is the main *reader* of the kit's output; if it cannot act on that output unaided, the kit has failed regardless of how the documents read to a human. |
| **Business goal** | The kit is adopted and *finished* — developers complete the intake rather than abandoning it partway, and the specifications they produce are still being used and updated after the first week of coding. |
| **User goal** | Go from a raw idea to a specification workspace the developer did not have to write by hand, and from then on be able to name the requirement behind every change the agent makes. |
| **Current pain points** | No structure exists at the point where it is cheapest to add one — the start. The developer must either invent a process, copy one from a book by hand, or proceed without one. Most proceed without one, discover the cost weeks later, and cannot retrofit intent onto code that already exists. |
| **Core capabilities** | Install into an existing repository with no service or account · run a structured intake that converts a raw idea into a filled specification workspace · supply the blueprint library that intake fills · produce a small entry-point file a fresh agent session reads first · govern the later coding sessions through task files with explicit file boundaries. |
| **Desired outcome** | A developer opens a new session in their project, gives one short instruction, and receives work that is in scope, cites its requirement, lists the files it touched, and comes with tests derived from acceptance criteria rather than from the code just written. |
| **Out of scope** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Success measures** | See table below. |
| **Constraints** | → [`constraints-and-non-goals.md`](constraints-and-non-goals.md) |
| **Risks** | See risk table below. |
| **Open questions** | → [`open-questions.md`](open-questions.md) |

### Success measures

Each measure is stated so that it can be observed rather than argued about. Where a target
number has not been set by the kit author, it is marked `[TODO]` rather than invented.

| # | Measure | How it is observed | Target |
|---|---|---|---|
| SM-1 | A developer completes the intake without hand-writing a specification file | The generated workspace exists and no file in it was created by the developer's own editor during intake | 100% of completed intakes |
| SM-2 | Intake completion rate — developers who start the interview and reach a finished workspace | Count of finished workspaces ÷ count of started intakes | `[TODO: target completion rate — what fraction of starts must finish for this to be worth shipping?]` |
| SM-3 | A fresh agent session becomes productive from one instruction | Open a new session, say "read the entry-point file, then implement the first task only", and the agent restates the task, names the requirement, and lists the files it will touch — before editing anything | Works on first attempt |
| SM-4 | Generated specifications survive contact with coding | The change log and spec-change log have entries dated after coding began — i.e. the specs were updated rather than abandoned | `[TODO: over what window — first week? first month?]` |
| SM-5 | Time from raw idea to finished workspace | Wall-clock duration of one intake session | `[TODO: target duration — the kit author has not set one]` |

### Risks

| # | Risk | Why it could sink the project | Early warning sign |
|---|---|---|---|
| RSK-1 | **The kit is experienced as paperwork.** | This is the primary risk and it is not technical. A developer who wanted to build an app is asked twenty-five questions and handed eighty-five files. If depth is not scaled to what actually matters, they abandon it at round three and never return. | Users stop mid-intake; users delete generated folders; users say "this is a lot" before they say anything else. |
| RSK-2 | **Generated specs are hollow.** | The workspace can be structurally complete and substantively empty — every heading present, every cell a placeholder. That is worse than no spec, because it looks answered. | High `[TODO]` density in finished workspaces; requirements that no two developers would build the same way. |
| RSK-3 | **Claude Code's plugin surface changes.** | The kit is coupled to a plugin format and to session-start file conventions owned by someone else. A change there can break installation for every user at once. | **Closed in Round 8 — a scheduled CI job installs the *published* plugin into a clean repository and fails if it breaks.** See `cicd-pipeline.md`. Until Round 8 this risk had no detector at all. |
| RSK-4 | **Recursion confusion.** | The kit specifies specification tooling. Requirements about "the spec" are ambiguous between the kit's own specs and the ones it generates, and an agent building the kit will conflate them. | Requirements that read correctly under both meanings. The glossary in `project-brief.md` is the mitigation; if it is not cited in requirements, it is not working. |
| RSK-5 | **The intake produces a workspace the agent then ignores.** | Governance that is not enforced is decoration. If nothing fails when the agent edits an out-of-scope file or skips a requirement, the workspace is a suggestion. | Agents completing tasks without citing requirement IDs; no check exists that would have caught it. |

---

## Users, goals, and constraints (Ch. 2 §2.4)

| Element | Question to answer | Your answer |
|---|---|---|
| Primary user | Who uses the system most often? | A developer running Claude Code inside their own project repository, at the moment they are starting something new. |
| Secondary user | Who reviews, manages, or supports the system? | The coding agent in later sessions — it consumes the generated workspace. Also the kit author, who maintains the blueprint library as the method evolves. |
| Goal | What should improve after the system exists? | The developer keeps authority over what gets built. The assistant becomes a fast executor of a specification the developer owns, instead of an unsupervised author of one. |
| Constraint | What must limit the design? | No server, no account, no network dependency. Runs from files in a repository. Must not impose a stack on the developer's project. Must not write their application code. |
| Risk | What could make the project fail? | Being felt as paperwork (RSK-1). Everything else is recoverable; that one is fatal because it ends adoption before value appears. |

> **Important distinction:** a goal is not a feature. "Generate a traceability matrix" is a
> feature. "Let a developer see what the agent has *not* covered" is a goal.

---

## Intent quality checklist (Appendix A)

- [x] The problem is stated without assuming a specific technical solution.
- [x] The intended users are named clearly.
- [x] The desired outcome can be measured or observed.
- [x] Out-of-scope items are written before implementation begins.
- [x] Open questions are captured instead of being hidden.

## Chapter checklist (Ch. 2)

| Before you move to requirements, confirm that you have: | Done |
|---|---|
| A clear problem statement. | [x] |
| Defined primary and secondary users. | [x] |
| Separated vision from implementation details. | [x] |
| Listed first-version capabilities. | [x] |
| Listed what is out of scope. | [ ] — full table lands in `constraints-and-non-goals.md` (Round 2) |
| Identified constraints and risks. | [x] risks here; constraints table in Round 2 |
| Defined simple success criteria. | [x] with three targets still `[TODO]` |

> **Self-check (Ch. 2):** if this document does not make writing requirements *easier*,
> it is too vague.

---

**Next:** [`requirements.md`](../02-requirements/requirements.md)

> Blueprint: ../../../spec-driven-template/01-docs/01-intent/intent.md
