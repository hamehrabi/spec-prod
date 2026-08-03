# TASK-002: CI gate skeleton — FF-001, FF-002, FF-009

**Task ID:** TASK-002 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

ADR-001 · ADR-002 · REQ-NF-005 · [`fitness-functions.md`](../../01-docs/04-technical-spec/fitness-functions.md)

## Business reason

Three fitness functions guard the shape of the plugin itself, and they are cheap. Added now,
they are enforced from the first commit that could break them. Added later, the first thing
they do is report a violation that has already been built on.

## Goal

A CI workflow that runs FF-001, FF-002, and FF-009 on every change and **blocks the merge**
on failure.

## Inputs

- [`fitness-functions.md`](../../01-docs/04-technical-spec/fitness-functions.md) — the register and the "where these run" section
- [`ADR-002`](../../01-docs/05-architecture/architecture-decisions/ADR-002-instructions-only-no-runtime.md) — the published-payload vs. repository distinction

## Expected files or components

```
.github/workflows/<gate>.yml   (or the chosen provider's equivalent)
ci/ff-001-single-command.*
ci/ff-002-module-independence.*
ci/ff-009-no-executable-payload.*
```

`[TODO: CI provider not chosen — see cicd-pipeline.md. Pick one that is free at this scale
and record the monthly ceiling and alert threshold that runtime-and-scale.md §4 leaves open.]`

## Expected output

- FF-001: exactly **1** user-invocable command, **1** end-to-end path. Fails otherwise.
- FF-002: a commit touching the question set changes **0** blueprint files, and vice versa.
- FF-009: the **published plugin payload** contains **0** files that are not Markdown or the manifest.

## Step-by-step instructions

1. Choose the CI provider and record the decision in `decisions.md`.
2. Define what the "published payload" is — the exact paths that ship — so FF-009 has a target.
3. Implement the three checks. Each must exit non-zero on failure.
4. Wire them into a gate that blocks merge.
5. Deliberately break each one and confirm the build fails. **A check never seen to fail is untested.**

## Dependencies

TASK-001.

## Constraints / Boundaries

- CI scripts live in the repository and **must not** be in the published payload — that is
  the distinction that keeps ADR-002 coherent. FF-009 must exclude them by path, deliberately.
- Do not add checks beyond these three in this task. The remaining eleven need a generated
  workspace to walk, which does not exist yet.
- A warning is not a fitness function. Every check blocks.

## Do not change

- Anything in `spec/`.
- The plugin payload itself — this task adds checks, not behaviour.
- The three thresholds. They come from `driving-characteristics.md`; changing one means
  changing a driver's measure.

## Acceptance check / Done criteria

- [ ] All three run on every change and block the merge.
- [ ] Each has been **seen to fail** against a deliberately broken input.
- [ ] FF-009's payload definition is explicit and excludes `ci/`, `.github/`, and `03-tests/`.
- [ ] The gate runs in a reasonable time on a free tier.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| UTEST-013 | Add a second command | FF-001 fails |
| UTEST-024 | Edit a question, then a blueprint | FF-002 passes for each alone |
| TEST-017 | One commit touching both modules | FF-002 **fails** |
| — | Add a `package.json` to the payload | FF-009 fails |
| — | Add a script under `ci/` | FF-009 **passes** — it is not payload |

## Review checklist

- [ ] Matches ADR-001, ADR-002, REQ-NF-005.
- [ ] No unrelated feature added.
- [ ] Every check demonstrated failing before being trusted.
- [ ] Failure messages name the ADR or requirement that was violated.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- FF-003…FF-008 and FF-010…FF-014 — they need a generated workspace (TASK-016).
- Golden fixtures (TASK-016).
- Publishing or release automation (Round 8's deployment work).

## Stop condition

**Stop and ask if:**
- The boundary between "published payload" and "repository" cannot be defined by path. FF-009
  is meaningless without it, and guessing would make ADR-002 unenforceable.
- Any check would require running the intake — that belongs in TASK-016, not here.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
