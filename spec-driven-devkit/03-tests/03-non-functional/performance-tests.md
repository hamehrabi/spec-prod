# Performance Test Plan

> Source: Ch. 17 §17.6, Ch. 7 §7.9, Ch. 24 §24.5.
> You do not need enterprise load testing in every project, but you should define simple
> performance expectations **before** code generation.

A useful performance plan starts with a plain-language target: how fast should the key
action feel, how many records should the page handle, and what should happen when the
system becomes slow?

---

## What can and cannot be measured here

Performance was **explicitly rejected as a driving characteristic** — no contended resource,
no query, no network, under 50 users, one machine per run. This file is short by decision,
not by neglect, and the reason needs stating precisely because it is unusual:

> **The dominant cost in every workflow is the host model's own thinking and writing time,
> which the kit neither controls nor can optimise.** Setting a latency target on a
> model-driven interview would be setting a target for somebody else's system, and then
> failing a build over it.

So exactly one thing is measured: **the part the kit owns**, which is whether the developer
is ever left waiting with nothing on screen. That is REQ-NF-001, and it is a rule about
*ordering*, not about speed.

---

| Test ID | Workflow | Metric | Target | Data volume | Action if exceeded | Status |
|---|---|---|---|---|---|---|
| **PTEST-001** | A full intake, round by round | **Longest stretch with no output** | **Never longer than one round.** Round *N*'s files exist on disk **before** round *N+1*'s questions are asked | ~90 files, 8 rounds | The round is writing too late. Move the writes earlier — do not make them faster | Planned |
| PTEST-002 | Validation walk over a finished workspace | Completes without a perceptible pause | Bounded by ~90 local Markdown reads | ~90 files | **Reopening trigger for performance as a driver.** If this is ever perceptible, the "not needed" rows in `runtime-and-scale.md` are wrong | Planned |
| PTEST-003 | Blueprint reads per generated file | Count | **1** — no blueprint read more than once per artifact | ~90 blueprints | Wasteful, not harmful. Fix if trivially fixable; do not build a cache (ADR-004) | Planned |
| PTEST-004 | Full intake, wall clock | Duration | `[TODO: the kit author has not set a target — SM-5 in intent.md. Recorded per run so a baseline exists before anyone needs one]` | one run | — | Planned |

---

## Simple performance expectations (Ch. 17 §17.6)

| Feature | Simple performance expectation |
|---|---|
| Each question round | The developer never waits inside a round with nothing on screen — questions are composed before being shown |
| Writing a round's files | Files appear, then a summary line. **Progress is visible after every round, without exception** |
| Resume | Reading a workspace to determine its stage is a file listing, not a scan of contents |
| Validation | ~90 files, read once, at the end. No incremental machinery |

---

## Weak vs. measurable (Ch. 7 §7.9)

| Weak statement | Stronger requirement |
|---|---|
| "Intake should be fast." | "Round *N*'s files exist on disk before round *N+1*'s questions are asked." |
| "It shouldn't feel slow." | "No stretch of the run passes with no output for longer than one round." |
| "Validation should be quick." | "The validation walk reads each of the ~90 files at most once." |
| ~~"The kit should respond within 2 seconds."~~ | **Unwriteable here** — the latency belongs to the host model. A target the kit cannot influence is a target that fails the build for someone else's reasons. |

---

## Performance risks to check in review (Ch. 20 §20.5)

| Performance risk | What to check here |
|---|---|
| Repeated queries | Is a blueprint being read more than once per generated file? (PTEST-003) |
| Overfetching | Is the kit reading the developer's source, dependencies, or git history? It must not — and not for performance reasons but because §7.4 of the security spec forbids it |
| Slow external calls | **n/a** — there are none, and FF-009 keeps it that way |
| Missing limits | Is anything unbounded? Two things are: the interview (bounded at 8 rounds, BR-004) and the re-fill retry (bounded at 1, REQ-F-037). Both bounds are requirements, and both have tests |
| Blocking work | **n/a** — there is nothing to move to a background job, and §6 of the reliability spec pre-rejects the one job somebody will propose |

> Only refactor for performance when the change supports a clear goal: faster response,
> lower cost, fewer failures, or simpler scaling. Avoid asking the agent to "optimize
> everything" without a target.

---

## Written out — the only performance test that binds

```
Test ID:     PTEST-001
Requirement: REQ-NF-001, BR-005
Workflow:    A complete intake at default depth

Method:
  Record a timestamped event for every developer-visible output and every file write
  during a full run. Then compute, for each round N:
     - the timestamp of the last file written in round N
     - the timestamp of the first question shown in round N+1

Assertion:
  For every N in 1..7:  last_write(N) < first_question(N+1)
  And for every N:      a summary line "Round N - wrote X files" was emitted

Target:  8/8 rounds satisfy both. Any failure is a defect regardless of duration.

Action if exceeded:
  The fix is NEVER "make it faster". The fix is to move the writes earlier in the round.
  This is an ordering rule; treating it as a speed problem would be the wrong diagnosis.

Status: Planned

Why this is the only one: it is the sole performance property the kit actually controls.
Everything else on this page is either not applicable or belongs to the host. Measuring
one real thing beats four numbers that describe someone else's system.
```

---

## Performance tip (Ch. 7 §7.9)

Set realistic targets for the version you are building now. Overengineering performance
too early makes the system harder to finish and harder to understand.

**Applied here, this rule is mostly a licence to write "not needed" and move on** — which is
what `runtime-and-scale.md` does across four sections, each with a reason and a revisit
trigger. The temptation this file exists to resist is inventing a latency number that sounds
professional, cannot be attributed to anything the kit does, and would eventually fail a
build because a model was slow that day.

Production performance signals → [`monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)
— **and there are none.** No run-time monitoring is possible under CON-007. PTEST-001 runs in
CI over golden intakes; nothing observes a real developer's run, by design.

> Blueprint: ../../../spec-driven-template/03-tests/03-non-functional/performance-tests.md
