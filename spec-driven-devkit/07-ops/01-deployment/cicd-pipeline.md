# CI/CD Pipeline

> Source: Ch. 23, Ch. 28 §28.12.
> The pipeline is where written governance becomes enforced governance. **Until a fitness
> function actually runs and fails a build, it is a document.**

**Provider:** `[TODO: not chosen — pick one free at this scale, and record the monthly
ceiling and alert threshold that `runtime-and-scale.md` §4 leaves open.]`

---

## What is being built, and what is not

There is **no deployment**. Nothing is provisioned, nothing runs, nothing is promoted. The
pipeline exists for two jobs:

1. **Gate every change** to the plugin against the fourteen fitness functions and the test suite.
2. **Detect that the host broke us** — the scheduled install test that is RISK-004's only detector.

Publishing is a separate, deliberate act — see [`deployment-plan.md`](deployment-plan.md).

---

## The gate — runs on every change, blocks the merge

```
stage 1  shape of the plugin itself        FF-001, FF-002, FF-009      ~seconds
         cheapest and most likely to catch a structural violation. Fail here first.

stage 2  unit tests                         UTEST-001..025              25 rule tests

stage 3  generate golden workspaces         from fixtures/answer-scripts/
         the slow step everything downstream needs

stage 4  walk the golden workspaces         FF-004..FF-008, FF-010..FF-014
         integration + security tests       TEST-001..018, STEST-001..014

stage 5  end-to-end                         ETEST-001..012
         including ETEST-009 x8 (resume)    <- FF-003; slowest, therefore last

stage 6  eval scorers                       11 deterministic, over 36 answer scripts
         the 2 human scorers gate RELEASE, not merge
```

**Nothing merges unless every stage passes.** A warning is not a gate.

### The stage that must never be made optional

**Stage 1, FF-009** — the published payload contains zero executable files. It is the check
that keeps ADR-002 true, and it is the one most likely to be skipped "just this once" when a
useful script appears. Skipping it does not weaken a rule; it deletes the architecture.

---

## The scheduled job — RISK-004's detector

```
schedule:  [TODO: cadence not set - weekly is likely enough for under 50 users]

  1. Install the PUBLISHED plugin (not the branch) into a clean repository, as a user would.
  2. Run one full intake with a fixed answer script.
  3. Assert it completes and validates 12 of 12.
  4. On failure: alert the kit author immediately.
```

**This is the only thing standing between "the host changed" and "a user tells us".** It
tests the *published* artifact, not the branch — a branch that passes CI proves nothing about
what people actually have installed.

---

## Pipeline rules

| Rule | Why |
|---|---|
| **The gate blocks; it does not warn.** | A warning is a decoration (`fitness-functions.md`). |
| **Cheapest checks first.** | A structural violation should fail in seconds, not after generating 36 workspaces. |
| **Resume ×8 runs last.** | Slowest stage; no point paying for it when stage 1 already failed. |
| **CI files never enter the published payload.** | FF-009 excludes `ci/`, `.github/`, `03-tests/` by path — deliberately, and that exclusion is itself part of the check. |
| **Never assert on generated prose.** | ADR-002 makes it non-deterministic. Structure only. |
| **A check that has never been seen to fail is untested.** | Every fitness function and denial test must be demonstrated failing before it is trusted. |

---

## What the pipeline does **not** do

| Not done | Why |
|---|---|
| Deploy | Nothing to deploy (ADR-002). |
| Provision infrastructure | None exists. |
| Run database migrations | No database. |
| Publish automatically on merge to main | **Deliberate.** Releases are tagged and manual — see `deployment-plan.md`. Auto-publishing would make ADR-005's version stamp useless, because a workspace could be stamped with a version that existed for an hour. |
| Collect metrics from users | Forbidden (CON-007). |

---

## Cost

| Item | Value |
|---|---|
| Expected cost | `[TODO: set a monthly ceiling and an alert threshold, even if it is $0 on a free tier. This is the only thing in the project that costs money — see runtime-and-scale.md §4.]` |
| Biggest driver | Stage 3 (generating 36 golden workspaces) and stage 5 (eight resume runs). |
| If it becomes expensive | Reduce the **scheduled** job's frequency first, never the merge gate. |

> Blueprint: ../../../spec-driven-template/07-ops/01-deployment/cicd-pipeline.md
