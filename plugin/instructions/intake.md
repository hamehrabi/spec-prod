# Intake — orchestration

This is the orchestration module. It decides **what happens and in what order**. It holds no
question text and no template content; those are separate modules, and mixing them here is a
boundary violation.

---

## Read this file only. Open the others when you reach them.

This file names eleven sibling modules. **Do not read them up front.** Open each one at the
step that uses it, and not before — `fill.md` when you are about to write a file,
`validation.md` when the workspace is finished, `report.md` at the very end.

**This is a performance rule with a user-visible consequence.** A first run that reads two
thousand lines of instructions and eighty-two blueprints before producing anything leaves the
developer watching an idle screen for minutes — and they close it. REQ-NF-001 says they must
never wait longer than one round to see output, and reading ahead is the easiest way to break
that without doing anything obviously wrong.

**Get to the first question fast.** Step 0 is a single command; the preamble is four
sentences. Everything else waits until it is needed.

---

## Step 0 — Verify the library, before anything else

**A precondition of the run, not a step inside it.** Follow `instructions/integrity.md` and
compare `blueprints/MANIFEST.md` against the library on disk. If anything is altered, missing,
or unlisted: name which of the three it is, say that nothing was written, and **stop**.

**Create nothing to perform this check** — no script, no helper, no temporary file, anywhere.
If the host cannot compute checksums, stop and say so. See BUG-004: this step wrote two shell
scripts into a developer's repository on the first real run, before the preamble.

This runs **before the preamble and before question one** — not before the first write. A
developer who answers eight rounds and is only then told the library was corrupt has been made
to waste the entire interview.

## Step 0a — Read the depth argument

The command takes **one argument, and only one**: `depth`, which is either `default` (the
value when nothing is given) or `express`.

It changes **how much** is asked and written — never **which path runs**. There is one flow
and both depths go through all of it. A second flow would be exercised half as often and
would rot; that is why this is a parameter and not a mode.

Anything other than those two values is rejected, naming both: *"depth must be `default` or
`express`."*

## Step 0c — Check for an existing workspace, before Round 1

Follow `instructions/resume.md`. If `spec/` already holds a workspace this kit generated,
read it, report each stage as **complete**, **partial** or **absent**, and continue from the
first stage that is not complete — never re-asking a completed round.

Derive that position by **reading the workspace**. There is no state file and never will be
(ADR-004).

If there is no workspace: *"No workspace found — starting a new intake at Round 1."* That is
a normal outcome, not an error.

## Step 0b — Check the workspace folder, before the first write

Follow `instructions/boundary.md`. If `spec/` already exists and holds files this kit did not
generate, **stop before writing anything**, say what was found, and offer an alternative
folder name. Never merge into it and never rename the developer's folder for them.

## Step 1 — Print the preamble

Print the following as plain terminal text, before anything else. Do not add a heading, a
banner, a symbol, a colour, or a progress indicator — every piece of meaning must survive
being read aloud.

```
This command runs a guided interview about the software you want to build, then writes your
answers into a specification workspace in the spec/ folder of this repository. It asks the
questions and records the decisions; you make every decision, and you approve every file
before it is written.

At default depth the interview takes eight rounds.
```

The round count is stated **in words**, and it is stated every time. A developer who cannot
see where an interview ends has no way to decide whether to start one now.

## The blueprint library

The library ships inside this plugin at **`blueprints/`**, relative to the plugin root. It is
**read-only for the whole run.** Nothing in an intake ever writes to it, renames a file in it,
or repairs one.

### Where a blueprint's output goes

The mapping is a **rule, not a list**:

```
blueprints/<relative-path>     ->     <repo>/spec/<relative-path>
```

A blueprint's path below `blueprints/` **is** its destination path below `spec/`. Nothing else
determines it, and the folder depth is carried across unchanged — the back-link written at the
foot of each generated file is computed from that depth, so flattening or re-nesting a path
silently breaks it.

**Never hardcode the set of files a stage produces.** Read the library and derive it. A list
written here would mean adding a blueprint changes nothing until someone remembers to edit
this file, and the whole point is that it changes something immediately.

### Every artifact is produced by the fill procedure

**No generated file is written any other way.** Each one is produced by the six steps in
`instructions/fill.md` — copy, strip the worked example, strip the prompt boxes, replace
every placeholder, mint identifiers, append the back-link.

There is no shortcut for a file that seems simple, and no authoring-from-memory for one whose
template seems obvious. A file written by any other route is a file whose structure nobody
can check against its blueprint, which is the guarantee contract C2 exists to make.

### A blueprint that is missing

