# Scope Change Log

> Source: Ch. 14 §14.7 (Preventing Scope Creep) + Ch. 29 §29.6 (Handling Scope Changes).
> Scope changes are not automatically bad. They become dangerous when they enter the
> project **without a decision trail**.

> **Scope control rule:** a scope change is not accepted until the relevant requirement,
> design, tests, tasks, and review checklist are updated. Otherwise the change is only a
> conversation, not a controlled decision.

---

## Change requests

```
Change ID:
Date:
Requested by:
Requested change:
Reason / evidence:

Evaluation:
  Does it support the project goal?         [yes/no + why]
  Does it affect existing requirements?     [which REQ IDs]
  Does it affect architecture?              [ADR needed? Which ADR is superseded?]
  Does it affect release timing?            [impact against CON-002's 2-4 weeks]
  Does it require new tests?                [which TEST IDs]

Decision:      Accept / Reject / Defer
Decision owner:
Date decided:

Artifacts updated:
  [ ] 01-docs/01-intent/constraints-and-non-goals.md
  [ ] 01-docs/02-requirements/requirements.md
  [ ] 01-docs/03-product-spec/product-spec.md
  [ ] 01-docs/04-technical-spec/technical-spec.md
  [ ] 01-docs/05-architecture/architecture-decisions/ADR-###
  [ ] 01-docs/08-traceability/traceability.md
  [ ] 02-tasks/01-planning/task-index.md
  [ ] 03-tests/01-plan/test-specification.md
  [ ] 05-review/02-checklists/code-review-checklist.md
  [ ] 07-ops/01-deployment/deployment-plan.md
```

| Change ID | Date | Requested change | Decision | Owner | Artifacts updated |
|---|---|---|---|---|---|
| SC-001 | 2026-08-03 | **Express mode** — a shallower intake for small projects | **Accept** | Kit author | REQ-F-033/034, AC-031/032, DD-006, TASK-015, `depth.md` |
| SC-002 | 2026-08-03 | Support AI assistants other than Claude Code | **Defer** | Kit author | Non-goals list only |
| SC-003 | 2026-08-03 | Non-interactive intake driven by a config file | **Defer** | Kit author | Non-goals list only |
| SC-004 | 2026-08-03 | Automatic spec-drift detection from the codebase | **Defer** | Kit author | Non-goals list only |
| SC-005 | 2026-08-03 | A hosted or team component (shared specs, dashboards) | **Reject for v1** | Kit author (inferred, then confirmed) | Non-goals list only |
| SC-006 | 2026-08-03 | Telemetry to measure intake completion rate | **Reject for v1** | Kit author | Non-goals list; **Q-002 opened** |
| SC-007 | 2026-08-03 | Standalone re-runnable validation command | **Defer** | Kit author | Q-001 closed; DD-010 recorded |
| SC-008 | — | **Two sessions in one repository** — concurrency handling | **Open** | Kit author | None yet — TASK-019 blocked pending this |
| **SC-009** | 2026-08-03 | **A stage acceptance gate** — show each round's result and require acceptance before continuing | **Accept** | Kit author | REQ-F-038/039/041, AC-036–038/040/041, **ADR-006**, `StageReview`, TASK-020, 13 tests |
| **SC-010** | 2026-08-03 | **Blueprint coverage** — every template used or recorded as skipped | **Accept** | Kit author | REQ-F-040/043, AC-039/044, FF-015/FF-018, check 13, TASK-022, 6 tests |
| **SC-011** | 2026-08-03 | **Blueprint integrity** — the library ships verifiably unmodified and drives progress | **Accept** | Kit author | REQ-F-042, AC-042/043, FF-017, check 15, TASK-021, 5 tests |

---

## Change detail — SC-001

