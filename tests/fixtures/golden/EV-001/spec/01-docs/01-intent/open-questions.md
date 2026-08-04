# Open Questions

> Source: Appendix A, Ch. 7 §7.11, Appendix C.
> Open questions must be **captured**, not hidden. An unresolved question that reaches an
> AI agent becomes a silent assumption — and silent assumptions become defects.

> **Technical spec guardrail (Appendix C):** open questions must not be treated as
> assumptions.

| ID | Question | Why it matters | Decision owner | Must be answered before | Status | Answer / decision |
|---|---|---|---|---|---|---|
| Q-001 | Which capabilities must exist in version one? | Everything later is derived from this list — the data model, the task order, the test plan. | Product owner | Design | Answered | Save a recipe with its ingredients · plan which meals to cook in a week · generate one shopping list from that week · search saved recipes. |
| Q-002 | Which capabilities are explicitly ruled out of version one? | A capability nobody ruled out is assumed in by whoever specifies next. Silence reads as inclusion. | Product owner | Design | Open | — |
| Q-003 | What hard constraints already exist — budget, platform, data, mandated technology? | A constraint changes the architecture rather than decorating it, and it silently rules out whole designs. | Product owner | Design | Open | — |
| Q-004 | Is there anyone who reviews, manages or supports this, or is the cook the only user? | Decides whether a permission model is needed at all, or whether every row belongs to one person. | Product owner | Design | Open | — |
| Q-005 | What does success mean for you as the owner of this project? | Without it there is nothing to weigh a scope decision against, and every request looks equally reasonable. | Product owner | Design | Open | — |
| Q-006 | What three to five measurable signs would tell you this is working? | These become the acceptance measures. Unmeasured success is indistinguishable from none. | Product owner | Release | Open | — |
| Q-007 | What could make this project fail? | A named risk gets a mitigation. An unnamed one gets discovered in production. | Product owner | Design | Open | — |
| Q-008 | Is capturing a recipe manual entry, a link, a photo, or more than one of these? | Each answer is a different product. A photo means image storage and extraction; a link means fetching and parsing someone else's page. | Product owner | Design | Open | — |
| Q-009 | What would tell you in the first month that this is working? | Different from Q-006: this is the early signal, not the target. It decides what to instrument first. | Product owner | Release | Open | — |
| Q-010 | How many people will use it in the first six months? | Sets the ceiling on every performance answer, and decides whether scaling work is needed at all. | Product owner | Design | Open | — |
| Q-011 | What is your build horizon for version one? | A horizon is what forces scope to be decided rather than deferred. Without one the specification has to supply the pressure. | Product owner | Design | Open | — |
| Q-012 | Which quality attributes matter most, and what measurable limit does each have? | Six of the seven non-functional requirements are waiting on it. A quality without a limit is an adjective, not a requirement. | Product owner | Design | Open | — |
| Q-013 | Does version one need to edit and delete a saved recipe, or only add one? | *Save a recipe* was the answer; changing one afterwards is a separate capability with its own screens, rules, and failure cases. Assuming it in would be a requirement nobody made. | Product owner | Design | Open | — |
| Q-014 | Which data store will this use? | Decides what the schema can promise — constraints, transactions, and whether BR-001's uniqueness rule can be enforced by the store at all. | Tech lead | Design | Open | — |
| Q-015 | Which authentication model does this project use? | Decides whether this system stores credential material or none, which is a materially different sensitive-data table. | Tech lead | Design | Open | — |
| Q-016 | Where will this run? | Constrains the runtime, the store's managed options, the secrets mechanism, and what a rollback means. | Tech lead | Implementation | Open | — |
| Q-017 | Which external services will this system depend on? | Two are visible as possible — an identity provider and object storage — and naming a provider before it is chosen makes it the choice. | Tech lead | Design | Open | — |
| Q-018 | What happens to a cook's recipes and plans when they close their account? | Deletion behaviour is decided everywhere else in the schema; this is the one path that has no answer, and it is the one with legal weight. | Product owner | Release | Open | — |

**Status values:** Open · Answered · Deferred · Rejected

> **Q-010 and Q-011 were never asked.** They are Round 1's third and fourth questions, dropped
> by `express` depth, which asks two per round. They are recorded here rather than answered on
> the developer's behalf — a guessed user count and a guessed deadline read exactly like stated
> ones, and nothing downstream could tell the difference.

> **Q-002 and Q-003 are Round 2's dropped pair**, for the same reason. Q-003 is the one to
> watch: constraints change the architecture, so the constraint table in
> [`constraints-and-non-goals.md`](constraints-and-non-goals.md) is written **marked rather
> than filled**, and every row there points back to this question.

---

## The ambiguity test (Ch. 2 §2.6)

Before moving forward, ask: *Could two competent developers build two different things
from this instruction?* If yes, it belongs in this table.

| Ambiguous statement | Why it is dangerous | Clarified version |
|---|---|---|
| "Turn the week's meals into a shopping list." | Says nothing about what happens when two recipes need the same ingredient, or in what units. Two developers build a list of duplicates and a list of sums. | "The shopping list combines identical ingredients across the week's chosen recipes into one line, with quantities summed per unit." |
| "Save a recipe." | Does not say what a recipe is made of, or how it arrives. | [TODO: is capturing a recipe manual entry, a link, a photo, or more than one of these?] |
| "Search saved recipes." | Does not say what is searched — the title, the ingredients, or both — and the two produce different results for the same query. | "Search matches recipe titles and ingredient names, and returns recipes containing every search term." |
| "Plan a week." | Does not say whether a week is fixed to Monday–Sunday, whether a day can hold more than one meal, or whether a recipe can repeat. | "A plan covers seven consecutive days from a chosen start date; a day holds zero or more meals; the same recipe may appear on more than one day." |

**The first row is the core subdomain's central rule**, which is why it is written out rather
than deferred — see [`subdomain-map.md`](subdomain-map.md).

---

**Next:** [`constraints-and-non-goals.md`](constraints-and-non-goals.md)

> Blueprint: blueprints/01-docs/01-intent/open-questions.md
