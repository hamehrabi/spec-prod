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
| FF-001 | Simplicity / feasibility | Structural | No import cycles between the data, domain and interface layers | 0 cycles | CI | **Block merge** |
| FF-002 | Reliability / graceful failure | Operational | Every consolidation case in the acceptance criteria, run against a plan fixture — including AC-004, where the same ingredient appears in two units | 0 failures, and 0 silent unit conversions | CI | **Block merge** |
| FF-003 | Reliability / graceful failure | Structural | No outbound call to any external service on the shopping-list generation path | 0 external calls | CI | **Block merge** |
| FF-004 | Accessibility | Operational | Automated accessibility pass over each capability's primary screen, keyboard-only navigation included | 0 critical violations | CI | **Block merge** |

**Types**
| Type | Measures | Examples |
|---|---|---|
| **Structural** | Code shape | Dependency cycles, layer rules, cyclomatic complexity |
| **Operational** | Runtime behaviour | p95 latency, throughput, error rate |
| **Security** | Boundaries hold | Isolation, authorization, secret scanning |
| **Process** | Delivery health | Deploy success rate, test-suite duration |

## Rules

- **One per driving characteristic, minimum.** No driver without a fitness function is
  governed — it is only documented.
- It must **fail the build**, not print a warning. A warning is a decoration.
- Every ADR's **Compliance** field names the fitness function that enforces it.
- Measure **tail percentiles**, never averages.
- If a characteristic cannot be measured, its definition is too vague — go fix the
  definition, not the function.

---

## What each one is actually for

**FF-001 — simplicity.** A cycle between layers is the first thing that makes a one-person
codebase stop being a one-person codebase, and it never arrives as a decision. It arrives as
one convenient import.

**FF-002 — the core rule, measured.** BR-001 says identical ingredients combine and BR-002 says
different units do not. AC-004 is the case that matters: 200 g of flour and 2 cups of flour must
stay two lines. **The threshold names the silent failure explicitly** — zero conversions — because
an implementation that helpfully converted them would pass a naive "the list is consolidated"
check while producing a wrong quantity nobody can detect at the shop.

**FF-003 — reliability as a shape, not a behaviour.** The shopping list is generated from data
the cook already owns. Nothing on that path needs an outside service, and the moment something
adds one, the product's one promise starts depending on somebody else's uptime. This is
structural rather than operational deliberately: it fails when the dependency is *introduced*,
not when it first goes down.

**FF-004 — accessibility, before it is expensive.** It is the driver that is hardest to
retrofit, so the check exists from the first screen rather than from the first complaint.

## Not yet wired

**None of these four runs anywhere.** They are specified and unwired, and that is the honest
state — a fitness function that is written down but not in a gate governs nothing at all.

Wiring them is one of the three human-only actions the closing report names. Until then this
register is a decision, not a control.

| FF | Blocked on |
|---|---|
| FF-001 | Nothing — it can be wired as soon as there is a layer to check. |
| FF-002 | The acceptance criteria becoming executable tests in Round 7. |
| FF-003 | Nothing. |
| FF-004 | [TODO: where will this run?] — the gate has to exist somewhere. |

**Security has no fitness function here, and that is not an omission.** It is not a driver —
see [`../02-requirements/driving-characteristics.md`](../02-requirements/driving-characteristics.md)
step 2. It is guarded instead by denial tests AC-005 and AC-006, which fail loudly rather than
degrade quietly. If security were ever promoted to a driver, this register gains a row on the
same day.

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

**Next:** [`technical-spec.md`](technical-spec.md)

> Blueprint: blueprints/01-docs/04-technical-spec/fitness-functions.md