```
Change ID:        SC-001
Date:             2026-08-03
Requested by:     Kit author, at Round 4 of intake
Requested change: A shallower "express" intake for small or exploratory projects.
Reason / evidence: RSK-1 - a full-depth interview may be more than a small project
                   warrants, and abandonment is the primary risk.

Evaluation:
  Does it support the project goal?      Yes - "developers finish the intake" is the
                                         stated definition of first-month success.
  Does it affect existing requirements?  Adds REQ-F-033 and REQ-F-034. No change to
                                         REQ-F-001..032.
  Does it affect architecture?           YES, and this is the important part. A second
                                         FLOW would violate the Simplicity driver, whose
                                         measure literally counts execution paths (FF-001).
                                         Accepted only as a PARAMETER on the one flow.
  Does it affect release timing?         Yes. Flagged at the point of asking as doubling
                                         the flows to test; the parameter form removes
                                         most of that cost.
  Does it require new tests?             Yes - ATEST-014, UTEST-012, UTEST-013, ETEST-007,
                                         EV-009.

Decision:       Accept, as a parameter - never as a second flow or command.
Decision owner: Kit author
Date decided:   2026-08-03

Artifacts updated:
  [x] 01-docs/02-requirements/requirements.md      (REQ-F-033, REQ-F-034, AC-031, AC-032)
  [x] 01-docs/05-architecture/decisions.md         (DD-006)
  [x] 01-docs/03-product-spec/product-spec.md      (Flow 7, feature scope)
  [x] 02-tasks/01-planning/task-index.md           (TASK-015)
  [x] 02-tasks/02-task-files/TASK-015.md
  [x] 03-tests/*                                   (five new test IDs)
  [x] 01-docs/08-traceability/traceability.md      (two new rows)
```

### Why SC-001 mattered

The request was accepted **with its shape changed**. "Express mode" as asked for would have
been a second path through the intake — and the Simplicity driver's observable measure is
*exactly one end-to-end execution path*. Accepting it as a **depth argument** gives the kit
author what they wanted without spending the driver.

> **The general lesson:** the useful question is rarely *accept or reject*. It is *what
> shape can this take that does not spend a driver?*

---

## Change detail — SC-006

```
Change ID:        SC-006
Date:             2026-08-03
Requested by:     Implied by success measure SM-2, written during Round 1
Requested change: Measure how many intakes start versus finish.
Reason / evidence: "Developers finish the intake" is the kit author's stated definition
                   of first-month success. It cannot be observed without telemetry.

Evaluation:
  Does it support the project goal?      Yes - it measures the primary risk directly.
  Does it affect existing requirements?  It CONTRADICTS CON-003 and CON-007 and BR-014.
  Does it affect architecture?           It would require a network call, which the kit
                                         is designed not to have.
  Does it affect release timing?         n/a
  Does it require new tests?             It would invalidate ETEST-011 and STEST-010.

Decision:       Reject for v1. The privacy promise is part of the product.
Decision owner: Kit author
Date decided:   2026-08-03

Consequence, recorded rather than hidden:
  SM-2 has NO observation method. It stays in intent.md and product-spec.md as a metric
  that cannot be measured, flagged as Q-002, because deleting it would hide the fact that
  the product's own definition of success is invisible to it.

Artifacts updated:
  [x] 01-docs/01-intent/open-questions.md          (Q-002 opened)
  [x] 01-docs/01-intent/constraints-and-non-goals.md
  [x] 01-docs/03-product-spec/product-spec.md      (§4, stated plainly)
  [x] 03-tests/03-non-functional/ai-evals.md       (§0 - the golden set is the substitute)
```

---

## Change detail — SC-009, and the collision it caused

```
Change ID:        SC-009
Date:             2026-08-03
Requested by:     Kit author, after the specification was first complete
Requested change: After each round, show the result and ask the developer to accept it
                  before moving to the next stage.
Reason / evidence: "so we ensure the user read it before moving to the next stage."
                  This is a direct attack on RSK-2 - a workspace that is structurally
                  complete and substantively hollow.

Evaluation:
  Does it support the project goal?      Yes. RSK-2 previously had NO detector inside a
                                         run - only the human eval sample, which happens
                                         before release, not during a developer's intake.
  Does it affect existing requirements?  Adds REQ-F-038/039/041. Changes what "a round"
                                         means, which is why TASK-020 is P0 not P1.
  Does it spend a driving characteristic? MIXED, and this is the interesting part:
                                         - Auditability: GAINS. Acceptance becomes a
                                           recorded, inspectable fact.
                                         - Simplicity: costs a little. One more
                                           interaction unit, one more resume state.
                                         - RSK-1 (abandonment): a real risk. More gates
                                           means more friction in an interview whose
                                           primary risk is not being finished.
  Does it affect architecture?           YES. Acceptance is STATE, and ADR-004 forbids
                                         state files. Resolved by ADR-006: acceptance is
                                         a dated row in a generated artifact, so the
                                         workspace remains the only store.
  Does it affect release timing?         Yes - one P0 task added.
  Does it require new tests?             13, including ETEST-014 x8 (interrupt between
                                         write and accept, at every stage).

Decision:       Accept.
Decision owner: Kit author
Date decided:   2026-08-03
```

