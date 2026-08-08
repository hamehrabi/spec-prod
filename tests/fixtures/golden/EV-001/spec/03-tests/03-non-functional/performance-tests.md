# Performance Test Plan

> Source: Ch. 17 §17.6, Ch. 7 §7.9, Ch. 24 §24.5.
> You do not need enterprise load testing in every project, but you should define simple
> performance expectations **before** code generation.

A useful performance plan starts with a plain-language target: how fast should the key
action feel, how many records should the page handle, and what should happen when the
system becomes slow?

---

| Test ID | Workflow | Metric | Target | Data volume | Action if exceeded | Status |
|---|---|---|---|---|---|---|
| PTEST-001 | Generate one shopping list (REQ-NF-001, REQ-F-004) | Response time | Prompt for one cook's library — the concrete threshold is deferred (`Q-010`) and set as a fitness function once chosen | one cook's recipes and one week | Profile the gather query; add an index; revisit `Q-010`. | Planned |
| PTEST-002 | Search saved recipes (REQ-F-002) | Response time | Returns promptly over one person's library | one cook's recipes | Add an index or simplify the query. | Planned |

---

## Simple performance expectations (Ch. 17 §17.6)

| Feature | Simple performance expectation |
|---|---|
| Weekly plan page | Should load quickly for one cook's plan. |
| Recipe list and search | Should handle one person's library without freezing. |
| List generation | Should return promptly for a planned week. |
| No external calls | Version one calls no external service (`Q-007`), so no third-party latency applies. |

---

## Weak vs. measurable (Ch. 7 §7.9)

| Weak statement | Stronger requirement |
|---|---|
| "The list should generate fast." | "List generation should return within the target set by `Q-010` for one cook's library." |
| "Search should be quick." | "Recipe search should return results promptly over one person's library." |
| "The app should support many users." | Not a version-one target — one user (`Q-001`); revisit at a real multi-user count. |

---

## Performance risks to check in review (Ch. 20 §20.5)

| Performance risk | What to check |
|---|---|
| Repeated queries | Does the code query the database inside a loop while gathering ingredient lines? |
| Overfetching | Does it load fields or records that are not needed? |
| Slow external calls | Not applicable in version one — no external calls (`Q-007`). |
| Missing limits | Can a request return an unbounded result set? |
| Blocking work | Should heavy work move to a background job? (None in version one.) |

> Only refactor for performance when the change supports a clear goal: faster response,
> lower cost, fewer failures, or simpler scaling. Avoid asking the agent to "optimize
> everything" without a target.

---

## Performance tip (Ch. 7 §7.9)

Set realistic targets for the version you are building now. Overengineering performance
too early makes the system harder to finish and harder to understand.

Production performance signals → [`../../07-ops/02-monitoring/monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)

---

> Blueprint: blueprints/03-tests/03-non-functional/performance-tests.md
