# TASK-001: Plugin skeleton — manifest, one command, preamble

**Task ID:** TASK-001 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-001 (install via the plugin mechanism) · REQ-F-002 (one command starts intake) ·
REQ-F-004 (state what happens and how many rounds) · ADR-001 (four separated modules) ·
ADR-002 (no executable code)

## Business reason

Nothing can be built or tested until the kit installs and runs. This task makes the thinnest
possible **vertical** slice: a developer installs the plugin, types one command, and sees the
preamble. It writes nothing, asks nothing, and proves the whole delivery path works.

## Goal

A plugin that installs through Claude Code's own mechanism and registers **one** command
which prints the preamble and exits.

## Inputs

- [`technical-spec.md`](../../01-docs/04-technical-spec/technical-spec.md) §1, §2
- [`frontend-component-spec.md`](../../01-docs/04-technical-spec/frontend-component-spec.md) — `Preamble`
- [`api-specification.md`](../../01-docs/06-api-and-data-design/api-specification.md) — contract C1
- [`ADR-001`](../../01-docs/05-architecture/architecture-decisions/ADR-001-modular-plugin-structure.md), [`ADR-002`](../../01-docs/05-architecture/architecture-decisions/ADR-002-instructions-only-no-runtime.md)

## Expected files or components

```
.claude-plugin/plugin.json        <- manifest: name, version, description
commands/<command-name>.md        <- the single command entry point
instructions/intake.md            <- orchestration module (preamble only, for now)
README.md                         <- what it is, how to install
```

`[TODO: confirm the exact manifest filename, required fields, and command-directory
convention against the current Claude Code plugin documentation before writing. Do not
guess the schema — if it cannot be confirmed, stop and ask.]`

`[TODO: the command name has not been chosen — see api-specification.md C1. Choose it in
this task and record it as a design decision; every later document references it.]`

## Expected output

Installing the plugin and running the command prints, in this order:
1. Two sentences: what is about to happen.
2. The number of rounds (eight at default depth).
3. Nothing else. It then exits without asking or writing.

## Step-by-step instructions

1. Confirm the plugin manifest format from current documentation. If unclear, **stop and ask**.
2. Create the manifest with name, version, and description.
3. Register one command.
4. Create `instructions/intake.md` containing **only** the preamble behaviour.
5. Create the plugin's own `README.md`.
6. Install locally and verify the command appears and runs.

## Dependencies

None. This is the first task.

## Constraints / Boundaries

- **No executable code of any kind** — no script, CLI, package manifest, lockfile, or
  dependency. Markdown and the plugin manifest only (ADR-002).
- Do not add a second command. There is exactly one, forever (FF-001).
- Do not put question text or blueprint content in `instructions/intake.md` (ADR-001).
- Do not write any file into a developer's repository in this task.

## Do not change

- **Anything in `spec/`** — this workspace is the specification, not the product.
- Any file in the developer's repository. This task creates the plugin, nothing else.

## Acceptance check / Done criteria

- [ ] The plugin installs through the documented mechanism with no extra step.
- [ ] The command is registered and runs.
- [ ] The preamble prints two sentences and the round count, in words, before anything else.
- [ ] The command exits without asking a question or writing a file.
- [ ] The plugin payload contains **zero** files that are not Markdown or the manifest.
- [ ] Works identically on Windows, macOS, and Linux.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-001 | Install into a clean repo, no network beyond the host | Available; no account, key, or download needed |
| ATEST-002 | Run the command | Preamble prints; no configuration step in between |
| ATEST-004 | Start a fresh run | What happens **and** the round count are stated before question one |
| UTEST-001 | Inspect the preamble | Round count present and stated in words |
| TEST-001 | Install, then list files | **No file created anywhere** — installing is not running |
| TEST-002 | Invoke with no arguments | Valid; this is the common case |

## Review checklist

- [ ] Matches REQ-F-001, REQ-F-002, REQ-F-004.
- [ ] No unrelated feature added — no questions, no writes, no second command.
- [ ] Tests pass.
- [ ] Messages are clear and carry meaning in words, not colour (REQ-NF-006).
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.
- [ ] **FF-009 would pass**: the payload contains no executable file.

## Out of scope

- Asking any question
- Writing any file into a repository
- The blueprint library (TASK-003)
- The boundary layer (TASK-004)
- CI (TASK-002)

## Stop condition

**Stop and ask if:**
- The plugin manifest format cannot be confirmed from documentation. **Do not guess a schema.**
- Anything appears to require a script, a runtime, or a dependency — that contradicts ADR-002,
  and the task is wrong rather than the ADR.
- The command name is unclear — it is referenced across the whole workspace and cannot be
  changed cheaply later.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
