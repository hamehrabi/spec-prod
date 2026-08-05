# Library integrity — verify before, verify after

The blueprint library is the **authority**. Every generated specification is a copy of a
blueprint with the developer's answers filled in. An altered blueprint does not produce an
obvious error — it produces a specification that is **subtly wrong and entirely plausible**,
which is the worst failure this product has.

This check runs **twice**, and both runs are obligatory.

---

## How to verify — and what you must never do to manage it

**Never create a file to perform this check.** Not a script, not a helper, not a temporary
file, not in `spec/`, not in the developer's repository, not anywhere. A check that writes
something in order to run has already broken the boundary it exists to protect, and it does
it *before the preamble* — before the developer has seen a single word.

This is not hypothetical: it is BUG-004, and it happened on the first real run.

**The check is two commands and one string comparison.** Run them from inside `blueprints/`.

1. **Read** `blueprints/MANIFEST.md` and take the value on its **Library digest** line.
2. **Compute the same value in one command:**

   ```
   POSIX shell    sha256sum *.md */*.md */*/*.md */*/*/*.md | grep -v MANIFEST | cut -c1-64 | sort | sha256sum
   macOS          shasum -a 256 *.md */*.md */*/*.md */*/*/*.md | grep -v MANIFEST | cut -c1-64 | sort | shasum -a 256
   ```

3. **Compare the two strings.** Equal means the library is intact — every file, its contents,
   and the fact that nothing was added. The check is finished; **do not also compare the
   per-file table.**

### Use these commands as written

**Do not compose your own, and do not fold the comparison into the command.** The comparison
happens when you read two strings, not in a shell.

This is not fussiness — it is the whole of BUG-022. A traced run reached all 81 digests in
five and a half minutes and then spent **another four and a half** trying to make a shell
perform the comparison: `Compare-Object`, then subexpressions, then `.Count`, then
parenthesised sub-pipelines, each refused by a different guard. Nine minutes on Step 0, no
question asked, nothing written. The commands above are chosen because they survive those
guards. A cleverer one probably will not, and finding out costs the developer the same nine
minutes every time.

If the pipeline is refused, `sha256sum *.md */*.md */*/*.md */*/*/*.md` alone still prints
every digest — but that leaves you comparing 81 strings by eye, which is the state this
section exists to avoid. Prefer the stop message.

### What the per-file table is for

**Only for naming which blueprint moved, after the digest line has already said one did.**
It is never the first comparison, and it is never a substitute for the digest.

Read it when — and only when — the two strings differ:

| Problem | Means |
|---|---|
| **Altered** | The file is present; its digest differs from the manifest's row |
| **Missing** | The manifest lists it; the digest output does not |
| **Unlisted** | The digest output has it; the manifest does not |

The glob covers four levels because that is how deep the library goes, and it drops the
manifest's own line with `grep -v MANIFEST` because a filename glob cannot exclude one file.
FF-017 fails the merge if any blueprint path ever contains that word, so the command cannot
quietly start skipping a file.

A command that computes and prints is fine. **A command that creates a file is not.**

### If a command is refused, that is not the host being unable

**A refused command is not permission to hash one file at a time.** Try the other form. If
both are refused, use the stop message below — the check did not run, and that is a complete
outcome.

This is the exact route by which BUG-005 comes back. A run traced in a guarded session had
every command it tried refused, and began hashing blueprints individually with literal paths:
each step was correct, each was permitted, and the developer was four minutes into a silent
screen having been asked nothing. The instruction said to stop only when the host "cannot
compute a digest at all" — and it plainly could, one file at a time. So the run kept going.

**Per-file hashing is forbidden even when it is the only thing that works.** Eighty-one
round-trips is not a slower verification, it is a different product: one that appears hung
before it has said a word.

