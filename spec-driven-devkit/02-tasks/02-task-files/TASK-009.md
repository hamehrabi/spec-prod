# TASK-009: Rounds 5–6 — architecture, security and reliability

**Task ID:** TASK-009 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-021 (a deny test per permission rule) · REQ-F-022 (a fitness function per driver) ·
BR-010 · REQ-F-017

## Business reason

These rounds produce the ADRs and the two governance artifacts that decide whether the
generated workspace **governs** anything or merely documents it (RSK-5).

## Goal

Rounds 5 and 6 ask their questions and produce the architecture, security, reliability, and
runtime specifications — including at least one ADR per consequential choice, one fitness
function per driver, and one deny test per permission rule.

## Inputs

- [`MASTER-PROMPT.md`](../../../spec-driven-template/MASTER-PROMPT.md) — Rounds 5–6
- [`ADR-000-template.md`](../../01-docs/05-architecture/architecture-decisions/ADR-000-template.md)
- [`fitness-functions.md`](../../01-docs/04-technical-spec/fitness-functions.md) · [`runtime-and-scale.md`](../../01-docs/04-technical-spec/runtime-and-scale.md)

## Expected files or components

```
instructions/questions.md     <- gains Rounds 5-6
instructions/governance.md    <- NEW: the ADR rule, the FF rule, the deny-test rule
```

Produces: `technical-spec.md` · `ADR-000-template.md` · `ADR-001…N` · `adr-index.md` ·
`decisions.md` · `fitness-functions.md` · `api-specification.md` ·
`security-specification.md` · `reliability-specification.md` · `runtime-and-scale.md` ·
`data-and-integration-spec.md` · `ai-boundary-spec.md` (AI products only) ·
`.env.example` · `environment-config.md`

## Expected output

- **One ADR per consequential choice**, each comparing at least two genuinely different
  options — not one option and two strawmen — and each with a filled Compliance field.
- `adr-index.md` includes the **"rules the ADRs impose on the AI assistant"** table, and every
  rule in it also appears in the generated `AGENT.md` (TASK-010).
- **One fitness function per driver, minimum**, each an automated check with a build-failing
  threshold.
- **Every row of `runtime-and-scale.md` is specified or marked *not needed* with a reason and
  a revisit trigger.** No blank rows.
- Login and any paid-API endpoint are rate-limited — or the file records why neither exists.

## Step-by-step instructions

1. Add Rounds 5–6 to `questions.md`, adapting options to the product type already established.
2. Create `instructions/governance.md`: the ADR rule, the FF rule, the deny-test rule.
3. Require the two-genuinely-different-options rule, and reject one-sided ADRs — *if no
   trade-off is visible, keep looking*.
4. Require every driver to produce at least one FF with a threshold that fails a build.
5. Require every `runtime-and-scale.md` row to be filled or explicitly *not needed, because…*.
6. Skip the AI boundary spec for products with no model — recording that it was skipped.

## Dependencies

TASK-008.

## Constraints / Boundaries

- Never write an ADR with no visible trade-off.
- Never write a fitness function that only warns.
- Never leave a `runtime-and-scale.md` row blank.
- Never write a permission rule without its deny test.
- Default to a modular monolith unless a named characteristic requires distribution.

## Do not change

- Anything in `spec/`.
- Earlier rounds' questions, or `boundary.md`, `fill.md`, `resume.md`, `depth.md`.

## Acceptance check / Done criteria

- [ ] Every consequential Round 5 choice has its own ADR.
- [ ] Every ADR compares two genuinely different options and names a trade-off.
- [ ] Every ADR's Compliance field names a fitness function or a named human reviewer.
- [ ] `adr-index.md` carries the agent-rules table.
- [ ] Every driver has at least one build-failing fitness function.
- [ ] Every permission rule has at least one deny test.
- [ ] No blank row in `runtime-and-scale.md`.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-022 | Find a permission rule in the output | ≥ 1 deny test exists |
| ATEST-023 | Find a driver in the output | ≥ 1 build-failing FF exists |
| TEST-010 | Walk a generated workspace | Every rule has a denial |
| TEST-011 | Walk a generated workspace | Every driver has an FF |

## Review checklist

- [ ] Matches REQ-F-021, REQ-F-022, BR-010.
- [ ] No unrelated feature added.
- [ ] Tests pass.
- [ ] ADRs read as decisions with costs, not as justifications.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Rounds 7–8 (TASK-010).
- `AGENT.md` itself (TASK-010) — this round produces the **rules** it must contain.
- The kit's own fitness functions (TASK-002, TASK-016).

## Stop condition

**Stop and ask if:**
- A decision has no visible downside. **Keep looking** — a choice with no cost was compared in
  the abstract rather than weighted for this context. Say so out loud rather than recording a
  one-sided ADR.
- A driver cannot be given a measurable fitness function. That means its **definition** is too
  vague; fix the definition, not the function.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
