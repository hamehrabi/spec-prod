# fitness-functions.md — Automated Architecture Governance

> **Purpose:** stop your architecture decisions from decaying silently.
> **When you use it:** one per driving characteristic, wired into the CI gate.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 6.

> A fitness function is **any mechanism that objectively assesses an architectural
> characteristic**: a test, a metric, a monitor, a CI script, a chaos experiment.
>
> **"High performance" is not a fitness function. A measurable threshold is.**

A test proves the feature does what was asked. A fitness function proves the **system
still has the shape you decided on**. They are different jobs; you need both.

---

## The register

| ID | Guards | Type | Check | Threshold | Runs | On failure |
|---|---|---|---|---|---|---|
| FF-001 | Simplicity / feasibility | Structural | No import cycles between the UI, the domain modules (Recipes, Planning, ShoppingList), and the data layer. | 0 cycles | Not wired yet — CI gate set up in Round 8 ([`cicd-pipeline.md`](../../07-ops/01-deployment/cicd-pipeline.md)) | Block merge (once wired) |
| FF-002 | Reliability / graceful failure | Process | Every defined failure state has a handler and a failure test; a simulated save failure preserves the cook's input. | 0 unhandled failure states | Not wired yet — CI gate set up in Round 8 ([`cicd-pipeline.md`](../../07-ops/01-deployment/cicd-pipeline.md)) | Block merge (once wired) |
| FF-003 | Accessibility | Operational | Automated accessibility scan on the core screens (plan a week, generate the list), plus keyboard-only completion of those flows. | 0 critical violations; core flows keyboard-completable | Not wired yet — CI gate set up in Round 8 ([`cicd-pipeline.md`](../../07-ops/01-deployment/cicd-pipeline.md)) | Block merge (once wired) |

> **`FF-` identifiers are DEFINED here, and only here.** Downstream files cite them — a task
> names the fitness functions it must satisfy, a CI pipeline names the gates it runs — and a
> citation is the id plus, at most, the characteristic it guards. **Do not restate what the
> function checks or its threshold**; those live in this register, and a second copy is a second
> thing to keep correct.
>
> A run put `FF-001`, `FF-002` and `FF-003` into a task file's test table and into an invented
> CI gate table, each with its own wording of the same check. Nothing was wrong on the day it
> was written and nothing kept the three in step afterwards.
>
> **`Runs` and `On failure` are claims about a gate that has to EXIST.** Writing `CI` here says
> a pipeline runs this check and a merge is blocked when it fails. If there is no pipeline yet —
> and on a new project there usually is not — then write **`Not wired yet`** in `Runs` and name
> the task that will wire it.
>
> These two columns arrived pre-filled with `CI` and `Block merge`. Every workspace inherited
> them, so every register asserted enforcement that nobody had built, and the file that exists
> to stop decisions decaying silently was itself the decoration it warns about. **A fitness
> function written down but not in a gate governs nothing** — say which it is.

**Types**
| Type | Measures | Examples |
|---|---|---|
| **Structural** | Code shape | Dependency cycles, layer rules, cyclomatic complexity |
| **Operational** | Runtime behaviour | p95 latency, throughput, error rate |
| **Security** | Boundaries hold | Isolation, authorization, secret scanning |
| **Process** | Delivery health | Deploy success rate, test-suite duration |

## Rules

- **One per driving characteristic, minimum.** No driver without a fitness function is
  governed — it is only documented. The three above map one-to-one to the three drivers in
  [`driving-characteristics.md`](../02-requirements/driving-characteristics.md).
- It must **fail the build**, not print a warning. A warning is a decoration.
- **Say honestly whether it runs.** None of the three run yet — there is no pipeline on a new
  project. Each names the round that wires it, and until then it governs nothing.
- Every ADR's **Compliance** field names the fitness function that enforces it.
- Measure **tail percentiles**, never averages.
- If a characteristic cannot be measured, its definition is too vague — go fix the
  definition, not the function.

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

> Blueprint: blueprints/01-docs/04-technical-spec/fitness-functions.md
