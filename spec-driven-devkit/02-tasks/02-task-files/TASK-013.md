# TASK-013: Entry point written last, under 100 lines, version stamped

**Task ID:** TASK-013 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-020 (written last) · REQ-F-026 (never touch an existing `CLAUDE.md`) ·
REQ-NF-009 (under 100 lines) · BR-006 · **ADR-005** (version stamp)

## Business reason

A build agent opening a ~90-file workspace with no memory of the interview needs one small
map. It is written **last** so every link in it is verifiable on the day it is written, and
kept **short** because it loads into every context window — a long one stops being read.

## Goal

An entry-point file at the workspace root: under 100 lines, every path resolving, carrying the
plugin version — and never touching a `CLAUDE.md` the developer already has.

## Inputs

- [`MASTER-PROMPT.md`](../../../spec-driven-template/MASTER-PROMPT.md) — "Write CLAUDE.md" and its exact structure
- [`ADR-005`](../../01-docs/05-architecture/architecture-decisions/ADR-005-version-stamp-generated-workspaces.md)
- [`api-specification.md`](../../01-docs/06-api-and-data-design/api-specification.md) — contract C3

## Expected files or components

```
instructions/entrypoint.md    <- NEW: structure, the 100-line cap, the CLAUDE.md rule
instructions/intake.md        <- gains: entry point is the LAST file written
```

Produces `spec/CLAUDE.md`, plus the printed line when the repository already has one.

## Expected output

- The structure from the master process: *Start here* table · *Working a task* · *Never* ·
  *Commands* · *Where things stand*.
- **Every placeholder replaced.** A `<cmd>` left in the shipped file is worse than an empty
  section — it looks answered. Unknown commands are `[TODO: ask the team]`, never a guess.
- Rows that do not apply are **dropped** (no AI rows for a non-AI project).
- Under 100 lines. Every path resolves.
- The plugin version recorded. **No generation timestamp** (ADR-005).
- If a root `CLAUDE.md` exists: the kit's own goes **inside** `spec/`, and the exact line to
  add is printed. Their file is never proposed for modification.

## Step-by-step instructions

1. Create `instructions/entrypoint.md` with the structure and the hard constraints.
2. Enforce: written **last**, after every file it links to exists.
3. Verify every path before finishing — a broken link on day one is a driver-level failure.
4. Enforce the 100-line cap; if it does not fit, **remove rows**, never shrink the font of the map.
5. Read the plugin version from the manifest; if unreadable, write `[TODO: plugin version could not be determined]`.
6. Implement the existing-`CLAUDE.md` case: write inside `spec/`, print the line, touch nothing.
7. Name the file to match the developer's tool convention if they use a different one, and say so.

## Dependencies

TASK-012.

## Constraints / Boundaries

- **Links, not copies.** Never restate a requirement, a rule, or a schema — point at the file
  that owns it. Duplication here is how the project starts contradicting itself.
- Never exceed 100 lines.
- Never write a timestamp.
- Never modify an existing root `CLAUDE.md`, **even if the developer offers permission** (EV-036).
- Never leave a placeholder.

## Do not change

- Anything in `spec/`.
- The developer's existing `CLAUDE.md`, ever.
- Any earlier instruction module.
- The generated `AGENT.md` — this file **links** to it; it does not summarise or replace it.

## Acceptance check / Done criteria

- [ ] Written last; every path resolves.
- [ ] Under 100 lines.
- [ ] No placeholder survives; unknown commands are `[TODO: ask the team]`.
- [ ] Inapplicable rows dropped.
- [ ] Plugin version present; no timestamp.
- [ ] An existing root `CLAUDE.md` is byte-for-byte unchanged **and was never proposed**.
- [ ] The printed line is copy-pasteable and correct.
- [ ] It links prominently to `AGENT.md` and does not duplicate it.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-021 | Complete workspace | Under 100 lines; all paths resolve |
| TEST-009 | Check write order | Written after every file it links to |
| ETEST-001 | Fresh session reads it | Enough to orient without reading everything |
| FTEST-017 | Old version stamp, moved blueprints | Mismatch named, not reported as a bug |
| STEST-007 | Repo with a root `CLAUDE.md` | Unchanged and never proposed |

## Review checklist

- [ ] Matches REQ-F-020, REQ-F-026, REQ-NF-009, BR-006, ADR-005.
- [ ] No unrelated feature added.
- [ ] Tests pass.
- [ ] It is a **map**, not a manual — no restated rules.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- The closing report and hand-off block (TASK-014).
- `AGENT.md` (TASK-010).
- Updating the entry point when the workspace changes later — a maintenance concern, in
  `spec-drift-checklist.md`.

## Stop condition

**Stop and ask if:**
- The map cannot fit in 100 lines without dropping something a build agent needs. That means
  the **workspace layout** is too complex to navigate, which is a design problem — not a
  reason to exceed the cap.
- The plugin version cannot be read. Write the `[TODO]`. **Never invent a version** — a wrong
  stamp is worse than none, because it will be trusted (ADR-005).

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
