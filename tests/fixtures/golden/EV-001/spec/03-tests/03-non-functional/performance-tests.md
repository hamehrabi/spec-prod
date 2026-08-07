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
| PTEST-001 | Generate shopping list | Response time | Feels immediate [TODO: precise target depends on scale — Q-001] | a week of up to ~21 meals | Check query design; avoid an N+1 over ingredients. | Planned |
| PTEST-002 | Recipe search | Response time | Feels immediate | one cook's recipe library | Add an index on `recipes(account_id)`. | Planned |

Performance is **not** a driving characteristic here (single user, small data), so targets are
kept simple and honest.

---

## Simple performance expectations (Ch. 17 §17.6)

| Feature | Simple performance expectation |
|---|---|
| Recipe list | Should load quickly for one cook's library. |
| Shopping-list generation | Should feel immediate for a week of meals. |
| Search | Results should appear quickly for common queries. |
| Photo upload | A bounded upload; the UI stays responsive. |

---

## Weak vs. measurable (Ch. 7 §7.9)

| Weak statement | Stronger requirement |
|---|---|
| "The list should generate fast." | "Shopping-list generation should feel immediate for a week of up to 21 planned meals." |
| "Search should be quick." | "Recipe search should return results quickly for one cook's library." |
| "The app should be responsive." | "The plan → list path should not block the UI." |

---

## Performance risks to check in review (Ch. 20 §20.5)

| Performance risk | What to check |
|---|---|
| Repeated queries | Does list generation query per ingredient in a loop (N+1)? |
| Overfetching | Does it load fields or records that are not needed? |
| Slow external calls | n/a in v1 — no external service. |
| Missing limits | Can a request return unbounded records? |
| Blocking work | Should photo processing move to a background job? |

> Only refactor for performance when the change supports a clear goal: faster response,
> lower cost, fewer failures, or simpler scaling. Avoid asking the agent to "optimize
> everything" without a target.

---

## Performance tip (Ch. 7 §7.9)

Set realistic targets for the version you are building now. Overengineering performance
too early makes the system harder to finish and harder to understand.

Production performance signals → [`../ops/monitoring-plan.md`](../../07-ops/02-monitoring/monitoring-plan.md)

---

> Blueprint: blueprints/03-tests/03-non-functional/performance-tests.md
