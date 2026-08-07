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

   **On Windows, where neither of those exists, use PowerShell** — one line, no file created:

   ```
   $h = Get-ChildItem -Recurse -Filter *.md | Where-Object { $_.Name -ne 'MANIFEST.md' } | Get-FileHash -Algorithm SHA256 | ForEach-Object { $_.Hash.ToLower() } | Sort-Object; $b = [Text.Encoding]::UTF8.GetBytes(($h -join "`n") + "`n"); ([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($b)) -replace '-','').ToLower()
   ```

3. **Compare the two strings.** Equal means the library is intact — every file, its contents,
   and the fact that nothing was added. The check is finished; **do not also compare the
   per-file table.**

### The Windows form is not optional, and not interchangeable

CON-004 requires the kit to behave identically on Windows, macOS and Linux. `sha256sum` and
`shasum` are both POSIX tools; on a Windows host without Git Bash or WSL **neither exists**,
so for that developer Step 0 could never run and the kit stopped before question one. That
is not a degraded experience — it is the whole product refusing to start.

The PowerShell line above was **verified by execution against this library**: it produces
`8c414fa508c617d6ec75b1c7b1d0cc523c71db7c9eeeb1bb6540c82c6f6eaee1`, byte-identical to what
the POSIX form produces and to the manifest's declared digest. It uses only built-ins that
ship with Windows, and it **creates no file** — the accumulation happens in a variable and
the final hash is computed in memory, which is what keeps it inside the BUG-004 rule.

Do not "simplify" it. The obvious simplification is to write the digest list to a temp file
and hash that, and **that is forbidden** — it is BUG-004 exactly. The second most obvious is
`Compare-Object`, which is BUG-022 exactly. This form was chosen because it avoids both and
was observed to survive a guarded session.

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

### Do not add a redirection — `2>/dev/null` is the one that keeps happening

**Add nothing to the command. In particular, never append `2>/dev/null`** — or `2>$null`,
or `2>nul`, or any other redirection.

The motive is real, so read why it is wrong rather than just obeying it. The library is four
levels deep at its deepest, but not every branch goes that far, so `*/*/*/*.md` matches
nothing in some installs and the shell prints `No such file or directory` to stderr. That
line looks like a failure. It is not.

**The unmatched glob is expected, and the command has already succeeded.** The digests are on
stdout; the complaint is on stderr; `sort` and the second hash never see it. Nothing is
missing from the result — a glob that matches nothing contributes nothing, and the shallower
globs have already covered every file that exists.

Suppressing it costs the whole check. `2>` is a redirection, a redirection reads as **file
creation** to a permission guard, and the guard denies the command that would otherwise have
worked. This is BUG-025: a traced run had the correct command, added `2>/dev/null` to tidy up
a message that did not matter, and was refused — then treated the refusal as the host being
unable, which is the doorway back to BUG-005.

Trading a working check for a quieter one is a bad trade at any price. **If stderr says a
glob matched nothing, read the digest off stdout and carry on.**

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

**First, check that you ran the command as written.** A command refused because you added
something to it is not the host refusing the check — it is refusing your addition. Run the
documented form unaltered before concluding anything about the host.

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
