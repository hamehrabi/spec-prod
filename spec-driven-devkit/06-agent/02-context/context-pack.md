# Context Pack — TASK-003

> Source: Ch. 25 §25.9.
> Everything an agent needs for **one** task, in one place. Pre-filled for TASK-003.
> Replace this file's contents when moving to the next task — it is a working document, not
> a record.

---

## Background

You are building a **Claude Code plugin** that installs a spec-driven development kit into a
developer's own repository. Running one command starts a guided interview; answering it
produces a specification workspace in a `spec/` folder. **The kit produces specifications and
never writes the developer's application code.**

**The distinction that matters most:** `spec/` **in this repository** is the specification of
the kit — it is the folder `spec-driven-devkit/`, and you never edit it. `spec/` in a
*developer's* repository is what the kit creates for them. Full glossary in
[`glossary.md`](../../01-docs/10-reference/glossary.md).

## What already exists

| Where | What |
|---|---|
| `plugin/` | The payload (DD-015). Manifest, one command, one orchestration module. v0.1.0 |
| `ci/`, `tests/`, `.github/` | FF-001, FF-002, FF-009 and 19 tests, gating every merge (DD-016) |
| `spec-driven-template/` | The ~90 blueprints **this task packages**. Not yet inside the plugin |

## This task

**TASK-003 — package the blueprint library, read-only.**

Copy the existing library into the plugin so intake can read it with no network call, and
make a missing blueprint a **named failure** rather than an improvisation.

Full task file: [`TASK-003.md`](../../02-tasks/02-task-files/TASK-003.md)

## Its requirements

| ID | Requirement |
|---|---|
| REQ-F-003 | The library ships **inside** the plugin, so intake works with no network access |
| REQ-NF-008 | Identical on Windows, macOS, and Linux — including case sensitivity |
| ADR-001 | The library is **read-only at run time** |
| ADR-005 | A blueprint path is a **contract**. Renaming or moving one is a breaking change |

## Technical rules that bind this task

| Rule | Source |
|---|---|
| **Packaging only. Do not rewrite, reformat, or improve any blueprint** | TASK-003 constraints |
| Preserve the folder structure exactly — **depth drives back-link arithmetic** | UTEST-014 |
| Do **not** copy `appendix-index.md` — template scaffolding, not a project artifact | TASK-003 step 5 |
| Record the blueprint **path map** in `instructions/intake.md`; never blueprint *content* | ADR-001 |
| Every packaged file must be **byte-identical** to its source | TEST-003 |
| The payload stays Markdown-only | ADR-002, FF-009 |

## File map

**You may create or modify:**
```
plugin/blueprints/**            the library, mirroring spec-driven-template/'s structure
plugin/instructions/intake.md   gains the path map and the MISSING_BLUEPRINT failure
```

**You must not touch:**
```
spec-driven-devkit/**           the specification. Never edit it
spec-driven-template/**         the SOURCE library. Copy from it; never edit it
plugin/commands/**              one command, and this task does not change it
```

## Restrictions

- If a blueprint looks wrong, outdated, or inconsistent — **package it as-is and raise it.**
  Fixing content inside a packaging task is an unrequested change.
- Do not flatten, rename, or tidy the folder structure. A rename is a **breaking change**
  requiring a migration note.
- Do not add a second command, a script, or any non-Markdown file.

## Watch for

**This task is followed immediately by TASK-021 (integrity manifest), also P0.** Nothing may
read a blueprint *for generation* until both are done — an unverified library produces
specifications that are subtly wrong and entirely plausible, which is the worst failure this
product has.

## Done when

- [ ] Every blueprint from `spec-driven-template/` is present, except `appendix-index.md`
- [ ] Each is **byte-identical** to its source
- [ ] All read from local disk with the network blocked
- [ ] A deliberately removed blueprint produces the named failure; prior rounds survive
- [ ] All paths resolve on Windows, macOS, and Linux
- [ ] No blueprint is modified by a run — verified by checksums before and after
- [ ] FF-009 still passes: the payload gained ~90 Markdown files and nothing else

## Tests

| Test ID | Proves |
|---|---|
| ATEST-003 | Full run with the network blocked reads every blueprint from local disk |
| TEST-003 | Packaged vs. source byte-identical; `appendix-index.md` absent |
| FTEST-004 | A removed blueprint is **named**, the run stops, nothing is improvised |
| STEST-012 | Plugin file checksums unchanged before and after a run |

## Review rules

Report: files changed and why · requirement covered · tests added · risks and assumptions ·
**any file touched that this task did not list**.

## Stop and ask if

- A blueprint seems wrong — **package it as-is and raise it**
- The library will not fit, or the plugin mechanism restricts bundled files — that challenges
  CON-003 and needs a decision, not a workaround
- Two specification files disagree about a path. **That has happened twice already** (DD-015,
  DD-016). Name both readings and ask; do not pick the convenient one

---

## When TASK-003 is done

Replace this file with TASK-021's context — the integrity manifest, which must land before
anything reads a blueprint to generate from. Keep it to one task: the value of a context pack
is that it is small enough to be read completely.

> Blueprint: ../../../spec-driven-template/06-agent/02-context/context-pack.md
