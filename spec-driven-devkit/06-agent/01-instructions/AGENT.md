# AGENT INSTRUCTIONS — spec-driven-devkit (AGENT v1.0)

> Source: Ch. 4 §4.7 + Ch. 11 §11.8 + Appendix H.
> Keep this **short enough to reuse often**. If it becomes too long, the assistant may
> ignore parts of it.

---

## Role

You are assisting with a **spec-driven software project**. Do not invent features. Follow
the approved requirements, specifications, tasks, and tests.

## Project goal

Build a Claude Code plugin that installs a spec-driven development kit into a developer's own
repository. Running one command starts a guided interview; answering it produces a complete,
traceable specification workspace in a `spec/` folder. **The kit produces specifications and
never writes the developer's application code.**

## Current stage

**Task planning complete. Implementation not started.** Next task: `TASK-001`.

## ⚠ The one distinction that everything depends on

This project is a tool that produces specifications, and this workspace is a specification
*of that tool*. Two different things share almost identical vocabulary.

| Term | Means |
|---|---|
| **the kit** | The product you are building. |
| **the developer** | The kit's user, who installs it into their own project. |
| **the generated workspace** | What the kit produces inside the developer's repository. |
| **`spec/` (in this repo)** | **This** specification. **You never edit it.** |
| **`spec/` (in a developer's repo)** | What the kit creates for them. |

Full glossary: [`project-brief.md`](../../01-docs/01-intent/project-brief.md).

---

## Source-of-truth order

When information conflicts, the higher item wins.

1. `01-docs/01-intent/intent.md`
2. `01-docs/03-product-spec/product-spec.md`
3. `01-docs/04-technical-spec/technical-spec.md` (+ `01-docs/05-architecture/architecture-decisions/`)
4. `01-docs/06-api-and-data-design/` — contracts and data model
5. `01-docs/07-security-and-reliability/` — security and reliability specifications
6. Current task file in `02-tasks/02-task-files/`
7. Existing code and tests

## Use these folders

| Folder | Contains |
|---|---|
| `01-docs/01-intent/` | Why this exists, constraints, non-goals, open questions, subdomain map |
| `01-docs/02-…09-` | Requirements, product spec, technical spec, ADRs, contracts, security, traceability |
| `02-tasks/` | Bounded work items — **read your task file before anything else** |
| `03-tests/01-…04-` | Test plans and specifications |
| `03-tests/05-executable/` | Executable tests (kit repo only — **never shipped**) |
| `04-src/` | The plugin itself |
| `05-review/` | Review checklists and logs |
| `06-agent/` | These rules, the context pack, prompts, handoffs |
| `07-ops/` | Release, maintenance, backup, drift |

---

## Rules

1. **Follow the current task only.**
2. **Do not add unrequested features.**
3. **Do not change unrelated files.** Every task names its allowed files **and** its do-not-change list.
4. **Ask before making assumptions** that affect scope, security, data, or architecture.
5. **Explain important changes in simple language.**
6. **Connect every change to a requirement and a test.**
7. Do not remove or weaken tests to make something pass.
8. Do not introduce a new dependency without approval — see ADR-002, which forbids **all** of them.
9. Do not expose secrets, tokens, or private data.
10. Do not rename anything public unless the task requires it.
11. If a request has no matching spec entry, **pause and ask**.
12. **Never edit `spec/` in this repository.** It is the specification, not the product.

## Workflow rule

Before changing anything: **restate the task, list the files you plan to touch, and name
every assumption. Then wait.**

| Stage | You must |
|---|---|
| Prepare | Restate the task, list relevant files, identify assumptions. **Wait.** |
| Implement | Change only approved files; keep the solution small. |
| Report | Summarise changes, tests, risks, unresolved questions, and any file you touched that the task did not list. |

## Testing rule

Tests come from **acceptance criteria**, never from the code you just wrote. **A denial test
must be seen failing before it is trusted** — twelve of them guard the only boundary this
product has.

---

## Output format

Every completion must include: **summary of changes · files affected and why · requirement
covered (REQ-### / TASK-###) · tests added or updated · risks or assumptions · questions
needing a human decision · any file changed that the task did not list.**

---

## Not allowed (Appendix H)

- Do not invent requirements, metrics, or compliance obligations.
- Do not remove tests to make something pass.
- Do not introduce dependencies.
- Do not expose secrets or private data.
- Do not expand scope without approval.

---

## Project-specific rules from ADRs

**These are copied verbatim from
[`adr-index.md`](../../01-docs/05-architecture/architecture-decisions/adr-index.md).** A rule
that is there and not here governs nothing — you read this file, not that one.

| ADR | Rule the agent must follow |
|---|---|
| **ADR-001** | Never place question text inside a blueprint. Never place blueprint structure inside the intake instruction set. Never place orchestration rules inside the question set. The blueprint library is **read-only at run time**. |
| **ADR-002** | Never add a script, CLI, templating engine, package manifest, lockfile, or dependency of any kind. The kit ships Markdown and a plugin manifest, nothing else. **If a task appears to require executable code, the task is wrong — stop and ask.** |
| **ADR-003** | Never author a generated file from memory of a blueprint. Copy the blueprint first. Then delete the `# WORKED EXAMPLE` section and the generic prompt boxes. Then replace **every** placeholder, empty table row, and instructional italic — with real content or with `[TODO: <the exact question>]`. Never leave one because it looked unimportant. |
| **ADR-004** | Never create a state, progress, session, cache, or answer file anywhere. Determine how far intake has got by **reading which artifacts exist**. Never write outside `spec/` without stopping to ask, naming the file and showing what would change. |
| **ADR-005** | Write the plugin version into the generated entry-point file. Do **not** write a generation timestamp. Never invent a version — read it from the manifest, or write `[TODO: plugin version could not be determined]`. |
| **ADR-006** | Record stage acceptance as a **dated row in the generated change-control artifact**. **Never create an acceptance, progress, or approval file.** Read those rows to know which stages are accepted. **Never proceed past an acceptance gate on silence**, and never make the gate skippable — at any depth, on any request. |

### Cross-cutting rules

| Rule | From |
|---|---|
| **One** intake command, **one** end-to-end path. Depth is an argument, never a branch. | ADR-001 + Simplicity driver |
| Tests assert **structure, never generated prose**. Nothing here can use an equality assertion on generated text. | ADR-002 |
| "Fails the build" means the **kit author's CI**, not the developer's machine. | ADR-002 + ADR-004 |
| A gap is always **named**. Missing blueprint, unreadable version, unanswerable question — each becomes a stated gap, never an improvisation. | ADR-002/003/005 |
| **The boundary layer (TASK-004) is built before the first write (TASK-006).** | `task-index.md` |

## The three temptations, pre-rejected

Each will look like a small, helpful improvement. Each supersedes an accepted ADR.

| You may be tempted to | Do not |
|---|---|
| Add `.intake-state.json` so resume is simpler | **ADR-004.** A second source of truth that starts disagreeing with the specs immediately. |
| Add a small script for the twelve validation checks | **ADR-002.** A check that silently skips where the runtime is absent builds BR-009's violation into the architecture. |
| Add a templating engine for the fill step | **`subdomain-map.md`.** Blueprints are Markdown; substitution is a fill, not a render. This is the predicted over-engineering for this project. |
| Add `.accepted.json` so the gate is simpler | **ADR-006.** Acceptance is a dated row in a generated artifact. A state file is exactly what ADR-004 forbids, and the gate is not a good enough reason to reopen it. |
| Regenerate the blueprint manifest to make an integrity check pass | **TASK-021.** A control that rewrites itself to pass is not a control. Stop and report the mismatch. |
| Hardcode the list of files a stage writes | **REQ-F-043.** The blueprint library is the authority. A hardcoded list means adding a blueprint silently changes nothing. |

## Lessons from past mistakes

*Add a row whenever a defect reveals a repeatable mistake (see
[`debugging-specification.md`](../../05-review/04-debugging/debugging-specification.md)).*

| Date | Mistake | Rule added |
|---|---|---|
| 2026-08-03 | **BUG-001.** FF-001 states two independent counts — user-invocable commands, and end-to-end paths. The check computed both from one filtered list, so a filter that was right for the first count silently narrowed the second. | When a rule names **two** thresholds, compute each over its own set. Write the case that breaks only the second one — if every test you can think of trips both, you have not tested the second. |
| 2026-08-03 | Two tasks instructed the agent to record a decision in `decisions.md` and update `traceability.md`, while the same tasks' do-not-change lists forbade editing `spec/`. The instinct is to pick the reading that lets the task finish. | **A task that contradicts itself is a stop-and-ask, not a judgement call.** Do the part that is unambiguous, report the conflict, and let the kit author resolve it. A spec change is theirs to authorise — an agent editing `spec/` to complete its own task is the exact failure this product exists to prevent. |
| 2026-08-03 | **BUG-002.** FF-002 blocked a commit, said "split the commit", and blocked the split result identically — because it measured a branch where the rule says *commit*. Its own remedy did not work. | **When a check tells the user what to do, test that doing it works.** A remedy message is a claim, and an untested one is worse than silence: it fails you, instructs you, and fails you again. Whenever a rule names a unit — a commit, a file, a round — assert on that unit, not on a convenient aggregate of it. |
| 2026-08-03 | TEST-017 contained the assertion *"a range spanning both is coupled again, and must fail"*. It had been written to match what the check did, not what the rule said, so it passed while the defect was live and had to be **deleted** rather than adjusted. | **A test written after the code, from the code, tests nothing.** If every case you can think of trips the same branch, you have tested one branch. Derive cases from the rule's wording — here, the word *commit* — and write the one that passes for the right reason. |
| 2026-08-03 | The specification placed the plugin payload in `04-src/` in two files and outside `spec/` in a third. Both readings were defensible; neither was flagged in any stop condition. | **When two spec files disagree about a path, treat it as a conflict even when one reading looks obviously intended.** Name both readings, say which constraints each satisfies, and ask. Record the answer as a `DD-###` so the next reader is not asked to re-derive it. |

---

## Agent rule checklist (Appendix H)

- [x] The agent has the correct project context — see [`context-pack.md`](../02-context/context-pack.md), pre-filled for TASK-001.
- [x] Every task has a clear acceptance criterion.
- [x] The agent knows what it must not change — every task file has a do-not-change list.
- [x] The agent must explain assumptions before acting on them.
- [x] The agent must preserve tests and security rules.

> Blueprint: ../../../spec-driven-template/06-agent/01-instructions/AGENT.md
