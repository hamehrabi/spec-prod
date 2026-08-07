# TASK-015: Express depth as a parameter on the one flow

**Task ID:** TASK-015 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-033 (express depth) · REQ-F-034 (a parameter, not a flow) · **DD-006** · FF-001

## Business reason

A small or exploratory project should not be made to carry full depth — that is RSK-1. But a
second *flow* would rot, because it would be exercised half as often. **The only way to have
express mode without undercutting Simplicity is to make it an argument.**

## Goal

`depth=express` produces a thinner workspace over **the same eight rounds**, through **the same
single flow**, with every structural guarantee intact.

## Inputs

- [`decisions.md`](../../01-docs/05-architecture/decisions.md) — DD-006
- [`driving-characteristics.md`](../../01-docs/02-requirements/driving-characteristics.md) — Simplicity's measure counts paths
- `instructions/depth.md` (TASK-008)

## Expected files or components

```
instructions/depth.md         <- gains the express reductions
instructions/questions.md     <- gains, per question, whether express asks it
instructions/intake.md        <- gains the depth argument (the ONLY argument)
```

## Expected output

- One command, one argument (`depth`), **one end-to-end path**. Depth changes *how much* is
  asked and written — never *which code runs*.
- Express: two questions a round instead of four, thinner files, the same eight rounds.
- **No stage is skipped.** Depth within a stage is reduced; a stage is never deleted.
- Every structural rule still holds: identifiers resolve, back-links resolve, `[TODO]`s pair
  with `Q-###` rows, no worked-example content.
- The closing report names which stages were written thin.

## Step-by-step instructions

1. Add the reductions to `depth.md`: which questions express skips, which files it thins.
2. Annotate `questions.md` per question with its express behaviour.
3. Add the argument to `intake.md`. **One argument. No second command, no branch.**
4. Enforce: reduce depth **within** a stage; never remove a stage.
5. Verify FF-001 still counts one command and one path.
6. Add the "written thin" line to the closing report.

## Constraints / Boundaries

- **Never create a second flow, command, or code path.** FF-001 fails if you do.
- Never skip a stage. Reducing depth is allowed; deleting a stage is not.
- Never weaken a structural guarantee for express. A thinner workspace is not a weaker one.
- Do not add a third depth. Two is a parameter; three is a configuration system.

## Do not change

- Anything in `spec/`.
- Any instruction module other than the three listed.
- The structural rules. Express changes volume, never validity.

## Acceptance check / Done criteria

- [ ] Exactly one command and one end-to-end path exist (FF-001 passes).
- [ ] `depth` is the only argument.
- [ ] Express produces thinner files and asks at most two questions a round, over eight rounds.
- [ ] **Every stage still produces at least its minimum artifacts.**
- [ ] All structural checks pass on an express workspace.
- [ ] The report names which stages were written thin.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-014 | Run at express depth | Thinner over the same eight rounds, all structural rules hold |
| UTEST-012 | Express vs. default | Two questions a round, not four; eight rounds either way; **no stage missing** |
| UTEST-013 | Count paths | One command, one path — depth is an argument |
| ETEST-007 | Express end to end | Complete, valid, thinner |
| EV-009 | EV-001's script at express depth | Passes every deterministic scorer |

## Review checklist

- [ ] Matches REQ-F-033, REQ-F-034, DD-006.
- [ ] No unrelated feature added — **no second flow**.
- [ ] Tests pass, including FF-001.
- [ ] Express output is thinner, not weaker.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- A third depth level.
- Per-file depth overrides — that is `depth.md`'s subdomain rule, not a user setting.
- Changing what full depth produces.

## Stop condition

**Stop and ask if:**
- Express seems to need its own branch through the intake. **That is DD-006 being violated**,
  and the task is wrong rather than the decision — stop before writing the branch.
- Express cannot be made meaningfully faster without skipping a stage entirely. The master
  process forbids that (*reduce depth within a stage, do not delete the stage*); if express is
  not fast enough without it, that is a finding worth raising, not a rule to bend.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
