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
| | Core / Generic / Supporting | | | Full | Full |
| | | | | Light | Acceptance only |

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

# WORKED EXAMPLE — ProjectBoard

| Area | Type | Why | Build / Buy |
|---|---|---|---|
| Task ownership + progress visibility | **Core** | This is the product. It is what a customer pays for and where competitors differ. | Build |
| Authentication / sessions | **Generic** | Every app needs it, none wins with it. | Build in v1 only because CON-006 blocks paid services — **flagged to buy at v2** |
| Email delivery | **Generic** | Solved problem. | Buy (provider) |
| CSV export | **Supporting** | Needed, simple, stable. | Build simply — transaction script, no domain model |
| Admin user list | **Supporting** | Pure CRUD. | Build simply |

**What this table changed:**

- Auth got a **thin** spec and an ADR noting it is a temporary in-house build, not a
  differentiator. Nobody spent a week modelling it.
- CSV export was implemented as a transaction script, not as a domain model. When the
  agent proposed an elaborate export-strategy hierarchy, "supporting subdomain" was the
  one-word reason to reject it.
- Task ownership got the full chain: aggregates, invariants, ADR-002, unit-heavy tests.

> **The mistake this prevents:** three of the first five agent tasks were spent building
> auth. Auth is generic. That effort belonged on the core.
