# Library integrity — verify before, verify after

The blueprint library is the **authority**. Every generated specification is a copy of a
blueprint with the developer's answers filled in. An altered blueprint does not produce an
obvious error — it produces a specification that is **subtly wrong and entirely plausible**,
which is the worst failure this product has.

This check runs **twice**, and both runs are obligatory.

---

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
