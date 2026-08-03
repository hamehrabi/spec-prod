# ADR-002: Instructions only — the kit ships no executable code

**ADR ID:** ADR-002
**Status:** Accepted
**Date:** 2026-08-03
**Decision owner:** Kit author
**Review date:** After the first ten real intakes

---

## Context

Something has to conduct the interview, copy ~90 templates, fill them, and check the result.
The obvious assumption is that this needs a program. The constraints make that assumption
expensive:

- **CON-004** requires identical behaviour on Windows, macOS, and Linux, which rules out
  shell scripts outright and makes any runtime a cross-platform packaging problem.
- **CON-006** forbids anything the developer must obtain, and **CON-003** forbids fetching
  anything at run time — so a runtime must either already be present or ship inside the
  plugin.
- The core subdomain is *judgement*: which question to ask, what to infer instead of asking,
  when two answers contradict, how deep to write a given file. That is the part a program is
  worst at and a language model is best at.

Meanwhile the host already provides everything an implementation would otherwise need: a
mechanism for asking structured questions, file read/write tools that work on all three
platforms, and a per-file permission prompt.

## Options considered

1. **Instructions only, no runtime** — the "program" is Markdown the agent follows, using
   the host's own tools. This is what `MASTER-PROMPT.md` already does.
   *Benefit:* nothing to install, nothing to version, nothing that can be absent from a
   developer's machine. Cross-platform for free, because the host owns path handling.
   Zero attack surface — the kit cannot execute, only describe. The judgement-heavy core is
   handled by the thing that is good at judgement.
   *Cost:* **non-deterministic.** The same answers may not produce byte-identical files, so
   nothing can be unit-tested with `assertEqual`, and an instruction can be misread in ways
   a compiler would have caught.

2. **A program does everything** — a Node or Python CLI conducts the interview and writes
   the files.
   *Benefit:* deterministic and unit-testable end to end. Repeatable output. Real error
   handling.
   *Cost:* a runtime dependency to detect, version, and fail cleanly without — on three
   platforms. And the interview, the part that carries the product's value, becomes a
   decision tree, which is exactly the thing a config file would have been and which was
   already rejected as out of scope for removing the value.

3. **Hybrid — instructions for the interview, a small program for validation.**
   *Benefit:* judgement where judgement is needed, determinism where determinism is needed.
   The twelve validation checks are mechanical and would genuinely benefit from being code.
   *Cost:* two technologies, a runtime dependency for the half that needs it, and a second
   execution path — which collides directly with the Simplicity driver's measure of *one
   path*. A developer without the runtime gets an intake that silently skips validation,
   which is worse than no validation because it looks complete.

*Compared on:* what a developer must have installed for the kit to work at all; where the
product's value actually lives; which failure mode is more tolerable; how much of CON-004
each option makes someone else's problem.

## Decision

**Instructions only. The kit ships no executable code and requires no runtime.** The agent
is the runtime, the Markdown instruction set is the program, and the host's file tools are
the I/O.

## Reason

Option 3 is genuinely attractive and was close. It lost on the failure mode: a validation
step that silently does not run on a machine lacking the runtime produces a workspace that
*reports* as validated. That is BR-009's exact failure — a success claim on an unrun check —
and it would be built into the architecture rather than being a bug.

Option 1's real cost is non-determinism, and that cost is payable: the validation checks are
all structural (does this identifier resolve, does this link resolve, is this placeholder
gone), and structural assertions survive non-determinism. Prose varying between runs does not
matter; structure varying does, and structure is what gets checked.

## Consequences

- **Positive:** No install step, no runtime detection, no version matrix, no packaging.
  CON-004 is satisfied by not having the problem. The kit cannot execute anything, so it has
  no code-execution surface at all. The judgement-heavy core subdomain is handled natively.
- **Trade-off or limitation:** **The system cannot be tested with equality assertions.**
  Every test must assert structure, never prose (`technical-spec.md` §11). An instruction
  can be misread, and there is no compiler to catch it — the validation walk is the only
  detector, and it is itself instruction-driven. This is a real and permanent weakness: the
  checker and the thing being checked share a failure mode.
- **Second limitation:** "fitness functions must fail the build" has no build on the
  developer's machine. They run in the kit author's CI instead (ADR-002 does not remove the
  need, it relocates it — see `fitness-functions.md`).
- **Rule the AI assistant must follow during implementation:** Never add a script, CLI,
  templating engine, package manifest, or dependency file to this project. If a task seems
  to require executable code, the task is wrong — stop and ask.

## Compliance

| Enforced by | Where |
|---|---|
| **FF-009** — the plugin contains zero executable files and zero dependency manifests | [`fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |
| Manual review by the kit author on every PR that adds a file type other than Markdown or the plugin manifest | `05-review/02-checklists/code-review-checklist.md` |

## Revisit when

- The validation checks prove unreliable in practice — if instruction-driven validation
  misses failures that a program would have caught, the hybrid becomes correct and the
  *silently skipped* problem must be solved by making the runtime a hard requirement rather
  than an optional one.
- The host stops providing a structured question mechanism or cross-platform file tools.
  The decision depends entirely on the host supplying them.
- The interview stops needing judgement — which would mean the core subdomain was
  misidentified, and would reopen ADR-002 and the subdomain map together.

## Impact

| Dimension | Impact |
|---|---|
| Security | Strongly positive. Nothing executes; there is no code-execution surface, no dependency supply chain, and no runtime to exploit. |
| Reliability | Mixed. No runtime can be missing or misversioned; but instructions can be misread, and the checker shares the reader's failure mode. |
| Performance | Neutral. Dominated by model time either way. |
| Cost | Lowest of the three — no packaging, no runtime support burden, no cross-platform build. |
| Maintainability | Positive for the kit author (edit Markdown), negative for confidence (no type system, no compiler, no deterministic test). |

## Related

- Related requirements: REQ-F-001, REQ-F-003, REQ-NF-008, CON-003, CON-004, CON-006
- Related technical spec sections: §1 System Overview, §2, §11 Testing Approach, §12
- Supersedes / superseded by: —

> Blueprint: ../../../../spec-driven-template/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
