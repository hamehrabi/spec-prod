# Resume — work out where you are by looking

Before Round 1, check whether a workspace already exists. If it does, **read it, report what
is there, and continue from the first incomplete stage.**

An intake that must be finished in one sitting will be abandoned half-way, and that is the
primary risk this product faces. Resume is what makes stopping safe.

---

## There is no state file

**Stage position is derived by reading the workspace. Every time. Never stored.**

No marker file, no progress manifest, no `.intake-state.json`, no hidden field, no cache of
last run's answer — under any name, for any reason (ADR-004).

This is not a rule about tidiness. A stored position is a **second source of truth**, and it
begins disagreeing with the workspace the moment anyone edits a file by hand — which is
precisely the moment a developer most needs resume to be right. Re-reading local Markdown is
cheap; being wrong about where someone left off is not.

**Do not cache the derivation between runs either.** A cache is a state file wearing a hat.

---

## The four states of a stage

Read which artifacts exist, then compare against what that round produces:

| State | What it means | What to do |
|---|---|---|
| **absent** | None of the stage's files exist | Ask this round |
| **partial** | Some files, not all | **Redo the stage from its start.** Replace the round's files whole — never append to a half-written one. The two ledgers below are appended to, never replaced |
| **written, not accepted** | Every file exists, no acceptance row | **Re-present that stage's gate.** Do not re-ask the round; do not advance |
| **complete** | Every file exists, and a dated acceptance row records it | Move on |

### The third state is the one a simpler design misses

A session can end **between the write and the decision**. The files are all there, so a
two-state check calls the stage done and skips past a gate the developer never answered.

They were asked a question and have not answered it. Ask it again — do not re-ask the round,
because the answers are already in the files, and do not advance, because nothing was agreed.

### Continue from the first stage that is not complete

Not the first empty one. A partial stage earlier in the sequence must be finished before
anything later is touched, or resume leaves a hole behind it and calls the workspace done.

---

## The report

State each stage as **complete**, **partial**, or **absent** — in words. Then say where the
run is continuing and why.

```
Found a workspace at spec/.
  Round 1 — the idea            complete   (accepted 2026-08-04)
  Round 2 — scope boundaries    partial    (2 of 3 files)
  Round 3 onwards               absent

Continuing at Round 2, which was partly written. I will redo it from the start
and replace those two files rather than adding to them.
```

### When there is no workspace

> "No workspace found — starting a new intake at Round 1."

**A normal outcome, stated positively.** Not an error, not a warning, and never rendered as
a failure to find something. An empty result and a broken one must not look alike.

### Re-running a complete workspace changes nothing

Report that every stage is complete and stop. Re-running is not a reason to rewrite anything.

---

## Redo replaces; it never appends

A partial stage is redone **from its start**, and each file is written **whole**. Never append
to a half-written file, and never try to repair one in place — a file that is half old and
half new matches no blueprint and belongs to no round.

Whole-file replacement is what makes a redone stage idempotent by construction.

### Two files are exempt, because they are ledgers and not round artifacts

**`01-docs/09-change-control/spec-change-log.md`** and **`01-docs/01-intent/open-questions.md`**
are owned by Round 1 but **written to by all eight** (`instructions/coverage.md`). A redo
appends to these two. It never replaces them.

The reason is ADR-004. There is no state file, so **these rows *are* the state** — the change
log is the only record of which stages were accepted and which blueprints were skipped, and
open-questions is the only place a `Q-###` is defined.

Replacing them whole is not an idempotent rewrite of one round's work; it is the deletion of
seven other rounds'. A partial Round 1 is ordinary — a declined file leaves one
(`instructions/intake.md`) — so this is reached by a normal workspace, not an unlucky one:

> Round 1 partial, Rounds 2–5 accepted. Resume redoes Round 1, rewrites the change log from
> its blueprint, and five acceptance rows and every skip reason are gone. Four gates are
> re-presented to a developer who already answered them, and check 13 now fails for coverage
> that was recorded. `open-questions.md` goes the same way, orphaning every `[TODO]` Rounds
> 2–5 wrote.

**Appending to a ledger is not repairing a half-written file.** The distinction the rule above
draws is between a file that belongs to one round and a file that belongs to the workspace.
A ledger's older rows were never this round's to write, so they were never this round's to
replace — and a half-written ledger is still a correct ledger, because a row is complete or
it is absent.

---

## When the workspace has been hand-edited

The developer's edits are **theirs**. Never silently overwrite them.

What is detectable: a generated file that has lost its `> Blueprint:` back-link, or one that
is empty. Report those and **ask** — say what was found and what cannot be reconciled.

**What is not detectable:** thoughtfully edited prose inside a correctly structured file is
indistinguishable from prose the kit wrote. That is a real limit rather than an oversight, and
the correct response to it is to ask rather than to guess. Redoing a stage the developer has
been editing would destroy exactly the work this kit exists to help them do.

---

## What resume never does

| Never | Why |
|---|---|
| Re-ask a completed round | Their answers are already on disk and already accepted |
| Write a state or progress file | ADR-004. Derivation is cheap; a second source of truth is not |
| Overwrite hand-edits silently | They are the developer's, and this kit does not own their repository |
| Guess at an inconsistent workspace | Report what was found, name what cannot be reconciled, ask |
| Skip a gate because the files exist | Files written is not the same as work accepted |
