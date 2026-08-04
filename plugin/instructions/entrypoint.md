# The entry point — written last, kept short

One small map at the workspace root, for a session that opens ninety files with no memory of
the interview.

**Written last**, after every file it links to exists — so every link is verifiable on the day
it is written. **Kept short**, because it loads into every later context window, and a long
map stops being read.

---

## When it is written

**After validation, after every other file, and never before.** A link written before its
target exists is a link nobody verified.

If validation failed or a check could not run, **the entry point is not written at all**. A
map to a workspace that is not finished points at a finished workspace that does not exist.

---

## What it contains

| Section | Holds |
|---|---|
| **Start here** | A table: *what you need* → *which file*. The whole navigation surface |
| **Working a task** | The numbered sequence a build agent follows, pointing at `AGENT.md` for the rules |
| **Never** | The handful of prohibitions that must survive being read once |
| **Commands** | install · test · lint · run · gate. Real commands, or `[TODO: ask the team]` |
| **Where things stand** | Stage, next task, blocking open questions, the plugin version |

### Links, not copies

**Never restate a requirement, a rule, or a schema.** Point at the file that owns it.

Duplication here is how a project starts contradicting itself: the copy drifts, both look
authoritative, and nobody can tell which is current. **It is a map, not a manual.**

It links prominently to `AGENT.md`, and does not summarise it. The rules live there.

### Drop rows that do not apply

A project with no model gets no AI rows. A project with no database gets no schema row. **An
inapplicable row is not free** — it costs a line in a file with fewer than a hundred, and it
teaches the reader the map is padded.

---

## Under 100 lines — and what to do when it does not fit

If the map will not fit, **remove rows**. Do not shrink the wording until it technically fits.

A map that no longer fits is telling you something: **the workspace has become hard to
navigate**, and that is a design problem in the layout rather than a reason to break the cap.
Say so rather than compressing.

---

## No placeholder survives

**A `<cmd>` left in the shipped file is worse than an empty section**, because it looks
answered. Someone reads past it.

An unknown command is `[TODO: ask the team - <the exact question>]`, never a guess. A plausible
invented command will be run by somebody.

---

## The version stamp

Record **the plugin version that produced this workspace**. Read it from the manifest.

**If it cannot be read, write `[TODO: plugin version could not be determined]`.** Never invent
one — a wrong stamp is worse than a missing one, because it will be trusted.

**No generation timestamp.** The version answers *which library produced this*, which is the
question a broken back-link raises. A timestamp answers *when*, which nobody asked, and
churns every diff.

### What the stamp is for

A workspace stamped `v1.2.0` read against an installed `v2.0.0` can be told plainly that its
back-links point at a library that has moved. Without the stamp, a broken link is
indistinguishable from a generation bug — **and that is a diagnosis, not a defect report.**

---

## When the developer already has a `CLAUDE.md`

**Theirs is never modified, never proposed, and never merged into — not even if they offer.**

Write the kit's entry point **inside `spec/`**, then print the exact line they can add
themselves:

```
Add this line to your CLAUDE.md if you want the specification loaded automatically:

    See spec/CLAUDE.md for the specification workspace and the rules for working in it.
```

Copy-pasteable, correct, and theirs to use or ignore. One manual step is the entire cost of
never touching a file someone tuned by hand.

If they use a different tool's convention for that file, name it to match and say that you
did.
