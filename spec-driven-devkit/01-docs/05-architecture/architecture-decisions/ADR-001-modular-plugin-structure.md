# ADR-001: Four separated modules inside one plugin

**ADR ID:** ADR-001
**Status:** Accepted
**Date:** 2026-08-03
**Decision owner:** Kit author
**Review date:** After the first ten real intakes

---

## Context

The kit is a Claude Code plugin: a folder of files installed into a repository (CON-001).
It has to hold four different kinds of content — orchestration rules, interview questions,
~90 blueprint templates, and a list of validation checks — and REQ-NF-005 requires that a
blueprint can be edited without touching the question flow, and a question added without
touching a blueprint.

The existing prototype, `MASTER-PROMPT.md`, is a single 40 KB file holding all four. It
works, and it demonstrates the method. It also means every template tweak is an edit to the
same file that contains the interview, which is precisely the coupling REQ-NF-005 forbids.

There is no deployment topology to decide here — nothing is hosted, nothing is
distributed, nothing scales. The only real question is **internal structure**.

## Options considered

1. **Single instruction file** (the status quo) — one Markdown file containing
   orchestration, questions, blueprint structure, and checks.
   *Benefit:* trivially simple; one file to read, install, and reason about; no
   cross-references to break.
   *Cost:* violates REQ-NF-005 outright. Every question edit risks a blueprint, and the
   file grows without bound as templates are added. Makes the swap-cost measure of the
   Simplicity driver unsatisfiable by construction.

2. **Four separated modules in one plugin** — manifest, intake instruction set, question
   set, blueprint library, validation checklist, each owning one concern.
   *Benefit:* satisfies REQ-NF-005; boundaries are decidable by inspection (a question
   inside a blueprint is visibly wrong), which makes FF-001/FF-002 computable.
   *Cost:* four places to look instead of one. Cross-references between modules can break
   silently. A contributor must understand the boundaries before contributing.

3. **One file per generated artifact** — ~90 self-contained units, each holding its own
   blueprint, its own questions, and its own checks.
   *Benefit:* maximum locality; changing one output touches exactly one file.
   *Cost:* the interview is inherently cross-cutting — Round 2's answers drive Round 7's
   task files — so orchestration would be smeared across ninety files with no owner. The
   eight-round limit and the inference rules would have no home. This option is what the
   third-design rule surfaced, and examining it is what made clear that **orchestration is
   a real module**, not glue.

*Compared on:* which structure keeps the two things the kit author actually edits —
questions and templates — independent; which makes a boundary violation visible rather than
arguable; which is cheaper to reverse.

## Decision

**Four separated modules inside one plugin**, as specified in
[`technical-spec.md`](../../04-technical-spec/technical-spec.md) §2: plugin manifest ·
intake instruction set · question set · blueprint library · validation checklist. One
deployable unit. A modular monolith, in the only sense that word can apply to a folder of
Markdown.

## Reason

REQ-NF-005 is not a preference; it is the observable measure of the Simplicity driver, and
option 1 cannot satisfy it at any effort. Option 3 fails for the opposite reason — it
distributes something that is genuinely centralised. Option 2 is the only one where the two
edits the kit author will actually make most often are independent, and where a violation
of that independence can be detected by a check rather than argued about in review.

## Consequences

- **Positive:** A blueprint edit and a question edit never collide. Boundary violations are
  visible by inspection, so FF-001 and FF-002 can be automated. New blueprints are added by
  dropping in a file, without touching orchestration.
- **Trade-off or limitation:** Four locations instead of one, and cross-module references
  (the instruction set names blueprint paths) that can break silently when a file moves.
  That breakage is exactly what ADR-005's version stamp exists to diagnose. A contributor
  now has to learn the boundaries before their first change — a real onboarding cost that
  the single-file version did not have.
- **Rule the AI assistant must follow during implementation:** Never place question text
  inside a blueprint. Never place blueprint structure inside the instruction set. Never
  place orchestration rules inside the question set. The blueprint library is read-only at
  runtime.

## Compliance

| Enforced by | Where |
|---|---|
| **FF-001** — exactly one intake command exists | [`fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |
| **FF-002** — a question-set change touches zero blueprint files, and a blueprint change touches zero flow files | `fitness-functions.md` |

## Revisit when

- The blueprint library stops changing independently of the questions — if a year passes in
  which every blueprint edit is accompanied by a question edit, the boundary was imaginary
  and option 1 was right.
- A fifth kind of content appears that fits none of the four modules. That is a signal the
  decomposition lines are wrong, not that a fifth module is needed.

## Impact

| Dimension | Impact |
|---|---|
| Security | Neutral. Boundaries here are about maintainability, not access. |
| Reliability | Slightly negative — cross-module references are a new failure mode (a missing blueprint). Mitigated by the `MISSING_BLUEPRINT` failure state. |
| Performance | None. |
| Cost | Small one-off restructuring of the existing prototype. |
| Maintainability | The entire point. This is the decision that makes REQ-NF-005 achievable. |

## Related

- Related requirements: REQ-NF-005, REQ-F-003, REQ-F-016
- Related technical spec sections: §2 Architecture Overview, §2 Component boundaries
- Supersedes / superseded by: —

> Blueprint: ../../../../spec-driven-template/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
