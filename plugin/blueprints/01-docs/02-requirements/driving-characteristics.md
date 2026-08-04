# driving-characteristics.md — Pick Three

> **Purpose:** choose the small set of quality attributes that will shape the structure.
> **When you use it:** after requirements, before the technical spec.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 4–6.

> **Pick three. More than three and you have prioritised nothing.**
> Every characteristic you support adds effort, complexity, and interaction effects.

---

## Step 1 — Translate business concerns into candidates

| Business concern (their words) | Candidate characteristics |
|---|---|
| Time to market | Agility, testability, deployability |
| User satisfaction | Performance, availability, fault tolerance |
| Competitive advantage | Agility, scalability, availability |
| Mergers / acquisitions | Interoperability, extensibility, adaptability |
| Tight time / budget | **Simplicity, feasibility** |

A concern is an **architecture characteristic** only if all three hold:
it is **non-domain**, it **influences structure**, and it is **critical to success**.

Decompose composites: *agility* = deployability + modularity + testability.

## Step 2 — Candidates considered

Keep roughly seven. Preserve the rejected ones — that list is why the decision was sound.

| Candidate | Kept? | Reason |
|---|---|---|
| | ✅ / ❌ | |

## Step 3 — The three drivers (unordered)

| # | Characteristic | Precise definition | Observable measure | Fitness function |
|---|---|---|---|---|
| 1 | | | | → `../04-technical-spec/fitness-functions.md` |
| 2 | | | | |
| 3 | | | | |

> If you cannot state a **measure**, the definition is too vague. Rewrite it before
> moving to the technical spec.

## Step 4 — Explicitly NOT driving

| Characteristic | Why it is not a driver here |
|---|---|
| | |

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

# WORKED EXAMPLE — ProjectBoard

**Business concerns heard:** *"teams waste time in status meetings"*, *"we have one
developer and one week"*, *"clients' data must not mix"*.

### Candidates considered

| Candidate | Kept? | Reason |
|---|---|---|
| Simplicity | ✅ | One developer, one week (CON-002). Feasibility is a real constraint. |
| Security | ✅ | Multi-tenant data. A leak ends the product. |
| Performance | ✅ | The core promise is "see current work fast". Slow = unused. |
| Scalability | ❌ | 50 users in v1 (CON-004). Revisit at 1,000. |
| Elasticity | ❌ | Load is flat and predictable — weekday mornings. |
| Availability | ❌ | Internal-ish tool; an hour of downtime is survivable in v1. |
| Extensibility | ❌ | Requirements are stable and narrow for v1. |

### The three drivers

| # | Characteristic | Precise definition | Observable measure | Fitness function |
|---|---|---|---|---|
| 1 | **Simplicity** | One developer can add a feature end-to-end in under a day. | Cyclomatic complexity < 5; no cycles between modules | FF-001, FF-002 |
| 2 | **Security** | No user ever reads or writes another project's data. | Zero cross-project rows in any response | FF-003 |
| 3 | **Performance** | Task list feels instant at realistic size. | p95 < 2 s for a 500-task project | FF-004 |

### Not driving

| Characteristic | Why not |
|---|---|
| Scalability | 50 users. Revisit at 1,000 — that is an ADR trigger, not a v1 driver. |
| Availability | No 24/7 commitment made to anyone. |

### What choosing three actually changed

- **Scalability was dropped** → ADR-001 chose a modular monolith instead of services.
  Had scalability stayed on the list, the same team would have built a distributed system
  it could not operate.
- **Simplicity was kept** → the agent's proposal for a plug-in export architecture was
  rejected in one sentence, against a written driver rather than an opinion.
- **Performance got a number** → "fast" became `p95 < 2 s for 500 tasks`, which became
  PTEST-003, which failed at 7.1 s, which produced ADR-003 (pagination). None of that
  happens if the requirement stays as the word *fast*.
