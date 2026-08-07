# Project Brief

> Source: Ch. 16 §16.2 — Project Brief Template.
> Plain language. Not technical. Written before requirements exist.

**Project name:** Pantry

**Problem you want to solve:** Home cooks keep recipes scattered across screenshots,
bookmarks and handwritten cards. Planning a week of meals means opening six places and still
forgetting something at the shop — a second trip, and food that goes off.

**Primary users:** Individual home cooks (B2C), using it for themselves.

**Main outcome:** A cook keeps their recipes in one place and turns a week of chosen meals
into one shopping list, forgetting nothing.

**Must-have features:**
- Save a recipe with its ingredients
- Plan which meals to cook in a week
- Generate one shopping list from that week
- Search saved recipes

**Out-of-scope features:**
- Recorded in [`constraints-and-non-goals.md`](constraints-and-non-goals.md) — out-of-scope was not decided at this depth (Round 2).

**Known constraints:**
- [TODO: what is the build horizon for version one? — Q-002]
- Further hard constraints: see [`constraints-and-non-goals.md`](constraints-and-non-goals.md) (Round 2).

**Success signal:** A cook plans a week and the app produces one shopping list that includes
every ingredient of every planned meal — no second trip for a forgotten item.

---

## Separate vision from implementation (Ch. 2 §2.2)

Write these in two columns. Do not let implementation ideas contaminate the vision.

| Vision statement (what should improve) | Implementation idea (how it might be built) |
|---|---|
| A cook can find any of their recipes in one place instead of six. | A saved-recipe store with search over titles and ingredients. |
| A week of chosen meals becomes one shopping list, with nothing forgotten. | A weekly plan of meals, and a step that rolls its recipes' ingredients into a single list. |

---

## Raw-idea interrogation (Ch. 2 §2.1)

| Question | Answer |
|---|---|
| Who is this for? (the actual user, not the requester) | An individual home cook, cooking for themselves. |
| What problem hurts enough to solve? | Scattered recipes and forgotten shopping items that cause a second trip and wasted food. |
| What outcome should improve? | Planning a week and shopping for it becomes one task; nothing is forgotten. |
| What must the system **not** do? | See [`constraints-and-non-goals.md`](constraints-and-non-goals.md) (Round 2). |
| What constraints already exist? | [TODO: build horizon for version one — Q-002]; further constraints in [`constraints-and-non-goals.md`](constraints-and-non-goals.md). |

---

## Problem statement formula (Ch. 2 §2.3)

> [Affected user] currently faces [difficulty], which causes [consequence].
> The system should [desired improvement].

**Your problem statement:** Home cooks currently keep recipes scattered across screenshots,
bookmarks and handwritten cards and forget items when shopping for a week of meals, which
costs them a second trip and food that goes off. The system should keep their recipes in one
place and turn a week of chosen meals into one complete shopping list.

---

> Blueprint: blueprints/01-docs/01-intent/project-brief.md
