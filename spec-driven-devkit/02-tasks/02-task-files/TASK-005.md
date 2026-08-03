# TASK-005: The fill procedure — copy, strip, fill, mint, back-link

**Task ID:** TASK-005 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-016, REQ-F-018, REQ-F-019, REQ-F-027 · BR-002, BR-003, BR-007 · **ADR-003** ·
[`technical-spec.md`](../../01-docs/04-technical-spec/technical-spec.md) §4

## Business reason

This is the one algorithm in the product, and it carries its characteristic failure:
**leftover template text reads exactly like a filled answer.** Getting it right, and testing
step 4 hardest, is what separates a specification from a plausible-looking document.

## Goal

A specified, tested six-step procedure that turns one blueprint into one filled artifact.

## Inputs

- [`technical-spec.md`](../../01-docs/04-technical-spec/technical-spec.md) §4 — the six steps and the failure each avoids
- [`ADR-003`](../../01-docs/05-architecture/architecture-decisions/ADR-003-copy-then-fill.md)
- [`integration-tests.md`](../../03-tests/02-functional/integration-tests.md) — the C2 contract table

## Expected files or components

```
instructions/fill.md          <- the six steps, in order, with the failure each prevents
instructions/intake.md        <- gains: every artifact is produced by fill.md
```

## Expected output

```
1. Copy the blueprint to its destination under spec/.
2. Delete "# WORKED EXAMPLE" and everything after it, up to any trailing
   blueprint-source line.
3. Delete the generic prompt boxes - they instruct how to PRODUCE the file,
   they are not content OF it.
4. Replace EVERY placeholder, empty table row, and instructional italic with the
   developer's content, or with "[TODO: <the exact question>]".
5. Mint and record any identifiers this file defines.
6. Append the blueprint back-link at the correct relative depth.
```

## Step-by-step instructions

1. Write `instructions/fill.md` with the six steps in order, each naming the failure it prevents.
2. Define the placeholder inventory precisely: what counts as a placeholder, an empty row, an
   instructional italic. **Step 4 cannot be tested without this list.**
3. Specify back-link depth arithmetic, worked for depths 1, 2, and 3.
4. Specify identifier minting: sequential, unique, never reused after deletion.
5. Write the unit and integration tests, including one blueprint crafted so a placeholder survives.

## Dependencies

TASK-003.

## Constraints / Boundaries

- **Never author a file from memory of a blueprint.** Copy first (ADR-003).
- Never leave a placeholder because it looked unimportant — that is the failure mode.
- Never invent a value. Unknown → `[TODO: <exact question>]` (BR-003).
- Never reuse a retired identifier (BR-007).
- Do not build a templating engine (`subdomain-map.md` — the single most likely
  over-engineering here). This is a copy and a set of replacements.

## Do not change

- Anything in `spec/`.
- Any blueprint file — read-only (ADR-001).
- The boundary layer from TASK-004. Fill **calls** it; it does not reimplement or relax it.

## Acceptance check / Done criteria

- [ ] All six steps specified, in order, each naming the failure it prevents.
- [ ] The placeholder inventory is explicit enough that "did step 4 finish?" is decidable.
- [ ] Worked-example content is removed **whole**, never edited around.
- [ ] Generic prompt boxes are removed.
- [ ] Back-links resolve at depths 1, 2, and 3.
- [ ] Identifiers are unique; a deleted ID leaves a permanent hole.
- [ ] A blueprint crafted to leave a placeholder is **detected**.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| UTEST-014 | Files at depths 1, 2, 3 | Correct `../` prefix each time |
| UTEST-016 | Delete `REQ-F-007`, add a requirement | Next is `REQ-F-008`; hole permanent |
| UTEST-017 | A fact never supplied | `[TODO: <exact question>]`; **no substituted value** |
| UTEST-020 | Blueprint with a worked example | Section removed whole; trailing source line preserved |
| TEST-005 | 14-section blueprint | All 14 headings present, in order |
| TEST-006 | Back-links at three depths | Each resolves |
| TEST-007 | Two files defining IDs | No duplicates; all references resolve |
| TEST-008 | Withheld fact | `[TODO]` **and** a matching `Q-###` |
| TEST-014 | Search for example content | Zero occurrences |

## Review checklist

- [ ] Matches REQ-F-016/018/019/027 and ADR-003.
- [ ] No unrelated feature added — **no templating engine, no rendering layer**.
- [ ] Tests pass, including the crafted-placeholder case.
- [ ] The step-4 inventory is explicit, not "replace the obvious ones".
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Asking questions (TASK-006).
- Deciding *which* blueprint to fill for a round (TASK-006).
- Depth scaling by subdomain (TASK-008).
- Validating the finished workspace (TASK-012).

## Stop condition

**Stop and ask if:**
- The placeholder inventory cannot be made precise. A vague step 4 makes FF-005 unenforceable
  and the product's characteristic failure undetectable.
- A blueprint's worked example is interleaved with real content rather than in one trailing
  section. ADR-003 assumes it can be removed whole; if that is false for any blueprint, the
  **blueprint** needs changing, not the procedure.
- Filling seems to need blueprint-specific special cases. That means ADR-003 is wrong for that
  file, and it is an ADR-level decision, not an exception to slip in.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
