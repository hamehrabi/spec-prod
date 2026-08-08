# Project Brief

> Source: Ch. 16 §16.2 — Project Brief Template.
> Plain language. Not technical. Written before requirements exist.

**Project name:** Pantry

**Problem you want to solve:** Home cooks keep recipes scattered across screenshots, bookmarks, and handwritten cards, and when they plan a week of meals they forget items at the shop — costing a second trip and food that spoils.

**Primary users:** Individual home cooks (B2C), managing their own recipes and weekly meal planning.

**Main outcome:** A cook keeps recipes in one place, plans a week, and shops from a single list — fewer second trips, less waste.

**Must-have features:**
- Save a recipe with its ingredients
- Plan which meals to cook in a week
- Generate one shopping list from that week
- Search saved recipes

**Out-of-scope features:**
- [TODO: what is explicitly out of scope for version one? — deferred at express depth (Q-004)]

**Known constraints:**
- A browser-based web application used by one individual consumer.
- [TODO: what hard constraints already exist — budget, single small server, data-storage limits, mandated technology? — deferred at express depth (Q-005)]

**Success signal:** A cook plans a week of meals and shops from a single list with no forgotten-item second trip.

---

## Separate vision from implementation (Ch. 2 §2.2)

Write these in two columns. Do not let implementation ideas contaminate the vision.

| Vision statement (what should improve) | Implementation idea (how it might be built) |
|---|---|
| A home cook keeps every recipe in one place instead of scattered screenshots, bookmarks, and cards. | You may need a saved-recipe store that holds each recipe with its ingredients. |
| A week of chosen meals becomes one shopping list, so nothing is forgotten at the shop. | You may need a weekly plan that aggregates its meals' ingredients into a single list. |

---

## Raw-idea interrogation (Ch. 2 §2.1)

| Question | Answer |
|---|---|
| Who is this for? (the actual user, not the requester) | Individual home cooks — not a business or a team. |
| What problem hurts enough to solve? | Recipes are scattered, and shopping for a planned week forgets items, causing second trips and spoiled food. |
| What outcome should improve? | One place for recipes; a week planned; a single shopping list; fewer second trips and less waste. |
| What must the system **not** do? | [TODO: what is explicitly out of scope for version one? — deferred at express depth (Q-004)] |
| What constraints already exist? | A browser-based web app for one individual consumer. Fuller hard constraints not yet decided — [TODO: what hard constraints already exist? — deferred at express depth (Q-005)] |

---

## Problem statement formula (Ch. 2 §2.3)

> [Affected user] currently faces [difficulty], which causes [consequence].
> The system should [desired improvement].

**Your problem statement:** Home cooks currently keep recipes scattered across screenshots, bookmarks, and handwritten cards and forget items when shopping for a planned week, which causes second trips and food that spoils. The system should let them keep recipes in one place, plan a week, and shop from a single list.

---

> Blueprint: blueprints/01-docs/01-intent/project-brief.md
