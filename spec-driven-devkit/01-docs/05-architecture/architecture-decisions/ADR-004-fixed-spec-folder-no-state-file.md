# ADR-004: A fixed `spec/` folder is the only writable target, and the only state store

**ADR ID:** ADR-004
**Status:** Accepted
**Date:** 2026-08-03
**Decision owner:** Kit author
**Review date:** After the first ten real intakes

---

## Context

Two questions look separate and are the same decision. **Where does the generated workspace
go?** and **where does intake keep track of how far it got?**

They are the same because the answer to the first determines whether the second needs an
answer at all. The workspace has to hold ~90 files with relative links between them, and
resume (REQ-F-028) has to work after an arbitrary interruption. Meanwhile CON-005 says an
existing repository must never be modified without asking, so wherever the kit writes, that
place has to be defensible as *ours* rather than *theirs*.

## Options considered

**On location:**

1. **A fixed folder at the repository root (`spec/`)** — one known path, always.
   *Benefit:* every relative link inside the workspace is computable at authoring time
   rather than per run. A build agent can be told where to look without being told. The
   boundary rule becomes one sentence: writes go under `spec/`.
   *Cost:* one workspace per repository. A monorepo with two products cannot have two
   workspaces without a convention that does not yet exist. Collides in any repo already
   using `spec/` for something else.

2. **Named after the product during intake** (`task-manager/`) — the source method's own
   convention.
   *Benefit:* multiple workspaces per repository; the folder name carries meaning.
   *Cost:* every relative link must be computed per run, and the boundary rule becomes
   "under whatever folder we chose earlier", which resume must rediscover before it can do
   anything. It also makes the workspace root indistinguishable from a source folder.

3. **Configurable with a documented default.**
   *Benefit:* covers both.
   *Cost:* a setting is a branch, and the Simplicity driver's measure counts branches. It
   also creates a class of failure where the configured path and the generated links
   disagree, which is undetectable without reading both.

**On state:**

4. **A state file** (`spec/.intake-state.json`) recording round, answers, and progress.
   *Benefit:* resume is trivial — read the file, continue. Changing an early answer could
   in principle re-derive later files.
   *Cost:* **two sources of truth.** The moment a developer hand-edits a spec, the state
   file is lying, and nothing detects it. It is also forbidden by CON-001's spirit — a
   store the kit owns, separate from the artifacts.

5. **Derive state by inspecting which artifacts exist.**
   *Benefit:* one source of truth, which is the same thing a human or a later agent reads.
   Hand-edits cannot desynchronise it, because there is nothing to desynchronise.
   *Cost:* more work to implement, and it **cannot distinguish a file the kit wrote from a
   file the developer edited afterwards** — so re-deriving an early answer is impossible.
   Correcting a Round 2 decision at Round 7 is a manual edit across several files.

*Compared on:* how many things can disagree with each other · what a later reader (human or
agent) can rely on without being told · which is cheaper to reverse.

## Decision

**A fixed `spec/` folder at the repository root, and no state file.** Stage completeness is
derived by inspecting which artifacts exist. The workspace is simultaneously the output and
the entire state store.

## Reason

Option 4 is the tempting one and it is wrong for a specific reason: this product's whole
proposition is that the specification is the truth. A hidden state file that can disagree
with the specification contradicts the thing being sold. The first time a developer
hand-edits `requirements.md` and resume acts on stale answers, the kit has demonstrated the
exact failure it exists to prevent.

The fixed folder is what makes option 5 affordable. With a known root, "which stage is
complete" is a question about which paths exist — cheap to answer, and answerable by anyone,
including a build agent that was never present for the interview.

## Consequences

- **Positive:** One source of truth. Every relative link is computable at authoring time.
  The boundary rule is one sentence and therefore testable. Hand-edits are safe by
  construction — the kit reads what is there, not what it remembers.
- **Trade-off or limitation:** **There is no replay.** Changing an early answer does not
  re-derive later files; it is a manual edit across several of them. This is a genuine cost
  paid by real users, and it is documented in
  [`database-design.md`](../../06-api-and-data-design/database-design.md) §0 rather than
  discovered.
- **Second limitation:** one workspace per repository. Monorepos with two products are not
  supported in v1, and `spec/` collides in a repository already using that name — with no
  fallback yet defined. `[TODO: what happens when spec/ exists and is not a kit workspace?
  Refuse, or ask for an alternative name? Raise before release.]`
- **Rule the AI assistant must follow during implementation:** Never create a state,
  progress, session, cache, or answer file anywhere. Never write outside `spec/` without
  stopping to ask, naming the file. Determine progress by reading the workspace, never by
  reading a record of what was done.

## Compliance

| Enforced by | Where |
|---|---|
| **FF-010** — the plugin creates no file outside `spec/` in a full intake, and no state/progress/cache file anywhere | [`fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |
| **STEST-002, STEST-003** — deny tests for a write outside `spec/` and for a path that normalises outside it | `03-tests/03-non-functional/security-tests.md` |

## Revisit when

- Monorepo demand appears. Supporting two workspaces means reopening the location decision,
  and option 2 becomes correct — at the cost of per-run link computation.
- The no-replay cost becomes the top complaint. The answer is a documented
  "revise a decision" procedure, **not** a state file — that path is closed by this ADR and
  reopening it requires superseding this record.

## Impact

| Dimension | Impact |
|---|---|
| Security | Positive. A single fixed writable root makes the boundary rule simple enough to test exhaustively. |
| Reliability | Positive. Nothing can desynchronise, because there is only one record. |
| Performance | Negligible — deriving stage means checking which paths exist. |
| Cost | Slightly higher to implement than a state file; much lower to support. |
| Maintainability | Positive, with one sharp edge: correcting an early answer is manual. |

## Related

- Related requirements: REQ-F-014, REQ-F-024, REQ-F-028, REQ-R-002, BR-008, CON-001, CON-005
- Related technical spec sections: §2 State ownership, §4 Authorization, §7.2
- Supersedes / superseded by: —

> Blueprint: ../../../../spec-driven-template/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
