# TASK-016: Golden fixtures and the eval harness

**Task ID:** TASK-016 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

[`ai-evals.md`](../../03-tests/03-non-functional/ai-evals.md) · [`fitness-functions.md`](../../01-docs/04-technical-spec/fitness-functions.md) FF-003…FF-014 · REQ-NF-007, REQ-NF-008

## Business reason

**CON-007 makes the kit structurally unable to observe its own failure rate in the field.**
This golden set is the only substitute that exists. It is also the only way to answer *"did
rewording that question help?"* — which, for a product that is entirely prose, is every
question worth asking.

## Goal

36 answer scripts, the fixtures they run against, and the eleven remaining fitness functions
walking the workspaces they produce — all blocking the merge.

## Inputs

- [`ai-evals.md`](../../03-tests/03-non-functional/ai-evals.md) — the 36 cases, 13 scorers, and the floor
- [`executable-tests.md`](../../03-tests/05-executable/executable-tests.md) — the fixture layout
- The CI gate from TASK-002

## Expected files or components

```
03-tests/05-executable/fixtures/answer-scripts/EV-001 .. EV-036
03-tests/05-executable/fixtures/repositories/     clean · has-claude-md · has-gitignore ·
                                                  populated-spec · read-only
03-tests/05-executable/fixtures/golden/           generated workspaces, kept
ci/ff-003 .. ff-008, ff-010 .. ff-014
ci/eval-runner.*                                  <- one engine, scorers at the edges
```

**None of this ships in the plugin payload** — FF-009 asserts that.

## Expected output

- 36 answer scripts covering 16 happy, 10 edge, 6 adversarial, 4 must-refuse.
- One engine that runs any script against the kit and collects any scorer. **Adding a scorer
  must not require editing the engine** — get this split wrong and every experiment becomes
  a harness change.
- Eleven deterministic scorers gating the **merge**; two human scorers gating the **release**.
- FF-003 (resume ×8) and FF-012 (three platforms) wired in.

## Step-by-step instructions

1. Write the 36 scripts. Label the invented ones **as invented** — they cover what you thought
   of, not what a real developer does.
2. Build the repository fixtures, including read-only and populated-`spec/`.
3. Build the runner: general engine, specialised scorers at the edges (Ousterhout Ch. 6).
4. Implement the eleven deterministic scorers.
5. Wire FF-003…FF-008 and FF-010…FF-014 into the gate from TASK-002.
6. Record the first baseline run in `ai-evals.md` §5 — quality, wall clock, and **the
   developer-side model cost**, which is visible nowhere else.
7. Establish the human-sample ritual: ≥ 4 cases read before each release.

## Dependencies

TASK-014.

## Constraints / Boundaries

- Fixtures and CI **never** enter the published payload (FF-009).
- **Never diff a golden workspace byte-for-byte.** ADR-002 makes output non-deterministic;
  assert structure, score quality.
- No model-graded scorer — grading a model-driven system with a model drifts on both sides.
- Prefer deterministic scorers. Eleven of thirteen is the target ratio, not an accident.

## Do not change

- Anything in `spec/`.
- Any instruction module. This task **measures** the kit; it does not modify it. If a fixture
  reveals a defect, that is a separate task with its own review.
- The quality floor without recording the change — it is the release gate.

## Acceptance check / Done criteria

- [ ] 36 scripts exist, in the specified category proportions.
- [ ] Each of the four must-refuse cases is refused correctly.
- [ ] Each of the six adversarial cases behaves as specified — **including EV-027**, where the
      intake proceeds normally and does not become judgemental about the developer's product.
- [ ] Eleven deterministic scorers run and block the merge.
- [ ] FF-003 passes 8/8; FF-012 passes on all three platforms.
- [ ] Adding a new scorer requires no change to the engine.
- [ ] The baseline run is recorded with quality, wall clock, and model cost.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| EV-001…036 | Each script | Scored; hard-fail scorers at their floor |
| ETEST-011 | Network blocked | Full intake completes; zero outbound requests |
| ETEST-012 ×3 | Windows, macOS, Linux | Workspaces differ only in line endings |
| — | Add a scorer | Engine unchanged |

## Review checklist

- [ ] Matches `ai-evals.md` and the remaining fitness functions.
- [ ] No unrelated feature added.
- [ ] Tests pass; the floor blocks.
- [ ] Invented scripts labelled as invented.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Fixing anything the evals reveal — separate tasks.
- Telemetry from real users (CON-007). **This harness exists precisely because that is
  forbidden.**
- Setting the `todo_density` threshold — it stays `[TODO]` until ten real runs exist. Guessing
  it now would invent the definition of "hollow".

## Stop condition

**Stop and ask if:**
- A scorer cannot be made deterministic and is not clearly a human judgement. Something
  in-between will drift and be trusted anyway.
- The engine needs modifying to add a scorer. That is the split Ousterhout Ch. 6 warns about,
  and fixing it later costs an hour per experiment forever.
- An adversarial case makes the kit refuse something it should not — particularly EV-027.
  **A specification tool that judges its users' products is a different product**, and that
  change needs deciding, not drifting into.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
