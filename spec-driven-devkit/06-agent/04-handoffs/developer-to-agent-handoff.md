# Developer → Agent Handoff

> Source: Ch. 11, Ch. 25.
> What the developer gives the agent when handing over one task. **The boundary is the
> handoff** — an agent that cannot see the whole project needs the file lists to be exact,
> not indicative.

---

## Task boundary

```
Task:         TASK-###
Requirement:  REQ-### (and any BR-###, SEC-###)
One outcome:  [if there is more than one, the task must be split]
```

## Context to use

**Read exactly these. Not the whole workspace.**

```
spec/CLAUDE.md                                  <- always first
spec/06-agent/01-instructions/AGENT.md          <- always second
spec/06-agent/02-context/context-pack.md        <- pre-filled for the current task
spec/02-tasks/02-task-files/TASK-###.md         <- the task
[only the specs that task file names]
```

**Do not read the whole workspace.** ~95 files is more context than the task needs, and
reading everything is how an agent acquires opinions about work it was not given.

## Files in scope

```
May create or modify:
  [exact paths from the task's allowed list]

Must NOT touch:
  spec/**                    <- ALWAYS. It is the specification, not the product.
  [the task's do-not-change list]
  the developer's own repository, if one is involved
```

## Expected output

```
1. PREPARE  - restate the task, list the files you will touch, name every
              assumption. THEN WAIT. Do not proceed on silence.
2. IMPLEMENT - only the allowed files. Smallest thing that satisfies the requirement.
3. REPORT   - changes and why · requirement covered · tests added · risks and
              assumptions · ANY FILE TOUCHED THAT THE TASK DID NOT LIST.
```

## Review rules

- Tests come from **acceptance criteria**, never from what was just written
- Every **denial** test must be seen to **fail** before it is trusted
- No assertion on generated prose — structure only (ADR-002)
- Every write test asserts the negative half: files outside `spec/` unchanged, **by checksum**
- Nothing merges until the full gate passes

## Do not proceed if

| Condition | Why it means stop, not improvise |
|---|---|
| **The task appears to require executable code** | ADR-002. The task is wrong more often than the ADR is |
| **The task appears to require a state file** | ADR-004. Under any name — cache, progress, session, manifest |
| The requirement is ambiguous enough that two developers would build different things | Raise it. An assumption acted on silently is exactly what BR-003 forbids |
| A file you need is not on the allowed list | Say so **before** editing. Not after |
| The task would reverse an ADR | Stop. Reversal needs a superseding ADR, not a commit |
| **You would have to edit `spec/` to make it pass** | The direction is reversed. The specification is not the thing that yields |

---

## What "wait" means

**Stop and produce no edits until the developer replies.** Not "state the assumption and
continue". Not "proceed with the most likely reading".

This is the single most load-bearing instruction in the handoff, and it is the one most
easily softened into helpfulness. The whole product exists because unsupervised plausible
work is expensive — and a build agent that restates the task and then proceeds anyway has
reproduced the problem inside the tool built to solve it.

The same rule is a **product requirement**, not only a process one: ETEST-003 asserts exactly
this behaviour on a generated workspace. If the kit's own build agent will not wait, the kit
has no standing to promise that anyone else's will.

---

## Handoff example — TASK-001

```
Task:         TASK-001 - plugin skeleton: manifest, one command, preamble
Requirement:  REQ-F-001, REQ-F-002, REQ-F-004

Context to use:
  spec/CLAUDE.md
  spec/06-agent/01-instructions/AGENT.md
  spec/06-agent/02-context/context-pack.md          (pre-filled for this task)
  spec/02-tasks/02-task-files/TASK-001.md
  spec/01-docs/04-technical-spec/technical-spec.md  §1-2 only

May create:
  .claude-plugin/plugin.json
  commands/<command-name>.md
  instructions/intake.md
  README.md

Must NOT touch:
  spec/**
  anything in a developer's repository

Expected output:
  A plugin that installs, registers ONE command, prints the preamble, and exits.
  It writes nothing and asks nothing.

Do not proceed if:
  - the plugin manifest schema cannot be confirmed from documentation
    -> DO NOT GUESS A SCHEMA. A wrong manifest fails at install time, for everyone.
  - anything appears to need a script, runtime, or dependency  -> ADR-002
  - the command name is unclear -> it is referenced across the whole workspace
```

> Blueprint: ../../../spec-driven-template/06-agent/04-handoffs/developer-to-agent-handoff.md
