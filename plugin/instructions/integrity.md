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

Use the host's own tools:

1. **Read** `blueprints/MANIFEST.md`.
2. **Hash the whole library in ONE command.** Not one command per blueprint — one command for
   all of them, printing every digest at once.

   **Try these in order and stop at the first that runs.** They are ordered by how much of a
   command a cautious host will allow, not by elegance: the first uses nothing but filename
   expansion, and the ones below it use a pipe, a redirection, or `-exec`, each of which some
   hosts refuse on sight.

   ```
   1  glob only    sha256sum *.md */*.md */*/*.md */*/*/*.md
   2  PowerShell   Get-FileHash -Algorithm SHA256 -Path *.md,*\*.md,*\*\*.md,*\*\*\*.md
   3  macOS        shasum -a 256 *.md */*.md */*/*.md */*/*/*.md
   4  find         find . -name '*.md' ! -name MANIFEST.md -exec sha256sum {} +
   ```

   Run it from inside `blueprints/`. Forms 1 to 3 also hash `MANIFEST.md` itself, which the
   manifest does not list — **ignore that one line.** It is not an unlisted blueprint.

   The glob covers four levels because that is how deep the library goes. A blueprint deeper
   than that is not silently skipped: the manifest lists it, the digests do not, and it is
   reported as **missing**. Wrong, but loudly wrong, which is the failure mode to prefer.

   A command that computes and prints is fine. **A command that creates a file is not.**
3. Compare the printed digests against the manifest, and compare the file list both ways to
   find anything missing or unlisted.

### If a command is refused, that is not the host being unable

**A refused command is not permission to hash one file at a time.** Work down the list. If
every form is refused, use the stop message below — the check did not run, and that is a
complete outcome.

This is the exact route by which BUG-005 comes back. A run traced in a guarded session had
all four forms refused, and began hashing blueprints individually with literal paths: each
step was correct, each was permitted, and the developer was four minutes into a silent screen
having been asked nothing. The instruction below said to stop only when the host "cannot
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
