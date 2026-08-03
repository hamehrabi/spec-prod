# TASK-012: Validation — twelve checks, retry once, not-run reporting

**Task ID:** TASK-012 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-029 (validate before reporting success) · REQ-F-037 (retry once, then flag) ·
BR-009 · [`technical-spec.md`](../../01-docs/04-technical-spec/technical-spec.md) §11

## Business reason

Reporting success on unverified work is how a hollow workspace ships looking complete — RSK-2.
The check that matters most is not any of the twelve; it is that **a check which did not run
is never reported as passed**.

## Goal

The twelve checks run over the finished workspace before any success claim, each reporting
**passed / failed / not run**, with one bounded retry for a file that fails structurally.

## Inputs

- [`technical-spec.md`](../../01-docs/04-technical-spec/technical-spec.md) §11 — the twelve checks
- [`frontend-component-spec.md`](../../01-docs/04-technical-spec/frontend-component-spec.md) — `ValidationReport`, including its empty state
- [`failure-tests.md`](../../03-tests/04-failure/failure-tests.md) — FTEST-005, FTEST-006

## Expected files or components

```
instructions/validation.md    <- NEW module: the twelve checks and the report shape
instructions/intake.md        <- gains: run validation before any success claim
```

## Expected output

For each of the twelve checks: **passed**, **failed** (with file and identifier), or **not
run** (with the reason). The report states the **count of checks that ran**:

> `All 12 checks ran; all 12 passed.`
> `11 of 12 checks ran. Check 7 could not run: <reason>. This workspace is NOT fully validated.`

A file failing a structural check is re-filled **once**. On a second failure: `[TODO]` +
`Q-###` + a report line. **No third attempt.**

## Step-by-step instructions

1. Create `instructions/validation.md` with the twelve checks, each naming what it proves.
2. Specify the three-state report and the **count of checks run** — the assertion, not the failures.
3. Implement the single retry and its stop condition.
4. Specify the empty state positively: *"All 12 checks ran; all 12 passed"* — never silence.
5. Wire it before the entry point and the closing report.
6. Test each check against a **deliberately broken** workspace. A check never seen to fail is untested.

## Dependencies

TASK-010.

## Constraints / Boundaries

- **Never infer passed from the absence of a failure.** Report the count that ran.
- Never retry more than once. A file failing twice is evidence about the *instruction*.
- Never claim success while any check failed or did not run.
- Do not build a rules engine, a schema language, or configurable checks. **Twelve, fixed**
  (`subdomain-map.md` — validation is supporting, built simply).

## Do not change

- Anything in `spec/`.
- Any instruction module from earlier tasks. Validation **reads**; it does not repair by
  editing another module's behaviour.
- The developer's generated files, other than the single permitted re-fill.

## Acceptance check / Done criteria

- [ ] All twelve run before any success claim.
- [ ] Each reports passed / failed / **not run**, and not-run is never rendered as passed.
- [ ] The report states the number of checks that **ran**.
- [ ] Each check has been **seen to fail** on a deliberately broken workspace.
- [ ] A structurally failing file is re-filled once, then flagged. No third attempt.
- [ ] A workspace with any failure produces **no** success claim and **no** hand-off block.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-024 | A file fails twice | `[TODO]` + `Q-###` + report line; no third attempt |
| ATEST-033 | Dangling identifier | Reported failed; no success claim |
| UTEST-018 | Fail once / fail twice | Re-filled / flagged |
| UTEST-022 | 12 run / 11 run | "12 of 12" / that one reports **not run** |
| TEST-015 | Broken workspace | Failure named with file and identifier |
| FTEST-005 | A check cannot run | Not-run reported; no success claim |
| FTEST-006 | Surviving placeholder | Retry once, then flag |

## Review checklist

- [ ] Matches REQ-F-029, REQ-F-037, BR-009.
- [ ] No unrelated feature added — **no rules engine, no configurable checks**.
- [ ] Every check demonstrated failing before being trusted.
- [ ] The report distinguishes all three states in words.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- The kit's own CI fitness functions (TASK-002, TASK-016) — related but independent, and
  deliberately not sharing an implementation.
- The entry-point file (TASK-013) and the closing report (TASK-014), which both come after.
- A standalone re-runnable validation command — out of scope for v1 (DD-010, Q-001).

## Stop condition

**Stop and ask if:**
- A check cannot be made to fail deterministically on a broken input. An unfalsifiable check
  is worse than none: it makes the report look thorough while proving nothing.
- Validation would need to edit a file to make a check pass. **It reports; it does not repair**
  — beyond the one permitted re-fill of a structurally failing file.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
