# ADR-003: Copy the blueprint file, then fill it in

**ADR ID:** ADR-003
**Status:** Accepted
**Date:** 2026-08-03
**Decision owner:** Kit author
**Review date:** After the first ten real intakes

---

## Context

REQ-F-016 requires every generated file to use the section structure of its blueprint, and
AC-012 tests it. There are two fundamentally different ways to get there, and the choice
determines which failure mode the product has — because each option has one, and they are
opposites.

The blueprint files are not bare skeletons. Each contains its section structure *and*
guidance prose *and* a `# WORKED EXAMPLE` section built around a sample product. BR-002
forbids any of that example reaching the developer's file. So whichever option is chosen,
something has to be removed or something has to be reconstructed.

## Options considered

1. **Author fresh from the blueprint** — the agent reads the template to learn its
   structure, then writes the developer's file from scratch.
   *Benefit:* clean output with no scaffolding to leak. Nothing to strip, so BR-002 is
   satisfied by construction. Prose can be written to fit the developer's project rather
   than adapted around a template's phrasing.
   *Cost:* **structure drifts.** A section gets renamed, reordered, merged, or quietly
   dropped because it seemed irrelevant. AC-012 then fails, and — worse — a *missing*
   section is invisible in the output. Nothing on the page says "there should have been a
   Compliance field here."

2. **Copy the file, then fill it in** — copy the blueprint to its destination, delete the
   worked example, replace every placeholder with the developer's content.
   *Benefit:* structure is guaranteed, not hoped for. Every section, table, and checklist
   arrives intact because it was never re-derived. A section cannot be silently dropped,
   because dropping requires an explicit deletion.
   *Cost:* **leftover template text**, and it is a nastier failure than it sounds. An
   unreplaced placeholder or a surviving line of guidance prose does not look like an error;
   it looks like a filled answer. A developer reading `*Short working name.*` in an italic
   cell may not register that nobody answered it.

3. **Copy the structure, drop the prose** — mechanically extract headings and tables, then
   fill only those.
   *Benefit:* structure guaranteed and scaffolding cannot leak — it appears to take the
   best of both.
   *Cost:* the guidance prose is a large part of what makes the blueprints valuable. The
   warnings ("if no trade-off is visible, keep looking"), the beginner rules, the
   "why each field matters" tables — these are what a developer reads when they do not know
   what a section is for. Extracting only headings produces a workspace that is structurally
   perfect and pedagogically empty, which is the hollow-spec risk (RSK-2) arriving by a new
   route.

*Compared on:* which failure mode is detectable · which failure is more damaging when
undetected · which preserves the value that is actually in the blueprint library.

## Decision

**Copy the blueprint file, then fill it in**, following the six-step fill procedure in
[`technical-spec.md`](../../04-technical-spec/technical-spec.md) §4.

## Reason

The deciding factor is **detectability**, not elegance. Both options 1 and 2 fail sometimes;
the question is whether a check can find the failure.

- Option 1's failure — a missing section — requires knowing what *should* have been there.
  Detecting it means comparing the output against the blueprint's structure, which is most
  of the work of option 2 anyway, done afterwards and less reliably.
- Option 2's failure — surviving template text — is a **string search**. Placeholder tokens,
  instructional italics, and the worked-example heading are all findable by looking for them.

A failure you can grep for is strictly better than a failure you have to reason about,
particularly in a system with no compiler (ADR-002). Option 3 was rejected because it
optimises for the structural check while discarding the reason anyone wants the templates.

## Consequences

- **Positive:** AC-012 becomes nearly free. Every section arrives. Guidance prose is
  preserved, so the generated workspace teaches as well as records. The kit author's edits
  to a blueprint appear in generated files without any change to the instruction set —
  which is ADR-001's boundary working as intended.
- **Trade-off or limitation:** **The characteristic failure of this product is now leftover
  template text.** It is silent, it reads as an answer, and it will happen. Validation check
  5 exists solely for it, and it is the check most likely to be the difference between a
  usable workspace and a hollow-looking one.
- **Second limitation:** the blueprints' prose is written for a general reader, so some of
  it will read slightly oddly in a specific project. That is accepted — generic guidance
  present beats specific guidance absent.
- **Rule the AI assistant must follow during implementation:** Never author a generated file
  from memory of a blueprint. Copy the file first. Then delete the worked example and the
  generic prompt boxes. Then replace **every** placeholder, empty table row, and
  instructional italic — with content or with `[TODO: <exact question>]`. Never leave one
  because it seemed unimportant.

## Compliance

| Enforced by | Where |
|---|---|
| **FF-005** — no generated file contains a surviving placeholder token, instructional italic, or worked-example heading | [`fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |
| **FF-006** — no generated file contains worked-example content (BR-002) | `fitness-functions.md` |
| **FF-007** — every generated file's section headings match its blueprint's, in order | `fitness-functions.md` |

## Revisit when

- Validation check 5 keeps failing across many real intakes. That would mean the fill step
  is unreliable in practice, and option 3 — structure-only extraction, with the guidance
  moved somewhere the developer can still reach — becomes the better trade.
- The blueprints stop containing worked examples and guidance prose. If they became bare
  skeletons, options 2 and 3 converge and the trade-off disappears.

## Impact

| Dimension | Impact |
|---|---|
| Security | Neutral. |
| Reliability | Positive for structure, negative for content — a new, silent failure mode is introduced deliberately because it is detectable. |
| Performance | Slightly negative — every blueprint is read and written in full. Irrelevant at ~90 Markdown files. |
| Cost | Lower than authoring fresh; the structure is not re-derived each time. |
| Maintainability | Positive. Blueprint edits propagate to output with no instruction-set change. |

## Related

- Related requirements: REQ-F-016, REQ-F-027, BR-002, AC-012, AC-022
- Related technical spec sections: §4 The fill procedure, §11 check 5
- Supersedes / superseded by: —

> Blueprint: ../../../../spec-driven-template/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