```
- Failure state: MISSING_BLUEPRINT
  - Trigger:       A blueprint required for the file being written is absent from the
                   installed plugin.
  - Recovery path: Stop at that file. Everything already written stays written.
  - Message:       "Blueprint <path> is missing from the installed plugin.
                    Rounds 1-N are intact. Stopping here."
  - Never:         improvise a structure, substitute a similar blueprint, or write the
                   file from memory of what that template usually contains.
```

A missing blueprint is a **named gap**, and naming it is the whole behaviour. A structure
invented to keep going produces a specification that looks complete and answers to nothing —
which is worse than stopping, because it is not visibly wrong.

### What the library does not contain

`Dockerfile.example` and three `.gitkeep` files are **deliberately not packaged** — the
`.gitkeep`s hold empty folders open and have no generated counterpart, and the Dockerfile is
an illustration rather than a specification.

`.gitignore` and `.env.example` **are** packaged, as **wrapper blueprints** that carry their
content in a fenced block (`gitignore.md`, `env-example.md`). See `instructions/fill.md`.
Neither is ever improvised from memory — writing a `.gitignore` from memory is exactly the
invention this file forbids everywhere else.

## Step 2 — Each round, in turn

**This step runs once per round, and it is written once.** The round number is the only thing
that changes between iterations. There is no per-round instruction anywhere in this kit, and
adding one would be eight places to keep correct instead of one — the same reason the file
list is derived rather than written down (REQ-F-043).

Everything that varies comes from two modules, both read at the round that needs them:

| What varies | Comes from |
|---|---|
| Which questions this round asks | `instructions/questions.md`, under that round's own heading |
| Which files this round writes | The round map in `instructions/coverage.md` — it names the **directories** that round owns, and the manifest lists what is in them |

**How many rounds there are is fixed at eight, and is not a depth setting.** `express` reduces
the questions asked inside a round, never the number of rounds (`instructions/depth.md`).
Every round still runs, and every round still produces its minimum artifacts — a stage that
was skipped to save time is not a thinner specification, it is a missing one.

One round is always **ask → write → summarise → gate**, in that order, with nothing deferred.

### 2a. Ask

**Open the round by saying where it sits.** One line, before the questions, every round:

```
Round 3 of 8 — users, roles, and data
```

**Both numbers, every time, in words the terminal can render plainly.** Not a bar, not a
percentage, not a symbol — the line has to survive being read aloud and being read in a log.

The second number is the point. *"Round 3"* on its own tells a developer they are somewhere in
an interview of unknown length, and an interview with no visible end is one they abandon rather
than pause — which loses every answer instead of one (REQ-F-032). The preamble states the
count once; by Round 5 nobody remembers a sentence they read twenty minutes ago.

**It is eight at both depths.** `express` asks less inside a round and never removes a round, so
the denominator never changes and must never be computed from anything. A progress indicator
that disagreed with the preamble would make both untrustworthy.

**First consult `instructions/inference.md`.** Any question the developer's earlier answers
already settle is not asked, and the inference drawn instead is stated with the answer it
came from. Any two answers that cannot both hold **stop the round** and are quoted verbatim.

Then ask what remains from `instructions/questions.md`, followed by its free-text question.
At most four multiple-choice questions in a round — the limit is a requirement, not a
guideline. **There is never a ninth round**; anything still unknown after the eighth becomes
an open question with a decision owner.

Compose the whole round before showing any of it, so the developer never waits inside a round
with a blank screen.

A typed answer is used **verbatim** and is never snapped to a listed option.

### 2b. Write

Write this round's files — **derived from the manifest, never from a list written here.**
Follow `instructions/coverage.md`: the round owns a set of directories, and every blueprint
the manifest lists under them is this round's to produce.

A list written into this file would mean adding a blueprint changes nothing until someone
remembers to edit orchestration, and the whole point is that it changes something
immediately (REQ-F-043).

Each file is produced by `instructions/fill.md`, and each destination is checked by
`instructions/boundary.md` first.

**Write them now, before the next round is asked** — not at the end of the run. An interrupted
intake has to leave usable output behind, and a run that holds everything until the end leaves
nothing when it is closed at round three.

Propose each file singly and let the host's per-file prompt decide. If the developer **declines**
one, record it as skipped, say so, and **continue the round.** A decline is a normal outcome, not
a failure state: the run stays resumable and the file is offered again next time.

### 2c. Summarise

One line, naming the count:

```
Round 1 — wrote 3 files
```

The count comes from what was actually written, never from what was expected.

If a file was skipped, the line says so rather than reporting a number that implies more was
written than was.

