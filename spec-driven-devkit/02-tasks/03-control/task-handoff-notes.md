# Task Handoff Notes

> Source: Ch. 30 §30.2, Ch. 29 §29.3, Ch. 11 §11.7.
> Notes passed between a human and an agent, or between sessions, when a task is picked
> up, paused, or returned.

**Who hands off to whom here:** one developer and an AI coding agent, one task at a time
(CON-008). There is no team, so every handoff is either human ↔ agent or session → session.
That makes the *assumptions* field the most valuable one — a fresh session inherits the
workspace, but not what the last one guessed.

---

## Handoff entries

```
Task ID:
Date:
From → To:          [human → agent | agent → human | session A → session B]
Current status:     [Not started / In progress / Blocked / In review]

What is done:
What is not done:
Files touched so far:
Assumptions made:
Open questions blocking progress:
Next concrete step:
Do not change:
Tests currently passing:
Tests currently failing:
```

| Task | Date | From → To | Status | Note |
|---|---|---|---|---|
| *(empty — nothing has been started)* | | | | |

---

## Agent three-stage workflow (Ch. 11 §11.7)

The agent must not skip a stage. You check the right-hand column.

| Stage | Agent must do | You check |
|---|---|---|
| **Prepare** | Restate the task, list the files it will touch, name every assumption. **Then wait.** | Scope matches the task and is not expanding. |
| **Implement** | Change only approved files; keep the solution small. | The change matches the spec and adds no surprise behaviour. |
| **Report** | Summarise changes, tests, risks, unresolved questions, **and any file touched that the task did not list**. | You can review without hunting through every file. |

> **Practical rule:** if an agent cannot explain what it changed, why it changed it, and
> how to verify it, the task is not complete.

**This is not only a process rule here — it is a product requirement.** ETEST-003 asserts
exactly this behaviour on a *generated* workspace: a fresh session given the hand-off
instruction must restate, list files, and wait before editing. The kit is therefore held to
the same standard it sells, and the same three stages appear in the generated `AGENT.md`.

---

## Mid-work checkpoint (Ch. 29 §29.7)

Trigger a checkpoint when the agent or developer finds ambiguity.

| Check | Answer |
|---|---|
| What assumption is being made? | |
| What is blocking progress? | |
| Which design choice is in question? | |
| Decision needed from whom? | |
| Revised task boundary: | |

### The four checkpoints already predicted

Every P0/P1 task file carries a stop condition. These four are the ones most likely to fire,
recorded now so that hitting one is recognised as *expected* rather than as a surprise:

| Task | Predicted checkpoint | Correct response |
|---|---|---|
| TASK-001 | The plugin manifest schema cannot be confirmed from documentation. | **Stop and ask.** Never guess a schema — a wrong manifest fails at install time, for everyone. |
| TASK-004 | Recognising "is this a kit workspace?" appears to need a marker file. | That is a state file. **ADR-004 forbids it.** Derive from artifacts, or stop and ask. |
| TASK-005 | Step 4's placeholder inventory cannot be made precise. | Stop. A vague step 4 makes FF-005 unenforceable and the product's characteristic failure undetectable. |
| TASK-007 | Stage derivation seems impossible without stored state. | Stop. If it is genuinely impossible, that is an **ADR-level supersession**, not a small exception. |

---

## Control rules while a task is in flight (Ch. 11 §11.5)

| Control rule | How you apply it |
|---|---|
| One task at a time | Do not combine TASK-004 and TASK-006, however tempting. The boundary layer must be provably done before the first write. |
| Approved files only | Every task file lists both an allowed set and a do-not-change list. Both are exact, not indicative. |
| Plan before edit | Require the Prepare stage output before any change. |
| No silent assumptions | Require unclear requirements to be reported **before** coding, not at handoff. |
| Tests required | Every behaviour change includes or updates a test — and for this project, every **denial** test must have been seen to fail first. |
| Review before next task | Do not start TASK-*n+1* until TASK-*n* has been reviewed. |

### Three rules specific to this project

1. **`spec/` is never edited by an implementation task.** Every task file's do-not-change list
   begins with it. This workspace is the specification of the product; changing it to make a
   task pass is reversing the direction the whole method runs in.
2. **If a task appears to need executable code or a state file, stop.** Those are ADR-002 and
   ADR-004. The task is wrong more often than the ADR is.
3. **A denial test must be seen failing before it is trusted.** A security test that has never
   failed proves nothing, and twelve of them guard the only boundary this product has.

---

## What a good handoff looks like here

The blueprint's worked example is a mid-feature pause. The equivalent shape for this project,
written as a template rather than as invented history:

```
Task ID:        TASK-00N
Date:           YYYY-MM-DD
From -> To:     agent -> human
Current status: Blocked

What is done:
  - [the instruction module(s) written, by path]
  - [the tests written AND seen to fail before the change]

What is not done:
  - [named explicitly - never "the rest"]

Files touched so far:
  - [every path, including any NOT on the task's allowed list - flag those loudly]

Assumptions made:
  - [each one, with the spec line it fills a gap in]
  - "none" is a valid and useful answer - say it rather than leaving the field blank

Open questions blocking progress:
  - [Q-### if it exists; if not, propose the wording and say it is new]

Next concrete step:
  - [one step, not a plan]

Do not change:
  - spec/ (always)
  - [the modules this task's do-not-change list names]

Tests currently passing:
Tests currently failing:  [with WHY - a failing test that is expected to fail is
                           different from a regression, and the difference matters]
```

> **The field that earns its place is *Assumptions made*.** Everything else is recoverable
> from the workspace and the diff. An assumption a previous session made and did not write
> down is invisible — and it is exactly what BR-003 forbids inside a generated file, applied
> to the process that generates it.

> Blueprint: ../../../spec-driven-template/02-tasks/03-control/task-handoff-notes.md
