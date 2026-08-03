# Context Pack — TASK-001

> Source: Ch. 25 §25.9.
> Everything an agent needs for **one** task, in one place. Pre-filled for TASK-001.
> Replace this file's contents when moving to the next task — it is a working document, not
> a record.

---

## Background

You are building a **Claude Code plugin** that installs a spec-driven development kit into a
developer's own repository. Running one command starts a guided interview; answering it
produces a specification workspace in a `spec/` folder. **The kit produces specifications and
never writes the developer's application code.**

**The distinction that matters most:** `spec/` **in this repository** is the specification of
the kit. You never edit it. `spec/` in a *developer's* repository is what the kit creates for
them. Full glossary in [`project-brief.md`](../../01-docs/01-intent/project-brief.md).

## This task

**TASK-001 — Plugin skeleton: manifest, one command, preamble.**

The thinnest possible vertical slice: a developer installs the plugin, types one command, and
sees the preamble. It writes nothing, asks nothing, and proves the delivery path works.

Full task file: [`TASK-001.md`](../../02-tasks/02-task-files/TASK-001.md)

## Its requirements

| ID | Requirement |
|---|---|
| REQ-F-001 | Install via Claude Code's own plugin mechanism — no installer, script, account, or key |
| REQ-F-002 | One command starts the intake; no configuration step in between |
| REQ-F-004 | State what is about to happen **and** roughly how many rounds, before question one |
| REQ-NF-006 | Plain text; no meaning carried by colour or symbol alone |
| REQ-NF-008 | Identical behaviour on Windows, macOS, and Linux |

## Technical rules that bind this task

| Rule | Source |
|---|---|
| **No executable code.** No script, CLI, package manifest, lockfile, or dependency — Markdown and the plugin manifest only | ADR-002 |
| **Exactly one command.** Not two, not now, not ever | FF-001 |
| **Module boundaries:** no question text and no blueprint content in `instructions/intake.md` | ADR-001 |
| **Write nothing** into any repository in this task | Task scope |
| Round count stated **in words**, not implied | REQ-NF-006 |

## File map

**You may create:**
```
.claude-plugin/plugin.json      manifest: name, version, description
commands/<command-name>.md      the single command entry point
instructions/intake.md          orchestration - PREAMBLE ONLY for now
README.md                       what it is, how to install
```

**You must not touch:**
```
spec/**                         the specification. Never edit it.
anything in a developer's repository
```

## Restrictions

- **Do not guess the plugin manifest schema.** Confirm it from current documentation. If it
  cannot be confirmed, **stop and ask** — a wrong manifest fails at install time, for everyone.
- Do not add a second command.
- Do not ask a question or write a file.
- Do not add anything that is not Markdown or the manifest.

## Open decision inside this task

**The command name has not been chosen.** It is referenced across the whole workspace and
cannot be changed cheaply later. Choose it in this task and record it as a design decision in
[`decisions.md`](../../01-docs/05-architecture/decisions.md).

## Done when

- [ ] Installs through the documented mechanism, no extra step
- [ ] The command is registered and runs
- [ ] Preamble prints two sentences **and** the round count, before anything else
- [ ] Exits without asking or writing
- [ ] The payload contains **zero** files that are not Markdown or the manifest
- [ ] Works identically on all three platforms

## Tests

| Test ID | Proves |
|---|---|
| ATEST-001 | Installs with no account, key, or download |
| ATEST-002 | Command runs; no configuration step between install and interview |
| ATEST-004 | What happens **and** the round count are stated before question one |
| UTEST-001 | Round count present, in words |
| TEST-001 | **Installing creates no file anywhere** — installing is not running |
| TEST-002 | Bare invocation is valid; it is the common case |

## Review rules

Report: files changed and why · requirement covered · tests added · risks and assumptions ·
**any file touched that this task did not list**.

## Stop and ask if

- The manifest format cannot be confirmed from documentation
- Anything appears to require a script, runtime, or dependency — **that contradicts ADR-002,
  and the task is wrong rather than the ADR**
- The command name is unclear

---

## When TASK-001 is done

Replace this file with TASK-002's context. Keep it to one task — the value of a context pack
is that it is small enough to be read completely.

> Blueprint: ../../../spec-driven-template/06-agent/02-context/context-pack.md
