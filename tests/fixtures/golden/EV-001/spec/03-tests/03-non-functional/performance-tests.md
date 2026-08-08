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
| PTEST-001 | Generate the shopping list | Response time | Under 2 s (REQ-NF-001) | A plan of 21 meals | Check the generation query — one query for the week's lines, not one per meal. | Planned |
| PTEST-002 | Recipe search | Response time | Under 1 s (REQ-NF-001) | 500 saved recipes | Check the search query and its index (database-design). | Planned |

The two rows are the two numbers REQ-NF-001 promises. Nothing else in version one carries
a stated performance target — scaling and caching rows are recorded as *not needed* in
`runtime-and-scale.md`, with their revisit triggers.

---

## Simple performance expectations (Ch. 17 §17.6)

| Feature | Simple performance expectation |
|---|---|
| Shopping-list generation | Within 2 seconds for a full week of up to 21 meals. |
| Recipe search | Within 1 second for a library of up to 500 recipes. |
| Recipe save | Feels immediate; no stated number — it is a single-row write. |
| Weekly plan view | Loads a week without visible delay at version-one volumes. |

---

## Weak vs. measurable (Ch. 7 §7.9)

| Weak statement | Stronger requirement |
|---|---|
| "The list should generate fast." | "Generating the week's shopping list must complete within 2 seconds for a plan of up to 21 meals." (REQ-NF-001) |
| "Search should be quick." | "Search must return within 1 second for a library of up to 500 recipes." (REQ-NF-001) |
| "The app should support many users." | Not claimed — expected volume is unknown (Q-001), so no load target is stated. |

---

## Performance risks to check in review (Ch. 20 §20.5)

| Performance risk | What to check |
|---|---|
| Repeated queries | Does generation query per meal (N+1) instead of once for the week? |
| Overfetching | Does search return whole recipes when the list needs titles? |
| Slow external calls | Not applicable — no external services in version one (Round 6). |
| Missing limits | Can a plan or library grow past the stated volumes without a word? |
| Blocking work | Generation is synchronous by design; revisit if it ever exceeds its target. |

> Only refactor for performance when the change supports a clear goal: faster response,
> lower cost, fewer failures, or simpler scaling. Avoid asking the agent to "optimize
> everything" without a target.

---

## Performance tip (Ch. 7 §7.9)

Set realistic targets for the version you are building now. Overengineering performance
too early makes the system harder to finish and harder to understand.

Production performance signals → [`../ops/monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)

> Blueprint: blueprints/03-tests/03-non-functional/performance-tests.md