### 2d. Present the gate, and wait

Follow `instructions/review.md`. Show what the round **decided**, what it **inferred instead
of asking**, and every **`[TODO]`** it created — then wait for **accept**, **revise**, or
**stop**.

**This blocks the next round.** No question from round *N+1* is asked until round *N* is
accepted, and **silence is not acceptance** — if no answer comes, keep waiting.

On **accept**, append a dated row to `spec/01-docs/09-change-control/spec-change-log.md`.
Never create an acceptance, progress, or approval file (ADR-006).

That file is **Round 1's to create**, because Round 1 is the first round to write to it. A
file every round appends to cannot be owned by the round its folder number resembles — see
the note in `instructions/coverage.md` (BUG-010).

### 2e. Go back to 2a for the next round — or leave the loop

**Round 8's gate is the last.** There is no ninth round, for any reason — not for one more
question, not because something important is still unclear, not if the developer offers
(`instructions/inference.md`). Anything still unknown becomes a `[TODO]` with a matching open
question and a named decision owner.

That is a **better outcome** than a longer interview: a recorded gap is visible, and an
interview that expands to fit the ambiguity gets abandoned — which loses everything rather
than one answer.

On **stop** at any round, the run ends where it is. Everything written stays written, the
workspace stays resumable, and steps 3 to 5 do **not** run — there is nothing finished to
validate or report on, and saying otherwise would be BR-009's exact failure.

---

## Step 3 — Validate, before claiming anything worked

Follow `instructions/validation.md`. Run the whole walk over the finished workspace **before**
saying it worked, before the entry point is written, and before the hand-off block is printed.

Report every check as **passed**, **failed**, or **not run**, and state **the number that
ran**. Never infer "all passed" from an empty list of failures — that is BR-009's exact
failure, and it is how a hollow workspace ships looking complete.

If any check failed or could not run: say so, name it, and **claim no success**.

## Step 4 — Write the entry point, last

Follow `instructions/entrypoint.md`. The entry point is the **last file written** — after
every file it links to exists, so every link is verifiable the day it is written.

**If validation failed or any check could not run, do not write it at all.** A map to a
finished workspace that does not exist is worse than no map.

If the developer already has a `CLAUDE.md` at their repository root, the kit's own goes
**inside `spec/`** and the exact line to add is printed. Theirs is never modified and never
proposed — not even if they offer.

## Step 5 — Report, and hand off

Follow `instructions/report.md`. **After validation, never before** (BR-009).

Five sections: what was created, what is still `[TODO]`, which open questions block coding,
**what was assumed rather than asked**, and where the entry point is. Every empty section is
stated as a sentence — a blank one reads as forgotten.

**If any check failed or could not run, print no hand-off block.** Say which checks, and say
the workspace is not finished. It stays resumable.

## Step 6 — Stop

The run ends after the report. Nothing follows it.

- Ask no further question. The eighth round was the last one.
- Create, modify, or delete no file outside `spec/`.
- Make no network call.
- Do not offer to start building. This kit writes specifications and stops (BR-001) —
  the hand-off names the entry point, and the developer decides what happens next.

**A run that ends early is not a failed run.** A developer who stopped at round three has a
three-round workspace and a resumable one, and it must be reported as exactly that: what was
written, what was not reached, and where to continue. An early end reported as a failure
teaches people not to stop, and an interview nobody dares pause is one they abandon instead.

---

## Rules that bind this module

| Rule | Why |
|---|---|
| **Every proposed write passes `instructions/boundary.md` first** | Normalise, then compare as a path. There is no undo, so the check never runs after the write |
| **The developer's root `CLAUDE.md` and `.gitignore` are never proposed at all** | Not refused after asking — never asked. A stop that asks and a stop that never asks are different promises (REQ-F-026, REQ-F-035) |
| **Blanket write permission is never requested** | The host's per-file prompt is the only enforcement independent of this kit's own behaviour (SEC-Z-002) |
| No question text lives in this file | Questions are their own module; this one sequences, it does not ask |
| No template or blueprint content lives in this file | Templates are their own module, and are read-only while the intake runs |
| This module never writes a file itself | It directs; the host's file tools write, and only after the developer approves each one |
| Meaning is carried in words, never in colour, symbol, or ordering alone | The output must be equally readable in a plain terminal, a log, or a screen reader |
| Behaviour is identical on Windows, macOS, and Linux | Nothing here assumes a shell, a path separator, or a case-sensitive filesystem |
| There is one command and one path through it | A second entry point is a second thing to keep correct, and the second one rots |
