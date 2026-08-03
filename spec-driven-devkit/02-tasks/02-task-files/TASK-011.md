# TASK-011: Inference and contradiction detection

**Task ID:** TASK-011 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-009 (never ask the derivable) · REQ-F-010 (contradictions stop and quote both) ·
REQ-F-011 (eight-round hard stop) · BR-004, BR-012 · **DD-007**

## Business reason

**DD-007 makes inference the source of depth.** The kit author asked for deep documents *and*
an interview developers finish; the only way to have both is to derive what can be derived
rather than asking for it. That makes REQ-F-009 load-bearing rather than an efficiency.

## Goal

Questions whose answers follow from earlier answers are not asked — and the inference is
**stated**. Answers that cannot both hold stop the interview and are **quoted verbatim**.

## Inputs

- [`decisions.md`](../../01-docs/05-architecture/decisions.md) — DD-007
- [`frontend-component-spec.md`](../../01-docs/04-technical-spec/frontend-component-spec.md) — `InferenceNotice`, `ContradictionStop`
- [`unit-tests.md`](../../03-tests/02-functional/unit-tests.md) — UTEST-006…009

## Expected files or components

```
instructions/inference.md     <- NEW: the derivation rules and the contradiction rules
instructions/questions.md     <- gains, per question, what makes it derivable
instructions/intake.md        <- gains: consult inference.md before composing a round
```

## Expected output

- A derivable question is **suppressed**, and an `InferenceNotice` names the conclusion **and
  the answer it came from**.
- Two answers that cannot both hold **stop** the interview; both are quoted verbatim; neither
  is chosen; no preference is hinted at.
- A reconcilable tension proceeds on a **stated** assumption, recorded.
- The eighth round is the last. Remaining unknowns become open questions.

## Step-by-step instructions

1. Create `instructions/inference.md` with the derivation rules.
2. Annotate each question in `questions.md` with what would make it derivable, and from what.
3. Implement the notice: never suppress silently — a silent inference is a hidden assumption
   (BR-003's sibling in the interview).
4. Implement contradiction detection and the verbatim double-quote.
5. Implement the eight-round stop: unknowns become `Q-###` rows, not a ninth round.
6. Test both directions: not asking what is derivable, **and** still asking what is not.

## Dependencies

TASK-008.

## Constraints / Boundaries

- **Never suppress a question silently.** Every suppression produces a notice.
- Never resolve a contradiction, rank the two answers, or hint at a preferred one.
- Never ask a ninth round, for any reason.
- Derivation rules live in `inference.md`; question text in `questions.md`. Not mixed (ADR-001).
- Do not infer aggressively — a wrong inference silently produces a wrong specification. When
  a question is only *partly* derivable, ask a narrowed version and state the partial inference.

## Do not change

- Anything in `spec/`.
- The question wording itself — this task adds the derivability annotations.
- `boundary.md`, `fill.md`, `resume.md`, `depth.md`, `governance.md`.

## Acceptance check / Done criteria

- [ ] A derivable question is not asked, and the inference is stated with its source.
- [ ] A non-derivable question is still asked — inference does not over-reach.
- [ ] A contradiction stops the interview, quotes both, chooses neither.
- [ ] A reconcilable tension proceeds on a stated, recorded assumption.
- [ ] No ninth round, ever; unknowns become open questions.
- [ ] A fully-inferable round is skipped **with** a notice, not rendered as empty or failed.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-009 | Answer determines a later question | Not asked; inference stated |
| ATEST-010 | Two answers conflict | Stops, quotes both, chooses neither |
| ATEST-011 | Unknowns at Round 8 | No ninth round; unknowns become open questions |
| UTEST-006 | Fully / partly derivable | Suppressed / narrowed-and-asked |
| UTEST-007 | A suppressed question | Notice names conclusion **and** source |
| UTEST-008 | Conflicting vs. merely tense answers | Stop / stated assumption |
| UTEST-009 | Round 8 completes with unknowns | Stop holds |
| ETEST-005 | Whole interview | Inference visible across rounds |
| ETEST-006 | Whole interview | Ceiling holds |
| FTEST-010, FTEST-014 | Contradiction; fully-inferable round | Named behaviours |

## Review checklist

- [ ] Matches REQ-F-009…011, BR-004, BR-012, DD-007.
- [ ] No unrelated feature added.
- [ ] Tests pass in **both** directions — over-inference is as much a failure as under-inference.
- [ ] Notices name the source answer, not just the conclusion.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Express depth (TASK-015) — a different mechanism that also reduces questions.
- Rewording questions to make them more derivable — that is a question-set change with its own eval run.

## Stop condition

**Stop and ask if:**
- An inference would change the architecture rather than a detail. Those get **asked**, not
  derived — REQ-F-009's licence is for what follows obviously, not for what merely seems likely.
- Two answers conflict in a way the rules do not recognise. **Stop and quote both anyway.**
  Under-detecting a contradiction is recoverable; resolving one silently is not.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
