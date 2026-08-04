# The closing report and the hand-off

Without this, the developer has ninety files and no idea what to do next.

**The assumptions section is the only part they cannot reconstruct for themselves.** Every
other fact is somewhere in the workspace. What the intake assumed rather than asked exists
nowhere else — once this report scrolls past, it is gone.

---

## Gate it on validation, first

**If any check failed or could not run, say so and do not print the hand-off block.**

```
9 of 12 checks ran. Check 6 failed: [TODO] in requirements.md has no matching Q-###.
Checks 10 and 11 could not run: the entry point was not written.

This workspace is not finished. I have not printed a hand-off, because handing
off an unvalidated workspace is how it gets built from.
```

The report still runs. **The hand-off does not.** A workspace that cannot be validated can
still be resumed, and saying which checks failed is more useful than a summary.

---

## The sections

### 1. What was created

How many files and folders. **Count them** — never state a number without having counted.

### 2. What is still `[TODO]`, and why

Every marker in the workspace, with the question it names and the file it sits in.

> *"No open `[TODO]` markers."*

### 3. Which open questions block coding

Not all of them — the ones whose absence stops work starting, each with its decision owner.

> *"No open question blocks starting work."*

### 4. What was assumed rather than asked

**Every inference drawn in place of a question**, and the answer it came from. This includes
every notice shown during the interview: the developer saw them once, in passing, several
rounds ago.

> *"No assumptions were made; every fact came from an answer."*

**An incomplete list here is worse than no list**, because it implies completeness. If
assumptions cannot be collected reliably, say that instead of listing some.

### 5. Which stages were written thin

At `express` depth, name them. The developer should know where to look first if the workspace
later feels shallow — and should know it was **a choice they made**, not a gap the intake left.

> *"Written at full depth throughout."*

### 6. Where the entry point is

Name it, and say it is the single entry point for every future session.

### Empty states are stated, never silent

Each section above shows its empty form as a **sentence**. A blank section reads as a section
that was forgotten, and the reader cannot tell the difference between *nothing to report* and
*nobody looked*.

---

## The hand-off block

Copy-pasteable, verbatim, with **no placeholder left in it** — it is pasted into a fresh
session by someone who will not proofread it first.

```
Read spec/CLAUDE.md, then spec/06-agent/01-instructions/AGENT.md, then
spec/02-tasks/02-task-files/TASK-001.md.

Restate the task, list the files you will touch, name every assumption — and wait.
```

Fill every name from the **actual workspace**: the real entry-point path, the real first task
ID. A hand-off naming `TASK-###` sends someone to a file that does not exist.

### The three things only a human can do

Name them with **this** project's specifics, not generic wording:

| Action | Why it cannot be automated |
|---|---|
| **Wire the fitness functions into CI** | They fail a build. Nothing here can reach your build |
| **Buy the generic subdomains** — *name them* | Someone has to choose a vendor and pay |
| **Perform one restore before launch** | A backup nobody has restored is a hypothesis |

The third is the one that gets skipped, and it is the one that matters at 3am.

---

## What the report is not

| Not | Because |
|---|---|
| A summary of the workspace | The workspace is right there. This says what is **unresolved** |
| A fix | It reports; the developer decides what to do |
| A nag | It is shown once. Later runs do not re-raise the same `[TODO]`s |
| Recorded anywhere | Shown to one person, once. There is no telemetry and no log |

---

## If the hand-off does not work

If a fresh session given that block does not restate the task and wait — **that is not a
defect in this report.**

It means the generated workspace does not govern, which is the risk this whole product exists
to address. **Raise it.** Do not reword the hand-off until the symptom goes away.
