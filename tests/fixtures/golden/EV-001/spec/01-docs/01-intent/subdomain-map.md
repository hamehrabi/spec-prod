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
| Turning a week of chosen meals into one shopping list | **Core** | This is the answer to *what do you compete on*. Recipe storage is a solved problem anyone can copy; consolidating a week of overlapping ingredients into a list you can shop from once is the thing that removes the second trip. It is also where the rules are genuinely hard — units, part-quantities, the same ingredient named two ways. | Build | Full | Full |
| Recipe storage and retrieval | **Supporting** | Necessary, and the product is unusable without it, but nobody chooses a recipe app because its storage is better. It changes rarely once the shape is fixed. | Build simply | Light | Acceptance only |
| Weekly plan — choosing which meals fall on which days | **Supporting** | A calendar of references. Simple, stable, and no competitor is beaten by a better one. | Build simply | Light | Acceptance only |
| Search across saved recipes | **Supporting** | Ordinary text matching over one person's own data. The volume is small enough that the obvious approach is the right one. | Build simply | Light | Acceptance only |
| Accounts and sign-in | **Generic** | Every application needs it and none wins with it — the textbook generic subdomain. | **Undecided — blocked on [`CON-006`](constraints-and-non-goals.md).** Generic says *buy*; whether a paid identity provider is allowed is the budget constraint nobody has stated yet ([`Q-003`](open-questions.md)). | Integration contract only | Contract and failure behaviour |

**Test:** *could this be sold on its own? would someone pay for it?* → then it is **core**.

Applied here: a service that took a week's recipes and returned one correctly consolidated
shopping list would be worth paying for. A service that stored recipes would not.

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

## What this table has already changed

- **Ingredient consolidation gets the full chain**, including the rule written out in
  [`open-questions.md`](open-questions.md)'s ambiguity test: identical ingredients across the
  week combine into one line with quantities summed per unit. That rule is the product.
- **Search gets a few lines and acceptance criteria, not a design.** It was the capability
  most likely to attract effort — search is interesting to build — and it is supporting.
- **Accounts get an integration contract and nothing more**, whichever way `CON-006` resolves.
  The row stays undecided rather than defaulting to *build*, because defaulting to build is
  precisely how three weeks disappear into authentication.

**The mistake this prevents, stated for this project:** the obvious first move is to build a
good recipe editor, because it is visible and satisfying. A better recipe editor changes
nothing about whether the weekly shop takes one trip.

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

**Next:** [`../02-requirements/requirements.md`](../02-requirements/requirements.md)

> Blueprint: blueprints/01-docs/01-intent/subdomain-map.md
