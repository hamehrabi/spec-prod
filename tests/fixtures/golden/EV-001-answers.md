# EV-001 — the answers this workspace was produced from

**Project:** Pantry — a recipe and shopping-list application for home cooks.
**Depth:** `express` (two questions per round).
**Workspace:** [`EV-001/`](EV-001/)

---

## Why this file exists

Until now these answers existed **only in the head of whoever ran the intake.** The workspace
records what was *decided* but not what was *said*, so the run could not be repeated, and a
fixture that cannot be reproduced is not evidence — it is a document someone wrote.

That distinction is the whole basis of GOLD-001. Its own header says the fixture *"was not
authored — it was produced."* Nothing has been able to check that claim.

**This file is the input half of the pair.** With it, TASK-016's runner can re-generate the
workspace and diff it against the committed one. **If they differ, some part of the fixture was
authored where it should have been produced**, and that is a finding rather than a nuisance —
it is the same self-check the kit demands of every workspace it writes.

---

## The free-text problem statement

> Asked at both depths, always. It is the only part of the workspace grounded in the
> developer's own problem rather than in an option list.

**Round 1:**

> People who cook at home keep recipes scattered across screenshots, bookmarks and handwritten
> cards. When they plan a week of meals they have to open six places and still forget something
> at the shop, which costs them a second trip and food that goes off.

---

## Round 1 — the idea

| Q | Question | Answer |
|---|---|---|
| Q1 | What kind of application is this? | Web application with a UI |
| Q2 | Who is the primary user? | Individual consumers (B2C) |
| Q3 | How many people in the first six months? | **not asked** — express keeps two |
| Q4 | Build horizon for version one? | **not asked** — express keeps two |

Dropped questions became `Q-010` and `Q-011`, recorded with decision owners rather than
answered on the developer's behalf.

## Round 2 — scope boundaries

| Q | Question | Answer |
|---|---|---|
| Q1 | Which capabilities must exist in version one? | Save a recipe with its ingredients · plan which meals to cook in a week · generate one shopping list from that week · search saved recipes |
| Q2 | Which are explicitly out of scope? | **not asked** → `Q-002` |
| Q3 | What hard constraints already exist? | **not asked** → `Q-003` |
| Q4 | Which ONE do you compete on? | Turning a week of chosen meals into one shopping list |

Q4 is asked at both depths. The Q1 answer closed `Q-001`, and its marker was replaced in
`intent.md` and `project-brief.md`.

## Round 3 — users, roles, and data

| Q | Question | Answer |
|---|---|---|
| Q1 | What is the permission model? | Single user only, no sharing |
| Q2 | What must the system remember? | Account · Recipe · IngredientLine · WeeklyPlan · PlannedMeal · ShoppingList · ShoppingListItem |
| Q3 | Isolation between customers? | **not asked** — *derived* from Q1, with the derivation stated |

Q3 is the one derivation in this run. *Single user, no sharing* settles it, so stating it
repeats the developer's answer rather than inventing one — which is the line between an
inference and a default.

## Round 4 — product shape *(incomplete)*

| Q | Question | Answer |
|---|---|---|
| Q1 | What does success look like in the first month? | **not asked** → pairs with the existing `Q-009` |
| Q2 | What matters most in the interface? | Speed of the core task |
| Q3 | Pick the three qualities that matter most. | Simplicity / feasibility · Reliability / graceful failure · Accessibility |

**Round 4 is not accepted.** Three of its six files are written — `driving-characteristics.md`,
`fitness-functions.md`, `runtime-and-scale.md` — and a round is accepted whole or not at all, so
the change log records nothing for it.

Q3's rejected candidates, with reasons, are in `driving-characteristics.md` step 2. The one
worth reading is **security**: dropped *not* because it does not matter but because it is already
a hard requirement with denial tests that fail loudly, and a driver slot governs what degrades
quietly.

## Rounds 5 to 8

Not run.

---

## Gate responses

**Accept** at rounds 1, 2 and 3. Round 4's gate has not been reached.

Each acceptance appended a dated row to
[`EV-001/spec/01-docs/09-change-control/spec-change-log.md`](EV-001/spec/01-docs/09-change-control/spec-change-log.md),
which is the only record of how far the run got. There is no state file, by design — so this
file must not become one either. **It records what was answered, never where the run is.**
