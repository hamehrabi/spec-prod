# subdomain-map.md — Core / Generic / Supporting

> **Purpose:** decide where effort goes before you decide anything else.
> **When you use it:** right after `intent.md`, before requirements.
> **Source:** Khononov, *Learning Domain-Driven Design*, Ch. 1.

One table. It redirects budget, hiring, build-vs-buy, spec depth, and test rigour.
Skip it and you will over-engineer the login screen and under-model the thing you
actually compete on.

| Type | Recognise it by | What to do |
|---|---|---|
| **Core** | Differentiating, complex, **changes constantly** | Build in-house. Best people. Richest modelling. **Never duplicate it.** |
| **Generic** | Everyone needs it, nobody wins with it (auth, payments, email) | **Buy or adopt.** Building it is waste. |
| **Supporting** | Necessary, simple, rarely changes (CRUD, admin screens) | Build simply, or outsource. Cheapest pattern that works. |

---

## The map

| Area of the system | Type | Why | Build / Buy | Spec depth | Test depth |
|---|---|---|---|---|---|
| Weekly plan → single shopping list (aggregating a week's meals into one list) | Core | This is what Pantry competes on — turning a week of chosen meals into one shopping list. | Build in-house | Full | Full |
| Recipe storage (a recipe with its ingredient lines) | Supporting | Necessary raw material for the core; simple to model and changes rarely. | Build simply | Light | Acceptance only |
| Weekly meal planning (choosing which meals to cook this week) | Supporting | Selecting saved recipes into a week; simple, and it feeds the core list. | Build simply | Light | Acceptance only |
| Recipe search | Supporting | Finding a saved recipe over one person's library; simple and stable. | Build simply | Light | Acceptance only |
| Account / authentication | Generic | Every app needs a signed-in account; nobody wins on it. | Adopt/buy unless a constraint forbids — revisit with hard constraints (`Q-005`) and the auth model in Round 5 | Contract only | Contract + failure |

**Test:** *could this be sold on its own? would someone pay for it?* → then it is **core**.

**Useful heuristic:** look for the worst-designed component — the one everyone hates and
the business refuses to rewrite because of the risk. That is very often a core subdomain.

---

## What each type changes downstream

| | Core | Generic | Supporting |
|---|---|---|---|
| Spec | Full chain, ADRs, deep modelling | Integration contract only | One page |
| Pattern | Domain model (rich objects, invariants) | Adapter around the bought thing | Transaction script / CRUD |
| Tests | Pyramid — mostly unit | Contract + failure tests | Reversed — mostly end-to-end |
| Review | Every change | Integration points only | Sampled |
| Who builds it | Your strongest people | Anyone | Training ground |

> **Never use "separate ways" for a core subdomain** — duplicating it defeats the whole
> strategy. Generic and supporting can be duplicated cheaply if it removes friction.

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

> Blueprint: blueprints/01-docs/01-intent/subdomain-map.md