> **Why "one command" is a rule and not a nicety.** Hashing all 81 blueprints costs **0.19
> seconds** as a single command. Done one file at a time it is 81 round-trips, and a run
> measured at over **thirty minutes** produced no output at all and never reached the
> preamble — the developer sees a silent, apparently hung tool before they have been asked
> anything. That is BUG-005, and it made the product unusable while every individual step
> behaved exactly as written.
>
> The same rule applies to every future check that walks the library: **the library is
> examined in one pass, never per file.**

**If no whole-library command will run** — the host has no hasher, or refused every form
above — stop and say so:

```
"I could not verify the blueprint library, because this session has no way to compute
 file checksums for the whole library at once. Nothing was written. Verification is
 required before any file is created, so I am stopping rather than proceeding on an
 unverified library."
```

Say which it was: no hasher, or refused. They send the developer to different places — one is
a missing tool, the other is a permission rule they can change.

Stopping is correct here. Proceeding would be reporting success on a check that did not run,
which is the one thing this product must never do (BR-009) — and improvising a way to run it
is how BUG-004 happened.

## Run 1 — before the first question

Not before the first write. **Before question one.** A developer who answers eight rounds and
is then told the library was corrupt has been made to waste the whole interview.

Compare `blueprints/MANIFEST.md` against the library on disk:

| Problem | Means | Say |
|---|---|---|
| **Altered** | The file is present; its checksum differs from the manifest | `Blueprint <path> does not match the integrity manifest (altered).` |
| **Missing** | The manifest lists it; it is not on disk | `Blueprint <path> is listed in the manifest but missing from the installed plugin.` |
| **Unlisted** | It is on disk; the manifest does not list it | `Blueprint <path> is in the library but not in the integrity manifest (unlisted).` |

**Name which of the three it is.** "Integrity check failed" sends the developer looking for
the wrong thing — altered means reinstall, unlisted means someone added a file without
regenerating the manifest, missing means the install is incomplete. One message for three
causes helps with none of them.

Then stop, and say plainly: **nothing was written.**

```
- Failure state: LIBRARY_INTEGRITY_FAILED
  - Trigger:       Any altered, missing, or unlisted blueprint, before question one.
  - Recovery path: None inside the run. Reinstall the plugin.
  - User message:  "<the named problem above>. Nothing was written. Reinstalling the
                    plugin restores the library."
  - Never:         proceed on a near match; repair the file; regenerate the manifest.
```

**Never proceed on a close match.** A single altered byte stops the run. There is no
threshold below which a corrupted authority is acceptable, because the output of a
near-correct blueprint is a document nobody can tell is wrong.

## Run 2 — at the end, as validation check 15

Re-verify every checksum. This run proves something different from the first: that **this run
read the library and never wrote to it** (ADR-001). Report it as a check that ran, with its
result — passed, failed, or not run — and never infer one from another.

A mismatch here means the intake modified its own authority mid-run. Report it as a failure
of the run, not of the library.

---

## What must never happen

| Temptation | Why not |
|---|---|
| Regenerate the manifest so the check passes | **A control that rewrites itself to pass is not a control.** Regeneration is the kit author's deliberate act, in its own commit, alongside the blueprint change that caused it. Nothing inside an intake may do it |
| Repair or re-download the altered blueprint | The kit does not fetch (CON-003) and does not edit its own library. Reinstalling is the developer's action, and it is the honest one |
| Skip the check when the run is a resume | A resumed run reads the same library and produces the same kind of file. Resume is when a stale or partially reinstalled plugin is *most* likely |
| Treat *unlisted* as harmless | A silent addition is as bad as a silent alteration. Something is in the library that nobody recorded putting there |
| Report "verified" when the manifest is absent | Unverifiable is not the same as fine. No manifest means the library has no authority, and that is a failure |

## What this check does not claim

It detects **accident and casual tampering**. It is not provenance and not a supply-chain
control — anyone who can alter a blueprint can regenerate the manifest. Saying so plainly is
the difference between a control and a reassurance.
