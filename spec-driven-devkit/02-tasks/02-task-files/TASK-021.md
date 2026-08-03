# TASK-021: Blueprint integrity manifest and verification

**Task ID:** TASK-021 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-042 (integrity manifest, verified before writing) · REQ-F-003 · ADR-001 (library is
read-only) · SEC-Z-004

## Business reason

**The blueprint library is the authority.** Every generated specification is a copy of one,
filled in. A blueprint that is altered, truncated, or missing does not produce an obvious
error — it produces a **specification that is subtly wrong and entirely plausible**, which is
the worst failure this product has.

It is **P0 and sits before TASK-005**, because the fill procedure must never read a library
nobody has verified.

## Goal

An integrity manifest listing every blueprint with its checksum, verified before the first
write and again at the end of a run.

## Inputs

- The packaged library from TASK-003
- [`security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md) §7 — the blueprint-library feature spec
- [`technical-spec.md`](../../01-docs/04-technical-spec/technical-spec.md) §11 check 15

## Expected files or components

```
blueprints/MANIFEST.md        <- NEW: every blueprint path + checksum + deliberate exclusions
instructions/integrity.md     <- NEW: verify before first write; verify again at the end
instructions/intake.md        <- gains: integrity check is a PRECONDITION of the run
```

`MANIFEST.md` is Markdown, like everything else (ADR-002) — a table of path, checksum, and a
short note for each deliberate exclusion.

## Expected output

**Before the first write:**
- Every manifest entry exists on disk, and its checksum matches
- Every blueprint on disk appears in the manifest — **an unlisted blueprint is a failure**, not a bonus
- Deliberate exclusions (e.g. `appendix-index.md`) are listed **with their reason**

**At the end of the run:** every checksum is unchanged — proving the library was read and never written.

**On any mismatch:** stop, name the file and whether it was altered, missing, or unlisted, and
**write nothing**.

## Step-by-step instructions

1. Generate `blueprints/MANIFEST.md`: path, checksum, and reason-for-exclusion where applicable.
2. Create `instructions/integrity.md`: the pre-write check and the post-run check.
3. Wire the pre-write check as a **precondition** in `intake.md` — before question one, not before the first write of round one.
4. Specify the failure message: name the file, name **which** of the three problems it is, and say that nothing was written.
5. Wire the post-run check into validation as check 15.
6. Make the manifest regenerable, and make regeneration an explicit, reviewable act — never automatic.

## Dependencies

TASK-003.

## Constraints / Boundaries

- **Never proceed on a near match.** A single altered byte stops the run.
- **Never regenerate the manifest automatically to make a check pass.** That converts the
  control into a formality, and it is the single most likely way this task gets defeated.
- Never write to a blueprint (ADR-001). The post-run check proves it.
- The manifest is Markdown (ADR-002) — no binary format, no lockfile.
- An **unlisted** blueprint is a failure. Silent additions are as bad as silent alterations.

## Do not change

- Anything in `spec/`.
- The **content** of any blueprint. This task measures the library; it does not edit it.
- Blueprint paths or filenames — a rename is a **major version with a migration note** (ADR-005).

## Acceptance check / Done criteria

- [ ] `MANIFEST.md` lists every blueprint with a checksum
- [ ] Deliberate exclusions are listed **with reasons**
- [ ] The check runs **before question one** and stops the run on any mismatch
- [ ] An altered blueprint stops the run and is named
- [ ] A missing blueprint stops the run and is named
- [ ] An **unlisted** blueprint stops the run and is named
- [ ] Post-run checksums are identical — the library was never written
- [ ] Manifest regeneration is explicit and reviewable, never automatic

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-046 | Alter one blueprint by one byte | Stops **before writing anything**; names it |
| UTEST-030 | All match / one unlisted | Proceed / stop |
| FTEST-020 | Altered or missing blueprint | Named failure; **no file written** |
| STEST-015 | Full intake with a tampered library | Nothing produced from an altered template |
| ETEST-015 | Full run | Checksums identical before and after |

## Review checklist

- [ ] Matches REQ-F-042, ADR-001, SEC-Z-004
- [ ] No unrelated feature added
- [ ] Every failure mode (altered · missing · unlisted) seen to fail
- [ ] The failure message names the file **and** which problem it is
- [ ] Only approved files changed
- [ ] Traceability matrix updated

## Out of scope

- Signing or cryptographic provenance. Checksums detect accident and casual tampering; they
  are not a supply-chain control, and claiming otherwise would overstate them.
- Repairing a mismatched library — it **stops and reports**. Reinstalling is the developer's action.
- Blueprint **coverage** (was every blueprint used?) — that is TASK-022.

## Stop condition

**Stop and ask if:**
- Checksums differ across platforms for the same file. That is a **line-ending** problem
  (CON-004), and normalising it away silently would make the control meaningless. It needs a
  stated rule about what is checksummed.
- The manifest would need to be regenerated during a normal run. **It must not.** If something
  forces that, the design is wrong — a control that rewrites itself to pass is not a control.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
