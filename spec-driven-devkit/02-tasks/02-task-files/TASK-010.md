# TASK-010: Rounds 7–8 — tasks, tests, operations

**Task ID:** TASK-010 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-R-005 (task files name allowed **and** forbidden files) · REQ-F-017 · BR-013

## Business reason

Round 7 produces the artifacts a build agent actually works from, and Round 8 produces the
agent contract. **REQ-R-005 is the clause the whole governance story rests on** — a task file
without a do-not-change list is how an agent causes silent damage while believing it is in
scope.

## Goal

Rounds 7 and 8 ask their questions and produce the test suite, the task breakdown, the review
and agent packs, and the operations files — including `AGENT.md` carrying every rule from
`adr-index.md`.

## Inputs

- [`MASTER-PROMPT.md`](../../../spec-driven-template/MASTER-PROMPT.md) — Rounds 7–8 and their file tables
- [`test-plan.md`](../../03-tests/01-plan/test-plan.md) — the coverage-matrix shape
- The `adr-index.md` produced in TASK-009

## Expected files or components

```
instructions/questions.md     <- gains Rounds 7-8
instructions/governance.md    <- gains: every adr-index rule must reach AGENT.md
```

Produces the remaining ~50 files: all of `03-tests/`, `02-tasks/`, `05-review/` (eleven),
`06-agent/` (seven), `07-ops/`, `traceability.md`, `spec-change-log.md`, `glossary.md`,
`repeatable-system.md`, `recommended-tools.md`, `04-src/README.md`, `.gitignore`.

## Expected output

- **Every** file in Round 7's and Round 8's tables — not a folder summarised and skipped.
- Every task file names its **allowed files** and its **do-not-change list**.
- Test shape weighted by subdomain: core → pyramid, supporting → reversed.
- `traceability.md` resolves every requirement to a task and a test, **with blank cells left visible**.
- `AGENT.md` contains every rule from `adr-index.md`, verbatim.
- `change-log.md` includes a **rejected** change — the log records why the product does *not*
  do something.
- `.gitignore` excludes `.env`, secrets, and build output — and is written **before** `.env.example`.
- `appendix-index.md` is **not** created.

## Step-by-step instructions

1. Add Rounds 7–8 to `questions.md`.
2. Extend `governance.md`: every `adr-index.md` rule must be copied into `AGENT.md`.
3. Require every generated task file to carry both file lists.
4. Weight test shape by subdomain class, reusing `depth.md`.
5. Write the traceability matrix so unresolved cells stay **visible**, not filled.
6. Enforce the `.gitignore` → `.env.example` ordering.
7. Keep `team-workflow-pack.md` short when the developer answered *solo*.

## Dependencies

TASK-009.

## Constraints / Boundaries

- **Write every file in the tables.** Do not summarise a folder and move on.
- Never generate a task file without both lists (REQ-R-005).
- Never fill a blank traceability cell to make the matrix look complete.
- Never create `appendix-index.md`.
- Never apply one test shape to every subdomain class.

## Do not change

- Anything in `spec/`.
- Earlier rounds, or any shared instruction module.
- The rules in the generated `adr-index.md` — `AGENT.md` **copies** them; it does not restate
  or soften them.

## Acceptance check / Done criteria

- [ ] Every file in Round 7's and Round 8's tables exists.
- [ ] Every generated task file has allowed **and** do-not-change lists.
- [ ] Core areas get pyramid-shaped tests; supporting areas get reversed.
- [ ] `traceability.md` resolves, with blank cells visible.
- [ ] Every `adr-index.md` rule appears in `AGENT.md`.
- [ ] `change-log.md` contains at least one rejected change.
- [ ] `.gitignore` excludes `.env` and precedes `.env.example`.
- [ ] `appendix-index.md` does not exist.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-040 | Open any generated task file | Both file lists present |
| TEST-018 | Walk every generated task file | 100% carry both lists |
| — | Diff `adr-index.md` rules against `AGENT.md` | Every rule present |
| — | List the generated workspace | `appendix-index.md` absent |

## Review checklist

- [ ] Matches REQ-R-005, REQ-F-017, BR-013.
- [ ] No unrelated feature added.
- [ ] Tests pass.
- [ ] `AGENT.md` reads as a contract, not a summary.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Validation of the finished workspace (TASK-012).
- The entry-point file (TASK-013) — written last, after everything here exists.
- The closing report (TASK-014).

## Stop condition

**Stop and ask if:**
- The number of files makes it tempting to summarise a folder. **That temptation is the
  failure this task exists to prevent** — a workspace missing its review checklists looks
  complete and is not.
- A requirement has no task or no test. Leave the cell **blank and visible** and raise it. A
  filled-in guess destroys the one signal the traceability matrix exists to give.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
