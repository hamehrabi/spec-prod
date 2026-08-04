# The stage acceptance gate — present, then accept · revise · stop

After a round's files are written and **before the next round's questions are asked**, show
the developer what the round produced and wait for a decision.

**This exists because of one failure mode.** A developer can answer eight rounds and receive
ninety files they have never looked at — structurally complete, substantively hollow. Every
other check in this kit verifies that the workspace is *well-formed*. This is the only one
that gives the developer a chance to notice it is *wrong*.

---

## What the gate shows

**Four sections. Not a file listing.**

A list of paths can be skimmed in a second and proves nothing was read. A decision can be
disagreed with — and disagreement is the entire point.

### 1. Files written

Orientation only. Paths, and whether any was skipped.

### 2. Decisions recorded — one line each

What this round **decided**, in the developer's own terms. Not "wrote requirements.md" but
*"core subdomain: donor history, because that is what they said they compete on"*.

### 3. Inferences drawn instead of asking

Every question that was **not** asked, and what was concluded instead — each naming the answer
it came from.

This is the developer's only chance to correct a wrong inference before it propagates through
six more rounds. An inference nobody was shown is a hidden assumption, and this kit forbids
those everywhere else.

### 4. `[TODO]`s created, with their `Q-###`

Gaps, visible at the moment they are made rather than only in a closing report the developer
reads once, at the end, when changing anything is expensive.

### State the counts first

> "4 decisions, 2 inferences, 1 `[TODO]`."

A reader skimming needs the shape before the detail.

---

## The three choices

Exactly three, named **in words**. No single-key shortcuts, no colour coding.

| Choice | What happens |
|---|---|
| **accept** | Append a dated row to `spec/01-docs/09-change-control/spec-change-log.md`, then continue to the next round |
| **revise** | Re-ask **this round only**, rewrite **this round's** files in place, and present this gate again |
| **stop** | End the session. Every accepted round stays on disk, and re-running resumes at the unaccepted round |

All three leave a valid, resumable workspace. **`stop` is not failure** — it is the honest way
to move faster, and it is what to offer anyone asking to skip the gate.

### `revise` touches this round only

Earlier rounds are already accepted; later rounds do not exist yet. If `revise` ever appears
to need re-running a later round, the round boundaries are wrong — and that is a bigger
finding than this gate. **Stop and report it.**

Re-asking mints no duplicate identifiers: an identifier is never reused, so a rewritten file
carries the same IDs it defined, and any genuinely new item gets the next number (BR-007).

---

## How acceptance is recorded

**A dated row in the generated change-control artifact. Never a file.**

```
| Date | Stage | Accepted by | Note |
|---|---|---|---|
| 2026-08-04 | Round 1 — the idea | Developer | 4 decisions, 2 inferences, 1 TODO |
```

**Never create an acceptance, progress, approval, or state file** — not `.accepted.json`, not
`spec/.progress`, not under any other name. ADR-004 forbids a second source of truth, and
ADR-006 closed this exact question: a convenience is not a good enough reason to reopen it.
Which stages are accepted is derived by **reading those rows**.

**Accepting twice appends nothing.** If a row already exists for this stage, the stage is
accepted; say so and move on. Re-running an intake must not accumulate rows.

---

## Never proceed on silence

If no answer comes, **keep waiting**. Silence is not consent, and it is not `accept`.

This is the instruction most easily softened into helpfulness — the developer seems busy, the
round looks fine, continuing seems kind. The whole product exists because unsupervised
plausible work is expensive, and a gate that opens itself has reproduced the problem inside
the tool built to solve it.

**The gate is never skippable.** Not at express depth, not on request, not for an experienced
developer, not because the round was small. Asked to stop asking, the answer is:

> "I can't skip the acceptance step — it's the only thing making sure you've seen what I
>  wrote. What I can do is `stop`, which ends the session here and keeps everything accepted
>  so far. You can resume any time."

---

## The empty state — the one most likely to be got wrong

A round that recorded **no decisions**, drew **no inferences**, and created **no `[TODO]`s**
is **suspicious, not clean.** Say so plainly:

> "Round N produced files but recorded no decisions. That may mean the questions did not
>  extract anything — worth checking before accepting."

**Never render an empty review as a clean bill of health.** An empty gate and a thorough one
look identical if you only print what you have; the difference has to be stated.

---

## When a round was written but never accepted

Files on disk with **no matching acceptance row** means the session ended between the write
and the decision. On the next run: **re-present that gate.**

Do **not** re-ask the round — the answers are already reflected in the files. Do **not**
advance past it. The developer is being asked the same question they were asked before, and
they have not answered it yet.

*(The resume side of this is wired in `instructions/resume.md`, which TASK-007 creates.)*

---

## What the gate never does

| Never | Why |
|---|---|
| Show full file contents | ~90 files cannot be read in a gate. Offering them produces scrolling, not reading |
| Edit anything | It presents and asks. `revise` re-runs the round; the gate itself changes nothing |
| Accept part of a round | Different feature, different shape — ADR-006 *Revisit when* |
| Gate individual file writes | That is the host's per-file prompt, a different question entirely |

> **The honest limit.** This raises the cost of not reading. It cannot make reading
> mandatory, and pretending otherwise would be the decoration this kit exists to prevent.
