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

**There is exactly one core subdomain.** That is deliberate. Everything else on this page
exists to serve it, and any hour spent on a lower row is an hour not spent on the top one.

| Area of the system | Type | Why | Build / Buy | Spec depth | Test depth |
|---|---|---|---|---|---|
| **Intake: question design, inference, and specification synthesis** — what to ask, in what order, what to infer rather than ask, when to push back on a contradiction, how deep to write each generated file, and how to fill it with decisions instead of placeholders | **Core** | Named by the kit author as the thing they compete on. It is the only part a competitor cannot acquire by reading the output — the templates are visible, the judgement behind the questions is not. It also changes constantly: every intake that goes badly is evidence that a question was wrong. | **Build** | **Full** — full chain, ADRs, deep modelling of the question flow and depth rules | **Full** — pyramid, mostly unit; every inference rule and every depth rule gets a case |
| **Blueprint library** — the ~90 template files, their section structure, and their worked examples | **Supporting** | Necessary, largely already written, and rarely changing once stable. *Tension worth naming:* it would pass the "could you sell it alone?" test, so this classification is a judgement, not an obvious call. It is filed as supporting because the kit author chose the interview as the differentiator, and because a library anyone can read is a library anyone can copy. | **Build simply** — package and version what exists in `spec-driven-template/`; do **not** rewrite it in v1 | **Light** — one page covering packaging, versioning, and integrity | **Acceptance only** — every blueprint is present, readable, and reachable |
| **Agent governance contract generation** — producing `AGENT.md`, task files with allowed-file and do-not-change lists, and the boundary rules into the workspace | **Supporting** | The *mechanism* is trivial: fill a template with the developer's IDs and write it out. The *content* is critical — it is where control is either real or decorative (RSK-5). Cheap to build, expensive to get wrong, so the care belongs in the blueprint content, not in the machinery. | **Build simply** | **Light** — one page; the substance lives in the blueprint library's `AGENT.md` template | **Acceptance only**, plus one end-to-end check that a generated `AGENT.md` names real requirement IDs from the same workspace |
| **Workspace validation** — checking that requirement IDs resolve, no row is silently blank, every permission has a deny test, every driving characteristic has a fitness function | **Supporting** | A finite list of mechanical checks over Markdown that was just written. No modelling required. Necessary because without it the intake reports success on unverified work. | **Build simply** — a checklist walked over the generated files, not a rules engine | **Light** — one page listing the checks | **Acceptance only** — one case per check, each proving the check *fails* on a deliberately broken workspace |
| **Resume from a partial workspace** — detecting what already exists and continuing from the first incomplete stage | **Supporting** | Simple: read the folder, decide the stage, carry on. Necessary because an intake that must be completed in one sitting will be abandoned mid-way (RSK-1). | **Build simply** — the generated files are the state; no separate progress store (CON-001) | **Light** | **Acceptance only** — reversed pyramid, mostly end-to-end |
| **Plugin packaging and installation** — plugin manifest, command registration, getting the kit's files onto a developer's machine | **Generic** | Every Claude Code plugin needs this and none wins with it. The host already defines the mechanism. | **Adopt** — use Claude Code's own plugin and marketplace mechanism exactly as documented. Do **not** write a custom installer, bootstrapper, or `install.sh` (CON-004 forbids the last one outright) | **Integration contract only** — which manifest fields are used and what each must contain | **Contract + failure** — installs cleanly on all three platforms; fails loudly rather than half-installing |
| **Distribution and updates** — how a developer gets version two | **Generic** | Solved by the host. Building a private update channel would be waste, and CON-003 forbids the network call anyway. | **Adopt** — the plugin marketplace mechanism | **Integration contract only** | **Contract + failure** |
| **Writing files into the developer's repository** | **Generic** | The host agent already has file tools that handle paths, encodings, and permissions across all three platforms. | **Adopt** — use the host's file tools. Do **not** build a templating engine or a virtual filesystem layer. The blueprint files are Markdown with substitutions, not a rendering problem | **Integration contract only** | **Contract + failure** — including the CON-005 case: refuses to overwrite an existing file without asking |
| **Documentation and marketplace listing** — README, install instructions, first-run guidance | **Supporting** | Necessary, simple, stable. | **Build simply** | **Light** | **Acceptance only** |
| **Telemetry and adoption measurement** | *(not built)* | Would be generic and obviously bought — except **CON-003 and CON-007 forbid it entirely**. Flagged here rather than omitted, because its absence has a consequence: success measure SM-2 (intake completion rate) has no way to be observed. | **Neither — blocked by constraint.** Revisit only if CON-007 is reopened, which means reopening a promise made to the user | — | — |

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

## What this table is expected to change

Written now, before requirements, so that it can be checked later against what actually
happened. If none of these predictions come true, the map was decoration.

| Prediction | What it rules out |
|---|---|
| Plugin packaging gets an integration contract and nothing more. | An agent proposing a custom installer, a bootstrap CLI, or a first-run wizard. The answer is one word: *generic*. |
| No templating engine, no plugin-side rendering layer, no virtual filesystem. | The most likely over-engineering in this project. Blueprints are Markdown; substitution is a fill, not a render. |
| The blueprint library is packaged, not rewritten, in v1. | Weeks disappearing into re-authoring 90 templates that already work — the direct analogue of "three of the first five tasks went to auth". |
| Validation is a checklist over files, not a rules engine with a DSL. | A schema language for specifications. It would be a fine product; it is not this one, and not in four weeks. |
| The intake's question flow gets ADRs and unit-level tests covering each inference and depth rule. | Treating the interview as glue code — which is what happens by default, because the question flow *looks* like configuration. |

> **The mistake this prevents:** in a project whose subject matter is specifications, the
> gravitational pull is toward building a specification *system* — schemas, validators,
> renderers, a DSL. All of that is machinery around the templates. The thing being competed
> on is which questions get asked and how the answers become decisions.

---

## Open tension to revisit

The blueprint library is classified **supporting** while plausibly passing the core test.
If usage shows that developers choose the kit for the depth of its templates rather than
for the interview, this map is wrong and the strategy built on it — thin specs and light
tests for the library — is wrong with it. Recorded as **Q-003** in
[`open-questions.md`](open-questions.md).

> Blueprint: ../../../spec-driven-template/01-docs/01-intent/subdomain-map.md
