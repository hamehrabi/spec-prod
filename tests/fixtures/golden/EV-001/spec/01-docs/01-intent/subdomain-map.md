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
| Turning a week of chosen meals into one shopping list | **Core** | It is the one thing the product competes on (Round 2 Q4). | Build in-house | Full | Full |
| Recipe management (save a recipe with ingredients; search) | **Supporting** | Necessary and simple; it feeds the core but is not the differentiator. | Build simply | Light | Acceptance only |
| Weekly meal planning (choose which meals to cook) | **Supporting** | Straightforward selection that feeds the core. | Build simply | Light | Acceptance only |
| Account / authentication | **Generic** | Every app needs it; nobody wins with it. | [TODO: buy vs build depends on hard constraints — Q-004] | Integration contract | Contract + failure |

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

> Blueprint: blueprints/01-docs/01-intent/subdomain-map.md
