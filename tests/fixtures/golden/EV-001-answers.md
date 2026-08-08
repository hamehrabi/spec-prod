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

### It found one, on 2026-08-07

The paragraph above was written as a hypothetical. It is not one. Two runs on different days,
and FF-007 arriving independently by a different route, agree that **four files in the committed
workspace deviate from their own blueprints**:

| File | What the fixture did |
|---|---|
| `intent.md` | Dropped `### Starter (Appendix A)`, which no instruction sanctions removing |
| `subdomain-map.md` | Invented `## What this table has already changed` |
| `fitness-functions.md` | Invented `## What each one is actually for` |
| `database-design.md` | Dropped `## Rules` |

The two invented headings sit exactly where the blueprint's `# WORKED EXAMPLE` was, so a person
deleted the worked example and wrote a replacement section from memory. That is BUG-024 — and
the fixture predates its fix. On the one file the comparison could reach twice, **the kit
produced the blueprint's structure and the fixture did not.**

So GOLD-001's header claim was false, and the pair this file created is what showed it. The
workspace is being regenerated rather than patched: four hand-edits are what was found, a
file-by-file read would find more, and every one repaired by hand recreates the defect being
repaired.

### And it was closed, on 2026-08-08

The regeneration succeeded — eight rounds, 87 files, the run recorded in `ai-evals.md` §5 —
and its output **is** now the committed workspace: TASK-016 swapped it in whole, and every
GOLD-001 assertion was rewritten against what the run wrote rather than against what anyone
remembered. The four deviations above are gone the only way they could honestly go: the files
that carried them were replaced by produced ones. The header claim — *produced, not authored* —
is now true of every file in the fixture, and this record is what it rests on.

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

Both dropped questions were filed in `open-questions.md` with a decision owner, rather than
answered on the developer's behalf. **Which Q-### they became is not recorded here** — the
numbering is something the run produces, and a number written down on the input side is a
number the next run has to reproduce to look correct. (An earlier draft of this file did name
them, and named them wrongly.)

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

## Round 4 — product shape

| Q | Question | Answer |
|---|---|---|
| Q1 | What does success look like in the first month? | **not asked** → pairs with the existing `Q-009` |
| Q2 | What matters most in the interface? | Speed of the core task |
| Q3 | Pick the three qualities that matter most. | Simplicity / feasibility · Reliability / graceful failure · Accessibility |

Q3's rejected candidates, with reasons, belong in `driving-characteristics.md` step 2. The one
worth reading is **security**: dropped *not* because it does not matter but because it is already
a hard requirement with denial tests that fail loudly, and a driver slot governs what degrades
quietly.

## Round 5 — architecture and stack

| Q | Question | Answer |
|---|---|---|
| Q1 | Which architecture style? | Modular monolith |
| Q2 | Which data store? | A relational database — SQLite while it is one person's, with nothing in the schema that would stop it becoming Postgres |
| Q3 | Which authentication model? | **not asked** |
| Q4 | What must be true before this is safe to run for real? | **not asked** |

Q2 is a derived question, so the options a run offers depend on what Rounds 1–4 established.
The answer above is what the developer picked, not the list they picked it from — recording
the list would be recording the kit's behaviour, and this file is the input half.

## Round 6 — security, reliability, and integrations

| Q | Question | Answer |
|---|---|---|
| Q1 | What must never leak or be logged? | **not asked** |
| Q2 | Which external services will you depend on? | None in version one |
| Q3 | When something is slow or fails, what should the user see? | **not asked** |
| Q4 | Does the system store files that users upload or generate? | Yes, and they are private to one user — photos of finished dishes |

**These two answers are in tension, deliberately.** Storing user files while depending on no
external service means the files live on the same box as the application, which is a real
constraint with real consequences for backup and for what Round 8's answer can promise. A
fixture whose answers never pull against each other tests only the easy path.

## Round 7 — tasks and tests

| Q | Question | Answer |
|---|---|---|
| Q1 | How should the work be sequenced? | Thin vertical slices — one feature end to end at a time |
| Q2 | How thorough should the test plan be? | **not asked** |
| Q3 | Who or what will write the code? | An AI coding agent, one task at a time |

## Round 8 — operations

| Q | Question | Answer |
|---|---|---|
| Q1 | Where will this run? | Not decided yet |
| Q2 | Which environments will exist? | **not asked** |
| Q3 | What is your monitoring appetite? | **not asked** |
| Q4 | If the data were lost right now, how much could you afford to lose, and how long could you be down? | A day of edits would sting but survive. Losing the recipe library would end the project — those are years of handwritten cards. Being down a whole evening is fine; nobody cooks from it at 3am. |

Q4 is free text at both depths, like Round 1's problem statement, and for the same reason: a
recovery objective picked from a list is a number nobody owns.

---

## Gate responses

**Accept** at all eight rounds. This is the happy path: a developer who answers every round and
agrees with what each one produced.

That is a deliberate choice about what EV-001 is *for*, not an assumption that runs go this way.
Decline, revise and stop are real outcomes with their own consequences — a declined file leaves
a stage partial, and a partial Round 1 is what BUG-026 was about. They belong in cases of their
own, where the thing under test is the outcome rather than the interview.

Each acceptance appended a dated row to
[`EV-001/spec/01-docs/09-change-control/spec-change-log.md`](EV-001/spec/01-docs/09-change-control/spec-change-log.md),
which is the only record of how far the run got. There is no state file, by design — so this
file must not become one either. **It records what was answered, never where the run is.**
