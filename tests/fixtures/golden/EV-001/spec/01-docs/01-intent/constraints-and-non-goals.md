# Constraints and Non-Goals

> Source: Ch. 30 §30.2, Ch. 5 §5.6, Ch. 6 §6.5.
> Out-of-scope decisions are as important as in-scope decisions — they protect focus and
> stop the agent from adding features you never approved.

## Constraints

A constraint is a fixed condition that limits the solution. State real-world limits before
implementation, because AI agents invent ideal solutions.

> **This table is marked, not filled, and that is deliberate.** The constraints question is
> Round 2's third, and `express` depth asks two questions per round. Nothing here was
> answered, so nothing here is written down as though it had been.
>
> The temptation is to fill it with the constraints that are usually true — no paid services,
> one small server, no card data. Every one of those would be plausible, and a guessed
> constraint is indistinguishable from a stated one once it is in the table. A constraint also
> changes the architecture rather than decorating it, which is exactly the class of thing
> `instructions/inference.md` forbids inferring.
>
> All eight rows are one question, [`Q-003`](open-questions.md). Answering it fills the table
> in a single pass.

| ID | Type | Constraint |
|---|---|---|
| CON-001 | Technology | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| CON-002 | Time | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| CON-003 | Data | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| CON-004 | Environment | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| CON-005 | Integration | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| CON-006 | Budget | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| CON-007 | Compliance / privacy | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| CON-008 | Team skill | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |

**Examples (Ch. 5 §5.6)**

| Type | Example |
|---|---|
| Technology | The frontend must be built with plain HTML, CSS, and JavaScript for v1. |
| Time | The first working version must be small enough to build in one week. |
| Data | The system must not store payment card details. |
| Environment | The application must run on a low-cost cloud instance. |
| Integration | The system must export task data as CSV. |

> **Warning:** do not let a constraint become an excuse for poor design. A constraint
> guides the solution; it does not lower the quality standard.

**What the empty table already costs.** CON-006 is unanswered, so
[`subdomain-map.md`](subdomain-map.md) cannot decide whether accounts and sign-in are bought
or built — the row carries both and names this table as the blocker. That is the visible
price of a dropped question, and it is the reason it is visible rather than assumed.

---

## Non-goals / out of scope

State whether each item is excluded **permanently**, **deferred**, or **waiting for
information**.

> **Also marked rather than filled**, for the same reason: this is Round 2's second question,
> and it was not asked. An explicit *no* is a decision; a *no* nobody said is an accident that
> looks like a decision once it is in a table.

| Item | Reason it is excluded now | Future status |
|---|---|---|
| [TODO: which capabilities are explicitly ruled out of version one?] | Not asked at this depth — see [`Q-002`](open-questions.md). | Waiting for information |

**What is in scope is a decision, and it was made.** Version one is the four capabilities in
[`Q-001`](open-questions.md): save a recipe with its ingredients, plan which meals to cook in a
week, generate one shopping list from that week, and search saved recipes.

**Anything not on that list is unbuilt, not ruled out.** The distinction matters: an unbuilt
capability is one nobody has decided about, and it will be proposed again. A ruled-out one has
a reason attached and stops coming back. Until Q-002 is answered this document can only claim
the first.

---

## Scope control habit (Ch. 6 §6.4)

For every feature you include, write one sentence explaining why it belongs in **this**
version. If you cannot explain the value, move it to the table above.

| Capability | Why it belongs in version one |
|---|---|
| Save a recipe with its ingredients | Nothing else in the product works without recipes to draw on. |
| Plan which meals to cook in a week | The week is the unit the shopping list is generated from; without it there is nothing to consolidate. |
| Generate one shopping list from that week | This is the problem statement. The second trip to the shop is the pain the product exists to remove. |
| Search saved recipes | A recipe nobody can find again is the scattered-screenshots problem with an extra step. |

**Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
main product idea? If yes, it is probably not a must-have for v1.

Applied here, the test passes for the first three and is arguable for the fourth: the main idea
can be tested with a handful of recipes and no search at all. Search stays in version one
because the problem being solved is *finding* recipes, not storing them — but it is the first
capability to cut if the horizon in [`Q-011`](open-questions.md) turns out to be short.

---

**Next:** [`subdomain-map.md`](subdomain-map.md)

> Blueprint: blueprints/01-docs/01-intent/constraints-and-non-goals.md
