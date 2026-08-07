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
| FF-001 | Simplicity | Structural | No import cycles between `ui`, `api`, `domain`, `data` layers | 0 cycles | CI | Block merge |
| FF-002 | Simplicity | Structural | Cyclomatic complexity per function | < 10 (waiver requires a comment) | CI | Block merge |
| FF-003 | Reliability | Operational | Every core write path (save recipe, generate list) has a failure-path test; no stack trace reaches the user | 0 unhandled errors surfaced | CI | Block merge |
| FF-004 | Accessibility | Structural | Automated accessibility scan (e.g. axe) on key screens | 0 critical violations | CI | Block merge |
| FF-005 | Security | Security | Every data query scoped by `account_id` | 0 unscoped queries | CI | Block merge |

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

> Blueprint source: this file is new to the template — added from the architecture review.

> Blueprint: blueprints/01-docs/04-technical-spec/fitness-functions.md
