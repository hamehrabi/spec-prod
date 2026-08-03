# Architecture Decision Records

> Source: Ch. 8 §8.8, Appendix K.
> An ADR is a short document explaining an important architecture decision: the context,
> the options considered, the decision made, and the consequences.

**Why ADRs matter with AI agents:** they become *durable instructions*. Instead of
explaining the same decision repeatedly in every prompt, include the ADR in the project
context and tell the assistant to follow it.

## Index

| ID | Title | Status | Date | Supersedes |
|---|---|---|---|---|
| [ADR-000](ADR-000-template.md) | Template — copy me | — | — | — |
| [ADR-001](ADR-001-modular-plugin-structure.md) | Four separated modules inside one plugin | Accepted | 2026-08-03 | — |
| [ADR-002](ADR-002-instructions-only-no-runtime.md) | Instructions only — the kit ships no executable code | Accepted | 2026-08-03 | — |
| [ADR-003](ADR-003-copy-then-fill.md) | Copy the blueprint file, then fill it in | Accepted | 2026-08-03 | — |
| [ADR-004](ADR-004-fixed-spec-folder-no-state-file.md) | A fixed `spec/` folder is the only writable target, and the only state store | Accepted | 2026-08-03 | — |
| [ADR-005](ADR-005-version-stamp-generated-workspaces.md) | Generated workspaces record the plugin version that produced them | Accepted | 2026-08-03 | — |
| [ADR-006](ADR-006-stage-acceptance-recorded-in-workspace.md) | Stage acceptance is recorded in the workspace, not in a state file | Accepted | 2026-08-03 | — (**extends** ADR-004) |

## Conventions

- File name: `ADR-###-short-kebab-title.md`
- Numbers are sequential and never reused.
- An accepted ADR is **immutable**. To change direction, write a new ADR and mark the old
  one `Superseded`.
- Every ADR lists at least one **rule the AI assistant must follow during implementation** —
  that rule belongs in [`AGENT.md`](../../../06-agent/01-instructions/AGENT.md) too.

## Status values

| Status | Meaning |
|---|---|
| Proposed | Written, not yet agreed. |
| Accepted | Agreed; binding on implementation. |
| Rejected | Considered and declined; kept for the record. |
| Replaced / Superseded | A later ADR governs instead. |

---

## Rules the ADRs impose on the AI assistant

**These must also appear verbatim in
[`AGENT.md`](../../../06-agent/01-instructions/AGENT.md).** If a rule is here and not there,
it is not governing anything — the build agent reads `AGENT.md`, not this file.

| ADR | Rule the agent must follow |
|---|---|
| **ADR-001** | Never place question text inside a blueprint. Never place blueprint structure inside the intake instruction set. Never place orchestration rules inside the question set. The blueprint library is **read-only at run time** — the kit never writes to its own files during an intake. |
| **ADR-002** | Never add a script, CLI, templating engine, package manifest, lockfile, or dependency of any kind to this project. The kit ships Markdown and a plugin manifest, nothing else. **If a task appears to require executable code, the task is wrong — stop and ask.** |
| **ADR-003** | Never author a generated file from memory of a blueprint. Copy the blueprint file first. Then delete the `# WORKED EXAMPLE` section and the generic prompt boxes. Then replace **every** placeholder, empty table row, and instructional italic — with real content or with `[TODO: <the exact question>]`. Never leave one because it looked unimportant. |
| **ADR-004** | Never create a state, progress, session, cache, or answer file anywhere. Determine how far intake has got by **reading which artifacts exist**, never by reading a record of what was done. Never write outside `spec/` without stopping to ask, naming the file and showing what would change. |
| **ADR-005** | Write the plugin version into the generated entry-point file. Do **not** write a generation timestamp. Do not invent a version — read it from the plugin manifest, and if it cannot be read write `[TODO: plugin version could not be determined]`. |
| **ADR-006** | Record stage acceptance as a **dated row in the generated change-control artifact**. **Never create an acceptance, progress, or approval file.** Determine which stages are accepted by reading those rows — never from remembered session state. Never proceed past a gate on silence, and never make the gate skippable. |

### Cross-cutting rules these ADRs imply together

| Rule | Comes from |
|---|---|
| There is exactly **one** intake command and **one** end-to-end path through it. Depth is an argument, never a branch. | ADR-001 + the Simplicity driver |
| Tests assert **structure, never prose**. Nothing in this project can be checked with an equality assertion on generated text. | ADR-002 |
| "Fails the build" means **the kit author's CI**, not the developer's machine — there is no build there. | ADR-002 + ADR-004 |
| A gap is always named. A missing blueprint, an unreadable version, an unanswerable question — each becomes a stated gap, never an improvisation. | ADR-002 + ADR-003 + ADR-005 |

## On superseding

No ADR here has been superseded yet. When one is, it is **not edited** — its status becomes
`Superseded`, and a new ADR is written with the new context, decision, and consequences. The
history is the point: a future reader needs to know what was believed at the time, not only
what is believed now.

The two most likely candidates for supersession, both named in their own *Revisit when*
sections:

- **ADR-002**, if instruction-driven validation proves unreliable and the hybrid becomes
  correct. That is a large reversal and it changes CON-006's practical meaning.
- **ADR-004**, if monorepo support is needed. Note that reopening the *state file* half of
  ADR-004 requires superseding it explicitly — that path is deliberately closed, not merely
  unchosen.

> Blueprint: ../../../../spec-driven-template/01-docs/05-architecture/architecture-decisions/adr-index.md