**The RSK-1 trade is real and is not resolved by accepting this.** Eight extra gates in an
interview whose primary risk is abandonment is a genuine cost. Three things reduce it, and
none eliminates it: the gate shows **decisions rather than filenames** (short to read, worth
reading), **stop** is a first-class choice rather than a failure, and every accepted round is
already on disk so stopping loses nothing. **TASK-020's stop condition instructs the agent to
report it if the interview starts to feel long — rather than quietly showing less.**

## Change detail — SC-010, the gap a question exposed

```
Change ID:        SC-010
Date:             2026-08-03
Requested by:     Kit author - as a question, not a request:
                  "will it always follow all the templates? I don't want it to invent."
Requested change: (none was proposed - the question exposed a missing check)

What the question found:
  NOTHING checked that every blueprint gets USED.
  FF-007 verified that a generated file matches its blueprint. But a blueprint the intake
  never reached produced no file, no mismatch, and no complaint. A workspace could be
  internally consistent, pass all twelve checks, and be missing an entire specification
  document.

Decision:       Accept. REQ-F-040 + FF-015 + check 13 + TASK-022.
Decision owner: Kit author
Date decided:   2026-08-03
```

> **Worth recording as a process observation:** this was found by someone asking what the
> checks *do not* cover. No review checklist in the workspace asks that question directly —
> and `engineering-quality-review.md` is the natural home for it.

## Evaluation questions (Ch. 29 §29.6)

| Question | Why it matters | Decision option | Artifact to update | Risk if ignored |
|---|---|---|---|---|
| Does it support the project goal? | Prevents attractive but distracting work. | Accept / reject / defer. | Intent and PRD. | Low-value features get built. |
| Does it affect existing requirements? | Prevents hidden behavior changes. | Revise or add a requirement. | Requirements and RTM. | Tests no longer match expectations. |
| **Does it spend a driving characteristic?** | The three drivers are the tiebreaker for every design call. A change that quietly costs one leaves the project with no tiebreaker. | Reshape the change so it does not. | `driving-characteristics.md`, ADR. | The drivers become decoration. |
| Does it affect architecture? | Prevents rushed design damage. | **Name the ADR it supersedes.** | Technical spec and ADR log. | An accepted ADR is silently reversed. |
| Does it affect release timing? | Prevents false delivery promises. | Move, reduce, or defer. | Task plan. | Unfinished work ships. |
| Does it require new tests? | Prevents unverified changes. | Add tests **before** implementation. | Test spec and checklist. | New behavior breaks silently. |

> The third row is added for this project. Two of the eight changes above were reshaped
> rather than accepted or rejected, and both times it was that question that did it.

---

## Preventing scope creep from the agent (Ch. 14 §14.7)

**Rule:** every task must point back to an approved requirement or design decision. If a
requested change has no matching spec entry, **pause the implementation** — reject it,
defer it, or update the spec first.

> **No new code without a matching approved reason.**

```
new idea → evaluate against intent & goals → accept/defer/reject
                  ↓ (accepted)
        update requirement + spec + tests
                  ↓
             create task
                  ↓
           implementation
```

### The three creeps most likely in *this* project

Named in advance, because each is a helpful-sounding suggestion that supersedes a decision:

| Likely creep | Why it will be proposed | The one-line rejection |
|---|---|---|
| A state file (`.intake-state.json`) | Resume is simpler with one, and it would work. | **ADR-004.** It is a second source of truth that begins disagreeing with the specs immediately. Supersede the ADR or drop it. |
| A small script for validation | The twelve checks are mechanical and code does them better. | **ADR-002.** A check that silently skips where the runtime is absent is BR-009's violation built into the architecture. |
| A templating engine | The fill procedure looks like rendering. | **`subdomain-map.md`.** Blueprints are Markdown; substitution is a fill, not a render. This is the predicted over-engineering. |

**SC-008 is open and deliberately visible.** Two Claude Code sessions in one repository would
both write to `spec/`. It came from the seven-questions worksheet, not from a requirement, so
TASK-019 stays blocked until it passes through this log. **A task with no requirement is as
suspicious as code with no requirement.**

> Blueprint: ../../../spec-driven-template/02-tasks/03-control/scope-change-log.md
